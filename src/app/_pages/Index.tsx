import { useState, useEffect } from 'react';
import { User } from '@/types';
import Login from './Login';
import Dashboard from './Dashboard';
import Matching from './Matching';
import Profile from './Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'matching' | 'profile'>('dashboard');

  // 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem('everylice-user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // 사용자 정보 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('everylice-user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('everylice-user');
    setCurrentPage('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleNavigate = (page: 'dashboard' | 'matching' | 'profile') => {
    setCurrentPage(page);
  };

  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      {currentPage === 'dashboard' && (
        <Dashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'matching' && (
        <Matching
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'profile' && (
        <Profile
          currentUser={currentUser}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          onNavigate={handleNavigate}
        />
      )}
      
      {/* Toast Container - 모든 페이지에서 표시되도록 */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}