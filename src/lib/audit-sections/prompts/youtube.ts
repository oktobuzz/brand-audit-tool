/**
 * YouTube Audit Section Prompt
 * Analyzes YouTube channel data and comments
 */

import type { YouTubeChannelData } from '../../youtube-scraper';
import type { BrandInfo } from '../types';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface YouTubeAuditOutput {
    channel_health: {
        overall_score: number; // 0-100
        subscriber_growth_potential: 'high' | 'medium' | 'low';
        content_consistency: 'excellent' | 'good' | 'poor';
        engagement_quality: 'excellent' | 'good' | 'average' | 'poor';
    };
    content_analysis: {
        top_performing_format: 'shorts' | 'long_form' | 'mixed';
        recommended_content_mix: {
            shorts_percentage: number;
            long_form_percentage: number;
        };
        optimal_upload_frequency: string;
        best_performing_topics: string[];
        underperforming_areas: string[];
    };
    audience_sentiment: {
        overall_mood: 'positive' | 'mixed' | 'negative';
        key_praises: string[];
        key_complaints: string[];
        trending_requests: string[];
        engagement_drivers: string[];
    };
    competitor_opportunity: {
        content_gaps: string[];
        unique_strengths: string[];
        improvement_areas: string[];
    };
    recommendations: {
        priority: 'high' | 'medium' | 'low';
        action: string;
        expected_impact: string;
    }[];
}

// ============================================
// PROMPT
// ============================================

export const YOUTUBE_PROMPT = `You are a Senior YouTube Growth Architect & Video Strategist. You are auditing the Presence of {brand_name} in the {industry} niche.

TASK: Provide a master-level diagnostic of the channel's growth trajectory and retention quality.

INPUT DATA:
{INPUT_DATA}

STRATEGIC DIRECTIVES:
1. SEARCH vs VIRAL: Analyze if the channel is relying too much on "Searchable" content (low growth) or "Viral" content (high churn).
2. SHORTS STRATEGY: With a {performance_metrics.shorts_percentage}% Shorts ratio, evaluate if they are cannibalizing their long-form audience or effectively funneling them.
3. COMMUNITY PULSE: Based on the sample comments, identify the "Unmet Needs" of the audience.
4. TONE: Expert, data-driven, and slightly critical to drive improvement.

OUTPUT FORMAT (JSON only):
{
    "channel_health": {
        "overall_score": 0-100,
        "subscriber_growth_potential": "high/medium/low",
        "content_consistency": "excellent/good/poor",
        "engagement_quality": "excellent/good/average/poor"
    },
    "content_analysis": {
        "top_performing_format": "shorts/long_form/mixed",
        "recommended_content_mix": {
            "shorts_percentage": number,
            "long_form_percentage": number
        },
        "optimal_upload_frequency": "X videos per week",
        "best_performing_topics": ["Specific topic clusters that win"],
        "underperforming_areas": ["What to stop doing immediately"]
    },
    "audience_sentiment": {
        "overall_mood": "positive/mixed/negative",
        "key_praises": ["Specific product/content loves"],
        "key_complaints": ["Specific friction points"],
        "trending_requests": ["What they should make next"],
        "engagement_drivers": ["What triggers the most comments"]
    },
    "competitor_opportunity": {
        "content_gaps": ["1-3 gaps no competitor is filling"],
        "unique_strengths": ["Our unique moat"],
        "improvement_areas": ["The most critical fix"]
    },
    "recommendations": [
        {
            "priority": "high/medium/low",
            "action": "Metric-backed action (e.g., 'A/B test thumbnail contrast to boost CTR')",
            "expected_impact": "Growth result description"
        }
    ]
}`;

// ============================================
// INPUT EXTRACTION
// ============================================

export function extractYouTubeInput(youtubeData: YouTubeChannelData, brandInfo: BrandInfo) {
    return {
        brand_name: brandInfo.name,
        industry: brandInfo.industry,
        channel: {
            name: youtubeData.channelName,
            subscribers: youtubeData.subscriberCount,
            total_views: youtubeData.viewCount,
            video_count: youtubeData.videoCount,
        },
        performance_metrics: {
            avg_views: youtubeData.avgViews,
            avg_likes: youtubeData.avgLikes,
            avg_comments: youtubeData.avgComments,
            engagement_rate: youtubeData.engagementRate,
            shorts_percentage: youtubeData.shortsPercentage,
            uploads_per_week: youtubeData.uploadsPerWeek,
        },
        top_videos: youtubeData.topVideos.slice(0, 5).map(v => ({
            title: v.title,
            views: v.viewCount,
            likes: v.likeCount,
            comments: v.commentCount,
            is_short: v.isShort,
        })),
        recent_videos: youtubeData.recentVideos.slice(0, 10).map(v => ({
            title: v.title,
            views: v.viewCount,
            likes: v.likeCount,
            is_short: v.isShort,
        })),
        sample_comments: youtubeData.recentComments.slice(0, 20).map(c => ({
            text: c.text,
            likes: c.likeCount,
        })),
    };
}

// ============================================
// CONDITION CHECK
// ============================================

export function shouldRunYouTube(scrapedData: { youtube?: YouTubeChannelData | null }): boolean {
    return !!scrapedData.youtube && scrapedData.youtube.videoCount > 0;
}

// ============================================
// OUTPUT VALIDATION
// ============================================

export function validateYouTubeOutput(output: unknown): output is YouTubeAuditOutput {
    if (!output || typeof output !== 'object') return false;
    const obj = output as Record<string, unknown>;
    return (
        'channel_health' in obj &&
        'content_analysis' in obj &&
        'audience_sentiment' in obj &&
        'recommendations' in obj
    );
}
