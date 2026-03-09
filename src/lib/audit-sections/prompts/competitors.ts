/**
 * Competitor Analysis Section Prompt
 * 
 * Compare brand against competitors.
 * Input: Competitor Instagram data
 * Output: Comparison matrix, market position, white space opportunities
 */

import { BrandInfo, CompetitorAnalysisOutput } from '../types';
import { InstagramMetrics, ScrapedData } from '../../apify-scrapers';

export const COMPETITORS_SECTION_ID = 'competitors';
export const COMPETITORS_SECTION_NAME = 'Competitor Analysis';
export const COMPETITORS_SECTION_ORDER = 4;

export interface CompetitorsInput {
    brand: BrandInfo;
    our_brand: {
        handle: string;
        followers: number;
        engagement_rate: number;
        avg_likes: number;
        posting_frequency: number;
        content_mix: {
            reels: number;
            carousels: number;
            images: number;
        };
    };
    competitors: {
        handle: string;
        followers: number;
        engagement_rate: number;
        avg_likes: number;
        posting_frequency: number;
        content_mix: {
            reels: number;
            carousels: number;
            images: number;
        };
        bio: string;
    }[];
}

export const COMPETITORS_PROMPT = `You are a Strategic M&A & Competitive Intelligence Analyst. You are evaluating {brand.name} against its top market rivals.

TASK: Conduct a Share-of-Voice (SOV) and Efficiency analysis of the competitive landscape.

INPUT DATA:
{INPUT_DATA}

ANALYSIS DIRECTIVES:
1. EFFICIENCY RATIO: Calculate which brand has the best Engagement-to-Follower ratio. A brand with 10k followers and 5% ER is "healthier" than a brand with 1M followers and 0.1% ER.
2. CONTENT MOATS: Identify what the "Market Leader" is doing that {brand.name} is missing (e.g., specific format dominance).
3. WHITE SPACE: Find the "Under-served Audience" — if all competitors are doing polished high-budget content, is there a gap for raw, authentic UGC?
4. TONE: Clinical, objective, and competitive.

OUTPUT FORMAT (JSON only):
{
    "competitor_matrix": [
        {
            "brand": "@handle",
            "followers": number,
            "engagement_rate": number,
            "posting_frequency": "X posts/week",
            "content_strength": "Strategic advantage",
            "weakness": "Exploitable gap"
        }
    ],
    "market_position": {
        "leader": "@handle",
        "our_position": "Placement numerical (1st/2nd/etc)",
        "gap_analysis": "Distance to leader diagnostic"
    },
    "content_comparison": {
        "our_brand": { "strength": "What we own", "weakness": "Where we leak" },
        "vs_competitors": [
            { "competitor": "@handle", "they_do_better": "Format dominance", "we_do_better": "Format dominance" }
        ]
    },
    "white_space_opportunities": ["3-5 concrete market gaps identified in the comparison"],
    "recommendations": [
        {
            "priority": "high/medium/low",
            "action": "Offensive move to take market share",
            "expected_outcome": "Competitive result"
        }
    ]
}`;

export const COMPETITORS_OUTPUT_SCHEMA = `CompetitorAnalysisOutput with competitor_matrix, market_position, content_comparison, white_space_opportunities, recommendations`;

export function extractCompetitorsInput(
    ourInstagram: InstagramMetrics,
    competitorData: { [handle: string]: InstagramMetrics },
    brandInfo: BrandInfo,
    ourHandle: string
): CompetitorsInput {
    return {
        brand: brandInfo,
        our_brand: {
            handle: ourHandle,
            followers: ourInstagram.profile?.followersCount || 0,
            engagement_rate: ourInstagram.engagement?.engagementRate || 0,
            avg_likes: ourInstagram.engagement?.avgLikes || 0,
            posting_frequency: ourInstagram.postingFrequency?.postsPerWeek || 0,
            content_mix: {
                reels: ourInstagram.contentBreakdown?.reels || 0,
                carousels: ourInstagram.contentBreakdown?.carousels || 0,
                images: ourInstagram.contentBreakdown?.images || 0,
            },
        },
        competitors: Object.entries(competitorData).map(([handle, data]) => ({
            handle,
            followers: data.profile?.followersCount || 0,
            engagement_rate: data.engagement?.engagementRate || 0,
            avg_likes: data.engagement?.avgLikes || 0,
            posting_frequency: data.postingFrequency?.postsPerWeek || 0,
            content_mix: {
                reels: data.contentBreakdown?.reels || 0,
                carousels: data.contentBreakdown?.carousels || 0,
                images: data.contentBreakdown?.images || 0,
            },
            bio: data.profile?.biography || '',
        })),
    };
}

export function shouldRunCompetitors(scrapedData: ScrapedData): boolean {
    return !!scrapedData.competitors && Object.keys(scrapedData.competitors).length > 0;
}

export function validateCompetitorsOutput(output: unknown): output is CompetitorAnalysisOutput {
    if (!output || typeof output !== 'object') return false;
    const o = output as Record<string, unknown>;
    return (
        Array.isArray(o.competitor_matrix) &&
        typeof o.market_position === 'object' &&
        Array.isArray(o.white_space_opportunities)
    );
}
