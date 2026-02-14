import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import InfoConfirmPage from './pages/InfoConfirmPage';
import BioPage from './pages/BioPage';
import ImagePage from './pages/ImagePage';
import ReadmePage from './pages/ReadmePage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/info-confirm" element={<InfoConfirmPage />} />
          <Route path="/bio" element={<BioPage />} />
          <Route path="/image" element={<ImagePage />} />
          <Route path="/readme" element={<ReadmePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
