import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  tags: { scenario: 'spike' },
  stages: [
    { duration: '10s', target: 1 },    // quase ocioso
    { duration: '5s',  target: 200 },  // pico súbito
    { duration: '20s', target: 200 },  // mantém o pico
    { duration: '10s', target: 0 },    // queda rápida
  ],
  thresholds: {
    http_req_duration: ['p(95) < 2000'],   // SLA p95 < 2s
    http_req_failed:   ['rate < 0.01'],    // erros < 1%
  },
};

export default function () {
  // endpoint “comum”
  const r1 = http.get('http://localhost:8000/produtos', { tags: { endpoint: 'GET /produtos' }});
  check(r1, { '200 produtos': (res) => res.status === 200 });

  // a cada 5 iterações simula uma transação mais “pesada”
  if (__ITER % 5 === 0) {
    const r2 = http.post('http://localhost:8000/pagamentos', null, { tags: { endpoint: 'POST /pagamentos' }});
    check(r2, { '200 pagamentos': (res) => res.status === 200 });
  }

  sleep(0.5);
}
