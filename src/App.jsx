import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

const HomePage = lazy(() => import('./pages/HomePage'));
const AtlasPage = lazy(() => import('./pages/AtlasPage'));
const RebiomePage = lazy(() => import('./pages/RebiomePage'));
const NovabiomePage = lazy(() => import('./pages/NovabiomePage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const EvidencePage = lazy(() => import('./pages/EvidencePage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const RefundPage = lazy(() => import('./pages/RefundPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AdminUploadPage = lazy(() => import('./pages/AdminUploadPage'));

function PageFallback() {
  return <div className="page-skeleton">Loading...</div>;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="app-main">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/atlas" element={<AtlasPage />} />
            <Route path="/rebiome" element={<RebiomePage />} />
            <Route path="/novabiome" element={<NovabiomePage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund" element={<RefundPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/admin-upload" element={<AdminUploadPage />} />

            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="/atlas.html" element={<Navigate to="/atlas" replace />} />
            <Route path="/rebiome.html" element={<Navigate to="/rebiome" replace />} />
            <Route path="/novabiome.html" element={<Navigate to="/novabiome" replace />} />
            <Route path="/team.html" element={<Navigate to="/team" replace />} />
            <Route path="/careers.html" element={<Navigate to="/careers" replace />} />
            <Route path="/contact.html" element={<Navigate to="/contact" replace />} />
            <Route path="/evidence.html" element={<Navigate to="/evidence" replace />} />
            <Route path="/privacy.html" element={<Navigate to="/privacy" replace />} />
            <Route path="/terms.html" element={<Navigate to="/terms" replace />} />
            <Route path="/refund.html" element={<Navigate to="/refund" replace />} />
            <Route path="/signin.html" element={<Navigate to="/signin" replace />} />
            <Route path="/signup.html" element={<Navigate to="/signup" replace />} />
            <Route path="/account.html" element={<Navigate to="/account" replace />} />
            <Route path="/admin-upload.html" element={<Navigate to="/admin-upload" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
