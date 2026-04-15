import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sparkles, Utensils, Users, Heart, X, ChevronRight } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Ulikula?",
    description: "The exclusive food community for MMUST students. Share your meal combos and see what others are eating!",
    icon: <Sparkles className="w-8 h-8 text-blue-400" />,
    color: "from-blue-600 to-blue-400"
  },
  {
    title: "Post Your Meal",
    description: "Click the '+' button to share your meal. Our AI will generate a professional photo or even a cinematic video!",
    icon: <Utensils className="w-8 h-8 text-orange-400" />,
    color: "from-orange-600 to-orange-400"
  },
  {
    title: "Connect with Comrades",
    description: "Follow your friends, start meal streaks, and mention them in comments using @username.",
    icon: <Users className="w-8 h-8 text-green-400" />,
    color: "from-green-600 to-green-400"
  },
  {
    title: "Like & Comment",
    description: "Double tap to like a post. Use emojis and stickers to express your love for the food!",
    icon: <Heart className="w-8 h-8 text-red-400" />,
    color: "from-red-600 to-red-400"
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className={`h-32 bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center relative`}>
          <button 
            onClick={onComplete}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <motion.div
            key={currentStep}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-white/20 backdrop-blur-md rounded-2xl"
          >
            {steps[currentStep].icon}
          </motion.div>
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
            <p className="text-blue-200/60 text-sm leading-relaxed">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-blue-500' : 'w-2 bg-white/10'}`}
              />
            ))}
          </div>

          <Button 
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold group"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
