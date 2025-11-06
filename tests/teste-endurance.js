import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  tags: { scenario: 'endurance' },
  stages: [
    { duration: '30s', target: 50 },   // sobe até 50 usuários
    { duration: '30m', target: 50 },   // mantém por 30 minutos
    { duration: '30s', target: 0 },    // desce gradualmente
  ],
  thresholds: {
    http_req_duration: ['p(95) < 2000'],   // SLA p95 < 2s
    http_req_failed:   ['rate < 0.01'],    // erros < 1%
  },
};

export default function () {
  // chamada leve
  const res1 = http.get('http://localhost:8000/produtos', { tags: { endpoint: 'GET /produtos' }});
  check(res1, { '200 produtos': (r) => r.status === 200 });

  // chamada pesada periódica
  if (__ITER % 5 === 0) {
    const res2 = http.post('http://localhost:8000/pagamentos', null, { tags: { endpoint: 'POST /pagamentos' }});
    check(res2, { '200 pagamentos': (r) => r.status === 200 });
  }

  sleep(1);
}
