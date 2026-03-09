'use client';

import { AuditReport } from '@/types/audit';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

import WordCloudHeatmap from './WordCloudHeatmap';
import BrandHeatmap from './BrandHeatmap';
import {
  NarrativeSection,
  RecommendationsList,
  ContentPillarCard,
  ExecutiveSummaryCard,
  RoadmapCard,
} from './HybridComponents';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);


interface AuditDashboardProps {
  report: AuditReport;
  onReset: () => void;
}

export default function AuditDashboard({ report, onReset }: AuditDashboardProps) {
  const {
    summary,
    social_media_audit,
    marketplace_audit,
    competitor_benchmark,
    swot,
    action_items,
    chart_data
  } = report;

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'var(--accent-emerald)';
    if (score >= 40) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{report.brandInput.brand}</h1>
          <span className="industry-badge">{report.brandInput.industry}</span>
        </div>
        <button onClick={onReset} className="btn btn-secondary">
          ← New Audit
        </button>
      </div>

      {/* ============================================ */}
      {/* HYBRID EXECUTIVE SUMMARY */}
      {/* ============================================ */}
      <ExecutiveSummaryCard
        grade={(report as any).summary?.overall_grade || 'B'}
        score={summary?.overall_health_score || 70}
        narrative={(report as any).summary?.executive_narrative || summary?.brand_overview || ''}
        oneLiner={(report as any).summary?.one_liner || ''}
        keyWins={(report as any).summary?.key_wins || []}
        keyChallenges={(report as any).summary?.key_challenges || []}
      />

      {/* Legacy Executive Summary Bullets (fallback) */}
      {summary?.executive_summary_bullets && summary.executive_summary_bullets.length > 0 && !(report as any).summary?.executive_narrative && (
        <div className="section-card">
          <h3>📊 Executive Summary</h3>
          <ul className="executive-bullets">
            {summary.executive_summary_bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section Scores Overview */}
      <div className="scores-grid">
        <div className="score-mini-card">
          <div className="score-mini" style={{ background: getScoreColor(social_media_audit?.social_media_score || 0) }}>
            {social_media_audit?.social_media_score || 0}
          </div>
          <span>Social Media</span>
        </div>
        <div className="score-mini-card">
          <div className="score-mini" style={{ background: getScoreColor(marketplace_audit?.marketplace_score || 0) }}>
            {marketplace_audit?.marketplace_score || 0}
          </div>
          <span>Marketplace</span>
        </div>

      </div>

      {/* ============================================ */}
      {/* BRAND HEALTH HEATMAP - Unified View */}
      {/* ============================================ */}
      {report.scrapedData && (
        <BrandHeatmap
          scrapedData={report.scrapedData}
          brandName={report.brandInput.brand}
          summary={{
            overall_health_score: summary?.overall_health_score,
            overall_grade: (report as any).summary?.overall_grade,
          }}
        />
      )}

      {/* ============================================ */}
      {/* INSTAGRAM SECTION - DETAILED RAW DATA */}
      {/* ============================================ */}
      {report.scrapedData?.instagram && (
        <div className="section-card instagram-section">
          <div className="section-header-row">
            <h3>📸 Instagram Performance Analysis</h3>
            <span className="data-source-badge">LIVE DATA</span>
          </div>

          {/* Profile Overview Stats */}
          <div className="ig-overview">
            <div className="ig-stat-card highlight">
              <div className="ig-stat-icon">👥</div>
              <div className="ig-stat-value">{formatNumber(report.scrapedData.instagram.profile.followersCount)}</div>
              <div className="ig-stat-label">Followers</div>
            </div>
            <div className="ig-stat-card">
              <div className="ig-stat-icon">👤</div>
              <div className="ig-stat-value">{formatNumber(report.scrapedData.instagram.profile.followsCount)}</div>
              <div className="ig-stat-label">Following</div>
            </div>
            <div className="ig-stat-card">
              <div className="ig-stat-icon">📷</div>
              <div className="ig-stat-value">{report.scrapedData.instagram.profile.postsCount}</div>
              <div className="ig-stat-label">Total Posts</div>
            </div>
            <div className="ig-stat-card">
              <div className="ig-stat-icon">📊</div>
              <div className="ig-stat-value">{report.scrapedData.instagram.engagement.engagementRate}%</div>
              <div className="ig-stat-label">Engagement Rate</div>
            </div>
            <div className="ig-stat-card">
              <div className="ig-stat-icon">❤️</div>
              <div className="ig-stat-value">{formatNumber(report.scrapedData.instagram.engagement.avgLikes)}</div>
              <div className="ig-stat-label">Avg Likes</div>
            </div>
            <div className="ig-stat-card">
              <div className="ig-stat-icon">💬</div>
              <div className="ig-stat-value">{formatNumber(report.scrapedData.instagram.engagement.avgComments)}</div>
              <div className="ig-stat-label">Avg Comments</div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="ig-profile-info">
            <div className="profile-header">
              <span className="username">@{report.scrapedData.instagram.profile.username}</span>
              {report.scrapedData.instagram.profile.isVerified && <span className="verified-badge">✓ Verified</span>}
            </div>
            <p className="profile-name">{report.scrapedData.instagram.profile.fullName}</p>
          </div>

          {/* Engagement Details */}
          <div className="ig-details">
            <div className="ig-detail-box">
              <h4>📈 Engagement Analysis</h4>
              <div className="ig-metrics-grid">
                <div className="ig-metric-item">
                  <span className="metric-label">Total Interactions</span>
                  <span className="metric-value">{formatNumber(report.scrapedData.instagram.engagement.totalInteractions)}</span>
                </div>
                <div className="ig-metric-item">
                  <span className="metric-label">Avg Views (Videos)</span>
                  <span className="metric-value">{formatNumber(report.scrapedData.instagram.engagement.avgViews)}</span>
                </div>
                <div className="ig-metric-item">
                  <span className="metric-label">Posts/Week</span>
                  <span className="metric-value">{report.scrapedData.instagram.postingFrequency.postsPerWeek}</span>
                </div>
                <div className="ig-metric-item">
                  <span className="metric-label">Most Active Day</span>
                  <span className="metric-value">{report.scrapedData.instagram.postingFrequency.mostActiveDay}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Breakdown */}
          <div className="ig-content-breakdown">
            <h4>📊 Content Mix Breakdown</h4>
            <div className="content-bars">
              <div className="content-bar-item">
                <span className="bar-label">🎬 Reels</span>
                <div className="bar-track">
                  <div
                    className="bar-fill reels"
                    style={{
                      width: `${Math.round((report.scrapedData.instagram.contentBreakdown.reels / (report.scrapedData.instagram.contentBreakdown.reels + report.scrapedData.instagram.contentBreakdown.carousels + report.scrapedData.instagram.contentBreakdown.images)) * 100) || 0}%`
                    }}
                  />
                </div>
                <span className="bar-count">{report.scrapedData.instagram.contentBreakdown.reels}</span>
              </div>
              <div className="content-bar-item">
                <span className="bar-label">📚 Carousels</span>
                <div className="bar-track">
                  <div
                    className="bar-fill carousels"
                    style={{
                      width: `${Math.round((report.scrapedData.instagram.contentBreakdown.carousels / (report.scrapedData.instagram.contentBreakdown.reels + report.scrapedData.instagram.contentBreakdown.carousels + report.scrapedData.instagram.contentBreakdown.images)) * 100) || 0}%`
                    }}
                  />
                </div>
                <span className="bar-count">{report.scrapedData.instagram.contentBreakdown.carousels}</span>
              </div>
              <div className="content-bar-item">
                <span className="bar-label">🖼️ Images</span>
                <div className="bar-track">
                  <div
                    className="bar-fill images"
                    style={{
                      width: `${Math.round((report.scrapedData.instagram.contentBreakdown.images / (report.scrapedData.instagram.contentBreakdown.reels + report.scrapedData.instagram.contentBreakdown.carousels + report.scrapedData.instagram.contentBreakdown.images)) * 100) || 0}%`
                    }}
                  />
                </div>
                <span className="bar-count">{report.scrapedData.instagram.contentBreakdown.images}</span>
              </div>
            </div>
          </div>

          {/* Sentiment from Comments */}
          <div className="ig-sentiment-section">
            <h4>💬 Comment Sentiment Analysis</h4>
            <div className="sentiment-bars">
              <div className="sentiment-bar-item positive">
                <span className="sentiment-label">😊 Positive</span>
                <div className="sentiment-bar-track">
                  <div
                    className="sentiment-bar-fill"
                    style={{
                      width: `${Math.round((report.scrapedData.instagram.sentiment.positiveCount / (report.scrapedData.instagram.sentiment.positiveCount + report.scrapedData.instagram.sentiment.neutralCount + report.scrapedData.instagram.sentiment.negativeCount)) * 100) || 0}%`,
                      background: 'var(--accent-emerald)'
                    }}
                  />
                </div>
                <span className="sentiment-count">{report.scrapedData.instagram.sentiment.positiveCount}</span>
              </div>
              <div className="sentiment-bar-item neutral">
                <span className="sentiment-label">😐 Neutral</span>
                <div className="sentiment-bar-track">
                  <div
                    className="sentiment-bar-fill"
                    style={{
                      width: `${Math.round((report.scrapedData.instagram.sentiment.neutralCount / (report.scrapedData.instagram.sentiment.positiveCount + report.scrapedData.instagram.sentiment.neutralCount + report.scrapedData.instagram.sentiment.negativeCount)) * 100) || 0}%`,
                      background: 'var(--text-secondary)'
                    }}
                  />
                </div>
                <span className="sentiment-count">{report.scrapedData.instagram.sentiment.neutralCount}</span>
              </div>
              <div className="sentiment-bar-item negative">
                <span className="sentiment-label">😠 Negative</span>
                <div className="sentiment-bar-track">
                  <div
                    className="sentiment-bar-fill"
                    style={{
                      width: `${Math.round((report.scrapedData.instagram.sentiment.negativeCount / (report.scrapedData.instagram.sentiment.positiveCount + report.scrapedData.instagram.sentiment.neutralCount + report.scrapedData.instagram.sentiment.negativeCount)) * 100) || 0}%`,
                      background: 'var(--accent-rose)'
                    }}
                  />
                </div>
                <span className="sentiment-count">{report.scrapedData.instagram.sentiment.negativeCount}</span>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* HYBRID INSTAGRAM NARRATIVES (LLM Insights) */}
          {/* ============================================ */}
          {(report as any).social_media_audit?.analysis_narrative && (
            <div style={{ marginTop: '24px' }}>
              <NarrativeSection
                title="Strategic Analysis"
                content={(report as any).social_media_audit?.analysis_narrative}
                icon="📊"
                accentColor="#ec4899"
              />

              <NarrativeSection
                title="Content Strategy Assessment"
                content={(report as any).social_media_audit?.content_strategy_verdict}
                icon="🎯"
                accentColor="#8b5cf6"
              />

              <NarrativeSection
                title="Top Posts Deep Dive"
                content={(report as any).social_media_audit?.top_posts_analysis}
                icon="🏆"
                accentColor="#22c55e"
              />

              <NarrativeSection
                title="Areas for Improvement"
                content={(report as any).social_media_audit?.improvement_areas}
                icon="📈"
                accentColor="#f97316"
              />

              <RecommendationsList
                title="Instagram Recommendations"
                recommendations={(report as any).social_media_audit?.recommendations_narrative || []}
                icon="💡"
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* AMAZON SECTION - DETAILED PERFORMANCE */}
      {/* ============================================ */}
      {report.scrapedData?.amazon && (
        <div className="section-card amazon-section">
          <div className="section-header-row">
            <h3>🛒 Amazon Performance Analysis</h3>
            <span className="data-source-badge">LIVE DATA</span>
          </div>

          {/* Amazon Stats Grid */}
          <div className="amazon-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <div className="stat-label" style={{ fontSize: '0.9rem', color: '#64748b' }}>Est. Monthly Sales</div>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
                {report.scrapedData.amazon.salesAnalysis?.totalMonthlySales
                  ? `${formatNumber(report.scrapedData.amazon.salesAnalysis.totalMonthlySales)}+`
                  : 'N/A'}
              </div>
              <div className="stat-sub" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Aggregated Volume</div>
            </div>
            <div className="stat-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <div className="stat-label" style={{ fontSize: '0.9rem', color: '#64748b' }}>Brand Rating</div>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#eab308' }}>
                {report.scrapedData.amazon.reviewAnalysis.avgRating} <span style={{ fontSize: '1rem' }}>★</span>
              </div>
              <div className="stat-sub" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Avg across Products</div>
            </div>
            <div className="stat-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <div className="stat-label" style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Reviews</div>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
                {formatNumber(report.scrapedData.amazon.reviewAnalysis.totalReviews)}
              </div>
            </div>
            <div className="stat-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <div className="stat-label" style={{ fontSize: '0.9rem', color: '#64748b' }}>Trust Badges</div>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
                {(report.scrapedData.amazon.salesAnalysis?.bestSellersCount || 0) + (report.scrapedData.amazon.salesAnalysis?.amazonChoiceCount || 0)}
              </div>
              <div className="stat-sub" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Best Seller / Choice</div>
            </div>
          </div>

          {/* Top Products Shelf */}
          <h4 style={{ marginBottom: '1rem' }}>🏆 Top Performing Products</h4>
          <div className="amazon-product-shelf" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {report.scrapedData.amazon.reviewAnalysis.topProducts?.map((prod, idx) => (
              <div key={idx} className="amazon-product-card" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fff' }}>
                <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem', padding: '10px' }}>
                  <img src={prod.images[0]} alt={prod.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {prod.isBestSeller && <span style={{ background: '#ff9900', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content' }}>#1 Best Seller</span>}
                  {prod.isAmazonChoice && <span style={{ background: '#232f3e', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content' }}>Amazon Choice</span>}
                </div>

                <h5 style={{ fontSize: '0.9rem', margin: '0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }} title={prod.title}>{prod.title}</h5>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{prod.price}</span>
                  <span style={{ color: '#eab308', fontWeight: 'bold' }}>{prod.rating} ★ <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>({formatNumber(prod.reviewsCount)})</span></span>
                </div>
                {prod.salesVolume > 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600' }}>
                    {prod.salesVolume}+ bought last month
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ============================================ */}
          {/* HYBRID AMAZON NARRATIVES (LLM Insights) */}
          {/* ============================================ */}
          {(report as any).marketplace_audit?.marketplace_narrative && (
            <div style={{ marginTop: '24px' }}>
              <NarrativeSection
                title="Marketplace Performance Overview"
                content={(report as any).marketplace_audit?.marketplace_narrative}
                icon="🛒"
                accentColor="#ff9900"
              />

              <NarrativeSection
                title="Product Performance Insights"
                content={(report as any).marketplace_audit?.product_performance}
                icon="📦"
                accentColor="#22c55e"
              />

              <NarrativeSection
                title="Voice of the Customer"
                content={(report as any).marketplace_audit?.customer_voice}
                icon="💬"
                accentColor="#6366f1"
              />

              <NarrativeSection
                title="Competitive Positioning"
                content={(report as any).marketplace_audit?.competitive_position}
                icon="🎯"
                accentColor="#8b5cf6"
              />

              <RecommendationsList
                title="Amazon Recommendations"
                recommendations={(report as any).marketplace_audit?.recommendations || []}
                icon="💡"
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* YOUTUBE SECTION - DETAILED FOR PPT */}
      {/* ============================================ */}
      {report.scrapedData?.youtube && (
        <div className="section-card youtube-section">
          <div className="section-header-row">
            <h3>🎬 YouTube Performance Analysis</h3>
            <span className="data-source-badge">LIVE DATA</span>
          </div>

          {/* Channel Overview Stats */}
          <div className="youtube-overview">
            <div className="yt-stat-card highlight">
              <div className="yt-stat-icon">👥</div>
              <div className="yt-stat-value">{formatNumber(report.scrapedData.youtube.subscriberCount)}</div>
              <div className="yt-stat-label">Subscribers</div>
            </div>
            <div className="yt-stat-card">
              <div className="yt-stat-icon">👁️</div>
              <div className="yt-stat-value">{formatNumber(report.scrapedData.youtube.viewCount)}</div>
              <div className="yt-stat-label">Total Views</div>
            </div>
            <div className="yt-stat-card">
              <div className="yt-stat-icon">🎥</div>
              <div className="yt-stat-value">{report.scrapedData.youtube.videoCount}</div>
              <div className="yt-stat-label">Total Videos</div>
            </div>
            <div className="yt-stat-card">
              <div className="yt-stat-icon">📊</div>
              <div className="yt-stat-value">{report.scrapedData.youtube.engagementRate}%</div>
              <div className="yt-stat-label">Engagement Rate</div>
            </div>
            <div className="yt-stat-card">
              <div className="yt-stat-icon">⚡</div>
              <div className="yt-stat-value">{report.scrapedData.youtube.shortsPercentage}%</div>
              <div className="yt-stat-label">Shorts Content</div>
            </div>
            <div className="yt-stat-card">
              <div className="yt-stat-icon">📅</div>
              <div className="yt-stat-value">{report.scrapedData.youtube.uploadsPerWeek}</div>
              <div className="yt-stat-label">Uploads/Week</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="youtube-details">
            <div className="yt-detail-box">
              <h4>📈 Average Performance per Video</h4>
              <div className="yt-metrics-grid-3">
                <div className="yt-metric-large">
                  <span className="metric-value">{formatNumber(report.scrapedData.youtube.avgViews)}</span>
                  <span className="metric-label">Avg Views</span>
                </div>
                <div className="yt-metric-large">
                  <span className="metric-value">{formatNumber(report.scrapedData.youtube.avgLikes)}</span>
                  <span className="metric-label">Avg Likes</span>
                </div>
                <div className="yt-metric-large">
                  <span className="metric-value">{formatNumber(report.scrapedData.youtube.avgComments)}</span>
                  <span className="metric-label">Avg Comments</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 Videos - Full Table */}
          <div className="yt-videos-section">
            <h4>🏆 Top 5 Performing Videos (by Views)</h4>
            <div className="videos-table">
              <div className="video-table-header">
                <span>Rank</span>
                <span>Title</span>
                <span>Views</span>
                <span>Likes</span>
                <span>Comments</span>
                <span>Type</span>
              </div>
              {report.scrapedData.youtube.topVideos.slice(0, 5).map((video, i) => (
                <div key={i} className="video-table-row">
                  <span className="rank-badge">#{i + 1}</span>
                  <span className="video-title-cell" title={video.title}>{video.title.slice(0, 60)}{video.title.length > 60 ? '...' : ''}</span>
                  <span className="metric-cell">{formatNumber(video.viewCount)}</span>
                  <span className="metric-cell">{formatNumber(video.likeCount)}</span>
                  <span className="metric-cell">{formatNumber(video.commentCount)}</span>
                  <span className={`type-badge ${video.isShort ? 'short' : 'long'}`}>
                    {video.isShort ? '⚡ Short' : '🎬 Long'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Videos - Full Table */}
          {report.scrapedData.youtube.recentVideos && (
            <div className="yt-videos-section">
              <h4>📅 Recent Videos (Last {report.scrapedData.youtube.recentVideos.length} uploads)</h4>
              <div className="videos-table compact">
                <div className="video-table-header">
                  <span>Date</span>
                  <span>Title</span>
                  <span>Views</span>
                  <span>Likes</span>
                  <span>Engagement</span>
                </div>
                {report.scrapedData.youtube.recentVideos.slice(0, 10).map((video, i) => (
                  <div key={i} className="video-table-row">
                    <span className="date-cell">{new Date(video.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    <span className="video-title-cell" title={video.title}>
                      {video.isShort && <span className="short-indicator">⚡</span>}
                      {video.title.slice(0, 50)}{video.title.length > 50 ? '...' : ''}
                    </span>
                    <span className="metric-cell">{formatNumber(video.viewCount)}</span>
                    <span className="metric-cell">{formatNumber(video.likeCount)}</span>
                    <span className="metric-cell">{video.viewCount > 0 ? ((video.likeCount / video.viewCount) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YouTube Comments Heatmap */}
          {report.scrapedData.youtube.recentComments.length > 0 && (
            <div className="comments-section">
              <h4>💬 Comment Sentiment Analysis ({report.scrapedData.youtube.recentComments.length} comments)</h4>

              {/* Heatmap */}
              <div className="comments-heatmap">
                <div className="heatmap-container">
                  {report.scrapedData.youtube.recentComments.slice(0, 30).map((comment, i) => {
                    const text = comment.text.toLowerCase();
                    const positiveWords = ['love', 'great', 'amazing', 'best', 'awesome', 'excellent', 'fantastic', 'helpful', 'thanks', 'thank you', '❤️', '🔥', '👏', 'good', 'nice'];
                    const negativeWords = ['bad', 'worst', 'hate', 'disappointed', 'waste', 'boring', 'useless', 'terrible', 'scam', 'fake'];
                    const isPositive = positiveWords.some(w => text.includes(w));
                    const isNegative = negativeWords.some(w => text.includes(w));
                    const sentiment = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';

                    return (
                      <div key={i} className={`heatmap-cell ${sentiment}`} title={comment.text.slice(0, 150)}>
                        <span className="cell-number">{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="heatmap-legend">
                  <span className="legend-item positive">🟢 Positive ({report.scrapedData.youtube.recentComments.filter(c => {
                    const t = c.text.toLowerCase();
                    return ['love', 'great', 'amazing', 'best', 'awesome', 'excellent', 'thanks'].some(w => t.includes(w));
                  }).length})</span>
                  <span className="legend-item neutral">🟡 Neutral</span>
                  <span className="legend-item negative">🔴 Negative ({report.scrapedData.youtube.recentComments.filter(c => {
                    const t = c.text.toLowerCase();
                    return ['bad', 'worst', 'hate', 'disappointed', 'waste'].some(w => t.includes(w));
                  }).length})</span>
                </div>
              </div>

              {/* Sample Comments */}
              <div className="sample-comments">
                <h5>📝 Sample Comments</h5>
                <div className="comments-list">
                  {report.scrapedData.youtube.recentComments.slice(0, 8).map((comment, i) => (
                    <div key={i} className="comment-item">
                      <span className="comment-author">@{comment.author}</span>
                      <p className="comment-text">&quot;{comment.text.slice(0, 150)}{comment.text.length > 150 ? '...' : ''}&quot;</p>
                      {comment.likeCount > 0 && <span className="comment-likes">❤️ {comment.likeCount}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* HYBRID YOUTUBE NARRATIVES (LLM Insights) */}
          {/* ============================================ */}
          {(report as any).youtube_audit?.channel_narrative && (
            <div style={{ marginTop: '24px' }}>
              <NarrativeSection
                title="Channel Performance Overview"
                content={(report as any).youtube_audit?.channel_narrative}
                icon="🎬"
                accentColor="#ff0000"
              />

              <NarrativeSection
                title="Content Strategy Analysis"
                content={(report as any).youtube_audit?.content_strategy}
                icon="📹"
                accentColor="#6366f1"
              />

              <NarrativeSection
                title="Audience Sentiment"
                content={(report as any).youtube_audit?.audience_sentiment}
                icon="💬"
                accentColor="#22c55e"
              />

              <NarrativeSection
                title="Growth Opportunities"
                content={(report as any).youtube_audit?.growth_opportunities}
                icon="📈"
                accentColor="#8b5cf6"
              />

              <RecommendationsList
                title="YouTube Recommendations"
                recommendations={(report as any).youtube_audit?.recommendations || []}
                icon="💡"
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* GOOGLE TRENDS SECTION */}
      {/* ============================================ */}


      {/* ============================================ */}
      {/* TIERED KEYWORD TRENDS SECTION */}
      {/* ============================================ */}


      {/* ============================================ */}
      {/* WEBSITE AUDIT SECTION */}
      {/* ============================================ */}
      {report.scrapedData?.websiteAudit && (
        <div className="section-card website-section">
          <div className="section-header-row">
            <h3>🌐 Website SEO Audit</h3>
            <span className="data-source-badge">LIVE DATA</span>
          </div>

          {/* Page Count & Summary */}
          <div className="audit-summary-bar">
            <span className="pages-badge">📄 {report.scrapedData.websiteAudit.pagesAudited} Pages Audited</span>
            <span className="url-badge">{report.scrapedData.websiteAudit.mainUrl}</span>
          </div>

          {/* Score Gauges */}
          <div className="website-scores">
            <div className="score-gauge overall">
              <div className="gauge-circle" style={{
                background: `conic-gradient(${getScoreColor(report.scrapedData.websiteAudit.overallScore)} ${report.scrapedData.websiteAudit.overallScore * 3.6}deg, #e5e7eb 0deg)`
              }}>
                <span className="gauge-value">{report.scrapedData.websiteAudit.overallScore}</span>
              </div>
              <span className="gauge-label">Overall</span>
            </div>
            <div className="score-gauge">
              <div className="gauge-circle" style={{
                background: `conic-gradient(${getScoreColor(report.scrapedData.websiteAudit.seoScore)} ${report.scrapedData.websiteAudit.seoScore * 3.6}deg, #e5e7eb 0deg)`
              }}>
                <span className="gauge-value">{report.scrapedData.websiteAudit.seoScore}</span>
              </div>
              <span className="gauge-label">SEO</span>
            </div>
            <div className="score-gauge">
              <div className="gauge-circle" style={{
                background: `conic-gradient(${getScoreColor(report.scrapedData.websiteAudit.contentScore)} ${report.scrapedData.websiteAudit.contentScore * 3.6}deg, #e5e7eb 0deg)`
              }}>
                <span className="gauge-value">{report.scrapedData.websiteAudit.contentScore}</span>
              </div>
              <span className="gauge-label">Content</span>
            </div>
            <div className="score-gauge">
              <div className="gauge-circle" style={{
                background: `conic-gradient(${getScoreColor(report.scrapedData.websiteAudit.technicalScore)} ${report.scrapedData.websiteAudit.technicalScore * 3.6}deg, #e5e7eb 0deg)`
              }}>
                <span className="gauge-value">{report.scrapedData.websiteAudit.technicalScore}</span>
              </div>
              <span className="gauge-label">Technical</span>
            </div>
          </div>

          {/* Aggregate Stats */}
          <div className="audit-stats-grid">
            <div className="audit-stat-card">
              <span className="stat-icon">📄</span>
              <span className="stat-value">{report.scrapedData.websiteAudit.pagesAudited}</span>
              <span className="stat-label">Pages Audited</span>
            </div>
            <div className={`audit-stat-card ${report.scrapedData.websiteAudit.totalBrokenLinks > 0 ? 'error' : 'good'}`}>
              <span className="stat-icon">🔗</span>
              <span className="stat-value">{report.scrapedData.websiteAudit.totalBrokenLinks}</span>
              <span className="stat-label">Broken Links</span>
            </div>
            <div className="audit-stat-card">
              <span className="stat-icon">📝</span>
              <span className="stat-value">{report.scrapedData.websiteAudit.avgWordsPerPage?.toLocaleString()}</span>
              <span className="stat-label">Avg Words/Page</span>
            </div>
            <div className={`audit-stat-card ${report.scrapedData.websiteAudit.totalNotOptimizedImages > 0 ? 'warning' : 'good'}`}>
              <span className="stat-icon">🖼️</span>
              <span className="stat-value">{report.scrapedData.websiteAudit.totalNotOptimizedImages}</span>
              <span className="stat-label">Unoptimized Images</span>
            </div>
          </div>

          {/* SEO Checklist */}
          <div className="seo-checklist">
            <h4>✅ SEO Checklist</h4>
            <div className="checklist-grid">
              <div className={`check-item ${report.scrapedData.websiteAudit.pagesWithH1 === report.scrapedData.websiteAudit.pagesAudited ? 'pass' : 'fail'}`}>
                <span className="check-icon">{report.scrapedData.websiteAudit.pagesWithH1 === report.scrapedData.websiteAudit.pagesAudited ? '✅' : '⚠️'}</span>
                <span className="check-text">H1 Tags</span>
                <span className="check-count">{report.scrapedData.websiteAudit.pagesWithH1}/{report.scrapedData.websiteAudit.pagesAudited}</span>
              </div>
              <div className={`check-item ${report.scrapedData.websiteAudit.pagesWithSingleH1 === report.scrapedData.websiteAudit.pagesAudited ? 'pass' : 'fail'}`}>
                <span className="check-icon">{report.scrapedData.websiteAudit.pagesWithSingleH1 === report.scrapedData.websiteAudit.pagesAudited ? '✅' : '⚠️'}</span>
                <span className="check-text">Single H1</span>
                <span className="check-count">{report.scrapedData.websiteAudit.pagesWithSingleH1}/{report.scrapedData.websiteAudit.pagesAudited}</span>
              </div>
              <div className={`check-item ${report.scrapedData.websiteAudit.pagesWithMetaDescription === report.scrapedData.websiteAudit.pagesAudited ? 'pass' : 'fail'}`}>
                <span className="check-icon">{report.scrapedData.websiteAudit.pagesWithMetaDescription === report.scrapedData.websiteAudit.pagesAudited ? '✅' : '⚠️'}</span>
                <span className="check-text">Meta Description</span>
                <span className="check-count">{report.scrapedData.websiteAudit.pagesWithMetaDescription}/{report.scrapedData.websiteAudit.pagesAudited}</span>
              </div>
              <div className={`check-item ${report.scrapedData.websiteAudit.pagesWithOptimalTitle === report.scrapedData.websiteAudit.pagesAudited ? 'pass' : 'fail'}`}>
                <span className="check-icon">{report.scrapedData.websiteAudit.pagesWithOptimalTitle === report.scrapedData.websiteAudit.pagesAudited ? '✅' : '⚠️'}</span>
                <span className="check-text">Title Tags</span>
                <span className="check-count">{report.scrapedData.websiteAudit.pagesWithOptimalTitle}/{report.scrapedData.websiteAudit.pagesAudited}</span>
              </div>
              <div className={`check-item ${report.scrapedData.websiteAudit.pagesWithRobotsTxt === report.scrapedData.websiteAudit.pagesAudited ? 'pass' : 'fail'}`}>
                <span className="check-icon">{report.scrapedData.websiteAudit.pagesWithRobotsTxt === report.scrapedData.websiteAudit.pagesAudited ? '✅' : '⚠️'}</span>
                <span className="check-text">Robots.txt</span>
                <span className="check-count">{report.scrapedData.websiteAudit.pagesWithRobotsTxt}/{report.scrapedData.websiteAudit.pagesAudited}</span>
              </div>
              <div className={`check-item ${report.scrapedData.websiteAudit.pagesWithFavicon === report.scrapedData.websiteAudit.pagesAudited ? 'pass' : 'fail'}`}>
                <span className="check-icon">{report.scrapedData.websiteAudit.pagesWithFavicon === report.scrapedData.websiteAudit.pagesAudited ? '✅' : '⚠️'}</span>
                <span className="check-text">Favicon</span>
                <span className="check-count">{report.scrapedData.websiteAudit.pagesWithFavicon}/{report.scrapedData.websiteAudit.pagesAudited}</span>
              </div>
            </div>
          </div>

          {/* Top Pages Table */}
          {report.scrapedData.websiteAudit.pages && report.scrapedData.websiteAudit.pages.length > 0 && (
            <div className="pages-table-section">
              <h4>📄 Page Analysis</h4>
              <div className="pages-table">
                <div className="pages-table-header">
                  <span>Page</span>
                  <span>Title</span>
                  <span>Words</span>
                  <span>Links</span>
                  <span>H1</span>
                </div>
                {report.scrapedData.websiteAudit.pages.slice(0, 8).map((page, i) => (
                  <div key={i} className="pages-table-row">
                    <span className="page-url" title={page.url}>{page.url.split('/').pop() || 'Home'}</span>
                    <span className="page-title" title={page.title}>{page.title.slice(0, 35)}...</span>
                    <span className="page-words">{page.wordsCount}</span>
                    <span className="page-links">{page.linksCount}</span>
                    <span className={`page-h1 ${page.isH1 && page.isH1OnlyOne ? 'good' : 'warn'}`}>
                      {page.isH1 ? (page.isH1OnlyOne ? '✅' : '⚠️') : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues */}
          {report.scrapedData.websiteAudit.issues && report.scrapedData.websiteAudit.issues.length > 0 && (
            <div className="website-issues">
              <h4>⚠️ Issues Found ({report.scrapedData.websiteAudit.issues.length})</h4>
              <div className="issues-list">
                {report.scrapedData.websiteAudit.issues.slice(0, 10).map((issue, i) => (
                  <div key={i} className={`issue-item ${issue.type}`}>
                    <span className="issue-icon">{issue.type === 'error' ? '🔴' : issue.type === 'warning' ? '🟡' : '🔵'}</span>
                    <span className="issue-page">{issue.page}</span>
                    <span className="issue-text">{issue.message}</span>
                    <span className="issue-category">{issue.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* SEO RANKINGS SECTION */}
      {/* ============================================ */}
      {report.scrapedData?.seo && (
        <div className="section-card seo-section">
          <div className="section-header-row">
            <h3>🔍 SEO & Search Rankings</h3>
            <span className="data-source-badge">LIVE DATA</span>
          </div>

          {/* Brand Rankings */}
          {report.scrapedData.seo.brandKeywordRankings && report.scrapedData.seo.brandKeywordRankings.length > 0 && (
            <div className="seo-rankings-section">
              <h4>🏆 Top Search Results for Your Brand</h4>
              <div className="rankings-table">
                <div className="ranking-table-header">
                  <span>#</span>
                  <span>Title</span>
                  <span>Domain</span>
                </div>
                {report.scrapedData.seo.brandKeywordRankings.slice(0, 10).map((result, i) => (
                  <div key={i} className="ranking-table-row">
                    <span className="position-badge">{result.position}</span>
                    <span className="ranking-title" title={result.title}>
                      {result.title.slice(0, 60)}{result.title.length > 60 ? '...' : ''}
                    </span>
                    <span className="ranking-domain">{result.domain}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Ranking Pages */}
          {report.scrapedData.seo.topRankingPages && report.scrapedData.seo.topRankingPages.length > 0 && (
            <div className="top-rankings-box">
              <h4>📈 Your Top Ranking Pages</h4>
              <div className="top-rankings-list">
                {report.scrapedData.seo.topRankingPages.map((page, i) => (
                  <div key={i} className="top-ranking-item">
                    <span className={`rank-position ${page.position <= 3 ? 'top3' : page.position <= 10 ? 'top10' : ''}`}>
                      #{page.position}
                    </span>
                    <span className="rank-keyword">{page.keyword}</span>
                    <span className="rank-url" title={page.url}>{page.url.slice(0, 40)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {report.scrapedData.seo.missingKeywords && report.scrapedData.seo.missingKeywords.length > 0 && (
            <div className="missing-keywords-box">
              <h4>⚠️ Keywords You're Missing</h4>
              <p className="insight-text">You don't rank in top 10 for these keywords:</p>
              <div className="missing-tags">
                {report.scrapedData.seo.missingKeywords.map((keyword, i) => (
                  <span key={i} className="missing-tag">{keyword}</span>
                ))}
              </div>
            </div>
          )}

          {/* Competitor Rankings */}
          {report.scrapedData.seo.competitorRankings && report.scrapedData.seo.competitorRankings.length > 0 && (
            <div className="competitor-rankings-box">
              <h4>🎯 Competitors Appearing in Search</h4>
              <div className="competitor-rankings-list">
                {report.scrapedData.seo.competitorRankings.slice(0, 8).map((result, i) => (
                  <div key={i} className="competitor-ranking-item">
                    <span className="comp-position">#{result.position}</span>
                    <div className="comp-info">
                      <span className="comp-title">{result.title.slice(0, 50)}...</span>
                      <span className="comp-domain">{result.domain}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* WORD CLOUD HEATMAP SECTION */}
      {/* ============================================ */}
      {report.scrapedData && (
        <WordCloudHeatmap
          scrapedData={report.scrapedData}
          brandName={report.brandInput.brand}
        />
      )}



      {/* ============================================ */}
      {/* HYBRID COMPETITOR NARRATIVES (LLM Insights) */}
      {/* ============================================ */}
      {(report as any).competitor_benchmark?.competitive_landscape && (
        <div className="section-card">
          <div className="section-header-row">
            <h3>⚔️ Competitive Intelligence</h3>
            <span className="data-source-badge ai-badge">AI ANALYSIS</span>
          </div>

          <NarrativeSection
            title="Competitive Landscape"
            content={(report as any).competitor_benchmark?.competitive_landscape}
            icon="🌍"
            accentColor="#6366f1"
          />

          <NarrativeSection
            title="Your Market Position"
            content={(report as any).competitor_benchmark?.positioning_analysis}
            icon="🎯"
            accentColor="#8b5cf6"
          />

          <NarrativeSection
            title="Competitor Insights"
            content={(report as any).competitor_benchmark?.competitor_insights}
            icon="🔍"
            accentColor="#ec4899"
          />

          <NarrativeSection
            title="White Space Opportunities"
            content={(report as any).competitor_benchmark?.white_space}
            icon="💎"
            accentColor="#22c55e"
          />

          <RecommendationsList
            title="Competitive Strategy Recommendations"
            recommendations={(report as any).competitor_benchmark?.recommendations || []}
            icon="💡"
          />
        </div>
      )}

      {/* ============================================ */}
      {/* STRATEGIC ROADMAP & CONTENT PILLARS */}
      {/* ============================================ */}
      {((report as any).strategic_summary || (report as any).content_pillars?.length > 0 || (report as any).thirty_day_focus) && (
        <div className="section-card">
          <div className="section-header-row">
            <h3>🗺️ Strategic Roadmap</h3>
            <span className="data-source-badge ai-badge">AI STRATEGY</span>
          </div>

          {/* Roadmap Card */}
          <RoadmapCard
            strategicSummary={(report as any).strategic_summary}
            thirtyDayFocus={(report as any).thirty_day_focus}
            ninetyDayVision={(report as any).ninety_day_vision}
          />

          {/* Content Pillars */}
          {(report as any).content_pillars?.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{
                color: '#fff',
                fontSize: '1.1rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📚 Content Pillars
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {(report as any).content_pillars.map((pillar: any, i: number) => (
                  <ContentPillarCard key={i} pillar={pillar} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Action Items Summary with Why */}
          {(report as any).action_items?.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <RecommendationsList
                title="Priority Action Items"
                recommendations={(report as any).action_items.map((item: any) => ({
                  priority: item.expected_impact === 'high' ? 'high' :
                    item.expected_impact === 'medium' ? 'medium' : 'low',
                  action: item.title,
                  why: item.why || item.description,
                  expected_outcome: item.description,
                }))}
                icon="⚡"
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* SWOT ANALYSIS - Strategic Overview */}
      {/* ============================================ */}
      {swot && (
        <div className="section-card swot-section">
          <div className="section-header-row">
            <h3>📐 SWOT Analysis</h3>
            <span className="data-source-badge ai-badge">AI ANALYSIS</span>
          </div>
          <p className="swot-intro">Strategic analysis based on all collected data:</p>
          <div className="swot-grid">
            <div className="swot-box strengths">
              <h4>💪 Strengths</h4>
              <ul>
                {swot.strengths?.map((item, i) => (
                  <li key={i}>
                    <strong>{item.point}</strong>
                    {item.evidence && <span className="evidence">{item.evidence}</span>}
                  </li>
                )) || <li>No strengths identified</li>}
              </ul>
            </div>
            <div className="swot-box weaknesses">
              <h4>⚠️ Weaknesses</h4>
              <ul>
                {swot.weaknesses?.map((item, i) => (
                  <li key={i}>
                    <strong>{item.point}</strong>
                    {item.evidence && <span className="evidence">{item.evidence}</span>}
                  </li>
                )) || <li>No weaknesses identified</li>}
              </ul>
            </div>
            <div className="swot-box opportunities">
              <h4>🚀 Opportunities</h4>
              <ul>
                {swot.opportunities?.map((item, i) => (
                  <li key={i}>
                    <strong>{item.point}</strong>
                    {item.rationale && <span className="evidence">{item.rationale}</span>}
                  </li>
                )) || <li>No opportunities identified</li>}
              </ul>
            </div>
            <div className="swot-box threats">
              <h4>🔥 Threats</h4>
              <ul>
                {swot.threats?.map((item, i) => (
                  <li key={i}>
                    <strong>{item.point}</strong>
                    {item.source && <span className="evidence">{item.source}</span>}
                  </li>
                )) || <li>No threats identified</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ACTION ITEMS - Recommendations */}
      {/* ============================================ */}
      {action_items && action_items.length > 0 && (

        <div className="section-card">
          <h3>🎯 Action Items</h3>
          <div className="action-items-list">
            {action_items.map((item, i) => (
              <div key={i} className={`action-item impact-${item.expected_impact}`}>
                <div className="action-priority">#{item.priority}</div>
                <div className="action-content">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <div className="action-meta">
                    <span className={`impact-badge ${item.expected_impact}`}>
                      {item.expected_impact} impact
                    </span>
                    <span className="timeframe-badge">{item.timeframe?.replace('_', ' ')}</span>
                    <span className="category-badge">{item.category?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .header-content h1 {
          margin: 0;
          font-size: 1.75rem;
        }

        .industry-badge {
          padding: var(--space-1) var(--space-3);
          background: var(--bg-glass);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        /* Score Card */
        .score-card {
          display: flex;
          gap: var(--space-6);
          padding: var(--space-6);
          background: var(--bg-glass);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-subtle);
          margin-bottom: var(--space-6);
        }

        .score-circle {
          width: 120px;
          height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 4px solid;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .score-value {
          font-size: 2.5rem;
          font-weight: 700;
        }

        .score-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .score-details {
          flex: 1;
        }

        .score-details h2 {
          margin: 0 0 var(--space-2);
          font-size: 1.25rem;
        }

        .score-details p {
          color: var(--text-secondary);
          margin-bottom: var(--space-4);
        }

        .priority-action {
          padding: var(--space-3);
          background: rgba(102, 126, 234, 0.1);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
        }

        /* Scores Grid */
        .scores-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .score-mini-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--bg-glass);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
        }

        .score-mini {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        /* Section Card */
        .lighthouse-circle-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .score-circle-sm {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid;
          border-radius: 50%;
          font-size: 1.1rem;
          font-weight: 700;
          background: var(--bg-glass);
        }

        .score-label-sm {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .section-card {
          padding: var(--space-6);
          background: var(--bg-glass);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-subtle);
          margin-bottom: var(--space-6);
        }

        .section-card h3 {
          margin: 0 0 var(--space-5);
          font-size: 1.25rem;
        }

        .section-card h4 {
          margin: var(--space-5) 0 var(--space-3);
          font-size: 1rem;
          color: var(--text-secondary);
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
        }

        .metric-card {
          padding: var(--space-4);
          background: var(--bg-input);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .metric-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-400);
        }

        .metric-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Insights Box */
        .insights-box {
          padding: var(--space-4);
          background: var(--bg-input);
          border-radius: var(--radius-lg);
          margin-top: var(--space-4);
        }

        .insights-box h4 {
          margin: 0 0 var(--space-3);
        }

        .insights-box ul {
          margin: 0;
          padding-left: var(--space-5);
        }

        .insights-box li {
          margin-bottom: var(--space-2);
          color: var(--text-secondary);
        }

        .benchmark-note {
          margin-top: var(--space-3);
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-subtle);
          font-size: 0.875rem;
        }

        /* Chart Container */
        .chart-container {
          padding: var(--space-4);
          background: var(--bg-input);
          border-radius: var(--radius-lg);
          margin-top: var(--space-4);
        }

        .chart-container.small {
          max-width: 300px;
          margin: var(--space-4) auto;
        }

        .chart-wrapper {
          max-width: 300px;
          margin: 0 auto;
        }

        .chart-container h4 {
          margin: 0 0 var(--space-3);
          text-align: center;
        }

        /* Tags */
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }

        .tag {
          padding: var(--space-1) var(--space-3);
          background: var(--bg-glass);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
        }

        .tag.positive {
          background: rgba(16, 185, 129, 0.2);
          color: var(--accent-emerald);
        }

        .tag.negative {
          background: rgba(239, 68, 68, 0.2);
          color: var(--accent-rose);
        }

        .tag.competitor {
          background: rgba(6, 182, 212, 0.2);
          color: var(--accent-cyan);
        }

        /* Executive Bullets */
        .executive-bullets {
          padding-left: var(--space-5);
        }

        .executive-bullets li {
          margin-bottom: var(--space-3);
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Format Grid */
        .format-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }

        .format-item {
          padding: var(--space-3);
          background: var(--bg-input);
          border-radius: var(--radius-md);
        }

        .format-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: var(--space-1);
        }

        .format-value {
          font-weight: 600;
        }

        .format-value.positive {
          color: var(--accent-emerald);
        }

        .format-value.negative {
          color: var(--accent-rose);
        }

        /* Sentiment */
        .sentiment-overview {
          text-align: center;
          margin-bottom: var(--space-4);
        }

        .sentiment-badge {
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .sentiment-badge.positive {
          background: rgba(16, 185, 129, 0.2);
          color: var(--accent-emerald);
        }

        .sentiment-badge.negative {
          background: rgba(239, 68, 68, 0.2);
          color: var(--accent-rose);
        }

        .sentiment-badge.mixed, .sentiment-badge.neutral {
          background: rgba(245, 158, 11, 0.2);
          color: var(--accent-amber);
        }

        .sentiment-themes {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
          margin-top: var(--space-4);
        }

        .theme-box {
          padding: var(--space-4);
          border-radius: var(--radius-lg);
        }

        .theme-box.positive {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .theme-box.negative {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .theme-box h5 {
          margin: 0 0 var(--space-3);
          font-size: 0.875rem;
        }

        /* Recommendations */
        .recommendations {
          margin-top: var(--space-5);
          padding-top: var(--space-5);
          border-top: 1px solid var(--border-subtle);
        }

        .recommendations h4 {
          margin: 0 0 var(--space-3);
        }

        .recommendations ul {
          padding-left: var(--space-5);
          margin: 0;
        }

        .recommendations li {
          margin-bottom: var(--space-2);
          color: var(--text-secondary);
        }

        /* Listing Scores */
        .scores-bar-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .score-bar-item {
          display: grid;
          grid-template-columns: 150px 1fr 50px;
          align-items: center;
          gap: var(--space-3);
        }

        .score-bar-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .score-bar-track {
          height: 8px;
          background: var(--bg-input);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .score-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.5s ease;
        }

        .score-bar-value {
          font-size: 0.875rem;
          font-weight: 600;
          text-align: right;
        }

        /* Review Analysis */
        .review-metrics {
          display: flex;
          gap: var(--space-6);
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .review-stat {
          text-align: center;
        }

        .review-stat.large .rating {
          font-size: 3rem;
          font-weight: 700;
          color: var(--accent-amber);
        }

        .review-stat .value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .review-stat .label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Pros/Cons Grid */
        .pros-cons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
          margin-top: var(--space-4);
        }

        .pros-box, .cons-box {
          padding: var(--space-4);
          border-radius: var(--radius-lg);
        }

        .pros-box {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .cons-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .pros-box h5, .cons-box h5 {
          margin: 0 0 var(--space-3);
          font-size: 0.875rem;
        }

        .pros-box ul, .cons-box ul {
          margin: 0;
          padding-left: var(--space-4);
        }

        .pros-box li, .cons-box li {
          font-size: 0.875rem;
          margin-bottom: var(--space-2);
        }

        /* Comparison Table */
        .comparison-table-wrapper {
          overflow-x: auto;
          margin-top: var(--space-4);
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .comparison-table th, .comparison-table td {
          padding: var(--space-3);
          text-align: left;
          border-bottom: 1px solid var(--border-subtle);
        }

        .comparison-table th {
          background: var(--bg-input);
          font-weight: 600;
        }

        .comparison-table .leader {
          color: var(--accent-emerald);
          font-weight: 600;
        }

        /* SWOT Section */
        .swot-section {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(255, 255, 255, 1));
          border-left: 4px solid #8b5cf6;
        }

        .swot-intro {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: var(--space-4);
        }

        .ai-badge {
          background: linear-gradient(135deg, #8b5cf6, #a78bfa) !important;
          color: white !important;
        }

        /* SWOT Grid */
        .swot-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }

        .swot-box {
          padding: var(--space-4);
          border-radius: var(--radius-lg);
        }

        .swot-box.strengths {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .swot-box.weaknesses {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .swot-box.opportunities {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
        }

        .swot-box.threats {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .swot-box h4 {
          margin: 0 0 var(--space-3);
        }

        .swot-box ul {
          margin: 0;
          padding-left: var(--space-4);
        }

        .swot-box li {
          margin-bottom: var(--space-3);
        }

        .swot-box li strong {
          display: block;
        }

        .swot-box .evidence {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: var(--space-1);
        }

        /* Action Items */
        .action-items-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .action-item {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--bg-input);
          border-radius: var(--radius-lg);
          border-left: 4px solid var(--border-subtle);
        }

        .action-item.impact-high {
          border-left-color: var(--accent-emerald);
        }

        .action-item.impact-medium {
          border-left-color: var(--accent-amber);
        }

        .action-item.impact-low {
          border-left-color: var(--text-muted);
        }

        .action-priority {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .action-content {
          flex: 1;
        }

        .action-content h4 {
          margin: 0 0 var(--space-2);
        }

        .action-content p {
          margin: 0 0 var(--space-3);
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .action-meta {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .impact-badge, .timeframe-badge, .category-badge {
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .impact-badge {
          background: var(--bg-glass);
        }

        .impact-badge.high {
          background: rgba(16, 185, 129, 0.2);
          color: var(--accent-emerald);
        }

        .impact-badge.medium {
          background: rgba(245, 158, 11, 0.2);
          color: var(--accent-amber);
        }

        .timeframe-badge {
          background: rgba(102, 126, 234, 0.2);
          color: var(--primary-400);
        }

        .category-badge {
          background: var(--bg-glass);
          color: var(--text-muted);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .score-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .scores-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .swot-grid {
            grid-template-columns: 1fr;
          }

          .pros-cons-grid, .sentiment-themes {
            grid-template-columns: 1fr;
          }
        }

        /* ==========================================
           Content Category Matrix Styles
           ========================================== */
        .content-matrix {
          margin-top: var(--space-6);
          padding: var(--space-5);
          background: var(--bg-glass);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
        }

        .content-matrix h4 {
          margin-bottom: var(--space-2);
        }

        .matrix-insight {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: var(--space-4);
          font-style: italic;
        }

        .matrix-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-4);
        }

        .matrix-item {
          background: var(--bg-card);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          border-left: 4px solid var(--border-subtle);
        }

        .matrix-item.overusing {
          border-left-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .matrix-item.balanced {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .matrix-item.underusing {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }

        .matrix-item.missing {
          border-left-color: #6b7280;
          background: rgba(107, 114, 128, 0.05);
        }

        .matrix-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
        }

        .category-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .status-badge {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .status-badge.overusing {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .status-badge.balanced {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .status-badge.underusing {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .status-badge.missing {
          background: rgba(107, 114, 128, 0.2);
          color: #6b7280;
        }

        .matrix-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .bar-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .bar-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          width: 60px;
        }

        .bar-track {
          flex: 1;
          height: 8px;
          background: var(--bg-glass);
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .bar-fill.current.overusing {
          background: #ef4444;
        }

        .bar-fill.current.balanced {
          background: #10b981;
        }

        .bar-fill.current.underusing {
          background: #f59e0b;
        }

        .bar-fill.current.missing {
          background: #6b7280;
        }

        .bar-fill.benchmark {
          background: rgba(102, 126, 234, 0.5);
        }

        .bar-value {
          font-size: 0.75rem;
          color: var(--text-secondary);
          width: 40px;
          text-align: right;
        }

        .matrix-example {
          margin-top: var(--space-2);
          padding-top: var(--space-2);
          border-top: 1px dashed var(--border-subtle);
        }

        .matrix-example small {
          color: var(--text-muted);
          font-size: 0.7rem;
        }

        /* ==========================================
           Word Cloud / Keyword Analysis Styles
           ========================================== */
        .word-cloud-section {
          margin-top: var(--space-6);
          padding: var(--space-5);
          background: var(--bg-glass);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
        }

        .word-cloud-section h4 {
          margin-bottom: var(--space-4);
        }

        .keywords-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          justify-content: center;
          padding: var(--space-4);
          background: var(--bg-card);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }

        .keyword-tag {
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: transform 0.2s ease;
        }

        .keyword-tag:hover {
          transform: scale(1.1);
        }

        .keyword-tag.positive {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .keyword-tag.negative {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .keyword-tag.neutral {
          background: rgba(148, 163, 184, 0.15);
          color: #94a3b8;
        }

        .keyword-tag sup {
          font-size: 0.6em;
          margin-left: 2px;
        }

        .word-cloud-insights {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
        }

        .insight-box {
          padding: var(--space-4);
          border-radius: var(--radius-md);
        }

        .insight-box.pain {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .insight-box.praise {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .insight-box.trending {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .insight-box h5 {
          margin-bottom: var(--space-3);
          font-size: 0.875rem;
        }

        .insight-box ul {
          list-style: disc;
          padding-left: var(--space-4);
          margin: 0;
        }

        .insight-box li {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-1);
        }

        .tag.trending {
          background: rgba(102, 126, 234, 0.2);
          color: var(--primary-400);
        }

        /* ============================================ */
        /* INSTAGRAM SECTION STYLES */
        /* ============================================ */
        .instagram-section {
          background: linear-gradient(135deg, rgba(228, 64, 95, 0.03), rgba(255, 255, 255, 1));
          border-left: 4px solid #E4405F;
        }

        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .data-source-badge {
          padding: 4px 12px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ig-overview {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }

        .ig-stat-card {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid var(--border-subtle);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ig-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .ig-stat-card.highlight {
          background: linear-gradient(135deg, #E4405F, #F77737);
          border: none;
        }

        .ig-stat-card.highlight .ig-stat-value,
        .ig-stat-card.highlight .ig-stat-label {
          color: white;
        }

        .ig-stat-icon {
          font-size: 1.5rem;
          margin-bottom: var(--space-2);
        }

        .ig-stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .ig-stat-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: var(--space-1);
        }

        .ig-profile-info {
          padding: var(--space-4);
          background: var(--bg-input);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .username {
          font-size: 1.1rem;
          font-weight: 600;
          color: #E4405F;
        }

        .verified-badge {
          background: #3b82f6;
          color: white;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 600;
        }

        .profile-name {
          color: var(--text-secondary);
          margin-top: var(--space-1);
          font-size: 0.9rem;
        }

        .ig-details {
          margin-bottom: var(--space-5);
        }

        .ig-detail-box {
          background: var(--bg-input);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
        }

        .ig-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
          margin-top: var(--space-3);
        }

        .ig-metric-item {
          text-align: center;
        }

        .ig-metric-item .metric-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: var(--space-1);
        }

        .ig-metric-item .metric-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .ig-content-breakdown {
          background: var(--bg-input);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
        }

        .content-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-top: var(--space-3);
        }

        .content-bar-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .content-bar-item .bar-label {
          width: 100px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .content-bar-item .bar-track {
          flex: 1;
          height: 12px;
          background: var(--bg-glass);
          border-radius: 6px;
          overflow: hidden;
        }

        .content-bar-item .bar-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.5s ease;
        }

        .bar-fill.reels {
          background: linear-gradient(90deg, #E4405F, #F77737);
        }

        .bar-fill.carousels {
          background: linear-gradient(90deg, #405DE6, #5851DB);
        }

        .bar-fill.images {
          background: linear-gradient(90deg, #833AB4, #C13584);
        }

        .content-bar-item .bar-count {
          width: 40px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          text-align: right;
        }

        .ig-sentiment-section {
          background: var(--bg-input);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
        }

        .sentiment-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-top: var(--space-3);
        }

        .sentiment-bar-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .sentiment-label {
          width: 100px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .sentiment-bar-track {
          flex: 1;
          height: 10px;
          background: var(--bg-glass);
          border-radius: 5px;
          overflow: hidden;
        }

        .sentiment-bar-fill {
          height: 100%;
          border-radius: 5px;
          transition: width 0.5s ease;
        }

        .sentiment-count {
          width: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          text-align: right;
        }

        @media (max-width: 768px) {
          .ig-overview {
            grid-template-columns: repeat(3, 1fr);
          }
          .ig-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* ============================================ */
        /* YOUTUBE SECTION STYLES */
        /* ============================================ */
        .youtube-section {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.03), rgba(255, 255, 255, 1));
          border-left: 4px solid #ff0000;
        }

        .youtube-overview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .yt-stat-card {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: transform 0.2s ease;
        }

        .yt-stat-card:hover {
          transform: translateY(-2px);
        }

        .yt-stat-icon {
          font-size: 1.5rem;
          margin-bottom: var(--space-2);
        }

        .yt-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .yt-stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .youtube-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .yt-detail-box {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .yt-detail-box h4 {
          margin-bottom: var(--space-3);
          color: var(--text-primary);
        }

        .yt-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }

        .yt-metric {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .yt-metric .label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .yt-metric .value {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--accent-teal);
        }

        .top-videos-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .top-video-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .top-video-item .rank {
          background: linear-gradient(135deg, #ff0000, #cc0000);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .video-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .video-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .video-stats {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .short-badge {
          background: linear-gradient(135deg, #ff4757, #ff6b81);
          color: white;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.6rem;
          margin-left: 8px;
        }

        /* Comments Heatmap */
        .comments-heatmap {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .comments-heatmap h4 {
          margin-bottom: var(--space-4);
        }

        .heatmap-container {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 4px;
          margin-bottom: var(--space-4);
        }

        .heatmap-cell {
          aspect-ratio: 1;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .heatmap-cell:hover {
          transform: scale(1.15);
          z-index: 10;
        }

        .heatmap-cell.positive {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .heatmap-cell.neutral {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
        }

        .heatmap-cell.negative {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .cell-number {
          font-size: 0.65rem;
          color: white;
          font-weight: 600;
        }

        .heatmap-legend {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
        }

        .legend-item {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        /* Section header with badge */
        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .section-header-row h3 {
          margin: 0;
        }

        .data-source-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* YouTube 6-column layout */
        .youtube-overview {
          grid-template-columns: repeat(6, 1fr) !important;
        }

        .yt-stat-card.highlight {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.05), white);
          border: 2px solid rgba(255, 0, 0, 0.2);
        }

        /* Large metrics */
        .yt-metrics-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
        }

        .yt-metric-large {
          padding: var(--space-4);
          background: var(--bg-tertiary);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .yt-metric-large .metric-value {
          display: block;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--accent-teal);
        }

        .yt-metric-large .metric-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        /* Video Tables */
        .yt-videos-section {
          margin-top: var(--space-6);
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .yt-videos-section h4 {
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-2);
          border-bottom: 1px solid var(--border-subtle);
        }

        .videos-table {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .video-table-header {
          display: grid;
          grid-template-columns: 60px 1fr 80px 80px 80px 80px;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
        }

        .videos-table.compact .video-table-header {
          grid-template-columns: 70px 1fr 80px 80px 90px;
        }

        .video-table-row {
          display: grid;
          grid-template-columns: 60px 1fr 80px 80px 80px 80px;
          gap: var(--space-2);
          padding: var(--space-3);
          background: white;
          border-bottom: 1px solid var(--border-subtle);
          align-items: center;
          transition: background 0.2s ease;
        }

        .videos-table.compact .video-table-row {
          grid-template-columns: 70px 1fr 80px 80px 90px;
        }

        .video-table-row:hover {
          background: rgba(20, 184, 166, 0.03);
        }

        .rank-badge {
          background: linear-gradient(135deg, #ff0000, #cc0000);
          color: white;
          padding: 4px 10px;
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
        }

        .date-cell {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .video-title-cell {
          font-size: 0.85rem;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .short-indicator {
          background: linear-gradient(135deg, #ff4757, #ff6b81);
          color: white;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 0.65rem;
          margin-right: 6px;
        }

        .metric-cell {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-align: right;
        }

        .type-badge {
          font-size: 0.7rem;
          padding: 4px 8px;
          border-radius: var(--radius-full);
          text-align: center;
        }

        .type-badge.short {
          background: linear-gradient(135deg, rgba(255, 71, 87, 0.1), rgba(255, 107, 129, 0.1));
          color: #ff4757;
        }

        .type-badge.long {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.05), rgba(255, 0, 0, 0.1));
          color: #cc0000;
        }

        /* Comments Section */
        .comments-section {
          margin-top: var(--space-6);
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .comments-section h4 {
          margin-bottom: var(--space-4);
        }

        .sample-comments {
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-subtle);
        }

        .sample-comments h5 {
          margin-bottom: var(--space-3);
          font-size: 0.9rem;
        }

        .comments-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
        }

        .comment-item {
          padding: var(--space-3);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--border-subtle);
        }

        .comment-author {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-teal);
          margin-bottom: 4px;
        }

        .comment-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }

        .comment-likes {
          display: inline-block;
          margin-top: 6px;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* ============================================ */
        /* GOOGLE TRENDS SECTION STYLES */
        /* ============================================ */
        .trends-section {
          background: linear-gradient(135deg, rgba(66, 133, 244, 0.03), rgba(255, 255, 255, 1));
          border-left: 4px solid #4285f4;
        }

        .trends-overview {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }

        .trends-chart-container, .regional-heatmap {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .trends-chart-container h4, .regional-heatmap h4 {
          margin-bottom: var(--space-4);
        }

        .trends-chart {
          display: flex;
          align-items: flex-end;
          height: 120px;
          gap: 4px;
        }

        .trend-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
        }

        .trend-bar {
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
        }

        .trend-label {
          font-size: 0.6rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .region-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .region-item {
          display: grid;
          grid-template-columns: 80px 1fr 40px;
          align-items: center;
          gap: var(--space-2);
        }

        .region-name {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .region-bar-container {
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }

        .region-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .region-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-teal);
          text-align: right;
        }

        .queries-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .queries-box {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .queries-box.rising {
          border-left: 3px solid var(--accent-coral);
        }

        .queries-box h4 {
          margin-bottom: var(--space-3);
        }

        .query-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .query-tag {
          background: var(--bg-tertiary);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .query-tag:hover {
          background: var(--accent-teal);
          color: white;
        }

        .query-tag.rising {
          background: linear-gradient(135deg, rgba(248, 113, 113, 0.1), rgba(251, 146, 60, 0.1));
          color: var(--accent-coral);
        }

        /* Enhanced Google Trends Styles */
        .trends-section {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.03), rgba(255, 255, 255, 1));
          border-left: 4px solid #a855f7;
        }

        .trends-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }

        .trend-stat-card {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid var(--border-subtle);
        }

        .trend-stat-card.trend-rising {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), white);
          border-color: var(--accent-emerald);
        }

        .trend-stat-card.trend-falling {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), white);
          border-color: var(--accent-rose);
        }

        .trend-stat-card.trend-stable {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), white);
          border-color: var(--accent-amber);
        }

        .trend-stat-icon {
          font-size: 1.5rem;
          margin-bottom: var(--space-2);
        }

        .trend-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .trend-stat-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: var(--space-1);
        }

        .trend-bar.partial {
          opacity: 0.6;
        }

        .region-item {
          display: grid;
          grid-template-columns: 30px 100px 1fr 40px;
          align-items: center;
          gap: var(--space-2);
        }

        .region-rank {
          font-size: 0.7rem;
          font-weight: 600;
          color: #a855f7;
        }

        .query-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .query-item {
          display: grid;
          grid-template-columns: 35px 1fr 50px;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          transition: all 0.2s ease;
        }

        .query-item:hover {
          background: var(--bg-tertiary);
        }

        .query-item.rising {
          background: linear-gradient(90deg, rgba(248, 113, 113, 0.05), rgba(251, 146, 60, 0.05));
        }

        .query-rank {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .query-text {
          font-size: 0.8rem;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .query-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-teal);
          text-align: right;
        }

        .query-growth {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-coral);
          text-align: right;
        }

        @media (max-width: 768px) {
          .trends-summary {
            grid-template-columns: repeat(2, 1fr);
          }
          .region-item {
            grid-template-columns: 25px 80px 1fr 35px;
          }
        }

        /* ============================================ */
        /* WEBSITE AUDIT SECTION STYLES */
        /* ============================================ */
        .website-section {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.03), rgba(255, 255, 255, 1));
          border-left: 4px solid var(--accent-teal);
        }

        .website-scores {
          display: flex;
          justify-content: space-around;
          margin-bottom: var(--space-6);
        }

        .score-gauge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }

        .score-gauge.overall .gauge-circle {
          width: 100px;
          height: 100px;
        }

        .gauge-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .gauge-circle::before {
          content: '';
          position: absolute;
          width: calc(100% - 16px);
          height: calc(100% - 16px);
          background: white;
          border-radius: 50%;
        }

        .gauge-value {
          position: relative;
          z-index: 1;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .score-gauge.overall .gauge-value {
          font-size: 1.75rem;
        }

        .gauge-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .core-web-vitals {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
        }

        .core-web-vitals h4 {
          margin-bottom: var(--space-4);
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
        }

        .vital-card {
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          text-align: center;
          border: 2px solid transparent;
        }

        .vital-card.good {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .vital-card.needs-improvement {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .vital-card.poor {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .vital-name {
          display: block;
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .vital-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .vital-rating {
          display: block;
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-top: 4px;
          text-transform: capitalize;
        }

        .website-issues {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
        }

        .website-issues h4 {
          margin-bottom: var(--space-4);
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .issue-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
        }

        .issue-item.error {
          background: rgba(239, 68, 68, 0.05);
        }

        .issue-item.warning {
          background: rgba(245, 158, 11, 0.05);
        }

        .issue-icon {
          font-size: 1rem;
        }

        .issue-text {
          flex: 1;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .issue-category {
          font-size: 0.7rem;
          padding: 2px 8px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .issue-page {
          font-size: 0.7rem;
          color: var(--accent-teal);
          font-family: monospace;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Enhanced Website Audit Styles */
        .audit-summary-bar {
          display: flex;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
        }

        .pages-badge {
          background: linear-gradient(135deg, var(--accent-teal), var(--accent-emerald));
          color: white;
          padding: 6px 16px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .url-badge {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          padding: 6px 16px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-family: monospace;
        }

        .audit-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }

        .audit-stat-card {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid var(--border-subtle);
        }

        .audit-stat-card.good {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), white);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .audit-stat-card.warning {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), white);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .audit-stat-card .stat-icon {
          font-size: 1.5rem;
          display: block;
          margin-bottom: var(--space-2);
        }

        .audit-stat-card .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
        }

        .audit-stat-card .stat-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-top: var(--space-1);
        }

        .seo-checklist {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .seo-checklist h4 {
          margin-bottom: var(--space-4);
        }

        .checklist-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3);
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid transparent;
        }

        .check-item.pass {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.05);
        }

        .check-item.fail {
          border-color: rgba(245, 158, 11, 0.3);
          background: rgba(245, 158, 11, 0.05);
        }

        .check-icon {
          font-size: 1rem;
        }

        .check-text {
          flex: 1;
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .check-count {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .pages-table-section {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .pages-table-section h4 {
          margin-bottom: var(--space-4);
        }

        .pages-table {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pages-table-header {
          display: grid;
          grid-template-columns: 100px 1fr 60px 60px 50px;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
        }

        .pages-table-row {
          display: grid;
          grid-template-columns: 100px 1fr 60px 60px 50px;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: white;
          border-bottom: 1px solid var(--border-subtle);
          align-items: center;
          font-size: 0.8rem;
        }

        .page-url {
          font-family: monospace;
          font-size: 0.7rem;
          color: var(--accent-teal);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .page-title {
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .page-words, .page-links {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .page-h1 {
          text-align: center;
        }

        .page-h1.good {
          color: var(--accent-emerald);
        }

        .page-h1.warn {
          color: var(--accent-amber);
        }

        @media (max-width: 768px) {
          .audit-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .checklist-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .pages-table-header,
          .pages-table-row {
            grid-template-columns: 80px 1fr 50px 50px 40px;
            font-size: 0.7rem;
          }
        }

        /* Responsive for new sections */
        @media (max-width: 768px) {
          .youtube-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .youtube-details, .trends-overview, .queries-section {
            grid-template-columns: 1fr;
          }

          .website-scores {
            flex-wrap: wrap;
            gap: var(--space-4);
          }

          .vitals-grid {
            grid-template-columns: 1fr;
          }

          .heatmap-container {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        /* ============================================ */
        /* SEO SECTION STYLES */
        /* ============================================ */
        .seo-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(255, 255, 255, 1));
          border-left: 4px solid #667eea;
        }

        .seo-rankings-section {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .seo-rankings-section h4 {
          margin-bottom: var(--space-4);
        }

        .rankings-table {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ranking-table-header {
          display: grid;
          grid-template-columns: 50px 1fr 120px;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
        }

        .ranking-table-row {
          display: grid;
          grid-template-columns: 50px 1fr 120px;
          gap: var(--space-2);
          padding: var(--space-3);
          background: white;
          border-bottom: 1px solid var(--border-subtle);
          align-items: center;
          transition: background 0.2s ease;
        }

        .ranking-table-row:hover {
          background: rgba(102, 126, 234, 0.03);
        }

        .position-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #667eea, #5851DB);
          color: white;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .ranking-title {
          font-size: 0.85rem;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ranking-domain {
          font-size: 0.75rem;
          color: var(--accent-teal);
          font-weight: 500;
        }

        .top-rankings-box {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .top-rankings-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .top-ranking-item {
          display: grid;
          grid-template-columns: 60px 1fr 1fr;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          align-items: center;
        }

        .rank-position {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          background: var(--bg-tertiary);
          text-align: center;
        }

        .rank-position.top3 {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
        }

        .rank-position.top10 {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .rank-keyword {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .rank-url {
          font-size: 0.75rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .missing-keywords-box {
          background: rgba(239, 68, 68, 0.05);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
          border: 1px solid rgba(239, 68, 68, 0.15);
        }

        .missing-keywords-box h4 {
          color: #ef4444;
          margin-bottom: var(--space-2);
        }

        .insight-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-3);
        }

        .missing-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .missing-tag {
          padding: 4px 12px;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .competitor-rankings-box {
          background: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .competitor-rankings-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
          margin-top: var(--space-3);
        }

        .competitor-ranking-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .comp-position {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-amber);
        }

        .comp-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .comp-title {
          font-size: 0.8rem;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .comp-domain {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .competitor-rankings-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

    </div>
  );
}
