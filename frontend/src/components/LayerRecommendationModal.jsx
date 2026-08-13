import React, { useState } from 'react';
import { 
  Sparkles, 
  Utensils, 
  Dumbbell, 
  Activity, 
  ShieldCheck, 
  X,
  HeartPulse,
  Loader2,
  Bot
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';

export default function LayerRecommendationModal({ 
  isOpen, 
  onClose, 
  layerTitle = "Cardiovascular Layer",
  diseaseType = "cardiovascular",
  riskCategory = "MODERATE",
  riskScore = 0.35,
  keyFactors = [],
  patientData = {}
}) {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await API.post('/recommendations/analyze-layer', {
        disease_type: diseaseType,
        risk_score: riskScore,
        risk_category: riskCategory,
        key_factors: keyFactors,
        patient_data: patientData,
        language: language
      });
      if (res.data && (res.data.general_lifestyle || res.data.lifestyle)) {
        setAiRecs(res.data);
      } else {
        setAiRecs(getFallbackRecs());
      }
    } catch (err) {
      console.error('Error analyzing care recommendations:', err);
      setAiRecs(getFallbackRecs());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackRecs = () => {
    if (diseaseType === 'diabetes') {
      return {
        general_lifestyle: [
          'Maintain regular fasting and postprandial glucose monitoring.',
          'Limit simple sugars and high-glycemic carbohydrates.',
          'Ensure adequate hydration with 2.5L to 3L water daily.'
        ],
        diet_suggestions: [
          'Incorporate high-fiber whole grains, legumes, and green vegetables.',
          'Avoid sweetened beverages, fruit juices, and ultra-processed snacks.',
          'Balance meals with healthy fats and lean protein.'
        ],
        physical_activity: [
          'Engage in 30 minutes of moderate aerobic exercise 5 days a week.',
          'Take a light 10-15 minute walk after major meals to reduce glucose spikes.'
        ],
        monitoring_suggestions: [
          'Track daily fasting blood sugar target (80-130 mg/dL).',
          'Schedule periodic laboratory assessments with your physician.'
        ]
      };
    }

    if (diseaseType === 'cardiovascular') {
      return {
        general_lifestyle: [
          'Keep resting blood pressure target below 120/80 mmHg.',
          'Practice daily stress reduction and relaxation techniques.',
          'Ensure 7-8 hours of quality restorative sleep nightly.'
        ],
        diet_suggestions: [
          'Follow a low-sodium, heart-healthy dietary plan.',
          'Increase intake of omega-3 rich foods and leafy greens.',
          'Avoid trans fats and limit saturated fat intake.'
        ],
        physical_activity: [
          'Engage in 150 minutes of moderate cardiovascular activity weekly.',
          'Track active heart rate zone during physical exercise.'
        ],
        monitoring_suggestions: [
          'Log daily blood pressure readings using home cuff or wearable.',
          'Schedule annual lipid profile and cardiovascular checkup.'
        ]
      };
    }

    return {
      general_lifestyle: [
        'Maintain daily wellness tracking and regular sleep schedules.',
        'Avoid smoking and limit alcohol consumption.'
      ],
      diet_suggestions: [
        'Emphasize nutrient-dense whole foods and balanced hydration.',
        'Reduce intake of highly processed foods and added sugars.'
      ],
      physical_activity: [
        'Aim for 10,000 steps daily or 30 minutes of active movement.',
        'Incorporate light mobility and stretching exercises.'
      ],
      monitoring_suggestions: [
        'Perform periodic biometric health tracking.',
        'Schedule routine wellness checkups with your doctor.'
      ]
    };
  };

  const currentRecs = aiRecs;

  const categories = currentRecs ? [
    { title: t('lifestyle'), items: currentRecs.general_lifestyle || currentRecs.lifestyle, icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { title: t('diet'), items: currentRecs.diet_suggestions || currentRecs.diet, icon: Utensils, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { title: t('activity'), items: currentRecs.physical_activity || currentRecs.activity, icon: Dumbbell, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { title: t('monitoring'), items: currentRecs.monitoring_suggestions || currentRecs.monitoring, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  ] : [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 relative z-10 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">{layerTitle} Care Recommendations</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {riskCategory} RISK
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                Personalized Health Guidance
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold text-slate-700">Analyzing metrics and generating personalized guidance...</span>
          </div>
        ) : !currentRecs ? (
          /* Generate Prompt View */
          <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Personalized Health Care Analysis</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Click below to analyze your specific layer biometrics and generate personalized lifestyle, dietary, physical activity, and monitoring recommendations.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Analyze & Generate Care Guidance
            </button>
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const itemsList = Array.isArray(cat.items) ? cat.items : (cat.items ? [cat.items] : []);
              return (
                <div key={idx} className={`p-4 rounded-2xl border ${cat.bg} space-y-2`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    <h4 className="text-xs font-black text-slate-900">{cat.title}</h4>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-700 font-medium leading-relaxed">
                    {itemsList.map((item, i) => {
                      const itemText = typeof item === 'object' ? (item.text || item.advice || item.suggestion || JSON.stringify(item)) : String(item);
                      return (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{itemText}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Health Guidance
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
