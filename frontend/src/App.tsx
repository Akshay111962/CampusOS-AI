import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import DemoPage from './pages/DemoPage';
import AssistantPage from './pages/AssistantPage';
import UniversitiesPage from './pages/UniversitiesPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';
import { AuthGate } from './components/ui/AuthGate';

// Scroll to top helper on route transitions
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-bg-deep min-h-screen flex items-center justify-center text-text-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-cyan"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }


  return (
    <Router>
      <ScrollToTop />
      <div className="bg-bg-deep text-text-primary min-h-screen flex flex-col justify-between overflow-x-hidden">
        {/* Sticky Navbar */}
        <Navbar />

        {/* Page Content Container */}
        <main className="flex-grow w-full relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/universities" element={<UniversitiesPage />} />
            {/* Fallback redirect to Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
