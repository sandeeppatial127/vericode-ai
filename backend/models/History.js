import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for history association'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
    },
    originalCode: {
      type: String,
      required: [true, 'Original code is required'],
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed, // Stores the rich JSON analysis structure
      default: null,
    },
    fixedCode: {
      type: String,
      default: null,
    },
    explanation: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Create compound index for search efficiency
historySchema.index({ userId: 1, createdAt: -1 });
historySchema.index({ language: 1 });

const History = mongoose.model('History', historySchema);
export default History;
