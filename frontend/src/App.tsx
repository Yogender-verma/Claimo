import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

const StoryPage = lazy(() => import('./pages/StoryPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg text-teal dark:text-dark-teal">
            <div className="w-8 h-8 border-2 border-teal dark:border-dark-teal border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
