import React from 'react';
import { useInternetIdentity } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import CourtroomVR from './components/CourtroomVR';

const App: React.FC = () => {
  const { principal, isAuthenticated, isDemo, authError, login, demoLogin, logout, clearError } = useInternetIdentity();

  return (
    <div className="app-container">
      {/* Animated background orbs */}
      <div className="bg-gradient-orbs">
        <div className="orb"></div>
        <div className="orb"></div>
        <div className="orb"></div>
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          VerdictXR
          <span>On-Chain Courtroom</span>
        </div>
        <div className="header-actions">
          {isAuthenticated && principal && (
            <>
              <div className="principal-badge">
                <span className="dot"></span>
                {isDemo ? '🎮 Demo Mode' : principal.substring(0, 16) + '...'}
              </div>
              <button className="btn btn-ghost" onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      {!isAuthenticated ? (
        <LandingPage onLogin={login} onDemoLogin={demoLogin} authError={authError} onClearError={clearError} />
      ) : (
        <div className="main-layout">
          <div className="courtroom-panel">
            <CourtroomVR />
            <div className="courtroom-overlay">
              <span className="chip">🎥 3D Courtroom</span>
              <span className="chip">WebXR Ready</span>
            </div>
          </div>
          <Dashboard principal={principal!} />
        </div>
      )}
    </div>
  );
};

/* ============================================
   Landing Page Component
   ============================================ */

interface LandingPageProps {
  onLogin: () => void;
  onDemoLogin: () => void;
  authError: string | null;
  onClearError: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onDemoLogin, authError, onClearError }) => (
  <section className="hero-section">
    <div className="hero-badge">Powered by Internet Computer</div>
    
    <h1 className="hero-title">
      The Future of<br />
      <span className="gradient-text">Digital Justice</span>
    </h1>
    
    <p className="hero-subtitle">
      AI-powered courtroom simulation with immersive VR, transparent on-chain verdicts, 
      and decentralized evidence management — all in your browser.
    </p>

    {/* Auth Error Banner */}
    {authError && (
      <div className="auth-error-banner">
        <div className="auth-error-content">
          <span className="auth-error-icon">⚠️</span>
          <div>
            <strong>Internet Identity Unavailable</strong>
            <p>{authError}</p>
          </div>
          <button className="auth-error-close" onClick={onClearError}>✕</button>
        </div>
        <button className="btn btn-primary" onClick={onDemoLogin} style={{ marginTop: 12, width: '100%' }}>
          🚀 Use Demo Mode Instead
        </button>
      </div>
    )}
    
    <div className="hero-buttons">
      <button className="btn btn-primary btn-lg" onClick={onDemoLogin}>
        🚀 Try Demo
      </button>
      <button className="btn btn-secondary btn-lg" onClick={onLogin}>
        🔐 Login with Internet Identity
      </button>
    </div>

    <div className="hero-features">
      <div className="hero-feature-card">
        <div className="icon">⚖️</div>
        <h4>AI Judge</h4>
        <p>LLM-powered legal reasoning for fair verdicts</p>
      </div>
      <div className="hero-feature-card">
        <div className="icon">🥽</div>
        <h4>VR Courtroom</h4>
        <p>WebXR 3D courtroom with Three.js</p>
      </div>
      <div className="hero-feature-card">
        <div className="icon">🔗</div>
        <h4>On-Chain</h4>
        <p>All trials and evidence stored on ICP</p>
      </div>
    </div>
  </section>
);

export default App;