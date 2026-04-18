import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:9001';

const SCENARIOS = {
  ramp: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 10 },
      { duration: '60s', target: 50 },
      { duration: '60s', target: 100 },
      { duration: '60s', target: 200 },
      { duration: '60s', target: 500 },
      { duration: '30s', target: 0 },
    ],
  },
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '10s', target: 10 },
      { duration: '10s', target: 500 },
      { duration: '60s', target: 500 },
      { duration: '10s', target: 0 },
    ],
  },
};

export const options = {
  scenarios: {
    default: SCENARIOS[__ENV.SCENARIO || 'ramp'],
  },
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<2000'],
  },
};

const ERROR_MESSAGES = [
  'TypeError: Cannot read properties of undefined (reading "id")',
  'ReferenceError: userId is not defined',
  'Error: connect ECONNREFUSED 127.0.0.1:3306',
  'Error: ER_DUP_ENTRY: Duplicate entry for key PRIMARY',
  'UnhandledPromiseRejectionWarning: connection refused',
  'Error: JWT expired',
  'Error: ENOENT: no such file or directory',
  'HttpException: 502 Bad Gateway',
  'HttpException: 429 Too Many Requests',
  'Error: MySQL: ER_LOCK_DEADLOCK',
];

export default function () {
  const message = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];

  const res = http.post(
    `${BASE_URL}/api/v1/errors/log`,
    JSON.stringify({ message, stackTrace: `Error: ${message}\n    at handler (app.ts:42:5)` }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has status field': (r) => {
      try {
        return JSON.parse(r.body).data?.status === 'saved';
      } catch {
        return false;
      }
    },
  });

  sleep(0.1);
}
