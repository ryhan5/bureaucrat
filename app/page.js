'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageContainer from '../components/PageContainer';

function DashboardCard({ title, description, icon, features, gradient, href, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`
        group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl 
        transition-all duration-300 bg-white hover:-translate-y-1
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.07] transition-opacity`} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-transparent opacity-50" />
      
      <Link href={href} className="block p-6 relative">
        <div className="flex items-center gap-4 mb-4">
          <div className={`
            w-14 h-14 rounded-xl flex items-center justify-center text-2xl
            bg-gradient-to-br ${gradient} text-white shadow-lg
            group-hover:scale-110 transition-transform duration-300
          `}>
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h2>
        </div>
        
        <p className="text-gray-600 mb-6 group-hover:text-gray-900 transition-colors">
          {description}
        </p>
        
        <div className="space-y-3">
          {features.map((feature, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index * 0.1) + (i * 0.1) }}
              className="flex items-center gap-3 text-sm text-gray-600"
            >
              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${gradient} group-hover:scale-150 transition-transform`} />
              {feature}
            </motion.div>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 px-4"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 
              bg-clip-text text-transparent mb-6 leading-tight"
          >
            Bureaucrat AI Assistant
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            Your intelligent companion for streamlining bureaucratic tasks with AI-powered voice dictation, 
            content creation, translation, and task management.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 sm:px-6 pb-12">
          {[
            {
              href: "/voice-notes",
              title: "Voice Notes with AI Grammar",
              description: "Create professional notes through voice dictation with real-time AI grammar correction.",
              icon: "🎤",
              features: [
                "Real-time voice-to-text",
                "AI grammar correction",
                "Professional style enhancement",
                "Secure storage"
              ],
              gradient: "from-rose-500 to-pink-500"
            },
            {
              href: "/tasks",
              title: "Smart Task Management",
              description: "Stay organized with AI-powered task tracking and intelligent reminders.",
              icon: "📅",
              features: [
                "Web notifications",
                "Calendar integration",
                "Priority management",
                "Deadline tracking"
              ],
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              href: "/translator",
              title: "Context-Aware Translation",
              description: "Accurate Hindi-English translations that preserve bureaucratic context and meaning.",
              icon: "🌐",
              features: [
                "Real-time translation",
                "Context preservation",
                "Professional terminology",
                "Bureaucratic accuracy"
              ],
              gradient: "from-emerald-500 to-teal-500"
            },
            {
              href: "/ai-writer",
              title: "AI Content Generator",
              description: "Generate professional speeches, letters, and documents with advanced AI assistance.",
              icon: "✍️",
              features: [
                "Speech generation",
                "Document templates",
                "Secure content",
                "Professional tone"
              ],
              gradient: "from-violet-500 to-purple-500"
            }
          ].map((card, index) => (
            <DashboardCard key={card.href} {...card} index={index} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
