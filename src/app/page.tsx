'use client';

import { useState } from 'react';
import AuditForm from '@/components/AuditForm';
import AuditDashboard from '@/components/AuditDashboard';
import type { AuditReport, BrandInput } from '@/types/audit';

type AppState = 'form' | 'loading' | 'dashboard';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('form');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const handleSubmit = async (data: {
    brandInput: BrandInput;
    mode: 'scrape';
  }) => {
    setAppState('loading');
    setError(null);

    // Set loading messages for scrape mode
    setLoadingStep('🚀 Initializing live data scraping...');
    setTimeout(() => setLoadingStep('📸 Scraping Instagram profile & posts...'), 3000);
    setTimeout(() => setLoadingStep('📊 Analyzing engagement metrics...'), 8000);
    if (data.brandInput.amazonUrl) {
      setTimeout(() => setLoadingStep('🛒 Fetching Amazon products...'), 15000);
    }
    setTimeout(() => setLoadingStep('🏆 Comparing with competitors...'), 20000);
    setTimeout(() => setLoadingStep('🧠 AI generating insights...'), 35000);
    setTimeout(() => setLoadingStep('🧠 AI generating insights...'), 45000);
    setTimeout(() => setLoadingStep('📋 Building your dashboard...'), 55000);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandInput: data.brandInput,
          mode: 'scrape',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate audit report');
      }

      setReport(result.report);
      setAppState('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setAppState('form');
    }
  };

  const handleReset = () => {
    setReport(null);
    setAppState('form');
    setError(null);
  };

  return (
    <main className="main-container">
      <div className="container">
        {appState === 'form' && (
          <div className="form-container fade-in">
            <div className="hero-section">
              <div className="logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="2">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h1 className="text-gradient">Buzz Researcher</h1>
              <p className="tagline">
                AI-powered brand research tool. Get actionable insights with SWOT analysis and visual dashboards.
              </p>
            </div>

            {error && (
              <div className="error-banner fade-in">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            <div className="glass-card form-card">
              <AuditForm onSubmit={handleSubmit} isLoading={false} />
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <h3>Perplexity Deep Research</h3>
                <p>Real-time web search and analysis using Perplexity's powerful AI to gather public data.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3>Visual Dashboard</h3>
                <p>Interactive charts, SWOT analysis, and competitor benchmarks in a beautiful dashboard.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <h3>Export to PPT</h3>
                <p>One-click export to professional PowerPoint presentations for stakeholder sharing.</p>
              </div>
            </div>
          </div>
        )}

        {appState === 'loading' && (
          <div className="loading-container fade-in">
            <div className="loading-card glass-card">
              <div className="loading-animation">
                <div className="pulse-ring"></div>
                <div className="pulse-ring"></div>
                <div className="pulse-ring"></div>
                <div className="loading-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
              </div>
              <h2>Generating Intelligence Report</h2>
              <p className="loading-step">{loadingStep}</p>
              <div className="loading-progress">
                <div className="progress-bar">
                  <div className="progress-fill animated"></div>
                </div>
              </div>
              <p className="loading-note">
                This may take 1-2 minutes as we perform deep web research...
              </p>
            </div>
          </div>
        )}

        {appState === 'dashboard' && report && (
          <div className="dashboard-container fade-in">
            <AuditDashboard report={report} onReset={handleReset} />
          </div>
        )}
      </div>

      <style jsx>{`
        .main-container {
          min-height: 100vh;
          padding: var(--space-8) 0;
        }

        .form-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .hero-section {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .logo {
          margin-bottom: var(--space-4);
        }

        .hero-section h1 {
          font-size: 2.5rem;
          margin-bottom: var(--space-4);
        }

        .tagline {
          color: var(--text-secondary);
          font-size: 1.0625rem;
          line-height: 1.6;
          max-width: 540px;
          margin: 0 auto;
        }

        .form-card {
          margin-bottom: var(--space-8);
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.3);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-6);
          color: var(--accent-rose);
        }

        .error-banner span {
          flex: 1;
          font-size: 0.875rem;
        }

        .error-banner button {
          background: none;
          border: none;
          color: var(--accent-rose);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
        }

        .feature-card {
          text-align: center;
          padding: var(--space-5);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          transition: all var(--transition-base);
          box-shadow: var(--shadow-xs);
        }

        .feature-card:hover {
          border-color: var(--accent-teal);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto var(--space-3);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(20, 184, 166, 0.1);
          border-radius: var(--radius-md);
          color: var(--accent-teal);
        }

        .feature-card h3 {
          font-size: 0.9375rem;
          margin-bottom: var(--space-2);
          color: var(--text-primary);
        }

        .feature-card p {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Loading State */
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .loading-card {
          text-align: center;
          padding: var(--space-12);
          max-width: 480px;
        }

        .loading-animation {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto var(--space-8);
        }

        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border: 2px solid var(--accent-teal);
          border-radius: 50%;
          animation: pulse-ring 2s ease-out infinite;
        }

        .pulse-ring:nth-child(2) {
          animation-delay: 0.5s;
        }

        .pulse-ring:nth-child(3) {
          animation-delay: 1s;
        }

        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        .loading-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-teal);
          border-radius: 50%;
          color: white;
          animation: icon-pulse 2s ease-in-out infinite;
          box-shadow: 0 4px 14px rgba(20, 184, 166, 0.3);
        }

        @keyframes icon-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }

        .loading-card h2 {
          font-size: 1.5rem;
          margin-bottom: var(--space-3);
          color: var(--text-primary);
        }

        .loading-step {
          color: var(--accent-teal);
          font-size: 0.9375rem;
          margin-bottom: var(--space-6);
          min-height: 1.5em;
        }

        .loading-progress {
          margin-bottom: var(--space-4);
        }

        .progress-fill.animated {
          animation: progress-animation 20s ease-in-out forwards;
        }

        @keyframes progress-animation {
          0% { width: 0%; }
          10% { width: 15%; }
          30% { width: 35%; }
          50% { width: 55%; }
          70% { width: 75%; }
          90% { width: 90%; }
          100% { width: 95%; }
        }

        .loading-note {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        /* Dashboard */
        .dashboard-container {
          width: 100%;
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 1.75rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .main-container {
            padding: var(--space-4) 0;
          }
        }
      `}</style>
    </main>
  );
}
