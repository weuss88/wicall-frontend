import { useState, useEffect } from 'react';
import { apiCall, setToken, loginAPI } from './api';
import LoginPage from './pages/LoginPage';
import ManagerPage from './pages/ManagerPage';
import ConseillerPage from './pages/ConseillerPage';

export default function App() {
  const [page, setPage] = useState('loading');
  const [me, setMe] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('wicall_token');
    if (token) {
      apiCall('GET', '/auth/me')
        .then(user => {
          setMe({ role: user.role, name: user.full_name });
          setPage(user.role === 'manager' ? 'manager' : 'conseiller');
        })
        .catch(() => {
          setToken(null);
          setPage('login');
        });
    } else {
      setPage('login');
    }
  }, []);

  const handleLogin = async (username, password) => {
    const data = await loginAPI(username, password);
    setToken(data.access_token);
    setMe({ role: data.role, name: data.full_name });
    setPage(data.role === 'manager' ? 'manager' : 'conseiller');
  };

  const handleLogout = () => {
    setToken(null);
    setMe(null);
    setPage('login');
  };

  if (page === 'loading') return null;
  if (page === 'login') return <LoginPage onLogin={handleLogin} />;
  if (page === 'manager') return <ManagerPage me={me} onLogout={handleLogout} />;
  if (page === 'conseiller') return <ConseillerPage me={me} onLogout={handleLogout} />;
}
