'use client';

import { ScrapedDataForDashboard } from '@/types/audit';
import { useMemo } from 'react';

interface WordCloudHeatmapProps {
    scrapedData: ScrapedDataForDashboard;
    brandName: string;
}

interface WordData {
    word: string;
    count: number;
    source: 'instagram' | 'amazon' | 'youtube' | 'trends' | 'seo';
    sentiment?: 'positive' | 'negative' | 'neutral';
}

// Simple stop words to filter out
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'over', 'after', 'is', 'it', 'its', 'this',
    'that', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my',
    'your', 'his', 'our', 'their', 'what', 'which', 'who', 'when', 'where', 'why',
    'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very', 'just', 'also',
    'now', 'here', 'there', 'then', 'once', 'ever', 'can', 'get', 'got', 'like',
    'really', 'much', 'well', 'back', 'even', 'still', 'way', 'take', 'come', 'go',
    'made', 'make', 'one', 'two', 'first', 'new', 'good', 'best', 'use', 'using',
    'used', 'buy', 'product', 'products', 'bought', 'amazon', 'india', 'price',
]);

function extractWords(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

export default function WordCloudHeatmap({ scrapedData, brandName }: WordCloudHeatmapProps) {
    const wordData = useMemo(() => {
        const wordCounts: Map<string, WordData> = new Map();

        const addWord = (word: string, source: WordData['source'], sentiment?: WordData['sentiment']) => {
            const key = word.toLowerCase();
            if (key.length < 3 || STOP_WORDS.has(key)) return;

            const existing = wordCounts.get(key);
            if (existing) {
                existing.count += 1;
            } else {
                wordCounts.set(key, { word: key, count: 1, source, sentiment });
            }
        };

        // Extract from Instagram
        if (scrapedData.instagram) {
            // From sentiment analysis
            scrapedData.instagram.sentiment?.positive?.forEach(text => {
                extractWords(text).forEach(w => addWord(w, 'instagram', 'positive'));
            });
            scrapedData.instagram.sentiment?.negative?.forEach(text => {
                extractWords(text).forEach(w => addWord(w, 'instagram', 'negative'));
            });
        }

        // Extract from Amazon
        if (scrapedData.amazon) {
            // From review pros/cons
            scrapedData.amazon.reviewAnalysis?.pros?.forEach(text => {
                extractWords(text).forEach(w => addWord(w, 'amazon', 'positive'));
            });
            scrapedData.amazon.reviewAnalysis?.cons?.forEach(text => {
                extractWords(text).forEach(w => addWord(w, 'amazon', 'negative'));
            });
            // From product titles
            scrapedData.amazon.products?.forEach(product => {
                extractWords(product.title).forEach(w => addWord(w, 'amazon'));
            });
        }

        // Extract from YouTube
        if (scrapedData.youtube) {
            scrapedData.youtube.recentComments?.forEach((comment: { text: string }) => {
                extractWords(comment.text).forEach(w => addWord(w, 'youtube'));
            });
            scrapedData.youtube.topVideos?.forEach((video: { title: string }) => {
                extractWords(video.title).forEach(w => addWord(w, 'youtube'));
            });
        }

        // Extract from SEO
        if (scrapedData.seo) {
            scrapedData.seo.brandKeywordRankings?.forEach(result => {
                extractWords(result.title).forEach(w => addWord(w, 'seo'));
            });
            scrapedData.seo.relatedSearches?.forEach((rs: { query: string }) => {
                extractWords(rs.query).forEach(w => addWord(w, 'seo'));
            });
        }

        // Remove brand name itself
        const brandWords = brandName.toLowerCase().split(/\s+/);
        brandWords.forEach(w => wordCounts.delete(w));

        // Convert to array and sort by count
        return Array.from(wordCounts.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 60); // Top 60 words
    }, [scrapedData, brandName]);

    if (wordData.length === 0) {
        return null;
    }

    const maxCount = Math.max(...wordData.map(w => w.count));

    const getWordStyle = (word: WordData) => {
        const intensity = Math.min(1, word.count / maxCount);
        const size = 0.7 + (intensity * 1.3); // 0.7rem to 2rem

        let bgColor = 'rgba(99, 102, 241, 0.1)'; // default indigo
        let textColor = 'rgb(99, 102, 241)';

        if (word.sentiment === 'positive') {
            bgColor = `rgba(16, 185, 129, ${0.1 + intensity * 0.2})`;
            textColor = 'rgb(5, 150, 105)';
        } else if (word.sentiment === 'negative') {
            bgColor = `rgba(239, 68, 68, ${0.1 + intensity * 0.2})`;
            textColor = 'rgb(220, 38, 38)';
        } else {
            // Color by source
            switch (word.source) {
                case 'instagram':
                    bgColor = `rgba(236, 72, 153, ${0.1 + intensity * 0.15})`;
                    textColor = 'rgb(219, 39, 119)';
                    break;
                case 'amazon':
                    bgColor = `rgba(251, 146, 60, ${0.1 + intensity * 0.15})`;
                    textColor = 'rgb(234, 88, 12)';
                    break;
                case 'youtube':
                    bgColor = `rgba(255, 0, 0, ${0.1 + intensity * 0.15})`;
                    textColor = 'rgb(220, 38, 38)';
                    break;
                case 'trends':
                    bgColor = `rgba(59, 130, 246, ${0.1 + intensity * 0.15})`;
                    textColor = 'rgb(37, 99, 235)';
                    break;
                case 'seo':
                    bgColor = `rgba(34, 197, 94, ${0.1 + intensity * 0.15})`;
                    textColor = 'rgb(22, 163, 74)';
                    break;
            }
        }

        return {
            fontSize: `${size}rem`,
            background: bgColor,
            color: textColor,
            fontWeight: intensity > 0.5 ? 600 : 400,
            opacity: 0.7 + intensity * 0.3,
        };
    };

    const getSourceIcon = (source: WordData['source']) => {
        switch (source) {
            case 'instagram': return '📸';
            case 'amazon': return '🛒';
            case 'youtube': return '🎬';
            case 'trends': return '📈';
            case 'seo': return '🔍';
        }
    };

    return (
        <div className="word-cloud-section">
            <div className="section-header-row">
                <h3>🔤 Brand Word Heatmap</h3>
                <span className="data-source-badge">AGGREGATED</span>
            </div>

            <p className="word-cloud-subtitle">
                Keywords extracted from Instagram, Amazon, YouTube, Google Trends, and SEO data
            </p>

            {/* Legend */}
            <div className="word-cloud-legend">
                <span className="legend-item instagram">📸 Instagram</span>
                <span className="legend-item amazon">🛒 Amazon</span>
                <span className="legend-item youtube">🎬 YouTube</span>
                <span className="legend-item trends">📈 Trends</span>
                <span className="legend-item seo">🔍 SEO</span>
                <span className="legend-item positive">✅ Positive</span>
                <span className="legend-item negative">⚠️ Concern</span>
            </div>

            {/* Word Cloud */}
            <div className="word-cloud-container">
                {wordData.map((word, i) => (
                    <span
                        key={word.word}
                        className="word-tag"
                        style={getWordStyle(word)}
                        title={`"${word.word}" - ${word.count} mentions from ${word.source}${word.sentiment ? ` (${word.sentiment})` : ''}`}
                    >
                        {word.word}
                        <span className="word-count">{word.count}</span>
                    </span>
                ))}
            </div>

            <style jsx>{`
                .word-cloud-section {
                    background: var(--card-bg);
                    border-radius: var(--radius-xl);
                    padding: var(--space-6);
                    margin-bottom: var(--space-6);
                }
                .section-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-2);
                }
                .section-header-row h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .word-cloud-subtitle {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-bottom: var(--space-4);
                }
                .word-cloud-legend {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: var(--space-5);
                    padding: 0.75rem;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-md);
                }
                .legend-item {
                    font-size: 0.7rem;
                    font-weight: 500;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }
                .legend-item.instagram { background: rgba(236, 72, 153, 0.1); color: rgb(219, 39, 119); }
                .legend-item.amazon { background: rgba(251, 146, 60, 0.1); color: rgb(234, 88, 12); }
                .legend-item.youtube { background: rgba(255, 0, 0, 0.1); color: rgb(220, 38, 38); }
                .legend-item.trends { background: rgba(59, 130, 246, 0.1); color: rgb(37, 99, 235); }
                .legend-item.seo { background: rgba(34, 197, 94, 0.1); color: rgb(22, 163, 74); }
                .legend-item.positive { background: rgba(16, 185, 129, 0.1); color: rgb(5, 150, 105); }
                .legend-item.negative { background: rgba(239, 68, 68, 0.1); color: rgb(220, 38, 38); }
                
                .word-cloud-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-4);
                    min-height: 200px;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02), rgba(236, 72, 153, 0.02));
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-subtle);
                }
                .word-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 9999px;
                    transition: all 0.2s ease;
                    cursor: default;
                    white-space: nowrap;
                }
                .word-tag:hover {
                    transform: scale(1.1);
                    z-index: 10;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .word-count {
                    font-size: 0.65em;
                    opacity: 0.7;
                    margin-left: 0.25rem;
                    background: rgba(255,255,255,0.3);
                    padding: 0.1rem 0.3rem;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}
