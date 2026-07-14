import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrls: {
    front: { type: String, default: '' },
    top: { type: String, default: '' },
    crown: { type: String, default: '' }
  },
  densityScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  norwoodStage: {
    type: String,
    enum: [
      'Norwood 1',
      'Norwood 2',
      'Norwood 3',
      'Norwood 3 Vertex',
      'Norwood 4',
      'Norwood 5',
      'Norwood 6',
      'Norwood 7'
    ],
    required: true
  },
  crownThinning: {
    type: Number,
    min: 0,
    max: 100, // Visible scalp percentage
    required: true
  },
  recommendations: {
    type: [String],
    default: []
  },
  nutritionRecommendations: {
    proteinScore: { type: Number, default: 0 },
    ironScore: { type: Number, default: 0 },
    zincScore: { type: Number, default: 0 },
    vitaminScore: { type: Number, default: 0 },
    nutritionScore: { type: Number, default: 0 },
    weeklyMealPlan: {
      type: Map,
      of: {
        breakfast: String,
        lunch: String,
        dinner: String,
        snacks: String
      }
    },
    foodsToLimit: {
      type: [String],
      default: []
    },
    growthFoods: [
      {
        name: String,
        category: String,
        nutrientInfo: String,
        benefit: String,
        dailyRec: String,
        image: String
      }
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Analysis', AnalysisSchema);
