import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Apple, ShieldCheck, HelpCircle } from 'lucide-react';

const About = () => {
  const faqs = [
    {
      q: "What is the Norwood Scale?",
      a: "The Norwood scale is the leading clinical classification system used to measure the stages of male pattern baldness. It ranges from Stage 1 (no recession) to Stage 7 (severe hairline recession and crown baldness)."
    },
    {
      q: "How does the AI analyze my photos?",
      a: "The HairScope AI analysis engine inspects user-uploaded photos, running pixel-level density checks to assess the hair-to-scalp ratio. It measures hairline recession angles and crown area exposure to estimate Norwood stages and calculate density ratings."
    },
    {
      q: "Can women use this analyzer?",
      a: "Yes! While the Norwood scale is traditionally used for male pattern baldness, women can upload scalp photos to evaluate general crown thinning and overall hair density score trends. In the profile page, set your gender to customize the recommendations."
    },
    {
      q: "Why does nutrition matter for hair loss?",
      a: "Hair follicles are some of the most metabolically active cells in the body. Insufficient protein, iron, zinc, or vitamins can impair keratin production, disrupt the hair growth cycle, and lead to shedding (Telogen Effluvium). Adjusting your diet supports follicle vitality."
    }
  ];

  return (
    <div className="min-h-screen bg-[#090B10] text-gray-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">The Science Behind HairScope</h1>
        <p className="text-gray-400 mb-12">Learn how computer vision and nutritional diagnostics help monitor hair conditions.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Science block */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-violet/10 text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Norwood Hamilton Scale</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Male pattern hair loss occurs in progressive stages. Early detection in Norwood Stage 2 or 3 allows users to adjust hygiene, request professional treatment, and improve nutrition before follicles reach advanced atrophy (Norwood Stages 5-7).
            </p>
          </div>

          {/* Nutrition block */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-cyan/10 text-cyan-400">
                <Apple className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Nutritional Diagnostics</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Our nutrition scoring evaluates the primary building blocks of hair. We look at protein (for keratin building), iron (for oxygen delivery to roots), zinc (for follicle cellular division), and vitamins (D & Biotin) to formulate custom-tailored daily meal guides.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-brand-violet" /> Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4 mb-12">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card p-6">
              <h4 className="text-base font-semibold text-white mb-2">{faq.q}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Safety Disclaimer banner */}
        <div className="glass-card p-6 border-brand-cyan/20 bg-brand-cyan/5 flex items-center gap-4">
          <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0" />
          <p className="text-xs text-gray-400">
            All data and scoring is compiled locally. We utilize HTTPS encryption and secure database structures to protect your profile details and private scalp photos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
