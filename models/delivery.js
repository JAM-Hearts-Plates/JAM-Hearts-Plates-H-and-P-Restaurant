import { Schema, model } from "mongoose";

const deliverySchema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true }, // Links to the order being delivered
    riderId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Links to the delivery driver
    status: {
        type: String,
        enum: ['pending', 'picked_up', 'in_transit', 'delivered', 'failed'],
        default: 'pending'
    }, // Tracks delivery progress
    location: { type: String }, // Optional: Current delivery location
    estimatedDeliveryTime: { type: Date }, // Optional: Estimated time of delivery
    notes: { type: String } // Optional notes (e.g., "Driver is running late");
})

export const DeliveryModel = model("Delivery", deliverySchema)