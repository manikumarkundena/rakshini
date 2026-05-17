
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { Shield, Map, Users, Zap, Eye, Lock } from 'lucide-react';

const steps = [
  {
    title: "AI Protection That Cares",
    description: "Smart AI that predicts risks, alerts you in real-time and keeps you protected.",
    icon: Shield,
    color: "bg-saffron"
  },
  {
    title: "Emergency SOS In Seconds",
    description: "Instant SOS alerts to your guardians and nearest help in one tap.",
    icon: Zap,
    color: "bg-orange-500"
  },
  {
    title: "Guardian Network",
    description: "Add your trusted guardians who will be notified and reach you fast.",
    icon: Users,
    color: "bg-amber-500"
  },
  {
    title: "AI Safe Routing",
    description: "Get AI-powered safe routes that avoid danger zones and isolated areas.",
    icon: Map,
    color: "bg-orange-600"
  },
  {
    title: "Stealth Protection",
    description: "Stay safe discreetly with stealth mode and hidden emergency features.",
    icon: Eye,
    color: "bg-gray-800"
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/auth');
    }
  };

  const handleSkip = () => navigate('/auth');

  const StepIcon = steps[currentStep].icon;

  return (
    <PageTransition>
      <div className="min-h-screen bg-cream flex flex-col pt-12 px-6 pb-20 justify-between">
        <div className="flex justify-end">
          <button onClick={handleSkip} className="text-gray-400 font-medium text-sm hover:text-saffron transition-colors">
            Skip
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center text-center max-w-sm"
            >
              <div className={`w-64 h-80 rounded-[40px] ${steps[currentStep].color} shadow-2xl mb-12 flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-[-20%] left-[-20%] w-full h-full border-[1px] border-white rounded-full transform rotate-45" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-full h-full border-[1px] border-white rounded-full transform -rotate-12" />
                </div>
                <StepIcon className="w-32 h-32 text-white relative z-10" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">{steps[currentStep].title}</h2>
              <p className="text-gray-500 leading-relaxed px-4">{steps[currentStep].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center space-y-10">
          {/* Indicators */}
          <div className="flex space-x-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-8 bg-saffron' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full h-16 saffron-gradient text-white font-bold rounded-2xl shadow-xl shadow-saffron/30 flex items-center justify-center text-lg"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
}
