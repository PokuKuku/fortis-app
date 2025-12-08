/**
 * AIAnalyticsPage
 * An AI-powered analytics interface for querying training data and insights.
 * Features:
 * - Chat-based interface for asking questions about training data
 * - Real-time AI responses with typing animation
 * - Suggested questions for quick access
 * - Message history with timestamps
 * - Professional glassmorphic design
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Zap,
  Brain,
  ChevronRight,
  Loader,
  Activity,
  Flame,
  Users
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AIAnalyticsPageProps {
  userName?: string;
}

// Suggested questions for quick access
const SUGGESTED_QUESTIONS = [
  {
    icon: TrendingUp,
    question: 'What exercises have improved the most?',
    description: 'Analyze your progress across movements'
  },
  {
    icon: Zap,
    question: 'What should I focus on next week?',
    description: 'Get personalized workout recommendations'
  },
  {
    icon: Brain,
    question: 'How am I progressing overall?',
    description: 'Review your training trends'
  },
  {
    icon: MessageSquare,
    question: 'Compare my stats to last month',
    description: 'Track your monthly improvements'
  }
];

// Particle background
const ParticleBackground = () => {
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 10 + Math.random() * 14,
    delay: Math.random() * 6,
    size: 1 + Math.random() * 2.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#4ade80]/8"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -120],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// --- Stainless Steel Pattern Helper ---
const StainlessSteelPattern = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-black via-zinc-900 to-black transition-colors duration-300">
      {/* Brushed Metal Texture Base */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)`
      }} />
      <div className="absolute inset-0 opacity-10" style={{
         backgroundImage: `repeating-linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 2%, transparent 4%)`
      }} />

      {/* Stainless steel pattern - SVG version */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern id="slashPattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            {/* Staggered Stainless Steel Pattern */}
            {/* Row 1: Forward Slash / centered at 6,6 */}
            <line x1="3" y1="9" x2="9" y2="3" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Row 2: Backslash \ centered at 18,18 (sitting in between) */}
            <line x1="15" y1="15" x2="21" y2="21" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#slashPattern)" />
      </svg>
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]" />
    </div>
  );
};

// Fortis Analytics Branding Header
const FortisHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3">
        <style>
          {`
          @keyframes shine {
            0% {
              background-position: 200% 200%;
            }
            100% {
              background-position: -200% -200%;
            }
          }
          `}
        </style>
        <h1
          className="text-[38px] tracking-[0.15em] text-center relative"
          style={{
            fontFamily: 'BankGothic, sans-serif',
            fontWeight: 900,
            // Metallic Green Gradient
            background: 'linear-gradient(110deg, #4ade80 0%, #22c55e 30%, #86efac 45%, #ffffff 50%, #86efac 55%, #22c55e 70%, #4ade80 100%)',
            // Setup for background clip text
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            // Animation
            animation: 'shine 5s linear infinite'
          }}
        >
          FORTIS
        </h1>
      </div>
    </motion.div>
  );
};

// AI Message Bubble
const AIMessage = ({ message }: { message: Message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-3 mb-6"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4ade80]/40 to-[#22c55e]/40 flex items-center justify-center border border-[#4ade80]/30">
          <Sparkles className="w-4 h-4 text-[#4ade80]" />
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-gradient-to-br from-white/8 to-white/3 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-2xl">
          {message.isTyping ? (
            <div className="flex items-center gap-2 h-6">
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-zinc-400"
              >
                {message.content}
              </motion.span>
            </div>
          ) : (
            <p className="text-zinc-100 text-sm leading-relaxed">{message.content}</p>
          )}
        </div>
        <span className="text-xs text-zinc-600 mt-2 block">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};

// User Message Bubble
const UserMessage = ({ message }: { message: Message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start justify-end gap-3 mb-6"
    >
      <div className="max-w-xs">
        <div className="bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-2xl px-4 py-3">
          <p className="text-black text-sm font-medium leading-relaxed">{message.content}</p>
        </div>
        <span className="text-xs text-zinc-600 mt-2 block text-right">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};

// Suggested Question Card
const SuggestedQuestion = ({ question, onSelect }: { question: typeof SUGGESTED_QUESTIONS[0]; onSelect: () => void }) => {
  const Icon = question.icon;

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left p-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-2xl hover:border-[#4ade80]/40 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/10 group-hover:from-[#4ade80]/30 group-hover:to-[#22c55e]/20 transition-all">
          <Icon className="w-4 h-4 text-[#4ade80]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white group-hover:text-[#4ade80] transition-colors">
            {question.question}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{question.description}</p>
        </div>
      </div>
    </motion.button>
  );
};

export function AIAnalyticsPage({ userName = 'User' }: AIAnalyticsPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hey ${userName}! I'm your AI training analyst. Ask me anything about your workout data, performance trends, or personalized recommendations. What would you like to know?`,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePage, setActivePage] = useState('ai');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'ai', label: 'AI Analysis', icon: Sparkles },
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponses = [
        `Based on your training data, I've noticed some interesting trends. Your volume has increased by 15% over the past week, particularly in compound movements. I'd recommend focusing on recovery and form refinement this week.`,
        `Great question! Your back exercises have shown the most improvement. Your squat depth and control have improved significantly. Consider adding more volume to chest exercises to balance your development.`,
        `Looking at your performance, you're on track for a fantastic month. Your consistency has been excellent. I recommend deloading next week to prevent overtraining and allow for optimal adaptation.`,
        `Your data shows you're strongest in the morning workouts. Consider scheduling your main lifts earlier in the day for better performance. Your accessory work could benefit from higher rep ranges.`,
        `I notice your progression on deadlifts has plateaued slightly. Try incorporating deficit deadlifts or speed work 2x per week. Your upper body strength is progressing well though!`
      ];

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 800);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="w-full h-full text-white overflow-hidden flex flex-col relative">
      <StainlessSteelPattern />
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ParticleBackground />
      </div>

      {/* Sidebar Navigation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-0 left-0 z-40 w-full border-t border-white/5 bg-gradient-to-t from-zinc-950/95 via-zinc-950/90 to-transparent backdrop-blur-xl md:fixed md:left-0 md:top-0 md:bottom-0 md:w-20 md:border-r md:border-t-0 md:border-l-0 md:from-zinc-950 md:to-zinc-950/80 md:flex md:flex-col md:items-center md:py-8"
      >
        <motion.div 
          className="hidden md:flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4ade80] to-[#22c55e] text-primary-foreground font-bold text-2xl mb-8 shadow-[0_0_30px_rgba(74,222,128,0.4)] border border-[#4ade80]/50"
          whileHover={{ scale: 1.1 }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Flame size={28} />
        </motion.div>
        
        <nav className="flex h-16 w-full justify-around items-center md:h-auto md:w-auto md:flex-col md:gap-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative p-3 rounded-xl transition-all duration-300 group",
                  activePage === item.id 
                    ? "text-[#4ade80] bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/5 border border-[#4ade80]/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent"
                )}
              >
                <Icon size={16} />
                {activePage === item.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] -translate-x-1/2 md:left-auto md:-right-1 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-1 md:h-8 shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                  />
                )}
                
                {/* Tooltip for desktop */}
                <span className="absolute left-full ml-4 px-3 py-1 bg-zinc-800/90 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 hidden md:block border border-white/10 font-semibold">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
        
        <div className="hidden md:flex mt-auto flex-col gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            className="p-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            <Users size={16} />
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full md:pl-20">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-6 backdrop-blur-sm">
          <FortisHeader />
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2">AI Training Analysis</h1>
            <p className="text-zinc-400 text-sm">Ask me anything about your training data and performance</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          <AnimatePresence>
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-12"
              >
                <div className="text-center mb-12">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/10 flex items-center justify-center border border-[#4ade80]/30 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
                  >
                    <Brain className="w-8 h-8 text-[#4ade80]" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-4">What would you like to know?</h2>
                  <p className="text-zinc-400 mb-8">Choose from suggestions below or ask your own question</p>
                </div>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {SUGGESTED_QUESTIONS.map((question, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <SuggestedQuestion
                        question={question}
                        onSelect={() => handleSuggestedQuestion(question.question)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'ai' ? (
                  <AIMessage message={message} />
                ) : (
                  <UserMessage message={message} />
                )}
              </div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4ade80]/40 to-[#22c55e]/40 flex items-center justify-center border border-[#4ade80]/30">
                    <Loader className="w-4 h-4 text-[#4ade80] animate-spin" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-white/8 to-white/3 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-2xl">
                    <div className="flex items-center gap-2">
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-zinc-400 text-sm"
                      >
                        Analyzing your data...
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 px-6 py-6 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSendMessage(inputValue);
                  }
                }}
                placeholder="Ask me about your training..."
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#4ade80]/40 focus:ring-1 focus:ring-[#4ade80]/30 transition-all backdrop-blur-2xl"
                disabled={isLoading}
              />
              <motion.button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all',
                  isLoading || !inputValue.trim()
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-gradient-to-b from-[#4ade80] to-[#22c55e] text-black hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]'
                )}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAnalyticsPage;
