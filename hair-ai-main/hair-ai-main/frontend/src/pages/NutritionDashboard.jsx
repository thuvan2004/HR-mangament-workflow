import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Sparkles, Apple, AlertTriangle, AlertCircle, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';

const NutritionDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [dietType, setDietType] = useState('Non-Vegetarian');
  const [activeDay, setActiveDay] = useState('monday');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/analysis/history');
      if (res.data && res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve nutrition configurations.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-extrabold text-white">Nutrition & Meal Planner</h1>
        <CardSkeleton />
      </div>
    );
  }

  const latest = history[0];
  const hasScan = !!latest;

  // Use scan results or fallbacks for meal planning and scores
  const nutrition = latest?.nutritionRecommendations || {};
  const scores = {
    protein: nutrition.proteinScore || 80,
    iron: nutrition.ironScore || 75,
    zinc: nutrition.zincScore || 85,
    vitamin: nutrition.vitaminScore || 70,
    overall: nutrition.nutritionScore || 78
  };

  const currentDiet = latest ? (latest.nutritionRecommendations?.weeklyMealPlan ? 'scanned' : dietType) : dietType;

  // Static fallback meal plan if no scan exists
  const defaultMealPlans = {
    'Vegetarian': {
      monday: { breakfast: 'Oatmeal with walnuts & flax seeds', lunch: 'Chickpea spinach salad with quinoa', dinner: 'Lentil dahl with brown rice', snacks: 'Greek yogurt with pumpkin seeds' },
      tuesday: { breakfast: 'Chia seed pudding with mixed berries', lunch: 'Tofu stir-fry with edamame', dinner: 'Black bean wrap with beetroot side', snacks: 'Roasted cashews' },
      wednesday: { breakfast: 'Avocado toast with hemp seeds', lunch: 'Red lentil soup with sweet potatoes', dinner: 'Stuffed bell peppers with quinoa', snacks: 'Hummus & cucumber sticks' },
      thursday: { breakfast: 'Greek yogurt parfait with almonds & honey', lunch: 'Quinoa bowl with spinach & cashews', dinner: 'Tempeh stir-fry with wild rice', snacks: 'Peanuts' },
      friday: { breakfast: 'Spinach & banana protein smoothie', lunch: 'Lentil soup with dinner roll', dinner: 'Mushroom risotto with walnuts', snacks: 'Cottage cheese' },
      saturday: { breakfast: 'Buckwheat pancakes with flax seeds', lunch: 'Falafel wrap with hummus', dinner: 'Vegetable curry with rice', snacks: 'Sweet potato wedges' },
      sunday: { breakfast: 'Scrambled tofu with spinach & toast', lunch: 'Lentil salad with butternut squash', dinner: 'Paneer tikka masala with quinoa', snacks: 'Mixed seeds' }
    },
    'Non-Vegetarian': {
      monday: { breakfast: 'Three scrambled eggs with spinach & toast', lunch: 'Grilled chicken breast with quinoa & broccoli', dinner: 'Baked salmon with roasted sweet potatoes', snacks: 'Walnuts & hard-boiled egg' },
      tuesday: { breakfast: 'Greek yogurt with flax seeds & almonds', lunch: 'Tuna wrap with carrot sticks', dinner: 'Lean beef stir-fry with brown rice', snacks: 'Cashews & beef jerky' },
      wednesday: { breakfast: 'Oatmeal with almonds & whey protein', lunch: 'Chicken wrap with spinach & avocado', dinner: 'Baked cod with green beans', snacks: 'Hard-boiled egg & peanuts' },
      thursday: { breakfast: 'Protein smoothie with spinach & berries', lunch: 'Turkey breast with spinach salad', dinner: 'Grilled salmon with asparagus', snacks: 'Greek yogurt with walnuts' },
      friday: { breakfast: 'Omelet with mushrooms, cheese & spinach', lunch: 'Lentil soup with shredded chicken', dinner: 'Shrimp skewers with brown rice', snacks: 'Pumpkin seeds' },
      saturday: { breakfast: 'Smoked salmon & avocado on toast', lunch: 'Chicken salad with pecans & greens', dinner: 'Lean pork loin with sweet potato', snacks: 'Almonds' },
      sunday: { breakfast: 'Poached eggs with kale & sweet potato hash', lunch: 'Baked trout with quinoa & spinach', dinner: 'Turkey meatballs with whole wheat pasta', snacks: 'Pumpkin seeds & walnuts' }
    }
  };

  const getDayPlan = (day) => {
    if (latest?.nutritionRecommendations?.weeklyMealPlan) {
      // Map check (could be Map object on Mongo)
      const plan = latest.nutritionRecommendations.weeklyMealPlan;
      return plan instanceof Map ? plan.get(day) : plan[day];
    }
    return defaultMealPlans[dietType][day];
  };

  const foodsToLimit = [
    'Excess sugary drinks (leads to high sebum & follicle inflammation)',
    'Highly processed foods (depleted of zinc/biotin for hair building)',
    'Excess alcohol (blocks zinc absorption & dehydrates hair shafts)',
    'Crash dieting (triggers sudden shedding / Telogen Effluvium)'
  ];

  const growthFoods = [
    { name: dietType === 'Vegetarian' ? 'Greek Yogurt' : 'Eggs', nutrient: 'Biotin & Protein', benefit: 'Synthesizes keratin fibers', rec: '2 eggs or 1 cup daily', img: 'https://images.unsplash.com/photo-1582722411495-3af722fe70a8?w=150&auto=format&fit=crop&q=60' },
    { name: 'Spinach', nutrient: 'Iron & Vitamin A/C', benefit: 'Carries oxygen to hair roots', rec: '1.5 cups fresh daily', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&auto=format&fit=crop&q=60' },
    { name: 'Pumpkin Seeds', nutrient: 'Zinc & Magnesium', benefit: 'Speeds cellular repair', rec: '30g raw daily', img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=150&auto=format&fit=crop&q=60' },
    { name: dietType === 'Vegetarian' ? 'Walnuts' : 'Salmon', nutrient: 'Omega-3 Fatty Acids', benefit: 'Promotes hair density & luster', rec: '120g grilled or 30g nuts', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=150&auto=format&fit=crop&q=60' }
  ];

  const activePlan = getDayPlan(activeDay) || { breakfast: 'N/A', lunch: 'N/A', dinner: 'N/A', snacks: 'N/A' };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Nutrition & Meal Planner</h1>
          <p className="text-sm text-gray-400">Optimize target food indices supporting hair shaft strength</p>
        </div>
        {!hasScan && (
          <div className="flex gap-2 p-1 bg-[#0f1422] border border-dark-border rounded-xl">
            <button
              onClick={() => setDietType('Non-Vegetarian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dietType === 'Non-Vegetarian' ? 'bg-brand-violet text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Non-Veg
            </button>
            <button
              onClick={() => setDietType('Vegetarian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dietType === 'Vegetarian' ? 'bg-brand-violet text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Veg
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Non-scanned Warning header */}
      {!hasScan && (
        <div className="p-4 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-cyan-400 mb-1">Standard Preview Mode</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              No analysis records found. Showing general nutritional recommendations. Run a diagnostic scan to generate custom scoring.
            </p>
            <Link to="/upload" className="text-xs font-bold text-white hover:underline mt-2 inline-flex items-center gap-1">
              Start Scan Now <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scores & Limit Foods */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Nutrition Scores card */}
          <div className="glass-card p-6 flex flex-col gap-4 glow-purple">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hair Nutrient Ratings</h3>
            
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs text-gray-300 font-semibold mb-1">
                  <span>Protein Index</span>
                  <span>{scores.protein}/100</span>
                </div>
                <div className="w-full bg-[#0f1422] h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-violet h-full rounded-full" style={{ width: `${scores.protein}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-300 font-semibold mb-1">
                  <span>Iron Index</span>
                  <span>{scores.iron}/100</span>
                </div>
                <div className="w-full bg-[#0f1422] h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-cyan h-full rounded-full" style={{ width: `${scores.iron}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-300 font-semibold mb-1">
                  <span>Zinc Index</span>
                  <span>{scores.zinc}/100</span>
                </div>
                <div className="w-full bg-[#0f1422] h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-emerald h-full rounded-full" style={{ width: `${scores.zinc}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-300 font-semibold mb-1">
                  <span>Vitamins (D/Biotin)</span>
                  <span>{scores.vitamin}/100</span>
                </div>
                <div className="w-full bg-[#0f1422] h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${scores.vitamin}%` }}></div>
                </div>
              </div>

              <div className="border-t border-dark-border/40 pt-4 mt-2 flex justify-between items-center">
                <span className="text-xs font-bold text-white">Overall Dietary Score</span>
                <span className="text-lg font-black text-brand-cyan">{scores.overall}/100</span>
              </div>
            </div>
          </div>

          {/* Foods to Limit Card */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Foods to Avoid</h3>
            <ul className="flex flex-col gap-2 list-disc pl-5 text-xs text-gray-400 leading-relaxed">
              {foodsToLimit.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Meal plan and growth foods grid */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Meal Plan Accordion Section */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand-violet" />
              <div>
                <h3 className="text-lg font-bold text-white">Weekly Meal Planner</h3>
                <p className="text-xs text-gray-400">Day-by-day food breakdown targeting hair growth</p>
              </div>
            </div>

            {/* Days tab select */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-[#0f1422] border border-dark-border rounded-xl">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day.toLowerCase())}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDay === day.toLowerCase() ? 'bg-brand-violet text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Day Meal layout details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 bg-[#0f1422]/60 border border-dark-border/50 rounded-xl">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">🍳 Breakfast</span>
                <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">{activePlan.breakfast}</p>
              </div>
              <div className="p-4 bg-[#0f1422]/60 border border-dark-border/50 rounded-xl">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">🥗 Lunch</span>
                <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">{activePlan.lunch}</p>
              </div>
              <div className="p-4 bg-[#0f1422]/60 border border-dark-border/50 rounded-xl">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">🍗 Dinner</span>
                <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">{activePlan.dinner}</p>
              </div>
              <div className="p-4 bg-[#0f1422]/60 border border-dark-border/50 rounded-xl">
                <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">🥜 Snacks</span>
                <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">{activePlan.snacks}</p>
              </div>
            </div>
          </div>

          {/* Growth Foods cards grid */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Apple className="w-5 h-5 text-brand-emerald" /> Hair Growth Friendly Foods
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {growthFoods.map((food, idx) => (
                <div key={idx} className="glass-card p-4 flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-dark-bg border border-dark-border shrink-0">
                    <img src={food.img} alt={food.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{food.name}</h4>
                    <p className="text-[10px] text-cyan-400 font-semibold">{food.nutrient}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{food.benefit}</p>
                    <span className="text-[9px] text-gray-500 block mt-0.5">Rec: {food.rec}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Safety info disclaimer */}
      <div className="glass-card p-6 border-brand-cyan/20 bg-brand-cyan/5 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-cyan-400 mb-1">Nutritional Advisory Guidance</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Personal meal plans and scores represent advisory recommendations targeting general nutritional support. This dashboard is not a medical prescription or professional therapeutic regimen. Consult a certified nutritionist or physician regarding dietary exclusions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NutritionDashboard;
