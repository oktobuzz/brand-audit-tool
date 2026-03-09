'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

export interface BrandInput {
  brand: string;
  website: string;
  instagram: string;
  country: string;
  industry: string;
  amazonUrl?: string;
  youtubeUrl?: string;
  seoKeywords?: string;
  competitors?: string;
  enableInstagram?: boolean;
  enableAmazon?: boolean;
  enableYouTube?: boolean;
  enableWebsiteAudit?: boolean;
  instagramPostsLimit?: number; // Number of posts to analyze (30, 80, 150)
}

interface AuditFormProps {
  onSubmit: (data: {
    brandInput: BrandInput;
    mode: 'scrape';
  }) => void;
  isLoading: boolean;
}

export default function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [formData, setFormData] = useState<BrandInput>({
    brand: '',
    website: '',
    instagram: '',
    country: '',
    industry: '',
    amazonUrl: '',
    youtubeUrl: '',
    seoKeywords: '',
    competitors: '',
  });

  // Toggle states for optional data sources
  const [instagramEnabled, setInstagramEnabled] = useState(false); // Default disable to match others
  const [amazonEnabled, setAmazonEnabled] = useState(false);
  const [youtubeEnabled, setYoutubeEnabled] = useState(false);

  const [websiteAuditEnabled, setWebsiteAuditEnabled] = useState(false); // Default false
  const [instagramPostsLimit, setInstagramPostsLimit] = useState<number>(80); // Default to 3 months (~80 posts)
  // Reddit removed - no longer needed

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.brand) {
      alert('Brand name is required');
      return;
    }

    // Clear URLs based on toggle states
    const submitData: BrandInput = {
      ...formData,
      instagram: instagramEnabled ? formData.instagram : '',
      amazonUrl: amazonEnabled ? formData.amazonUrl : undefined,
      youtubeUrl: youtubeEnabled ? formData.youtubeUrl : undefined,
      enableInstagram: instagramEnabled,
      enableAmazon: amazonEnabled,
      enableYouTube: youtubeEnabled,

      enableWebsiteAudit: websiteAuditEnabled,
      instagramPostsLimit: instagramEnabled ? instagramPostsLimit : undefined,
    };

    onSubmit({
      brandInput: submitData,
      mode: 'scrape',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="audit-form">
      <div className="form-header">
        <div className="icon-wrapper">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <h2>Start Your Research</h2>
        <p>Enter brand details to generate insights</p>
      </div>

      {/* Brand Details */}
      <div className="section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Brand Details
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="brand">
            Brand Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            className="form-input"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g., Man Matters, Nike"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="industry">
            Industry / Niche <span className="required">*</span>
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            className="form-input"
            value={formData.industry}
            onChange={handleChange}
            placeholder="e.g., Men's Wellness, Fashion"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="website">
            Website URL
          </label>
          <input
            type="url"
            id="website"
            name="website"
            className="form-input"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://manmatters.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="country">
            Primary Market
          </label>
          <input
            type="text"
            id="country"
            name="country"
            className="form-input"
            value={formData.country}
            onChange={handleChange}
            placeholder="e.g., India, USA, Global"
          />
        </div>
      </div>

      {/* Data Sources */}
      <div className="scrape-section fade-in">
        <div className="section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          Data Sources
        </div>

        {/* Instagram Toggle */}
        <div className="toggle-section">
          <button
            type="button"
            className={`toggle-btn ${instagramEnabled ? 'active' : ''}`}
            onClick={() => setInstagramEnabled(!instagramEnabled)}
          >
            <span className="toggle-icon">{instagramEnabled ? '✅' : '📸'}</span>
            <span className="toggle-label">
              Instagram Analysis
              <small>{instagramEnabled ? 'Enabled - Enter handle below' : 'Click to enable'}</small>
            </span>
            <span className={`toggle-switch ${instagramEnabled ? 'on' : ''}`}>
              <span className="toggle-knob" />
            </span>
          </button>
        </div>

        {/* Instagram Handle - Only show when enabled */}
        {instagramEnabled && (
          <div className="form-group full-width fade-in">
            <label className="form-label" htmlFor="instagram">
              Instagram Handle
            </label>
            <input
              type="text"
              id="instagram"
              name="instagram"
              className="form-input"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="@man.matters or instagram.com/man.matters"
            />
            <small className="input-hint">
              📸 We'll scrape followers, engagement, posts & sentiment
            </small>
          </div>
        )}

        {/* Instagram Time Range - Only show when enabled */}
        {instagramEnabled && (
          <div className="form-group full-width fade-in">
            <label className="form-label" htmlFor="instagramPostsLimit">
              📅 Data Range
            </label>
            <select
              id="instagramPostsLimit"
              className="form-input form-select"
              value={instagramPostsLimit}
              onChange={(e) => setInstagramPostsLimit(Number(e.target.value))}
            >
              <option value={30}>Last 30 posts (~1 month)</option>
              <option value={80}>Last 80 posts (~3 months) ⭐ Recommended</option>
              <option value={150}>Last 150 posts (~6 months)</option>
            </select>
            <small className="input-hint">
              ⏱️ More posts = deeper analysis but takes longer (~30-90 sec)
            </small>
          </div>
        )}

        {/* Amazon Toggle */}
        <div className="toggle-section">
          <button
            type="button"
            className={`toggle-btn ${amazonEnabled ? 'active' : ''}`}
            onClick={() => setAmazonEnabled(!amazonEnabled)}
          >
            <span className="toggle-icon">{amazonEnabled ? '✅' : '🛒'}</span>
            <span className="toggle-label">
              Amazon Analysis
              <small>{amazonEnabled ? 'Enabled - Enter URL below' : 'Click to enable'}</small>
            </span>
            <span className={`toggle-switch ${amazonEnabled ? 'on' : ''}`}>
              <span className="toggle-knob" />
            </span>
          </button>
        </div>

        {/* Amazon Brand Search - Only show when enabled */}
        {amazonEnabled && (
          <div className="form-group full-width fade-in">
            <label className="form-label" htmlFor="amazonUrl">
              Amazon Brand Search
            </label>
            <input
              type="text"
              id="amazonUrl"
              name="amazonUrl"
              className="form-input"
              value={formData.amazonUrl}
              onChange={handleChange}
              placeholder="e.g. Mamaearth (We'll search Amazon automatically)"
            />
            <small className="input-hint">
              🛒 Enter your brand name. We'll find top products and reviews automatically.
            </small>
          </div>
        )}

        {/* YouTube Toggle */}
        <div className="toggle-section">
          <button
            type="button"
            className={`toggle-btn ${youtubeEnabled ? 'active' : ''}`}
            onClick={() => setYoutubeEnabled(!youtubeEnabled)}
          >
            <span className="toggle-icon">{youtubeEnabled ? '✅' : '🎬'}</span>
            <span className="toggle-label">
              YouTube Analysis
              <small>{youtubeEnabled ? 'Enabled - Enter channel URL below' : 'Click to enable'}</small>
            </span>
            <span className={`toggle-switch ${youtubeEnabled ? 'on' : ''}`}>
              <span className="toggle-knob" />
            </span>
          </button>
        </div>

        {/* YouTube URL - Only show when enabled */}
        {youtubeEnabled && (
          <div className="form-group full-width fade-in">
            <label className="form-label" htmlFor="youtubeUrl">
              YouTube Channel URL
            </label>
            <input
              type="url"
              id="youtubeUrl"
              name="youtubeUrl"
              className="form-input"
              value={formData.youtubeUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/@ManMatters or https://youtube.com/c/ManMatters"
            />
            <small className="input-hint">
              💡 We'll analyze subscribers, videos, engagement & comments
            </small>
          </div>
        )}



        {/* Website Audit Toggle */}
        <div className="toggle-section">
          <button
            type="button"
            className={`toggle-btn ${websiteAuditEnabled ? 'active' : ''}`}
            onClick={() => setWebsiteAuditEnabled(!websiteAuditEnabled)}
          >
            <span className="toggle-icon">{websiteAuditEnabled ? '✅' : '🌐'}</span>
            <span className="toggle-label">
              Website SEO Audit
              <small>{websiteAuditEnabled ? 'Enabled - Uses website URL' : 'Click to enable'}</small>
            </span>
            <span className={`toggle-switch ${websiteAuditEnabled ? 'on' : ''}`}>
              <span className="toggle-knob" />
            </span>
          </button>
        </div>

        {/* Reddit removed */}

        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label" htmlFor="competitors">
              Competitor Instagram Handles
            </label>
            <input
              type="text"
              id="competitors"
              name="competitors"
              className="form-input"
              value={formData.competitors}
              onChange={handleChange}
              placeholder="@themancompany, @ustraa, @bombayshavingcompany (comma separated)"
            />
            <small className="input-hint">We'll compare engagement, followers & content</small>
          </div>
        </div>

        <div className="info-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <div>
            <strong>Live Scraping Mode</strong>
            <p>We'll scrape real-time data from Instagram{amazonEnabled ? ' and Amazon' : ''}. This may take 2-5 minutes.</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary submit-btn"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
            Scraping Live Data...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            🔥 Start Live Audit
          </>
        )}
      </button>

      <style jsx>{`
        .audit-form {
          width: 100%;
        }

        .form-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .icon-wrapper {
          width: 64px;
          height: 64px;
          margin: 0 auto var(--space-4);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: var(--radius-xl);
          color: white;
          box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
        }

        .form-header h2 {
          margin-bottom: var(--space-2);
          color: var(--text-primary);
        }

        .form-header p {
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        /* Mode Toggle */
        .mode-toggle {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-6);
          padding: var(--space-1);
          background: var(--bg-tertiary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
        }

        .mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .mode-btn:hover {
          color: var(--text-primary);
        }

        .mode-btn.active {
          background: var(--gradient-teal);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        /* Section Title */
        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: var(--space-4);
          margin-top: var(--space-6);
        }

        .section-title:first-of-type {
          margin-top: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .required {
          color: var(--accent-rose);
        }

        .input-hint {
          display: block;
          margin-top: var(--space-1);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Scrape Section */
        .scrape-section {
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-subtle);
        }

        /* Toggle Section */
        .toggle-section {
          margin-bottom: var(--space-4);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          width: 100%;
          padding: var(--space-4);
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .toggle-btn:hover {
          border-color: var(--primary-300);
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08);
        }

        .toggle-btn.active {
          border-color: var(--accent-red);
          background: #fff5f5; /* Very subtle red tint */
          box-shadow: 0 0 0 1px var(--accent-red);
        }

        .toggle-icon {
          font-size: 1.25rem;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.03);
          transition: all 0.2s ease;
        }
        
        .toggle-btn:hover .toggle-icon {
           background: white;
           box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
           transform: scale(1.05);
        }

        .toggle-btn.active .toggle-icon {
           background: white;
           color: var(--accent-red);
           border-color: rgba(220, 38, 38, 0.1);
           box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
        }

        .toggle-label {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .toggle-label small {
          font-weight: 400;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .toggle-switch {
          width: 44px;
          height: 24px;
          background: var(--bg-tertiary);
          border-radius: 12px;
          position: relative;
          transition: all var(--transition-base);
          border: 1px solid var(--border-subtle);
        }

        .toggle-switch.on {
          background: var(--accent-red);
          border-color: var(--accent-red);
        }

        .toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: all var(--transition-base);
          box-shadow: var(--shadow-sm);
        }

        .toggle-switch.on .toggle-knob {
          left: 22px;
        }

        /* Expanded Content under Toggle */
        .toggle-expanded-content {
          margin-top: var(--space-3);
          padding: var(--space-4);
          background: #fafafa;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          border-top: 2px solid var(--accent-red);
        }

        .keyword-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .keyword-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .free-badge {
          display: inline-block;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.65rem;
          font-weight: 600;
          margin-left: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cost-badge {
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.65rem;
          font-weight: 600;
          margin-left: 8px;
        }

        .info-box {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-4);
          margin-top: var(--space-6);
          background: rgba(20, 184, 166, 0.08);
          border: 1px solid rgba(20, 184, 166, 0.2);
          border-radius: var(--radius-lg);
          color: var(--accent-teal);
        }

        .info-box div {
          flex: 1;
        }

        .info-box strong {
          display: block;
          margin-bottom: var(--space-1);
          color: var(--text-primary);
        }

        .info-box p {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Manual Section */
        .manual-section {
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-subtle);
        }

        .input-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-4);
          line-height: 1.6;
        }

        /* PDF Upload */
        .pdf-upload-area {
          margin-bottom: var(--space-4);
        }

        .pdf-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-8);
          background: var(--bg-glass);
          border: 2px dashed var(--border-subtle);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-base);
          color: var(--text-muted);
        }

        .pdf-upload-label:hover {
          border-color: var(--primary-400);
          color: var(--primary-400);
        }

        .pdf-upload-label span {
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .pdf-upload-label small {
          font-size: 0.75rem;
        }

        .pdf-selected {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-lg);
          color: var(--accent-emerald);
        }

        .pdf-selected span {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .remove-pdf {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--accent-rose);
          padding: var(--space-1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin: var(--space-4) 0;
          color: var(--text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }

        /* Textarea */
        .form-textarea {
          width: 100%;
          min-height: 200px;
          padding: var(--space-4);
          font-family: inherit;
          font-size: 0.9375rem;
          line-height: 1.6;
          color: var(--text-primary);
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          resize: vertical;
          transition: all var(--transition-base);
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }

        .form-textarea::placeholder {
          color: var(--text-muted);
        }

        .submit-btn {
          width: 100%;
          margin-top: var(--space-8);
          padding: var(--space-4) var(--space-6);
          font-size: 1rem;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .mode-toggle {
            flex-direction: column;
          }
        }
      `}</style>
    </form>
  );
}
