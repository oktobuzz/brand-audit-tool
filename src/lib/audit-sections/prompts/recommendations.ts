/**
 * Recommendations & Roadmap Section Prompt
 * 
 * This section synthesizes all findings into actionable recommendations.
 * Input: Summary of all section outputs
 * Output: Priority actions, content pillars, 90-day roadmap
 */

import { BrandInfo, RecommendationsOutput } from '../types';

export const RECOMMENDATIONS_SECTION_ID = 'recommendations';
export const RECOMMENDATIONS_SECTION_NAME = 'Recommendations & Roadmap';
export const RECOMMENDATIONS_SECTION_ORDER = 6;

export interface RecommendationsInput {
    brand: BrandInfo;
    key_findings: {
        instagram?: {
            main_issues: string[];
            engagement_status: 'good' | 'average' | 'poor';
            content_gaps: string[];
        };
        amazon?: {
            main_issues: string[];
            rating_status: 'good' | 'average' | 'poor';
            product_gaps: string[];
        };
        website?: {
            score: number;
            status: string;
            main_issues: string[];
        };
        trends?: {
            growth: string;
            interest_score: number;
        };
        youtube?: {
            status: string;
            gaps: string[];
        };
        competitors?: {
            our_position: string;
            biggest_threats: string[];
            opportunities: string[];
        };
    };
    available_data_sources: string[];
}

export const RECOMMENDATIONS_PROMPT = `You are a Chief Performance Officer & Growth Consultant. You are drafting a high-impact roadmap for {brand.name}.

TASK: Synthesize all audit findings into a prioritized 90-day Growth Roadmap.

INPUT DATA:
{INPUT_DATA}

STRATEGIC DIRECTIVES:
1. THE FOUNDATION: If the Website SEO score is <60, prioritize Technical/SEO fixes in Month 1.
2. THE AMPLIFIER: If Instagram ER is <2%, prioritize Content Pillar restructuring in Month 1.
3. COMPETITIVE MOAT: Use the white-space opportunities identified in competitor analysis to drive the roadmap.
4. TONE: Bold, expert, and actionable. Avoid "should" - use "Must" or "Strategy:".

OUTPUT FORMAT (JSON only):
{
    "priority_actions": [
        {
            "rank": 1,
            "action": "Metric-focused action (e.g., 'Optimize H1 tags on 45 top pages')",
            "category": "technical/content/growth/ads/brand",
            "impact": "high/medium/low",
            "effort": "high/medium/low",
            "timeline": "immediate (1-7 days)",
            "expected_result": "Measurable KPI change"
        }
    ],
    "content_pillars": [
        {
            "pillar": "Pillar Name",
            "description": "Strategic rationale",
            "content_ideas": ["Actionable idea 1", "idea 2", "idea 3"]
        }
    ],
    "ninety_day_roadmap": [
        {
            "month": 1,
            "focus": "Title of Focus (e.g. 'Plugging Technical Leaks')",
            "key_actions": ["Specific Action 1", "Action 2"],
            "success_metrics": ["Metric 1", "Metric 2"]
        },
        { "month": 2, "focus": "Growth Optimization", "key_actions": [], "success_metrics": [] },
        { "month": 3, "focus": "Scaling Efficiency", "key_actions": [], "success_metrics": [] }
    ],
    "quick_wins": ["List of 3-5 tasks they can do within 48 hours to see immediate improvement"]
}`;

export const RECOMMENDATIONS_OUTPUT_SCHEMA = `RecommendationsOutput with priority_actions, content_pillars, ninety_day_roadmap, quick_wins`;

export function extractRecommendationsInput(
    sectionSummaries: {
        instagram?: { issues: string[]; status: string; gaps: string[] };
        amazon?: { issues: string[]; status: string; gaps: string[] };
        website?: { issues: string[]; status: string; score: number };
        trends?: { growth: string; interest_score: number };
        youtube?: { status: string; gaps: string[] };
        competitors?: { position: string; threats: string[]; opportunities: string[] };
    },
    brandInfo: BrandInfo,
    availableDataSources: string[]
): RecommendationsInput {
    return {
        brand: brandInfo,
        key_findings: {
            instagram: sectionSummaries.instagram ? {
                main_issues: sectionSummaries.instagram.issues,
                engagement_status: sectionSummaries.instagram.status as any,
                content_gaps: sectionSummaries.instagram.gaps,
            } : undefined,
            amazon: sectionSummaries.amazon ? {
                main_issues: sectionSummaries.amazon.issues,
                rating_status: sectionSummaries.amazon.status as any,
                product_gaps: sectionSummaries.amazon.gaps,
            } : undefined,
            website: sectionSummaries.website ? {
                score: sectionSummaries.website.score,
                status: sectionSummaries.website.status,
                main_issues: sectionSummaries.website.issues,
            } : undefined,
            trends: sectionSummaries.trends ? {
                growth: sectionSummaries.trends.growth,
                interest_score: sectionSummaries.trends.interest_score,
            } : undefined,
            youtube: sectionSummaries.youtube ? {
                status: sectionSummaries.youtube.status,
                gaps: sectionSummaries.youtube.gaps,
            } : undefined,
            competitors: sectionSummaries.competitors ? {
                our_position: sectionSummaries.competitors.position,
                biggest_threats: sectionSummaries.competitors.threats,
                opportunities: sectionSummaries.competitors.opportunities,
            } : undefined,
        },
        available_data_sources: availableDataSources,
    };
}

export function validateRecommendationsOutput(output: unknown): output is RecommendationsOutput {
    if (!output || typeof output !== 'object') return false;
    const o = output as Record<string, unknown>;
    return Array.isArray(o.priority_actions) && Array.isArray(o.content_pillars) && Array.isArray(o.ninety_day_roadmap);
}
