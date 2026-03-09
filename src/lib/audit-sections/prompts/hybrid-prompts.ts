/**
 * HYBRID PROMPTS - Narrative + Structured Data
 * 
 * Design Philosophy:
 * 1. Metrics come from scraped data (accurate numbers)
 * 2. LLM provides rich narrative analysis (insights, recommendations)
 * 3. Simple structure to avoid JSON parsing errors
 * 4. Professional, agency-quality language
 */

import { BrandInfo } from '../types';
import { InstagramMetrics, AmazonMetrics, ScrapedData } from '../../apify-scrapers';
import { YouTubeChannelData } from '../../youtube-scraper';

// ===========================================
// HYBRID OUTPUT TYPES
// ===========================================

export interface HybridExecutiveOutput {
    overall_grade: string;  // A+, A, B+, B, C, D, F
    executive_narrative: string;  // 2-3 paragraph overview
    key_wins: string[];  // Top 3-5 wins
    key_challenges: string[];  // Top 3-5 challenges
    one_liner: string;  // Sharp verdict
}

export interface HybridInstagramOutput {
    analysis_narrative: string;  // 3-4 paragraphs of deep analysis
    content_strategy_verdict: string;  // Assessment of their content approach
    top_posts_analysis: string;  // Why top posts worked
    improvement_areas: string;  // What needs work
    recommendations: string[];  // Actionable recommendations
}

export interface HybridAmazonOutput {
    marketplace_narrative: string;  // Overall marketplace presence analysis
    product_performance: string;  // How products are performing
    customer_voice: string;  // What customers are saying
    competitive_position: string;  // Position vs competitors
    recommendations: string[];  // Actionable recommendations
}

export interface HybridYouTubeOutput {
    channel_narrative: string;  // Overall channel analysis
    content_strategy: string;  // Analysis of content approach
    audience_sentiment: string;  // What audience thinks
    growth_opportunities: string;  // Where to grow
    recommendations: string[];  // Actionable recommendations
}

export interface HybridCompetitorOutput {
    competitive_landscape: string;  // Overview of the market
    positioning_analysis: string;  // Where brand stands
    competitor_insights: string;  // Key learnings from competitors
    white_space: string;  // Opportunities they're missing
    recommendations: string[];  // Actionable recommendations
}

export interface HybridRecommendationsOutput {
    strategic_summary: string;  // High-level strategy overview
    priority_actions: {
        priority: 'critical' | 'high' | 'medium';
        action: string;
        why: string;
        expected_outcome: string;
    }[];
    content_pillars: {
        pillar_name: string;
        description: string;
        content_ideas: string[];
    }[];
    thirty_day_focus: string;  // What to do in first 30 days
    ninety_day_vision: string;  // 90-day goal
}

// ============================================
// EXECUTIVE SUMMARY PROMPT
// ============================================

export const HYBRID_EXECUTIVE_PROMPT = `You are a Senior Brand Strategist at a top-tier consulting firm (McKinsey, BCG, Bain level).
You've been asked to provide an executive briefing on {brand_name} in the {industry} industry.

YOUR ROLE: Deliver a sharp, insight-packed executive summary that a CMO would find valuable.
Write like a seasoned consultant - confident, data-driven, and actionable.

AVAILABLE DATA:
{INPUT_DATA}

INSTRUCTIONS:
1. Analyze ALL provided data holistically
2. Identify patterns, strengths, and gaps
3. Write in a professional but engaging tone
4. Be specific - reference actual metrics when making points
5. Focus on strategic implications, not just observations

RESPOND IN THIS EXACT JSON FORMAT:
{
    "overall_grade": "B+",
    "executive_narrative": "A 2-3 paragraph executive overview. Start with the big picture. What's the brand's current digital standing? What are the strategic implications? Write this like a McKinsey partner would present to a board. Be insightful, not generic.",
    "key_wins": [
        "Specific win with supporting metric (e.g., 'Strong engagement at 3.2% vs industry benchmark of 1.8%')",
        "Another specific win",
        "Third win"
    ],
    "key_challenges": [
        "Specific challenge with impact (e.g., 'Content mix heavily skewed to static images (60%) in a Reels-first algorithm')",
        "Another challenge",
        "Third challenge"
    ],
    "one_liner": "A sharp, memorable 1-sentence verdict that captures the brand's situation"
}

GRADING SCALE:
- A+ (95): Exceptional across all channels, industry leader
- A (90): Strong performance, minor improvements needed
- B+ (80): Good performance, clear growth opportunities
- B (70): Average, needs strategic focus
- C (60): Below average, significant gaps
- D (50): Poor, requires turnaround strategy
- F (40): Critical, major issues across the board

WRITE WITH CONVICTION. Avoid hedging language like "might" or "could potentially".`;

// ============================================
// INSTAGRAM ANALYSIS PROMPT
// ============================================

export const HYBRID_INSTAGRAM_PROMPT = `You are the Head of Social Strategy at a leading digital agency.
You're auditing {brand_name}'s Instagram presence.

YOUR MISSION: Provide a comprehensive, narrative analysis that goes beyond surface metrics.
Think like a strategist who has managed Fortune 500 social accounts.

INSTAGRAM DATA:
{INPUT_DATA}

INSTRUCTIONS:
1. Tell the story of this brand's Instagram presence
2. Explain WHY certain content performs (not just WHAT)
3. Identify strategic gaps and opportunities
4. Make recommendations that are specific and actionable
5. Reference the actual data points to support your analysis

RESPOND IN THIS EXACT JSON FORMAT:
{
    "analysis_narrative": "A 3-4 paragraph deep-dive analysis. Start with the overall health of the account. Discuss engagement patterns, content strategy effectiveness, and audience response. This should read like a professional audit report, rich with insights. Don't just list facts - explain what they mean strategically.",
    
    "content_strategy_verdict": "A 1-2 paragraph assessment of their current content approach. Are they using the right formats? Is the content mix aligned with algorithm preferences? Are they building brand or just chasing engagement?",
    
    "top_posts_analysis": "Explain what's working and WHY. Look at the top performing posts and identify patterns - what hooks, formats, topics, or emotions drive their best content?",
    
    "improvement_areas": "Be specific about what needs work. Don't be vague - point to specific gaps like 'Lack of UGC content' or 'Inconsistent posting schedule' and explain the impact.",
    
    "recommendations": [
        "First actionable recommendation with specificity (e.g., 'Increase Reels output from 2 to 5 per week, focusing on trending audios and quick-tip formats')",
        "Second recommendation",
        "Third recommendation",
        "Fourth recommendation (if applicable)"
    ]
}

BENCHMARKS TO REFERENCE:
- Engagement Rate: <1% = Critical, 1-2% = Average, 2-4% = Good, >4% = Excellent
- Content Mix: Industry best practice is 50% Reels, 30% Carousels, 20% Static
- Posting Frequency: 5-7 posts/week for active brands`;

// ============================================
// AMAZON ANALYSIS PROMPT
// ============================================

export const HYBRID_AMAZON_PROMPT = `You are an E-commerce Strategy Director with deep Amazon marketplace expertise.
You're analyzing {brand_name}'s Amazon presence.

YOUR MISSION: Provide marketplace intelligence that would guide product and retail strategy.

AMAZON DATA:
{INPUT_DATA}

RESPOND IN THIS EXACT JSON FORMAT:
{
    "marketplace_narrative": "A 2-3 paragraph analysis of the brand's overall Amazon presence. Cover product breadth, ratings landscape, competitive positioning, and marketplace strategy. Think like an Amazon retail analyst.",
    
    "product_performance": "Analyze product performance patterns. Which products are winning and why? Any concerning trends in low-rated products?",
    
    "customer_voice": "Synthesize the voice of the customer from reviews. What do customers love? What frustrates them? Any recurring themes that indicate product or service issues?",
    
    "competitive_position": "How is the brand positioned in the marketplace? Premium, mid-range, or value? How does pricing and ratings compare to likely competitors?",
    
    "recommendations": [
        "📦 Product-focused recommendation",
        "⭐ Ratings/reviews improvement recommendation",
        "💰 Pricing or positioning recommendation",
        "📝 Listing optimization recommendation"
    ]
}`;

// ============================================
// YOUTUBE ANALYSIS PROMPT
// ============================================

export const HYBRID_YOUTUBE_PROMPT = `You are a YouTube Growth Strategist who has scaled channels from 0 to 1M+ subscribers.
You're auditing {brand_name}'s YouTube channel.

YOUR MISSION: Provide a growth-focused analysis with specific content recommendations.

YOUTUBE DATA:
{INPUT_DATA}

RESPOND IN THIS EXACT JSON FORMAT:
{
    "channel_narrative": "A 2-3 paragraph analysis of the channel's overall health. Cover subscriber quality, view velocity, content cadence, and growth trajectory. Be specific about what the numbers mean.",
    
    "content_strategy": "Analyze their content approach. Shorts vs long-form balance, topic selection, upload frequency, thumbnail/title patterns. What's working in the algorithm?",
    
    "audience_sentiment": "What's the audience saying? Analyze comment patterns for sentiment, requests, complaints, and praise. This reveals what the audience actually wants.",
    
    "growth_opportunities": "Where are the untapped growth opportunities? New content formats, underserved topics, collaboration opportunities, or algorithm optimization.",
    
    "recommendations": [
        "🎬 Content format recommendation",
        "📈 Growth-focused recommendation",
        "🎯 Audience engagement recommendation",
        "⏰ Consistency/cadence recommendation"
    ]
}`;

// ============================================
// COMPETITOR ANALYSIS PROMPT
// ============================================

export const HYBRID_COMPETITOR_PROMPT = `You are a Competitive Intelligence Analyst at a leading brand strategy firm.
You're comparing {brand_name} against their competitors.

YOUR MISSION: Provide strategic intelligence that reveals opportunities and threats.

COMPETITIVE DATA:
{INPUT_DATA}

RESPOND IN THIS EXACT JSON FORMAT:
{
    "competitive_landscape": "A 2-paragraph overview of the competitive landscape. Who are the key players? How is the market segmented? Where does {brand_name} fit in the hierarchy?",
    
    "positioning_analysis": "Where does {brand_name} stand relative to competitors? Are they a leader, challenger, or laggard? What's their unique positioning or lack thereof?",
    
    "competitor_insights": "What can be learned from competitors? What content strategies are they using that work? What are their weaknesses that can be exploited?",
    
    "white_space": "Identify white space opportunities - content territories, audience segments, or strategies that competitors aren't owning but {brand_name} could.",
    
    "recommendations": [
        "🎯 Competitive positioning recommendation",
        "📱 Content differentiation recommendation", 
        "🏆 Market capture opportunity",
        "⚔️ Competitive defense recommendation"
    ]
}`;

// ============================================
// RECOMMENDATIONS & ROADMAP PROMPT
// ============================================

export const HYBRID_RECOMMENDATIONS_PROMPT = `You are a Chief Strategy Officer synthesizing all audit findings into an actionable roadmap.
    You're creating the strategic recommendations for {brand_name}.

YOUR MISSION: Create a prioritized, actionable roadmap that a marketing team can execute.

INSIGHTS FROM PREVIOUS SECTIONS:
{INPUT_DATA}

RESPOND IN THIS EXACT JSON FORMAT:
{
    "strategic_summary": "A 2-3 paragraph synthesis of all findings. What's the overall strategic picture? What are the 2-3 most important things this brand needs to focus on right now?",

        "priority_actions": [
            {
                "priority": "critical",
                "action": "The most important action with specific details",
                "why": "Why this matters strategically",
                "expected_outcome": "What success looks like"
            },
            {
                "priority": "high",
                "action": "Second priority action",
                "why": "Strategic rationale",
                "expected_outcome": "Expected result"
            },
            {
                "priority": "high",
                "action": "Third priority action",
                "why": "Strategic rationale",
                "expected_outcome": "Expected result"
            },
            {
                "priority": "medium",
                "action": "Fourth priority action",
                "why": "Strategic rationale",
                "expected_outcome": "Expected result"
            }
        ],

            "content_pillars": [
                {
                    "pillar_name": "Name of content pillar (e.g., 'Educational Content')",
                    "description": "What this pillar is about and why it matters",
                    "content_ideas": ["Specific content idea 1", "Content idea 2", "Content idea 3"]
                },
                {
                    "pillar_name": "Second pillar",
                    "description": "Description",
                    "content_ideas": ["Idea 1", "Idea 2", "Idea 3"]
                },
                {
                    "pillar_name": "Third pillar",
                    "description": "Description",
                    "content_ideas": ["Idea 1", "Idea 2", "Idea 3"]
                }
            ],

                "thirty_day_focus": "What should the brand focus on in the first 30 days? Be specific about quick wins and foundation-building.",

                    "ninety_day_vision": "What does success look like in 90 days? Set clear goals and milestones."
}

PRIORITIZATION FRAMEWORK:
- Critical: Must do immediately, significant impact on brand health
    - High: Should do within 30 days, important for growth
        - Medium: Do within 60 days, enhances performance`;

// ============================================
// INPUT EXTRACTORS (What we send to LLM)
// ============================================

export function extractHybridExecutiveInput(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo
): Record<string, unknown> {
    const summary: Record<string, unknown> = {
        brand: brandInfo,
        data_available: {
            instagram: !!scrapedData.instagram,
            amazon: !!scrapedData.amazon,
            youtube: !!scrapedData.youtube,
            website_audit: !!scrapedData.websiteAudit,
            competitors: !!scrapedData.competitors && Object.keys(scrapedData.competitors).length > 0,
        }
    };

    if (scrapedData.instagram) {
        summary.instagram_summary = {
            followers: scrapedData.instagram.profile.followersCount,
            engagement_rate: scrapedData.instagram.engagement.engagementRate,
            avg_likes: scrapedData.instagram.engagement.avgLikes,
            avg_comments: scrapedData.instagram.engagement.avgComments,
            posts_analyzed: scrapedData.instagram.profile.posts?.length || 0,
            content_mix: scrapedData.instagram.contentBreakdown,
            posting_frequency: scrapedData.instagram.postingFrequency.postsPerWeek,
            sentiment: {
                positive: scrapedData.instagram.sentiment.positiveCount,
                negative: scrapedData.instagram.sentiment.negativeCount,
                neutral: scrapedData.instagram.sentiment.neutralCount,
            }
        };
    }

    if (scrapedData.amazon) {
        summary.amazon_summary = {
            total_products: scrapedData.amazon.products?.length || 0,
            avg_rating: scrapedData.amazon.reviewAnalysis.avgRating,
            total_reviews: scrapedData.amazon.reviewAnalysis.totalReviews,
            best_sellers: scrapedData.amazon.salesAnalysis?.bestSellersCount || 0,
            monthly_sales: scrapedData.amazon.salesAnalysis?.totalMonthlySales || 0,
        };
    }

    if (scrapedData.youtube) {
        summary.youtube_summary = {
            subscribers: scrapedData.youtube.subscriberCount,
            total_views: scrapedData.youtube.viewCount,
            videos_count: scrapedData.youtube.videoCount,
            avg_views: scrapedData.youtube.avgViews,
            engagement_rate: scrapedData.youtube.engagementRate,
            uploads_per_week: scrapedData.youtube.uploadsPerWeek,
        };
    }

    if (scrapedData.websiteAudit) {
        summary.website_summary = {
            overall_score: scrapedData.websiteAudit.overallScore,
            seo_score: scrapedData.websiteAudit.seoScore,
            issues_count: scrapedData.websiteAudit.issues.length,
        };
    }

    return summary;
}

export function extractHybridInstagramInput(
    instagram: InstagramMetrics,
    brandInfo: BrandInfo
): Record<string, unknown> {
    const profile = instagram.profile;
    const topPosts = instagram.topPerformingPosts || [];

    return {
        brand_name: brandInfo.name,
        industry: brandInfo.industry,
        profile: {
            username: profile.username,
            followers: profile.followersCount?.toLocaleString() || '0',
            following: profile.followsCount,
            total_posts: profile.postsCount,
            bio: profile.biography,
            is_verified: profile.isVerified,
        },
        engagement_metrics: {
            engagement_rate: `${instagram.engagement.engagementRate}% `,
            avg_likes: instagram.engagement.avgLikes?.toLocaleString() || '0',
            avg_comments: instagram.engagement.avgComments,
            avg_views: instagram.engagement.avgViews?.toLocaleString() || '0',
            total_interactions: instagram.engagement.totalInteractions?.toLocaleString() || '0',
        },
        content_breakdown: {
            reels: instagram.contentBreakdown.reels,
            carousels: instagram.contentBreakdown.carousels,
            images: instagram.contentBreakdown.images,
            videos: instagram.contentBreakdown.videos,
            total_posts_analyzed: (instagram.contentBreakdown.reels + instagram.contentBreakdown.carousels + instagram.contentBreakdown.images + instagram.contentBreakdown.videos),
        },
        posting_frequency: {
            posts_per_week: instagram.postingFrequency.postsPerWeek,
            most_active_day: instagram.postingFrequency.mostActiveDay,
        },
        top_posts: topPosts.slice(0, 5).map((p, i) => ({
            rank: i + 1,
            type: p.type,
            likes: p.likesCount?.toLocaleString() || '0',
            comments: p.commentsCount,
            caption_preview: (p.caption || '').slice(0, 150),
        })),
        sentiment_from_comments: {
            positive_comments: instagram.sentiment.positiveCount,
            negative_comments: instagram.sentiment.negativeCount,
            neutral_comments: instagram.sentiment.neutralCount,
            positive_samples: instagram.sentiment.positive?.slice(0, 5) || [],
            negative_samples: instagram.sentiment.negative?.slice(0, 5) || [],
        }
    };
}

export function extractHybridAmazonInput(
    amazon: AmazonMetrics,
    brandInfo: BrandInfo
): Record<string, unknown> {
    const products = amazon.products || [];
    const topProducts = products
        .filter(p => p.rating > 0)
        .sort((a, b) => b.salesVolume - a.salesVolume)
        .slice(0, 5);

    return {
        brand_name: brandInfo.name,
        industry: brandInfo.industry,
        overview: {
            total_products_found: products.length,
            avg_rating: amazon.reviewAnalysis.avgRating,
            total_reviews: amazon.reviewAnalysis.totalReviews?.toLocaleString() || '0',
            best_sellers_count: amazon.salesAnalysis?.bestSellersCount || 0,
            amazon_choice_count: amazon.salesAnalysis?.amazonChoiceCount || 0,
            estimated_monthly_sales: amazon.salesAnalysis?.totalMonthlySales?.toLocaleString() || '0',
            average_price: amazon.salesAnalysis?.averagePrice || 'N/A',
        },
        top_performing_products: topProducts.map((p, i) => ({
            rank: i + 1,
            title: p.title.slice(0, 100),
            rating: p.rating,
            reviews: p.reviewsCount?.toLocaleString() || '0',
            estimated_sales: p.salesVolume?.toLocaleString() || '0',
            is_best_seller: p.isBestSeller,
            is_amazon_choice: p.isAmazonChoice,
        })),
        review_themes: {
            pros: amazon.reviewAnalysis.pros || [],
            cons: amazon.reviewAnalysis.cons || [],
            common_keywords: amazon.reviewAnalysis.commonKeywords || [],
        }
    };
}

export function extractHybridYouTubeInput(
    youtube: YouTubeChannelData,
    brandInfo: BrandInfo
): Record<string, unknown> {
    return {
        brand_name: brandInfo.name,
        industry: brandInfo.industry,
        channel: {
            name: youtube.channelName,
            subscribers: youtube.subscriberCount?.toLocaleString() || '0',
            total_views: youtube.viewCount?.toLocaleString() || '0',
            total_videos: youtube.videoCount,
        },
        performance_metrics: {
            avg_views_per_video: youtube.avgViews?.toLocaleString() || '0',
            avg_likes_per_video: youtube.avgLikes?.toLocaleString() || '0',
            avg_comments_per_video: youtube.avgComments,
            engagement_rate: `${youtube.engagementRate}% `,
            shorts_percentage: `${youtube.shortsPercentage}% `,
            uploads_per_week: youtube.uploadsPerWeek,
        },
        top_videos: (youtube.topVideos || []).slice(0, 5).map((v, i) => ({
            rank: i + 1,
            title: v.title.slice(0, 80),
            views: v.viewCount?.toLocaleString() || '0',
            likes: v.likeCount?.toLocaleString() || '0',
            is_short: v.isShort,
        })),
        recent_comments_sample: (youtube.recentComments || []).slice(0, 10).map(c => c.text),
    };
}

export function extractHybridCompetitorInput(
    ourInstagram: InstagramMetrics,
    competitors: { [handle: string]: InstagramMetrics },
    brandInfo: BrandInfo
): Record<string, unknown> {
    const competitorData = Object.entries(competitors).map(([handle, data]) => ({
        handle: `@${handle} `,
        followers: data.profile.followersCount?.toLocaleString() || '0',
        engagement_rate: `${data.engagement.engagementRate}% `,
        avg_likes: data.engagement.avgLikes?.toLocaleString() || '0',
        posts_per_week: data.postingFrequency.postsPerWeek,
        reels_percentage: data.contentBreakdown.reels,
        carousels_percentage: data.contentBreakdown.carousels,
    }));

    return {
        brand_name: brandInfo.name,
        industry: brandInfo.industry,
        our_brand: {
            handle: ourInstagram.profile.username,
            followers: ourInstagram.profile.followersCount?.toLocaleString() || '0',
            engagement_rate: `${ourInstagram.engagement.engagementRate}% `,
            avg_likes: ourInstagram.engagement.avgLikes?.toLocaleString() || '0',
            posts_per_week: ourInstagram.postingFrequency.postsPerWeek,
            reels_percentage: ourInstagram.contentBreakdown.reels,
            carousels_percentage: ourInstagram.contentBreakdown.carousels,
        },
        competitors: competitorData,
    };
}

// ============================================
// VALIDATORS (Lenient - accept partial data)
// ============================================

export function validateHybridOutput(output: unknown, requiredFields: string[]): boolean {
    if (!output || typeof output !== 'object') return false;
    const o = output as Record<string, unknown>;

    // At minimum, check if the output has ANY of the required fields
    const hasAtLeastOne = requiredFields.some(field => o[field] !== undefined);
    return hasAtLeastOne;
}

export function safeGet<T>(obj: unknown, path: string, defaultValue: T): T {
    try {
        const keys = path.split('.');
        let current: unknown = obj;
        for (const key of keys) {
            if (current === null || current === undefined) return defaultValue;
            current = (current as Record<string, unknown>)[key];
        }
        return (current as T) ?? defaultValue;
    } catch {
        return defaultValue;
    }
}
