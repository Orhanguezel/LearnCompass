export type HealthResponse = {
  ok: true;
  service: string;
  env: 'development' | 'test' | 'production';
  time: string; // ISO-8601
};
