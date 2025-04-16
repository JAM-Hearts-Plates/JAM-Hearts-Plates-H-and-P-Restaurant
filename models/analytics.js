import { Schema, model } from "mongoose";


const analyticsSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: String, required: true }, // e.g., "order_placed", "reservation_made"
    metadata: { type: Object },
    entityType: { type: String, enum: ['order', 'reservation', 'loyalty', 'event'], required: true },
    entityId: { type: Schema.Types.ObjectId, refPath: 'entityType' },
    sessionId: { type: String },
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
  }, {
    timestamps: true
  });
  
  export const AnalyticsModel = model('Analytics', analyticsSchema);
  