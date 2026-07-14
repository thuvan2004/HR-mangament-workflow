import Analysis from '../models/Analysis.js';
import User from '../models/User.js';
import { generateAnalysisPDF } from '../services/pdfService.js';
import { sendEmail } from '../services/emailService.js';
import path from 'path';

// Helper: Generate Food recommendation list based on diet and scores
const getGrowthFoods = (dietType) => {
  const isVeg = dietType === 'Vegetarian';
  return [
    {
      name: isVeg ? 'Lentils & Chickpeas' : 'Chicken Breast',
      category: 'Protein Rich Foods',
      nutrientInfo: 'High-quality Amino Acids, L-Lysine',
      benefit: 'Maintains structure of hair follicles and blocks hair shedding.',
      dailyRec: isVeg ? '1 cup cooked daily' : '150g grilled daily',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=60'
    },
    {
      name: 'Spinach & Beetroot',
      category: 'Iron Rich Foods',
      nutrientInfo: 'Folate, Iron, Vitamin A & C',
      benefit: 'Assists red blood cells in carrying oxygen to the hair roots.',
      dailyRec: '1.5 cups fresh daily',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&auto=format&fit=crop&q=60'
    },
    {
      name: 'Pumpkin Seeds & Cashews',
      category: 'Zinc Rich Foods',
      nutrientInfo: 'Zinc, Magnesium, Selenium',
      benefit: 'Supports cellular division and repair of hair tissue.',
      dailyRec: '30g raw/roasted daily',
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=150&auto=format&fit=crop&q=60'
    },
    {
      name: isVeg ? 'Mushrooms & Fortified Yogurt' : 'Salmon & Egg Yolks',
      category: 'Vitamin D Sources',
      nutrientInfo: 'Vitamin D3, Calcium',
      benefit: 'Creates new hair follicles (micro-pores for hair growth).',
      dailyRec: isVeg ? '100g mushrooms' : '120g grilled salmon',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=150&auto=format&fit=crop&q=60'
    },
    {
      name: isVeg ? 'Flax Seeds & Walnuts' : 'Sardines & Walnuts',
      category: 'Omega-3 Sources',
      nutrientInfo: 'Essential Fatty Acids',
      benefit: 'Nourishes the hair shaft and increases hair density.',
      dailyRec: '2 tbsp flax seeds or 30g walnuts',
      image: 'https://images.unsplash.com/photo-1606923829579-0ac984c55dc4?w=150&auto=format&fit=crop&q=60'
    },
    {
      name: 'Sweet Potatoes & Almonds',
      category: 'Biotin Sources',
      nutrientInfo: 'Biotin (Vitamin B7), Beta-carotene',
      benefit: 'Synthesizes keratin protein which forms the hair fiber.',
      dailyRec: '1 medium baked sweet potato',
      image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=150&auto=format&fit=crop&q=60'
    }
  ];
};

// Helper: Get weekly meal plan based on diet
const getWeeklyMealPlan = (dietType) => {
  const isVeg = dietType === 'Vegetarian';
  
  const vegPlan = {
    monday: {
      breakfast: 'Oatmeal topped with walnuts, flax seeds, and sliced bananas',
      lunch: 'Chickpea & spinach salad with quinoa and lemon-tahini dressing',
      dinner: 'Lentil curry (dahl) with brown rice and stir-fried broccoli',
      snacks: 'Greek yogurt with raw pumpkin seeds'
    },
    tuesday: {
      breakfast: 'Chia seed pudding with mixed berries and almond butter',
      lunch: 'Tofu and vegetable stir-fry with a side of edamame',
      dinner: 'Black bean burger wrap with side spinach salad and beetroot slices',
      snacks: 'Roasted cashews and a green apple'
    },
    wednesday: {
      breakfast: 'Whole grain toast with smashed avocado and hemp seeds',
      lunch: 'Red lentil soup with roasted sweet potatoes and baby kale',
      dinner: 'Stuffed bell peppers with quinoa, pinto beans, and melted cheese',
      snacks: 'Hummus with cucumber and carrot sticks'
    },
    thursday: {
      breakfast: 'Greek yogurt parfait with almonds, oats, and honey',
      lunch: 'Quinoa bowl with roasted beetroot, cashews, and baby spinach',
      dinner: 'Tempeh stir-fry with snap peas, bell peppers, and wild rice',
      snacks: 'A handful of peanuts and dark chocolate'
    },
    friday: {
      breakfast: 'Smoothie with spinach, banana, almond milk, and pea protein powder',
      lunch: 'Lentil and barley soup with whole-wheat dinner roll',
      dinner: 'Mushroom risotto with a large green side salad and walnuts',
      snacks: 'Cottage cheese with pineapple slices'
    },
    saturday: {
      breakfast: 'Buckwheat pancakes with maple syrup and flax seeds',
      lunch: 'Falafel wrap with hummus, tomatoes, and arugula',
      dinner: 'Vegetable korma curry with garlic naan and brown rice',
      snacks: 'Almonds and baked sweet potato wedges'
    },
    sunday: {
      breakfast: 'Scrambled tofu with mushrooms, spinach, and whole grain toast',
      lunch: 'Warm lentil salad with roasted butternut squash and pecans',
      dinner: 'Paneer tikka masala with quinoa and sautéed green beans',
      snacks: 'Mixed seeds (pumpkin, sunflower, flax)'
    }
  };

  const nonVegPlan = {
    monday: {
      breakfast: 'Three scrambled eggs with spinach and whole grain toast',
      lunch: 'Grilled chicken breast with quinoa and sautéed broccoli',
      dinner: 'Baked salmon with roasted sweet potatoes and asparagus',
      snacks: 'Walnuts and hard-boiled egg'
    },
    tuesday: {
      breakfast: 'Greek yogurt parfait with honey, flax seeds, and almonds',
      lunch: 'Tuna salad lettuce wraps with pumpkin seeds and carrot sticks',
      dinner: 'Lean beef stir-fry with bell peppers and brown rice',
      snacks: 'A handful of cashews and beef jerky'
    },
    wednesday: {
      breakfast: 'Oatmeal topped with sliced almonds, chia seeds, and protein powder',
      lunch: 'Grilled chicken wrap with spinach, beetroot, and avocado',
      dinner: 'Baked cod filet with wild rice and steamed green beans',
      snacks: 'Hard-boiled egg and peanuts'
    },
    thursday: {
      breakfast: 'Smoothie with whey protein, spinach, blueberries, and almond milk',
      lunch: 'Turkey breast slices with spinach salad and roasted sweet potato',
      dinner: 'Grilled salmon with quinoa and roasted Brussels sprouts',
      snacks: 'Greek yogurt with walnuts'
    },
    friday: {
      breakfast: 'Omelet with mushrooms, cheese, and spinach',
      lunch: 'Lentil soup with shredded chicken breast and side salad',
      dinner: 'Grilled shrimp skewers with vegetable kebabs and brown rice',
      snacks: 'Pumpkin seeds and a pear'
    },
    saturday: {
      breakfast: 'Smoked salmon on whole-grain toast with avocado',
      lunch: 'Chicken salad with pecans, grapes, and mixed greens',
      dinner: 'Lean pork loin chops with roasted sweet potato and broccoli',
      snacks: 'Almonds and boiled edamame'
    },
    sunday: {
      breakfast: 'Poached eggs over sautéed kale, mushrooms, and sweet potato hash',
      lunch: 'Baked trout with quinoa and spinach salad',
      dinner: 'Turkey meatballs with whole wheat pasta and marinara sauce',
      snacks: 'Walnuts and pumpkin seeds'
    }
  };

  return isVeg ? vegPlan : nonVegPlan;
};

// @desc    Handle file upload response
// @route   POST /api/analysis/upload
// @access  Private
export const uploadPhotos = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: 'No image files uploaded' });
    }

    const files = req.files;
    const imageUrls = {
      front: files.front ? `/uploads/${files.front[0].filename}` : '',
      top: files.top ? `/uploads/${files.top[0].filename}` : '',
      crown: files.crown ? `/uploads/${files.crown[0].filename}` : ''
    };

    res.status(200).json({
      success: true,
      imageUrls
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Analyze uploaded photos and generate scores/nutrition
// @route   POST /api/analysis/analyze
// @access  Private
export const analyzePhotos = async (req, res) => {
  try {
    const { imageUrls, dietType } = req.body;
    
    if (!imageUrls) {
      return res.status(400).json({ message: 'Please provide imageUrls for analysis' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // AI Heuristics Engine (Simulated backend TensorFlow model response)
    // In a real application, the images would be fed into a trained model.
    // Here we compute realistic, deterministic outputs from image metadata, user age, and gender.
    const age = user.age || 30;
    const gender = user.gender || 'Male';
    
    // We create realistic variations based on age and a pseudo-random seed linked to imageUrl length
    const imageSeed = (imageUrls.front?.length || 10) + (imageUrls.top?.length || 15) + (imageUrls.crown?.length || 20);
    const norwoodIndex = (imageSeed % 7) + 1; // Norwood stages 1-7
    const stages = [
      'Norwood 1',
      'Norwood 2',
      'Norwood 3',
      'Norwood 3 Vertex',
      'Norwood 4',
      'Norwood 5',
      'Norwood 6',
      'Norwood 7'
    ];
    const norwoodStage = stages[norwoodIndex];

    // Density Score calculations
    // Typically, higher Norwood stages relate to lower density
    let densityScore = Math.max(20, Math.min(95, 95 - (norwoodIndex * 10) + (imageSeed % 8)));
    let crownThinning = Math.max(5, Math.min(85, (norwoodIndex * 11) + (imageSeed % 6)));
    
    // Adjust metrics for females (Ludwig scale is typical but the prompt lists Norwood stages. We support Norwood but adapt scores)
    if (gender === 'Female') {
      densityScore = Math.min(98, densityScore + 10);
      crownThinning = Math.max(2, crownThinning - 10);
    }

    // Health Score (calculated using density, recession/stage index, and crown thinning)
    const recessionPenalty = norwoodIndex * 8;
    const healthScore = Math.round(Math.max(15, Math.min(98, 100 - (100 - densityScore)*0.4 - recessionPenalty*0.3 - crownThinning*0.3)));

    // Recommendations Engine
    const recommendations = [];
    if (norwoodStage === 'Norwood 1') {
      recommendations.push('Maintain current routine: Keep your scalp clean and use gentle shampoos.');
      recommendations.push('Monitor closely: Review and photograph your hairline once every 6 months.');
    } else if (norwoodStage === 'Norwood 2') {
      recommendations.push('Monitor progress: Recession is mild, localized near temples.');
      recommendations.push('Improve nutrition: Optimize dietary protein, zinc, and iron levels.');
      recommendations.push('Scalp massage: Stimulate microcirculation to target hair follicles.');
    } else if (norwoodStage === 'Norwood 3' || norwoodStage === 'Norwood 3 Vertex') {
      recommendations.push('Consult a professional: Consider consulting a dermatologist for Minoxidil or Finasteride.');
      recommendations.push('Add DHT blockers: Incorporate pumpkin seed oil or saw palmetto products.');
      recommendations.push('Intense nutrition: Supplement Biotin and Omega-3 sources twice weekly.');
    } else {
      recommendations.push('Clinical Consultation: Seek guidance from a dermatologist regarding therapeutic remedies or hair transplant options.');
      recommendations.push('Scalp nourishment: Use hair growth serums featuring copper peptides or redensyl.');
      recommendations.push('Low-Level Laser Therapy (LLLT): Consider seeking clinical red light therapy.');
    }
    recommendations.push('Medical Disclaimer: This application is not a medical diagnostic tool.');

    // Nutrition scoring system (0-100)
    // Lower hair density indicates higher nutritional needs
    const severityFactor = Math.max(0, 100 - healthScore);
    const proteinScore = Math.round(Math.max(40, Math.min(98, 90 - severityFactor * 0.3)));
    const ironScore = Math.round(Math.max(35, Math.min(95, 88 - severityFactor * 0.4)));
    const zincScore = Math.round(Math.max(40, Math.min(98, 92 - severityFactor * 0.35)));
    const vitaminScore = Math.round(Math.max(30, Math.min(96, 85 - severityFactor * 0.45)));
    const nutritionScore = Math.round((proteinScore + ironScore + zincScore + vitaminScore) / 4);

    const nutritionRecommendations = {
      proteinScore,
      ironScore,
      zincScore,
      vitaminScore,
      nutritionScore,
      weeklyMealPlan: getWeeklyMealPlan(dietType || 'Non-Vegetarian'),
      foodsToLimit: [
        'Excess sugary drinks (promotes high sebum and inflammation)',
        'Highly processed foods (lacks micronutrients essential for keratin synthesis)',
        'Excess alcohol (depletes zinc and hydration)',
        'Crash dieting (triggers telogen effluvium hair shedding)'
      ],
      growthFoods: getGrowthFoods(dietType || 'Non-Vegetarian')
    };

    // Save Analysis to DB
    const analysis = new Analysis({
      userId: user._id,
      imageUrls,
      densityScore,
      healthScore,
      norwoodStage,
      crownThinning,
      recommendations,
      nutritionRecommendations
    });

    await analysis.save();

    res.status(201).json({
      success: true,
      analysis
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user's analysis history
// @route   GET /api/analysis/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single analysis record
// @route   GET /api/analysis/:id
// @access  Private
export const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Check ownership (admins can access any analysis)
    if (analysis.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this record' });
    }

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Export Analysis PDF Report
// @route   GET /api/analysis/export-pdf/:id
// @access  Private
export const exportReportPDF = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis report not found' });
    }

    // Authorization
    if (analysis.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this report' });
    }

    const user = await User.findById(analysis.userId);

    const pdfBuffer = await generateAnalysisPDF(analysis, user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=HairScope_Report_${analysis._id}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.end(pdfBuffer);
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ message: 'Could not generate PDF report' });
  }
};

// @desc    Email Analysis PDF Report
// @route   POST /api/analysis/email-report/:id
// @access  Private
export const emailReportPDF = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis report not found' });
    }

    // Authorization
    if (analysis.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this report' });
    }

    const user = await User.findById(analysis.userId);
    const pdfBuffer = await generateAnalysisPDF(analysis, user);

    // Send email with PDF attachment
    await sendEmail({
      email: user.email,
      subject: `HairScope AI - Your Hair Loss Analysis Report [${new Date(analysis.createdAt).toLocaleDateString()}]`,
      message: `Hi ${user.name},\n\nPlease find attached your personalized Hair Loss Analysis and Nutrition Report generated on HairScope AI.\n\nBest regards,\nThe HairScope Team`,
      attachments: [
        {
          filename: `HairScope_Report_${analysis._id}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'PDF report has been compiled and emailed successfully!'
    });
  } catch (err) {
    console.error('Email PDF report error:', err);
    res.status(500).json({ message: 'Could not compile and email PDF report' });
  }
};
