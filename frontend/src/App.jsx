import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatbotDrawer from './components/ChatbotDrawer';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import HealthDataInputPage from './pages/HealthDataInputPage';
import DiabetesAssessment from './pages/DiabetesAssessment';
import HeartAssessment from './pages/HeartAssessment';
import ChronicAssessment from './pages/ChronicAssessment';
import RecommendationsPage from './pages/RecommendationsPage';
import HistoryTrends from './pages/HistoryTrends';
import PredictionHistoryPage from './pages/PredictionHistoryPage';
import ChatPage from './pages/ChatPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';

import { Loader2 } from 'lucide-react';

function AppLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Navbar toggleChat={() => setIsChatOpen(prev => !prev)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-3 lg:p-6 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/assess/diabetes" element={<ProtectedRoute><DiabetesAssessment /></ProtectedRoute>} />
            <Route path="/assess/heart" element={<ProtectedRoute><HeartAssessment /></ProtectedRoute>} />
            <Route path="/assess/chronic" element={<ProtectedRoute><ChronicAssessment /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryTrends /></ProtectedRoute>} />
            <Route path="/prediction-history" element={<ProtectedRoute><PredictionHistoryPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <ChatbotDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

function RootRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa] text-indigo-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/*" element={user ? <AppLayout /> : <Navigate to="/landing" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <RootRouter />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
