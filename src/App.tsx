import { Fragment, lazy, Suspense, useEffect, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Celebrations } from './components/layout/Celebrations';
import { getState, update, useAppState } from './engine/store';
import { Home } from './pages/Home';

const Learn = lazy(() => import('./pages/Learn'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const Lesson = lazy(() => import('./pages/Lesson'));
const PracticeHub = lazy(() => import('./pages/PracticeHub'));
const Session = lazy(() => import('./pages/Session'));
const CodeLab = lazy(() => import('./pages/CodeLab'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Daily = lazy(() => import('./pages/Daily'));
const BossBattle = lazy(() => import('./pages/BossBattle'));
const Game = lazy(() => import('./pages/Game'));
const Revision = lazy(() => import('./pages/Revision'));
const RevisionTopic = lazy(() => import('./pages/RevisionTopic'));
const Exam = lazy(() => import('./pages/Exam'));
const ExamSession = lazy(() => import('./pages/ExamSession'));
const Structured = lazy(() => import('./pages/Structured'));
const Progress = lazy(() => import('./pages/Progress'));
const NotFound = lazy(() => import('./pages/NotFound'));

function Loading() {
  return (
    <div className="page-loading" role="status" aria-label="Loading">
      <span className="loader" />
    </div>
  );
}

function ThemeSync() {
  const s = useAppState();
  useEffect(() => {
    const root = document.documentElement;
    if (s.profile.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', s.profile.theme);
  }, [s.profile.theme]);
  return null;
}

function ScrollAndTrack() {
  const loc = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (!/session|lesson|boss|games|exam\/(mock|timed)/.test(loc.pathname) && getState().lastPath !== loc.pathname) {
      update((d) => {
        d.lastPath = loc.pathname;
      });
    }
  }, [loc.pathname]);
  return null;
}

const S = ({ children }: { children: ReactNode }) => <Suspense fallback={<Loading />}>{children}</Suspense>;

/** Remount a page when its URL parameters change, so per-page state never leaks between items. */
function K({ children }: { children: ReactNode }) {
  const params = useParams();
  return (
    <Suspense fallback={<Loading />}>
      <Fragment key={JSON.stringify(params)}>{children}</Fragment>
    </Suspense>
  );
}

export function App() {
  return (
    <HashRouter>
      <ThemeSync />
      <ScrollAndTrack />
      <Routes>
        {/* Focus-mode screens (no navigation chrome) */}
        <Route path="/learn/:topicId/lesson" element={<K><Lesson /></K>} />
        <Route path="/practice/session" element={<S><Session /></S>} />
        <Route path="/challenges/boss/:bossId" element={<K><BossBattle /></K>} />
        <Route path="/games/:gameId" element={<K><Game /></K>} />
        <Route path="/exam/run/:kind" element={<K><ExamSession /></K>} />
        <Route path="/exam/structured/:id" element={<K><Structured /></K>} />
        {/* Main app */}
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="learn" element={<S><Learn /></S>} />
          <Route path="learn/:topicId" element={<K><TopicPage /></K>} />
          <Route path="practice" element={<S><PracticeHub /></S>} />
          <Route path="lab" element={<S><CodeLab /></S>} />
          <Route path="challenges" element={<S><Challenges /></S>} />
          <Route path="challenges/daily" element={<S><Daily /></S>} />
          <Route path="revision" element={<S><Revision /></S>} />
          <Route path="revision/:topicId" element={<K><RevisionTopic /></K>} />
          <Route path="exam" element={<S><Exam /></S>} />
          <Route path="exam/timed" element={<Navigate to="/exam/run/timed" replace />} />
          <Route path="exam/mock" element={<Navigate to="/exam/run/mock" replace />} />
          <Route path="progress" element={<S><Progress /></S>} />
          <Route path="*" element={<S><NotFound /></S>} />
        </Route>
      </Routes>
      <Celebrations />
    </HashRouter>
  );
}
