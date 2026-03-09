/**
 * Executive Summary Section Prompt
 * 
 * This section provides the high-level overview and scoring.
 * Input: Summary metrics from all available data
 * Output: Overall scores, wins/failures, verdict
 */

import { BrandInfo, ExecutiveSummaryOutput } from '../types';
import { ScrapedData } from '../../apify-scrapers';

export const EXECUTIVE_SECTION_ID = 'executive';
export const EXECUTIVE_SECTION_NAME = 'Executive Summary';
export const EXECUTIVE_SECTION_ORDER = 1;

export interface ExecutiveInput {
    brand: BrandInfo;
    instagram_summary?: {
        followers: number;
        engagement_rate: number;
        avg_likes: number;
        avg_comments: number;
        posts_analyzed: number;
    };
    amazon_summary?: {
        total_products: number;
        avg_rating: number;
        total_reviews: number;
    };
    website_summary?: {
        overall_score: number;
        seo_score: number;
        technical_score: number;
        performance_ms: number;
        major_issues: string[];
    };
    trends_summary?: {
        average_interest: number;
        growth_status: string;
    };
    competitor_count?: number;
}

export const EXECUTIVE_PROMPT = `You are a Lead Partner at a Global Brand Intelligence Firm. You are delivering the high-level verdict of a deep-dive brand audit.

CONTEXT:
You are analyzing {brand.name} in the {brand.industry} space. Your audience is the CEO/Founder who wants the "unfiltered truth" backed by specific numbers.

INPUT DATA:
{INPUT_DATA}

ANALYSIS GUIDELINES:
1. TONE: Professional, authoritative, and direct. Avoid corporate fluff.
2. SCORING LOGIC: 
   - A: Market Leader. High engagement (>2%), strong SEO (>80), and consistent growth.
   - B: Healthy but stagnant. Good basics but lacks unique content or technical polish.
   - C/D: In trouble. Technical errors, declining search interest, or poor engagement.
3. ANTI-HALLUCINATION: 
   - If a section (Amazon, IG, Website) is missing from the input, do NOT mention it in the summary.
   - Focus ONLY on the evidence provided.

OUTPUT FORMAT (JSON only):
{
    "brand_overview": "A high-impact 2-3 sentence strategic summary.",
    "overall_score": "A+/A/B+/B/C+/C/D/F based on data weighted by industry standards.",
    "score_breakdown": {
        "social_presence": 0-100,
        "content_quality": 0-100,
        "engagement": 0-100,
        "brand_perception": 0-100
    },
    "top_3_wins": ["Metric-backed win (e.g. '0.45% ER is 2x industry average')", "...", "..."],
    "top_3_failures": ["Metric-backed failure (e.g. '30% of pages lack meta titles')", "...", "..."],
    "one_line_verdict": "A powerful, punchy summary of the brand's current trajectory.",
    "key_metrics_snapshot": [
        {"metric": "Metric Name", "value": "Number + Unit", "status": "good/average/poor"}
    ]
}`;

export const EXECUTIVE_OUTPUT_SCHEMA = `ExecutiveSummaryOutput with brand_overview, overall_score, score_breakdown, top_3_wins, top_3_failures, one_line_verdict, key_metrics_snapshot`;

export function extractExecutiveInput(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo
): ExecutiveInput {
    const input: ExecutiveInput = {
        brand: brandInfo,
    };

    if (scrapedData.instagram) {
        const ig = scrapedData.instagram;
        input.instagram_summary = {
            followers: ig.profile?.followersCount || 0,
            engagement_rate: ig.engagement?.engagementRate || 0,
            avg_likes: ig.engagement?.avgLikes || 0,
            avg_comments: ig.engagement?.avgComments || 0,
            posts_analyzed: ig.profile?.postsCount || 0,
        };
    }

    if (scrapedData.amazon) {
        const az = scrapedData.amazon;
        input.amazon_summary = {
            total_products: az.products?.length || 0,
            avg_rating: az.reviewAnalysis?.avgRating || 0,
            total_reviews: az.reviewAnalysis?.totalReviews || 0,
        };
    }

    if (scrapedData.websiteAudit) {
        const web = scrapedData.websiteAudit;
        input.website_summary = {
            overall_score: web.overallScore,
            seo_score: web.seoScore,
            technical_score: web.technicalScore,
            performance_ms: Math.round(web.pages.reduce((a, b) => a + (b.responseTime || 0), 0) / (web.pages.length || 1)),
            major_issues: web.issues.slice(0, 3).map(i => i.message)
        };
    }

    if (scrapedData.competitors) {
        input.competitor_count = Object.keys(scrapedData.competitors).length;
    }

    return input;
}

export function validateExecutiveOutput(output: unknown): output is ExecutiveSummaryOutput {
    if (!output || typeof output !== 'object') return false;
    const o = output as Record<string, unknown>;
    return (
        typeof o.brand_overview === 'string' &&
        typeof o.overall_score === 'string' &&
        Array.isArray(o.top_3_wins) &&
        Array.isArray(o.top_3_failures)
    );
}
