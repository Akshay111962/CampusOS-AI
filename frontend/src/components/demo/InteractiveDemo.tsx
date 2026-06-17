import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquare, ListTodo } from 'lucide-react';
import { DemoDashboard } from './DemoDashboard';
import { DemoChat } from './DemoChat';
import { DemoDeadlines } from './DemoDeadlines';

type TabType = 'dashboard' | 'chat' | 'deadlines';

export const InteractiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Your Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Ask Campus AI', icon: MessageSquare },
    { id: 'deadlines', label: 'Upcoming Deadlines', icon: ListTodo }
  ] as const;

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DemoDashboard />;
      case 'chat':
        return <DemoChat />;
      case 'deadlines':
        return <DemoDeadlines />;
    }
  };

  return (
    <div className="w-full">
      {/* Tab Selectors */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl backdrop-blur-md max-w-lg w-full sm:w-auto overflow-x-auto select-none no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  rounded-xl
                  text-sm
                  font-medium
                  transition-colors
                  duration-200
                  flex-1
                  sm:flex-none
                  whitespace-nowrap
                  cursor-pointer
                  z-10
                  ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}
                `.trim()}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-demo-tab"
                    className="absolute inset-0 bg-gradient-to-r from-accent-indigo/15 to-accent-cyan/15 border border-accent-indigo/25 rounded-xl -z-10 shadow-[0_2px_10px_rgba(99,102,241,0.15)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 stroke-[1.5] ${isActive ? 'text-accent-cyan' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo View Window */}
      <div className="relative min-h-[460px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderActiveComponent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InteractiveDemo;
