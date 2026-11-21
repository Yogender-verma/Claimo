import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';

const StoryPage = lazy(() => import('./pages/StoryPage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const SchemeDetailPage = lazy(() => import('./pages/SchemeDetailPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

export const App: React.FC = () => {
  return (
    <AuthProvider>
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
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/schemes/:id" element={<SchemeDetailPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
