export class AppError extends Error {
status: number;
code?: string;
constructor(status: number, code?: string, message?: string) {
super(message ?? code ?? 'ApplicationError');
this.status = status;
this.code = code;
}
static fromUnknown(err: unknown) {
if (err instanceof AppError) return err;
if (err instanceof Error) return new AppError(500, 'INTERNAL_ERROR', err.message);
return new AppError(500, 'INTERNAL_ERROR');
}
}