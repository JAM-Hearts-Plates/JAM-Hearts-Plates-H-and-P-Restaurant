import { Schema, Types, model } from 'mongoose';
import normalize from "normalize-mongoose";

const tableSchema = new Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['regular', 'vip_section', 'premium_window_seat'],
    default: 'regular'
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  reservedBy: {
    type: Types.ObjectId,
    ref: 'User',
    default: null
  },
  orderId: {
    type: Types.ObjectId,
    ref: 'Order',
    default: null
  },
  reservedAt: {
    type: Date,
    default: null
  },
  releaseAt: {
    type: Date,
    default: null
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'balcony'],
    default: 'indoor'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
tableSchema.index({ isAvailable: 1 });
tableSchema.index({ type: 1, isAvailable: 1 });

// Automatically release expired table reservations
tableSchema.statics.releaseExpiredReservations = async function() {
  const now = new Date();
  return this.updateMany(
    { 
      isAvailable: false, 
      releaseAt: { $lt: now } 
    },
    {
      $set: {
        isAvailable: true,
        reservedBy: null,
        orderId: null,
        reservedAt: null,
        releaseAt: null
      }
    }
  );
};

tableSchema.plugin(normalize);

export const TableModel = model('Table', tableSchema);