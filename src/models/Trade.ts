import mongoose, { Document, Schema } from 'mongoose';

export interface ITrade extends Document {
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  entryDate: Date;
  exitDate?: Date;
  pnl?: number;
  pnlPercent?: number;
  status: 'open' | 'closed';
  
  // Journal fields (Notion-like)
  entryReason: string;
  notes: string;
  afterReview: string;
  
  // Screenshots
  screenshots: string[];
  
  // Tags
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    direction: {
      type: String,
      enum: ['long', 'short'],
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    exitPrice: {
      type: Number,
      default: null,
    },
    stopLoss: {
      type: Number,
      default: null,
    },
    takeProfit: {
      type: Number,
      default: null,
    },
    lotSize: {
      type: Number,
      required: true,
    },
    entryDate: {
      type: Date,
      required: true,
    },
    exitDate: {
      type: Date,
      default: null,
    },
    pnl: {
      type: Number,
      default: null,
    },
    pnlPercent: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    
    // Journal fields
    entryReason: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    afterReview: {
      type: String,
      default: '',
    },
    
    // Screenshots
    screenshots: {
      type: [String],
      default: [],
    },
    
    // Tags
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
TradeSchema.index({ symbol: 1, entryDate: -1 });
TradeSchema.index({ status: 1 });
TradeSchema.index({ createdAt: -1 });

export const Trade = mongoose.model<ITrade>('Trade', TradeSchema);
