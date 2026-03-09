/**
 * Audit Sections - Type Definitions
 * 
 * This module defines the structure for modular, section-wise audit analysis.
 * Each section is independently processed by LLM for better accuracy.
 */

import { ScrapedData } from '../apify-scrapers';

// ============================================
// SECTION DEFINITION
// ============================================

export interface AuditSection<TInput, TOutput> {
    /** Unique identifier for the section */
    id: string;

    /** Human-readable name */
    name: string;

    /** Section description */
    description: string;

    /** Order in the final report (lower = earlier) */
    order: number;

    /** Whether this section is required or optional */
    required: boolean;

    /** Function to check if section should run based on available data */
    shouldRun: (scrapedData: ScrapedData) => boolean;

    /** Function to extract relevant input data for this section */
    extractInput: (scrapedData: ScrapedData, brandInfo: BrandInfo) => TInput | null;

    /** The prompt template for this section */
    prompt: string;

    /** Expected output schema description (for LLM guidance) */
    outputSchema: string;
}

// ============================================
// BRAND INFO (Common input for all sections)
// ============================================

export interface BrandInfo {
    name: string;
    industry: string;
    website?: string;
    country?: string;
}

// ============================================
// SECTION OUTPUTS - Each section has its own typed output
// ============================================

// Executive Summary Section
export interface ExecutiveSummaryOutput {
    brand_overview: string;
    overall_score: string; // A+, A, B+, B, C, D, F
    score_breakdown: {
        social_presence: number; // 0-100
        content_quality: number;
        engagement: number;
        brand_perception: number;
    };
    top_3_wins: string[];
    top_3_failures: string[];
    one_line_verdict: string;
    key_metrics_snapshot: {
        metric: string;
        value: string;
        status: 'good' | 'average' | 'poor';
    }[];
}

// Instagram Audit Section
export interface InstagramAuditOutput {
    health_check: {
        followers: number;
        follower_growth_rate: string;
        engagement_rate: number;
        avg_likes: number;
        avg_comments: number;
        posting_frequency: string;
    };
    content_analysis: {
        reels_percentage: number;
        carousel_percentage: number;
        static_percentage: number;
        content_buckets: {
            category: string;
            percentage: number;
        }[];
    };
    top_performing_posts: {
        description: string;
        engagement: number;
        why_it_worked: string;
    }[];
    worst_performing_posts: {
        description: string;
        engagement: number;
        why_it_failed: string;
    }[];
    sentiment_analysis: {
        positive_percentage: number;
        negative_percentage: number;
        neutral_percentage: number;
        key_positive_themes: string[];
        key_concerns: string[];
    };
    recommendations: {
        priority: 'high' | 'medium' | 'low';
        action: string;
        expected_impact: string;
    }[];
}

// Amazon Audit Section
export interface AmazonAuditOutput {
    overview: {
        total_products: number;
        avg_rating: number;
        total_reviews: number;
        price_range: string;
        prime_percentage: number;
    };
    product_analysis: {
        top_rated_products: {
            title: string;
            rating: number;
            reviews: number;
        }[];
        low_rated_products: {
            title: string;
            rating: number;
            main_complaints: string[];
        }[];
    };
    review_sentiment: {
        positive_themes: string[];
        negative_themes: string[];
        common_complaints: string[];
    };
    competitive_pricing: {
        position: 'premium' | 'mid-range' | 'budget';
        analysis: string;
    };
    recommendations: {
        priority: 'high' | 'medium' | 'low';
        action: string;
        expected_impact: string;
    }[];
}

// Competitor Analysis Section
export interface CompetitorAnalysisOutput {
    competitor_matrix: {
        brand: string;
        followers: number;
        engagement_rate: number;
        posting_frequency: string;
        content_strength: string;
        weakness: string;
    }[];
    market_position: {
        leader: string;
        our_position: string;
        gap_analysis: string;
    };
    content_comparison: {
        our_brand: {
            strength: string;
            weakness: string;
        };
        vs_competitors: {
            competitor: string;
            they_do_better: string;
            we_do_better: string;
        }[];
    };
    white_space_opportunities: string[];
    recommendations: {
        priority: 'high' | 'medium' | 'low';
        action: string;
        expected_impact: string;
    }[];
}

// YouTube Audit Section
export interface YouTubeAuditOutput {
    channel_health: {
        overall_score: number;
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

// SWOT Analysis Section
export interface SwotAnalysisOutput {
    strengths: {
        point: string;
        evidence: string;
    }[];
    weaknesses: {
        point: string;
        evidence: string;
    }[];
    opportunities: {
        point: string;
        rationale: string;
    }[];
    threats: {
        point: string;
        rationale: string;
    }[];
}

// Recommendations & Roadmap Section
export interface RecommendationsOutput {
    priority_actions: {
        rank: number;
        action: string;
        category: 'content' | 'engagement' | 'growth' | 'branding' | 'product';
        impact: 'high' | 'medium' | 'low';
        effort: 'high' | 'medium' | 'low';
        timeline: string;
        expected_result: string;
    }[];
    content_pillars: {
        pillar: string;
        description: string;
        content_ideas: string[];
    }[];
    ninety_day_roadmap: {
        month: number;
        focus: string;
        key_actions: string[];
        success_metrics: string[];
    }[];
    quick_wins: string[];
}

// ============================================
// COMBINED AUDIT REPORT
// ============================================

export interface SectionResult<T> {
    sectionId: string;
    sectionName: string;
    success: boolean;
    data: T | null;
    error?: string;
    processingTime: number;
}

export interface AuditReport {
    brandInfo: BrandInfo;
    generatedAt: string;
    sections: {
        executive?: SectionResult<ExecutiveSummaryOutput>;
        instagram?: SectionResult<InstagramAuditOutput>;
        amazon?: SectionResult<AmazonAuditOutput>;
        youtube?: SectionResult<YouTubeAuditOutput>;
        competitors?: SectionResult<CompetitorAnalysisOutput>;
        swot?: SectionResult<SwotAnalysisOutput>;
        recommendations?: SectionResult<RecommendationsOutput>;
    };
    scrapedData: ScrapedData;
    metadata: {
        totalProcessingTime: number;
        sectionsRun: number;
        sectionsSucceeded: number;
        sectionsFailed: number;
    };
}

// ============================================
// SECTION REGISTRY - For extensibility
// ============================================

export type SectionId =
    | 'executive'
    | 'instagram'
    | 'amazon'
    | 'youtube'
    | 'competitors'
    | 'swot'
    | 'recommendations';

// This allows adding new sections easily
export interface SectionRegistry {
    [key: string]: AuditSection<unknown, unknown>;
}
