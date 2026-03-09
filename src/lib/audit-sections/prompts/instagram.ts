/**
 * Instagram Audit Section Prompt
 * 
 * Deep dive into Instagram performance.
 * Input: Full Instagram scraped data
 * Output: Health check, content analysis, top/bottom posts, sentiment, recommendations
 */

import { BrandInfo, InstagramAuditOutput } from '../types';
import { InstagramMetrics, ScrapedData } from '../../apify-scrapers';

export const INSTAGRAM_SECTION_ID = 'instagram';
export const INSTAGRAM_SECTION_NAME = 'Instagram Audit';
export const INSTAGRAM_SECTION_ORDER = 2;

export interface InstagramInput {
    brand: BrandInfo;
    profile: {
        username: string;
        followers: number;
        following: number;
        posts_count: number;
        bio: string;
        is_verified: boolean;
    };
    engagement: {
        rate: number;
        avg_likes: number;
        avg_comments: number;
        avg_views: number;
    };
    content_breakdown: {
        reels_percentage: number;
        carousel_percentage: number;
        image_percentage: number;
        video_percentage: number;
    };
    posting_frequency: {
        posts_per_week: number;
        most_active_day: string;
    };
    top_posts: {
        type: string;
        likes: number;
        comments: number;
        caption_preview: string;
    }[];
    sentiment: {
        positive_count: number;
        neutral_count: number;
        negative_count: number;
        positive_samples: string[];
        negative_samples: string[];
    };
}

export const INSTAGRAM_PROMPT = `You are a Global Social Media Director for a luxury marketing agency. You are auditing {profile.username}.

TASK: Provide a high-precision analysis of the brand's Instagram performance.

INPUT DATA:
{INPUT_DATA}

STRATEGIC DIRECTIVES:
1. CONTENT MIX: Analyze if the brand is over-using one format (e.g., too many static images in a Video-first world).
2. SENTIMENT GAP: Contrast the bio's promise with what customers are actually saying in the comments.
3. BENCHMARKING: {engagement.rate}% engagement must be evaluated against our agency standards: <1% (Critical), 1.5% (Baseline), >3% (Health), >5% (Exceptional).
4. TONE: Sharp, expert, and diagnostic.

OUTPUT FORMAT (JSON only):
{
    "health_check": {
        "followers": number,
        "engagement_rate": number,
        "avg_likes": number,
        "avg_comments": number,
        "posting_frequency": "X posts per week",
        "verdict": "High-impact summary bullet"
    },
    "content_analysis": {
        "reels_percentage": number,
        "carousel_percentage": number,
        "static_percentage": number,
        "pillar_analysis": "Diagnostic of whether they are too salesy or missing UGC.",
        "content_buckets": [
            {"category": "Product/Lifestyle/UGC/Sale", "percentage": 0}
        ]
    },
    "top_performing_posts": [
        {
            "description": "Post description",
            "engagement": number,
            "why_it_worked": "Strategic reason (Hooks, Trending Audio, Visual Depth, etc.)"
        }
    ],
    "worst_performing_posts": [
        {
            "description": "Post description",
            "why_it_failed": "Diagnostic reason (Poor hook, bad timing, low visual contrast, etc.)"
        }
    ],
    "sentiment_analysis": {
        "positive_percentage": number,
        "negative_percentage": number,
        "neutral_percentage": number,
        "core_emotional_triggers": ["What specifically users love"],
        "recurring_friction_points": ["Specific complaints found in data"]
    },
    "recommendations": [
        {
            "priority": "high/medium/low",
            "action": "Metric-backed action (e.g. 'Shift to 4 reels/week to capture 2x reach')",
            "strategic_impact": "How this moves the needle"
        }
    ]
}`;

export const INSTAGRAM_OUTPUT_SCHEMA = `InstagramAuditOutput with health_check, content_analysis, top/worst posts, sentiment, recommendations`;

export function extractInstagramInput(
    instagramData: InstagramMetrics,
    brandInfo: BrandInfo
): InstagramInput {
    const profile = instagramData.profile;
    const topPosts = instagramData.topPerformingPosts || [];

    return {
        brand: brandInfo,
        profile: {
            username: profile.username || '',
            followers: profile.followersCount || 0,
            following: profile.followsCount || 0,
            posts_count: profile.postsCount || 0,
            bio: profile.biography || '',
            is_verified: profile.isVerified || false,
        },
        engagement: {
            rate: instagramData.engagement?.engagementRate || 0,
            avg_likes: instagramData.engagement?.avgLikes || 0,
            avg_comments: instagramData.engagement?.avgComments || 0,
            avg_views: instagramData.engagement?.avgViews || 0,
        },
        content_breakdown: {
            reels_percentage: instagramData.contentBreakdown?.reels || 0,
            carousel_percentage: instagramData.contentBreakdown?.carousels || 0,
            image_percentage: instagramData.contentBreakdown?.images || 0,
            video_percentage: instagramData.contentBreakdown?.videos || 0,
        },
        posting_frequency: {
            posts_per_week: instagramData.postingFrequency?.postsPerWeek || 0,
            most_active_day: instagramData.postingFrequency?.mostActiveDay || 'Unknown',
        },
        top_posts: topPosts.slice(0, 5).map(p => ({
            type: p.type,
            likes: p.likesCount || 0,
            comments: p.commentsCount || 0,
            caption_preview: (p.caption || '').slice(0, 100),
        })),
        sentiment: {
            positive_count: instagramData.sentiment?.positiveCount || 0,
            neutral_count: instagramData.sentiment?.neutralCount || 0,
            negative_count: instagramData.sentiment?.negativeCount || 0,
            positive_samples: (instagramData.sentiment?.positive || []).slice(0, 5),
            negative_samples: (instagramData.sentiment?.negative || []).slice(0, 5),
        },
    };
}

export function shouldRunInstagram(scrapedData: ScrapedData): boolean {
    return !!scrapedData.instagram && (scrapedData.instagram.profile?.followersCount || 0) > 0;
}

export function validateInstagramOutput(output: unknown): output is InstagramAuditOutput {
    if (!output || typeof output !== 'object') return false;
    const o = output as Record<string, unknown>;
    return (
        typeof o.health_check === 'object' &&
        typeof o.content_analysis === 'object' &&
        Array.isArray(o.recommendations)
    );
}
