import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  comparisonResults: {
    beforeAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis' },
    afterAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis' },
    densityDiff: Number,
    healthDiff: Number,
    stageChange: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Report', ReportSchema);
