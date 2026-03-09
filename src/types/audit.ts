// ===========================================
// Brand Input
// ===========================================
export interface BrandInput {
    brand: string;
    website: string;
    instagram: string;
    country: string;
    industry: string;
    amazonUrl?: string;
    youtubeUrl?: string;
    seoKeywords?: string;
    competitors?: string;
    enableInstagram?: boolean;
    enableAmazon?: boolean;
    enableYouTube?: boolean;
    enableWebsiteAudit?: boolean;
    instagramPostsLimit?: number; // Number of posts to analyze (30, 80, 150)
}

// ===========================================
// Summary Section
// ===========================================
export interface AuditSummary {
    brand_overview: string;
    executive_summary_bullets: string[];
    overall_health_score: number;
    priority_action: string;
}

// ===========================================
// Social Media Audit
// ===========================================
export interface EngagementMetrics {
    followers: number;
    avg_likes_per_post: number;
    avg_comments_per_post: number;
    engagement_rate_percentage: number;
    total_posts_analyzed: number;
}

export interface EngagementAnalysis {
    metrics: EngagementMetrics;
    engagement_volatility: 'stable' | 'high_variance' | 'declining' | 'growing';
    benchmark_vs_competitors: {
        summary: string;
        ranking: string;
    };
    insights: string[];
}

export interface ContentBreakdown {
    reels_percentage: number;
    carousels_percentage: number;
    static_images_percentage: number;
    videos_percentage: number;
}

export interface CreativeFormatAnalysis {
    content_breakdown: ContentBreakdown;
    content_pillars_identified: string[];
    format_performance: {
        best_performing: string;
        worst_performing: string;
        video_retention_quality: 'high' | 'medium' | 'low';
    };
    creative_observations: string[];
    gaps: string[];
}

export interface SentimentAnalysis {
    overall_sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
    sentiment_distribution: {
        positive_percentage: number;
        neutral_percentage: number;
        negative_percentage: number;
    };
    positive_themes: string[];
    negative_themes: string[];
    sample_positive_comments: string[];
    sample_negative_comments: string[];
    sentiment_insights: string[];
}

// Content Category Matrix
export interface ContentCategory {
    name: string;
    current_percentage: number;
    benchmark_percentage: number;
    status: 'overusing' | 'balanced' | 'underusing' | 'missing';
    example_from_data?: string;
}

export interface ContentCategoryMatrix {
    categories: ContentCategory[];
    key_insight: string;
}

// Word Cloud Data
export interface WordCloudItem {
    word: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
}

export interface WordCloudData {
    comment_keywords: WordCloudItem[];
    pain_points: string[];
    praise_points: string[];
    trending_topics: string[];
}

export interface SocialMediaAudit {
    engagement_analysis: EngagementAnalysis;
    creative_format_analysis: CreativeFormatAnalysis;
    content_category_matrix?: ContentCategoryMatrix;
    word_cloud_data?: WordCloudData;
    sentiment_analysis: SentimentAnalysis;
    social_media_score: number;
    social_media_recommendations: string[];
}

// ===========================================
// Marketplace Audit
// ===========================================
export interface ListingScores {
    visual_quality: number;
    information_quality: number;
    a_plus_content: number;
    brand_consistency: number;
    overall_listing_score: number;
}

export interface ListingQuality {
    scores: ListingScores;
    strengths: string[];
    weaknesses: string[];
    competitor_comparison: string;
}

export interface ReviewMetrics {
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
        '5_star': number;
        '4_star': number;
        '3_star': number;
        '2_star': number;
        '1_star': number;
    };
}

export interface ReviewAnalysis {
    metrics: ReviewMetrics;
    pros_from_reviews: string[];
    cons_from_reviews: string[];
    common_keywords: string[];
    review_insights: string[];
}

export interface MarketplaceAudit {
    listing_quality: ListingQuality;
    review_analysis: ReviewAnalysis;
    marketplace_score: number;
    marketplace_recommendations: string[];
}

// ===========================================
// Competitor Benchmark
// ===========================================
export interface ComparisonRow {
    metric: string;
    brand_value: string;
    competitor1_value: string;
    competitor2_value: string;
    leader: string;
}

export interface CompetitorBenchmark {
    competitors_analyzed: string[];
    comparison_table: ComparisonRow[];
    competitive_strengths: string[];
    competitive_weaknesses: string[];
    benchmark_insights: string[];
}

// ===========================================
// SWOT
// ===========================================
export interface SwotItem {
    point: string;
    evidence?: string;
    rationale?: string;
    source?: string;
}

export interface SwotAnalysis {
    strengths: SwotItem[];
    weaknesses: SwotItem[];
    opportunities: SwotItem[];
    threats: SwotItem[];
}

// ===========================================
// Action Items
// ===========================================
export interface ActionItem {
    priority: number;
    title: string;
    description: string;
    expected_impact: 'high' | 'medium' | 'low';
    timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
    category: 'social_media' | 'marketplace' | 'ads' | 'product' | 'brand';
}

// ===========================================
// Chart Data
// ===========================================

export interface ChartDataset {
    labels: string[];
    data: number[];
}

export interface ChartData {
    engagement_comparison: ChartDataset;
    content_breakdown: ChartDataset;
    sentiment_distribution: ChartDataset;
    rating_distribution: ChartDataset;
}

// ===========================================
// Scraped Data Types (from external APIs)
// ===========================================
export interface YouTubeScrapedData {
    channelName: string;
    subscriberCount: number;
    viewCount: number;
    videoCount: number;
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    shortsPercentage: number;
    uploadsPerWeek: number;
    topVideos: {
        title: string;
        viewCount: number;
        likeCount: number;
        commentCount: number;
        publishedAt: string;
        isShort: boolean;
    }[];
    recentVideos: {
        title: string;
        viewCount: number;
        likeCount: number;
        commentCount: number;
        publishedAt: string;
        isShort: boolean;
    }[];
    recentComments: {
        text: string;
        author: string;
        likeCount: number;
    }[];
}






export interface WebsiteAuditPageResult {
    url: string;
    title: string;
    isLoaded: boolean;
    metaDescription: string;
    isMetaDescriptionEnoughLong: boolean;
    isTitleEnoughLong: boolean;
    isH1: boolean;
    h1: string;
    isH1OnlyOne: boolean;
    linksCount: number;
    notOptimizedImagesCount: number;
    wordsCount: number;
    robotsFileExists: boolean;
    faviconExists: boolean;
    brokenLinksCount: number;
}

export interface WebsiteAuditScrapedData {
    mainUrl: string;
    pagesAudited: number;

    // Scores (0-100)
    overallScore: number;
    seoScore: number;
    contentScore: number;
    technicalScore: number;

    // Aggregate stats
    totalLinks: number;
    totalBrokenLinks: number;
    totalWords: number;
    totalNotOptimizedImages: number;
    avgWordsPerPage: number;

    // Page breakdown
    pagesWithH1: number;
    pagesWithSingleH1: number;
    pagesWithMetaDescription: number;
    pagesWithOptimalTitle: number;
    pagesWithRobotsTxt: number;
    pagesWithFavicon: number;
    pagesWithAnalytics: number;

    // Individual pages
    pages: WebsiteAuditPageResult[];

    // Issues
    issues: {
        type: 'error' | 'warning' | 'info';
        category: string;
        page: string;
        message: string;
    }[];

    scrapedAt: string;
}


export interface ScrapedDataForDashboard {
    instagram?: {
        profile: {
            username: string;
            fullName: string;
            followersCount: number;
            followsCount: number;
            postsCount: number;
            isVerified: boolean;
        };
        engagement: {
            avgLikes: number;
            avgComments: number;
            avgViews: number;
            engagementRate: number;
            totalInteractions: number;
        };
        contentBreakdown: {
            reels: number;
            carousels: number;
            images: number;
            videos: number;
        };
        sentiment: {
            positive: string[];
            negative: string[];
            neutral: string[];
            positiveCount: number;
            neutralCount: number;
            negativeCount: number;
        };
        postingFrequency: {
            postsPerWeek: number;
            mostActiveDay: string;
        };
    } | null;
    youtube?: YouTubeScrapedData | null;
    websiteAudit?: WebsiteAuditScrapedData | null;
    seo?: {
        brandKeywordRankings: { position: number; title: string; url: string; description: string; domain: string }[];
        competitorRankings: { position: number; title: string; url: string; description: string; domain: string }[];
        missingKeywords: string[];
        topRankingPages: { keyword: string; position: number; url: string }[];
        relatedSearches?: { query: string; link: string }[];
    } | null;
    // Reddit removed
    amazon?: import('../lib/apify-scrapers').AmazonMetrics | null;
}


// ===========================================
// Complete Audit Report
// ===========================================
export interface AuditReport {
    // Brand info
    brandInput: BrandInput;

    // Main sections
    summary: AuditSummary;
    social_media_audit: SocialMediaAudit;
    marketplace_audit: MarketplaceAudit;
    competitor_benchmark: CompetitorBenchmark;
    swot: SwotAnalysis;
    action_items: ActionItem[];
    chart_data: ChartData;

    // Scraped Data for Dashboard
    scrapedData?: ScrapedDataForDashboard;

    // Metadata
    generatedAt: string;
}

