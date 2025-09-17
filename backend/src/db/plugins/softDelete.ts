import type { Schema } from 'mongoose';


export function softDeletePlugin<TSchema extends Schema>(schema: TSchema) {
schema.add({ deletedAt: { type: Date, default: null, index: true } });


schema.pre('find', function () {
// @ts-ignore
this.where({ deletedAt: null });
});
schema.pre('findOne', function () {
// @ts-ignore
this.where({ deletedAt: null });
});
}