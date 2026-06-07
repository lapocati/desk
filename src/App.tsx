import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from '@/pages/HomePage';
import UploadPage from '@/pages/UploadPage';
import LoadingPage from '@/pages/LoadingPage';
import DialoguePage from '@/pages/DialoguePage';
import ObservationPage from '@/pages/ObservationPage';
import ResultPage from '@/pages/ResultPage';
import ComparePage from '@/pages/ComparePage';
import TimelinePage from '@/pages/TimelinePage';

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/dialogue" element={<DialoguePage />} />
          <Route path="/observation" element={<ObservationPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;