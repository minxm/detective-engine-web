import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import AuthProvider from '@/components/AuthProvider';
import AppHeader from '@/components/AppHeader';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import CursorGlow from '@/components/hud/CursorGlow';
import CrtOverlay from '@/components/hud/CrtOverlay';
import ScrollToTop from '@/components/ScrollToTop';
import EntryPage from '@/pages/EntryPage';
import AuthPage from '@/pages/AuthPage';
import LobbyPage from '@/pages/LobbyPage';
import ArchivePage from '@/pages/ArchivePage';
import GeneratingPage from '@/pages/GeneratingPage';
import CasePage from '@/pages/CasePage';
import EvidencePage from '@/pages/EvidencePage';
import ForensicsPage from '@/pages/ForensicsPage';
import InterrogateHubPage from '@/pages/InterrogateHubPage';
import InterrogatePage from '@/pages/InterrogatePage';
import DeductionPage from '@/pages/DeductionPage';
import ReconstructionPage from '@/pages/ReconstructionPage';
import ResultPage from '@/pages/ResultPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import AdminPage from '@/pages/AdminPage';
import {
  LegacyHistoryRedirect,
  LegacyHomeRedirect,
  LegacyInterrogateRedirect,
  LegacyInvestigateRedirect,
  LegacyResultRedirect,
} from '@/pages/LegacyRedirects';

function AppRoutes() {
  const location = useLocation();
  const hideChrome = ['/', '/auth'].includes(location.pathname) || location.pathname.includes('/interrogate/');
  const isInterrogateChat = /\/case\/[^/]+\/interrogate\/[^/]+/.test(location.pathname);

  return (
    <>
      <CrtOverlay />
      {!hideChrome && !isInterrogateChat && <CinematicBackdrop />}
      {!hideChrome && <CursorGlow />}
      {!hideChrome && !isInterrogateChat && <AppHeader />}
      <ScrollToTop />
      <Routes>
          {/* 全局流程 */}
          <Route path="/" element={<EntryPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/generating/:jobId" element={<GeneratingPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* 案件流程 */}
          <Route path="/case/:id" element={<CasePage />} />
          <Route path="/case/:id/evidence" element={<EvidencePage />} />
          <Route path="/case/:id/forensics" element={<ForensicsPage />} />
          <Route path="/case/:id/interrogate" element={<InterrogateHubPage />} />
          <Route path="/case/:id/interrogate/:suspectId" element={<InterrogatePage />} />
          <Route path="/case/:id/deduction" element={<DeductionPage />} />
          <Route path="/case/:id/reconstruction" element={<ReconstructionPage />} />
          <Route path="/case/:id/result" element={<ResultPage />} />

          {/* 旧路由重定向 */}
          <Route path="/home" element={<LegacyHomeRedirect />} />
          <Route path="/history" element={<LegacyHistoryRedirect />} />
          <Route path="/investigate/:id" element={<LegacyInvestigateRedirect />} />
          <Route path="/interrogate/:id" element={<LegacyInterrogateRedirect />} />
          <Route path="/result/:id" element={<LegacyResultRedirect />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
