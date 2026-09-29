import { useState, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import NavigatorPage from './pages/NavigatorPage';
import './index.css';

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'navigator'
  const [initialFloorId, setInitialFloorId] = useState('floor1');

  const goToNavigator = useCallback((floorId = 'floor1') => {
    setInitialFloorId(floorId);
    setPage('navigator');
  }, []);

  const goToLanding = useCallback(() => {
    setPage('landing');
  }, []);

  return (
    <AuthProvider>
      {page === 'navigator' ? (
        <NavigatorPage initialFloorId={initialFloorId} onGoHome={goToLanding} />
      ) : (
        <LandingPage onNavigate={goToNavigator} />
      )}
    </AuthProvider>
  );
}
