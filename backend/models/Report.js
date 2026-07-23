import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for report association'],
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Analysis content is required'],
    },
    fixedCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

reportSchema.index({ userId: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
