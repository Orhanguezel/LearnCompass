import type { Schema } from 'mongoose';


export function baseModelPlugin<TSchema extends Schema>(schema: TSchema) {
schema.add({
tenantId: { type: String, index: true, required: true },
createdAt: { type: Date, default: () => new Date(), index: true },
updatedAt: { type: Date, default: () => new Date(), index: true },
});


schema.pre('save', function (next) {
// @ts-ignore
this.updatedAt = new Date();
next();
});


schema.set('toJSON', {
virtuals: true,
versionKey: false,
transform: (_doc, ret) => {
ret.id = ret._id;
delete ret._id;
return ret;
},
});
}