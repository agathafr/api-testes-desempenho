import http from 'k6/http';
import { check, sleep } from 'k6';
import { normalDistributionStages } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// === PERFIS DE USUÁRIO ===
const PERFIS = {
  navegante: {
    peso: 0.5,
    cenarios: [
      { endpoint: '/produtos', peso: 0.4, pausa: [1, 3] },
      { endpoint: '/categorias', peso: 0.3, pausa: [2, 4] },
      { endpoint: '/busca', peso: 0.2, pausa: [1, 2] },
      { endpoint: '/usuarios/1', peso: 0.1, pausa: [3, 5] }
    ]
  },
  comprador: {
    peso: 0.3,
    cenarios: [
      { endpoint: '/produtos', peso: 0.2, pausa: [1, 3] },
      { endpoint: '/pagamentos', peso: 0.5, pausa: [2, 4] },
      { endpoint: '/status', peso: 0.3, pausa: [1, 2] }
    ]
  },
  robo: {
    peso: 0.2,
    cenarios: [
      { endpoint: '/produtos', peso: 1.0, pausa: [0.1, 0.5] } // Alta frequência
    ]
  }
};

// === CONFIGURAÇÃO DO TESTE ===
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp-up gradual 
    { duration: '1m', target: 100 },   // Pico de carga
    { duration: '1m', target: 50 },    // Redução
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    // Objetivos SMART devem ser alinhados ao negócio
    http_req_duration: ['p(95) < 2000'], // 95% das requisições < 2s
    'http_req_duration{endpoint:/pagamentos}': ['p(95) < 3000'], // pode ser mais lento
    http_req_failed: ['rate < 0.02'],    // Taxa de erro < 2% (erros HTTP, timeouts, etc)
  },
  summaryTrendStats: ['avg', 'min', 'max', 'p(95)', 'p(99)'],
};

// === CENÁRIO DINÂMICO ===
export default function () {
  const perfil = escolherPerfil();
  const cenario = escolherCenario(perfil.cenarios);
  const endpoint = cenario.endpoint;
  let res;
  
  if (endpoint !== '/pagamentos') {
    res = http.get(`http://localhost:8000${endpoint}`, {
      tags: {
        endpoint: endpoint,
        perfil: getPerfilName(perfil),
        tipo: 'navegacao'
      }
    });

  } else {
    res = http.post(`http://localhost:8000${endpoint}`, {
      tags: {
        endpoint: endpoint,
        perfil: getPerfilName(perfil),
        tipo: 'transacao'
      }
    });
  }

  // Validação com múltiplos cenários (evita "caminho feliz")
  check(res, {
    'status 200': (r) => r.status === 200,
    'tempo < 2s': (r) => r.timings.duration < 2000,
  });

  // Pausa realista com distribuição normal (simula comportamento real)
  const [min, max] = cenario.pausa;
  const media = (min + max) / 2;
  const desvio = (max - min) / 4;
  const pausa = Math.max(0.1, normalDistributionStages(media, desvio)); // Evita pausas negativas
  sleep(pausa);
}

function escolherPerfil() {
  const rand = Math.random();
  let acumulado = 0;

  for (const [nome, perfil] of Object.entries(PERFIS)) {
    acumulado += perfil.peso;

    if (rand <= acumulado)
      return perfil;
  }

  return PERFIS.navegante;
}

function escolherCenario(cenarios) {
  const rand = Math.random();
  let acumulado = 0;

  for (const cenario of cenarios) {
    acumulado += cenario.peso;

    if (rand <= acumulado) 
      return cenario;
  }

  return cenarios[0];
}

function getPerfilName(perfil) {
  if (perfil === PERFIS.navegante) return 'navegante';
  if (perfil === PERFIS.comprador) return 'comprador';
  if (perfil === PERFIS.robo) return 'robo';
  return 'desconhecido';
}