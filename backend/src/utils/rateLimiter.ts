// Future: rate-limiter-flexible + Redis store
export function noopRateLimiter() {
return (_req: any, _res: any, next: any) => next();
}