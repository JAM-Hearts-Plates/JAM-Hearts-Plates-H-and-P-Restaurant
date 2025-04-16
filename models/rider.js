import { Schema, model } from "mongoose";

const riderSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true},
    password: { type: String, required: true},
    role: { type: String, enum: ['rider'] },
    phone: { type: String, required: true },
    vehicle: { type: String, required: true }, // e.g., bike, car, van
    availability: { type: Boolean, default: true },
    location: { type: String },
    assignedDeliveries: [{ type: Schema.Types.ObjectId, ref: 'Delivery' }],
    externalProvider: { type: String, default: null }, // External service name (e.g., yango delivery)
}, {
    timestamps: true
});


export const RiderModel  = model( "Rider", riderSchema)
