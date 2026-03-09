'use client';

import React from 'react';
import { ScrapedDataForDashboard } from '@/types/audit';

/**
 * BrandHeatmap - Unified heatmap showing overall brand health across all platforms
 * 
 * Features:
 * - Multi-dimensional brand health visualization
 * - Combined metrics from Instagram, Amazon, YouTube, Website, Trends
 * - Category-based performance comparison
 * - Sentiment distribution across all sources
 */

interface BrandHeatmapProps {
    scrapedData: ScrapedDataForDashboard;
    brandName: string;
    summary?: {
        overall_health_score?: number;
        overall_grade?: string;
    };
}

interface MetricCell {
    label: string;
    value: number;  // 0-100 normalized score
    rawValue: string;
    category: string;
    source: string;
}

interface SentimentData {
    source: string;
    positive: number;
    neutral: number;
    negative: number;
    total: number;
}

export default function BrandHeatmap({ scrapedData, brandName, summary }: BrandHeatmapProps) {
    // Calculate normalized scores for each dimension
    const calculateMetrics = (): MetricCell[] => {
        const metrics: MetricCell[] = [];

        // Instagram Metrics
        if (scrapedData?.instagram) {
            const ig = scrapedData.instagram;

            // Followers Score (based on common benchmarks)
            const followersScore = Math.min(100, (ig.profile.followersCount / 1000000) * 100);
            metrics.push({
                label: 'Followers',
                value: followersScore,
                rawValue: formatNumber(ig.profile.followersCount),
                category: 'Reach',
                source: 'Instagram'
            });

            // Engagement Rate Score
            const engagementScore = Math.min(100, ig.engagement.engagementRate * 20);
            metrics.push({
                label: 'Engagement Rate',
                value: engagementScore,
                rawValue: `${ig.engagement.engagementRate}%`,
                category: 'Engagement',
                source: 'Instagram'
            });

            // Content Mix Score (balanced mix is better)
            const contentBreakdown = ig.contentBreakdown;
            const total = contentBreakdown.reels + contentBreakdown.carousels + contentBreakdown.images;
            const reelsPercent = total > 0 ? (contentBreakdown.reels / total) * 100 : 0;
            const contentScore = reelsPercent >= 30 && reelsPercent <= 60 ? 90 :
                reelsPercent >= 20 ? 70 : 50;
            metrics.push({
                label: 'Content Mix',
                value: contentScore,
                rawValue: `${Math.round(reelsPercent)}% Reels`,
                category: 'Content',
                source: 'Instagram'
            });

            // Posting Frequency Score
            const freqScore = Math.min(100, ig.postingFrequency.postsPerWeek * 15);
            metrics.push({
                label: 'Posting Frequency',
                value: freqScore,
                rawValue: `${ig.postingFrequency.postsPerWeek}/week`,
                category: 'Activity',
                source: 'Instagram'
            });
        }

        // Amazon Metrics
        if (scrapedData?.amazon) {
            const az = scrapedData.amazon;

            // Rating Score
            const ratingScore = (az.reviewAnalysis.avgRating / 5) * 100;
            metrics.push({
                label: 'Avg Rating',
                value: ratingScore,
                rawValue: `${az.reviewAnalysis.avgRating}★`,
                category: 'Quality',
                source: 'Amazon'
            });

            // Review Volume Score
            const reviewScore = Math.min(100, (az.reviewAnalysis.totalReviews / 10000) * 100);
            metrics.push({
                label: 'Review Volume',
                value: reviewScore,
                rawValue: formatNumber(az.reviewAnalysis.totalReviews),
                category: 'Social Proof',
                source: 'Amazon'
            });

            // Best Seller/Choice Badges Score
            const badgeCount = (az.salesAnalysis?.bestSellersCount || 0) + (az.salesAnalysis?.amazonChoiceCount || 0);
            const badgeScore = Math.min(100, badgeCount * 25);
            metrics.push({
                label: 'Trust Badges',
                value: badgeScore,
                rawValue: `${badgeCount} badges`,
                category: 'Authority',
                source: 'Amazon'
            });
        }

        // YouTube Metrics
        if (scrapedData?.youtube) {
            const yt = scrapedData.youtube;

            // Subscriber Score
            const subScore = Math.min(100, (yt.subscriberCount / 1000000) * 100);
            metrics.push({
                label: 'Subscribers',
                value: subScore,
                rawValue: formatNumber(yt.subscriberCount),
                category: 'Reach',
                source: 'YouTube'
            });

            // YouTube Engagement
            const ytEngScore = Math.min(100, yt.engagementRate * 10);
            metrics.push({
                label: 'Video Engagement',
                value: ytEngScore,
                rawValue: `${yt.engagementRate}%`,
                category: 'Engagement',
                source: 'YouTube'
            });

            // Upload Frequency
            const uploadScore = Math.min(100, yt.uploadsPerWeek * 20);
            metrics.push({
                label: 'Upload Frequency',
                value: uploadScore,
                rawValue: `${yt.uploadsPerWeek}/week`,
                category: 'Activity',
                source: 'YouTube'
            });

            // Shorts Adoption
            const shortsScore = yt.shortsPercentage >= 20 && yt.shortsPercentage <= 50 ? 90 :
                yt.shortsPercentage > 0 ? 70 : 40;
            metrics.push({
                label: 'Shorts Strategy',
                value: shortsScore,
                rawValue: `${yt.shortsPercentage}%`,
                category: 'Content',
                source: 'YouTube'
            });
        }

        // Website/SEO Metrics
        if (scrapedData?.websiteAudit) {
            const web = scrapedData.websiteAudit;

            metrics.push({
                label: 'SEO Score',
                value: web.seoScore,
                rawValue: `${web.seoScore}/100`,
                category: 'Technical',
                source: 'Website'
            });

            metrics.push({
                label: 'Content Quality',
                value: web.contentScore,
                rawValue: `${web.contentScore}/100`,
                category: 'Content',
                source: 'Website'
            });

            metrics.push({
                label: 'Technical Health',
                value: web.technicalScore,
                rawValue: `${web.technicalScore}/100`,
                category: 'Technical',
                source: 'Website'
            });
        }

        return metrics;
    };

    // Calculate sentiment across all sources
    const calculateSentiment = (): SentimentData[] => {
        const sentimentData: SentimentData[] = [];

        if (scrapedData?.instagram?.sentiment) {
            const s = scrapedData.instagram.sentiment;
            sentimentData.push({
                source: 'Instagram',
                positive: s.positiveCount,
                neutral: s.neutralCount,
                negative: s.negativeCount,
                total: s.positiveCount + s.neutralCount + s.negativeCount
            });
        }

        if (scrapedData?.youtube && scrapedData.youtube.recentComments && scrapedData.youtube.recentComments.length > 0) {
            // Analyze YouTube comments sentiment
            let positive = 0, neutral = 0, negative = 0;
            const positiveWords = ['love', 'great', 'amazing', 'best', 'awesome', 'excellent', 'helpful', 'thanks'];
            const negativeWords = ['bad', 'worst', 'hate', 'disappointed', 'waste', 'boring'];

            scrapedData.youtube.recentComments.forEach(c => {
                const text = c.text.toLowerCase();
                if (positiveWords.some(w => text.includes(w))) positive++;
                else if (negativeWords.some(w => text.includes(w))) negative++;
                else neutral++;
            });

            sentimentData.push({
                source: 'YouTube',
                positive,
                neutral,
                negative,
                total: positive + neutral + negative
            });
        }

        // Amazon review sentiment (estimate from rating)
        if (scrapedData?.amazon) {
            const avgRating = scrapedData.amazon.reviewAnalysis.avgRating;
            const total = scrapedData.amazon.reviewAnalysis.totalReviews;
            // Estimate distribution based on rating
            const positivePercent = avgRating >= 4 ? 0.7 : avgRating >= 3 ? 0.5 : 0.3;
            const negativePercent = avgRating >= 4 ? 0.1 : avgRating >= 3 ? 0.2 : 0.4;

            sentimentData.push({
                source: 'Amazon',
                positive: Math.round(total * positivePercent),
                neutral: Math.round(total * (1 - positivePercent - negativePercent)),
                negative: Math.round(total * negativePercent),
                total
            });
        }

        return sentimentData;
    };

    // Format number helper
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    // Get cell color based on value
    const getCellColor = (value: number): string => {
        if (value >= 80) return 'rgba(34, 197, 94, 0.8)';  // Green
        if (value >= 60) return 'rgba(234, 179, 8, 0.8)';   // Yellow
        if (value >= 40) return 'rgba(249, 115, 22, 0.8)';  // Orange
        return 'rgba(239, 68, 68, 0.8)';  // Red
    };

    // Get gradient for overall score
    const getScoreGradient = (score: number): string => {
        if (score >= 80) return 'linear-gradient(135deg, #22c55e, #10b981)';
        if (score >= 60) return 'linear-gradient(135deg, #eab308, #f59e0b)';
        if (score >= 40) return 'linear-gradient(135deg, #f97316, #ef4444)';
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
    };

    const metrics = calculateMetrics();
    const sentimentData = calculateSentiment();

    // Group metrics by category
    const categories = [...new Set(metrics.map(m => m.category))];

    // Group metrics by source
    const sources = [...new Set(metrics.map(m => m.source))];

    // Calculate overall brand score
    const overallScore = summary?.overall_health_score ||
        (metrics.length > 0 ? Math.round(metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length) : 0);

    // Calculate total sentiment
    const totalSentiment = sentimentData.reduce((acc, s) => ({
        positive: acc.positive + s.positive,
        neutral: acc.neutral + s.neutral,
        negative: acc.negative + s.negative,
        total: acc.total + s.total
    }), { positive: 0, neutral: 0, negative: 0, total: 0 });

    return (
        <div className="brand-heatmap-container" style={{
            backgroundColor: '#fff',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px',
            }}>
                <div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        🔥 Brand Health Heatmap
                    </h2>
                    <p style={{
                        color: '#64748b',
                        fontSize: '0.9rem',
                        margin: '4px 0 0 0',
                    }}>
                        Unified performance view across all platforms for {brandName}
                    </p>
                </div>

                {/* Overall Score Circle */}
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: getScoreGradient(overallScore),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                }}>
                    <span style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#fff',
                    }}>
                        {overallScore}
                    </span>
                    <span style={{
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        textTransform: 'uppercase',
                    }}>
                        Score
                    </span>
                </div>
            </div>

            {/* Main Heatmap Grid - By Source */}
            <div style={{ marginBottom: '32px' }}>
                <h4 style={{
                    color: '#1e293b',
                    fontSize: '1rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    📊 Performance by Platform
                </h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `120px repeat(${Math.min(categories.length, 6)}, 1fr)`,
                    gap: '4px',
                }}>
                    {/* Header Row */}
                    <div style={{
                        padding: '12px 8px',
                        fontWeight: 600,
                        color: '#64748b',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                    }}>
                        Platform
                    </div>
                    {categories.slice(0, 6).map(cat => (
                        <div key={cat} style={{
                            padding: '12px 8px',
                            fontWeight: 600,
                            color: '#64748b',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            textAlign: 'center',
                        }}>
                            {cat}
                        </div>
                    ))}

                    {/* Data Rows by Source */}
                    {sources.map(source => (
                        <React.Fragment key={source}>
                            <div style={{
                                padding: '12px 8px',
                                fontWeight: 600,
                                color: '#1e293b',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                            }}>
                                {source === 'Instagram' && '📸'}
                                {source === 'Amazon' && '🛒'}
                                {source === 'YouTube' && '🎬'}
                                {source === 'Website' && '🌐'}
                                {source === 'Trends' && '📈'}
                                {source}
                            </div>
                            {categories.slice(0, 6).map(cat => {
                                const cell = metrics.find(m => m.source === source && m.category === cat);
                                return (
                                    <div
                                        key={`${source}-${cat}`}
                                        style={{
                                            padding: '16px 8px',
                                            backgroundColor: cell ? getCellColor(cell.value) : '#f1f5f9',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            cursor: cell ? 'pointer' : 'default',
                                        }}
                                        title={cell ? `${cell.label}: ${cell.rawValue}` : 'No data'}
                                    >
                                        {cell ? (
                                            <div style={{
                                                fontSize: '1.25rem',
                                                fontWeight: 700,
                                                color: '#fff',
                                                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                            }}>
                                                {cell.rawValue}
                                            </div>
                                        ) : (
                                            <div style={{
                                                color: '#94a3b8',
                                                fontSize: '0.75rem',
                                            }}>
                                                —
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Sentiment Heatmap */}
            {sentimentData.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <h4 style={{
                        color: '#1e293b',
                        fontSize: '1rem',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        💬 Sentiment Distribution Across Platforms
                    </h4>

                    {/* Overall Sentiment Bar */}
                    <div style={{
                        marginBottom: '20px',
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                    }}>
                        <div style={{
                            fontSize: '0.8rem',
                            color: '#64748b',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}>
                            Overall Brand Sentiment
                        </div>
                        <div style={{
                            display: 'flex',
                            height: '32px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                        }}>
                            <div style={{
                                width: `${(totalSentiment.positive / totalSentiment.total) * 100}%`,
                                backgroundColor: '#22c55e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                            }}>
                                {totalSentiment.total > 0 && `${Math.round((totalSentiment.positive / totalSentiment.total) * 100)}% 😊`}
                            </div>
                            <div style={{
                                width: `${(totalSentiment.neutral / totalSentiment.total) * 100}%`,
                                backgroundColor: '#eab308',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                            }}>
                                {totalSentiment.neutral > 0 && `${Math.round((totalSentiment.neutral / totalSentiment.total) * 100)}%`}
                            </div>
                            <div style={{
                                width: `${(totalSentiment.negative / totalSentiment.total) * 100}%`,
                                backgroundColor: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                            }}>
                                {totalSentiment.negative > 0 && `${Math.round((totalSentiment.negative / totalSentiment.total) * 100)}% 😠`}
                            </div>
                        </div>
                    </div>

                    {/* Per-Source Sentiment */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                    }}>
                        {sentimentData.map((data, i) => (
                            <div key={i} style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                padding: '16px',
                                border: '1px solid #e2e8f0',
                            }}>
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    {data.source === 'Instagram' && '📸'}
                                    {data.source === 'Amazon' && '🛒'}
                                    {data.source === 'YouTube' && '🎬'}
                                    {data.source}
                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: '#64748b',
                                        marginLeft: 'auto',
                                    }}>
                                        {formatNumber(data.total)} reviews
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    height: '16px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                                }}>
                                    <div style={{
                                        width: `${data.total > 0 ? (data.positive / data.total) * 100 : 0}%`,
                                        backgroundColor: '#22c55e',
                                    }} />
                                    <div style={{
                                        width: `${data.total > 0 ? (data.neutral / data.total) * 100 : 0}%`,
                                        backgroundColor: '#eab308',
                                    }} />
                                    <div style={{
                                        width: `${data.total > 0 ? (data.negative / data.total) * 100 : 0}%`,
                                        backgroundColor: '#ef4444',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.9)' }} />
                    <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 500 }}>Excellent (80+)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(234, 179, 8, 0.9)' }} />
                    <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 500 }}>Good (60-79)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(249, 115, 22, 0.9)' }} />
                    <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 500 }}>Needs Work (40-59)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.9)' }} />
                    <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 500 }}>Critical (&lt;40)</span>
                </div>
            </div>
        </div>
    );
}
