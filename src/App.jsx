import { useState, useEffect } from 'react';
import { apiCall, setToken, loginAPI, onUnauthorized } from './api';
import LoginPage from './pages/LoginPage';
import ManagerPage from './pages/ManagerPage';
import ConseillerPage from './pages/ConseillerPage';

export default function App() {
  const [page, setPage] = useState('loading');
  const [me, setMe] = useState(null);

  useEffect(() => {
    onUnauthorized(() => {
      setMe(null);
      setPage('login');
    });
    const token = localStorage.getItem('wicall_token');
    if (token) {
      apiCall('GET', '/auth/me')
        .then(user => {
          setMe({ role: user.role, name: user.full_name, billing_access: user.billing_access });
          setPage(user.role === 'manager' || user.role === 'super_admin' ? 'manager' : 'conseiller');
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
    setMe({ role: data.role, name: data.full_name, billing_access: data.billing_access });
    setPage(data.role === 'manager' || data.role === 'super_admin' ? 'manager' : 'conseiller');
  };

  const handleLogout = () => {
    setToken(null);
    setMe(null);
    setPage('login');
  };

  if (page === 'loading') return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#060d14',flexDirection:'column',gap:'16px'}}>
      <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'linear-gradient(135deg,rgba(0,210,200,0.25),rgba(0,210,200,0.05))',border:'1.5px solid rgba(0,210,200,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'24px',fontWeight:700,color:'#00f5ea',boxShadow:'0 0 20px rgba(0,210,200,0.3)'}}>W</div>
      <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'13px',color:'rgba(0,210,200,0.5)',letterSpacing:'3px',textTransform:'uppercase'}}>Chargement...</div>
    </div>
  );
  if (page === 'login') return <LoginPage onLogin={handleLogin} />;
  if (page === 'manager') return <ManagerPage me={me} onLogout={handleLogout} />;
  if (page === 'conseiller') return <ConseillerPage me={me} onLogout={handleLogout} />;
}
