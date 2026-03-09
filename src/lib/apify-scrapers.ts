/**
 * Apify Scraper Services
 * Handles all data collection from Instagram, Google Search, Amazon, and websites
 */

import { ApifyClient } from 'apify-client';

// Initialize Apify client
const getApifyClient = () => {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
        throw new Error('APIFY_API_TOKEN not configured. Get free token at https://console.apify.com');
    }
    return new ApifyClient({ token });
};

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface InstagramPost {
    id: string;
    type: 'Image' | 'Video' | 'Sidecar' | 'Reel';
    caption: string;
    likesCount: number;
    commentsCount: number;
    videoViewCount?: number;
    timestamp: string;
    url: string;
    hashtags: string[];
    comments: InstagramComment[];
}

export interface InstagramComment {
    text: string;
    ownerUsername: string;
    timestamp: string;
}

export interface InstagramProfileData {
    username: string;
    fullName: string;
    biography: string;
    followersCount: number;
    followsCount: number;
    postsCount: number;
    isVerified: boolean;
    profilePicUrl: string;
    externalUrl: string;
    posts: InstagramPost[];
}

export interface InstagramMetrics {
    profile: InstagramProfileData;
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
        neutral: string[];
        negative: string[];
        positiveCount: number;
        neutralCount: number;
        negativeCount: number;
    };
    topPerformingPosts: InstagramPost[];
    postingFrequency: {
        postsPerWeek: number;
        mostActiveDay: string;
    };
}

export interface AmazonReview {
    title: string;
    text: string;
    rating: number;
    date: string;
    isVerified: boolean;
}

export interface AmazonProductData {
    title: string;
    price: string;
    rating: number;
    reviewsCount: number;
    images: string[];
    description: string;
    features: string[];
    reviews: AmazonReview[];
    asin?: string;
    brand?: string;
    // New metrics from ScrapingDog
    salesVolume: number;
    isBestSeller: boolean;
    isAmazonChoice: boolean;
    url?: string;
}

export interface AmazonMetrics {
    product: AmazonProductData;
    products?: AmazonProductData[]; // All products from search
    reviewAnalysis: {
        avgRating: number;
        totalReviews: number;
        totalProducts?: number;
        ratingDistribution: { [key: number]: number };
        pros: string[];
        cons: string[];
        commonKeywords: string[];
        topProducts?: AmazonProductData[];
        lowestProducts?: AmazonProductData[];
    };
    salesAnalysis?: {
        totalMonthlySales: number;
        bestSellersCount: number;
        amazonChoiceCount: number;
        averagePrice: string;
    };
}

export interface GoogleSearchResult {
    position: number;
    title: string;
    url: string;
    description: string;
    domain: string;
    source?: string; // e.g., "Amazon.in", "Smytten", "1mg"
}

export interface SEOMetrics {
    brandKeywordRankings: GoogleSearchResult[];
    competitorRankings: GoogleSearchResult[];
    missingKeywords: string[];
    topRankingPages: { keyword: string; position: number; url: string }[];
    relatedSearches?: { query: string; link: string }[]; // Related searches from Google
}

export interface ScrapedData {
    instagram: InstagramMetrics | null;
    amazon: AmazonMetrics | null;
    seo: SEOMetrics | null;
    competitors: { [handle: string]: InstagramMetrics } | null;
    youtube: import('./youtube-scraper').YouTubeChannelData | null;
    websiteAudit: import('./website-audit').WebsiteAuditData | null;
    // Reddit removed
    scrapedAt: string;
    errors: string[];
}

// ============================================
// INSTAGRAM SCRAPER
// ============================================

export async function scrapeInstagram(
    username: string,
    postsLimit: number = 80 // Default to ~3 months of posts
): Promise<InstagramMetrics> {
    const client = getApifyClient();

    let profileUrl: string;
    let cleanUsername: string;

    // Check if input is already a full URL
    if (username.includes('instagram.com')) {
        // Use the URL as-is (Apify handles it well)
        profileUrl = username.startsWith('http') ? username : `https://${username}`;
        // Extract username for display purposes
        const match = username.match(/instagram\.com\/([^/?]+)/i);
        cleanUsername = match ? match[1] : username;
    } else {
        // It's just a username - build the URL
        cleanUsername = username.replace('@', '').trim();
        profileUrl = `https://www.instagram.com/${cleanUsername}/`;
    }

    console.log(`\n📸 Scraping Instagram: @${cleanUsername}...`);
    console.log(`   URL: ${profileUrl}`);
    console.log(`   Using: apify/instagram-api-scraper`);

    try {
        // STEP 1: Get profile details first
        console.log(`   Step 1: Fetching profile details...`);
        const profileRun = await client.actor('apify/instagram-api-scraper').call({
            directUrls: [profileUrl],
            resultsType: 'details',
            resultsLimit: 1,
            searchType: 'user',
            addParentData: false,
        });

        const profileResult = await client.dataset(profileRun.defaultDatasetId).listItems();
        console.log(`   ✓ Profile data received: ${profileResult.items?.length || 0} items`);

        if (!profileResult.items || profileResult.items.length === 0) {
            throw new Error(`No profile found for @${cleanUsername}. Check if the account exists and is public.`);
        }

        const profileData = profileResult.items[0] as Record<string, unknown>;
        console.log(`   ✓ Username: ${profileData.username}`);
        console.log(`   ✓ Followers: ${profileData.followersCount || profileData.followers || 'N/A'}`);

        // STEP 2: Get posts
        // Calculate date filter based on posts limit
        // 30 posts ≈ 1 month, 80 posts ≈ 3 months, 150 posts ≈ 6 months
        const monthsBack = postsLimit <= 30 ? 1 : postsLimit <= 80 ? 3 : 6;
        const dateFilterDate = new Date();
        dateFilterDate.setMonth(dateFilterDate.getMonth() - monthsBack);
        const dateFilter = dateFilterDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        console.log(`   Step 2: Fetching posts (limit: ${postsLimit}, since: ${dateFilter}, ~${monthsBack} months)...`);
        const postsRun = await client.actor('apify/instagram-api-scraper').call({
            directUrls: [profileUrl],
            resultsType: 'posts',
            resultsLimit: postsLimit,
            searchType: 'user',
            addParentData: true,
            onlyPostsNewerThan: dateFilter,  // Only fetch posts from specified time range
        });

        const postsResult = await client.dataset(postsRun.defaultDatasetId).listItems();
        console.log(`   ✓ Posts received: ${postsResult.items?.length || 0} items`);

        // Merge profile and posts data
        const allItems = [profileData, ...(postsResult.items || [])];

        return processInstagramData(allItems, cleanUsername, profileData);

    } catch (error) {
        console.error(`   ❌ Instagram scrape error:`, error);
        throw error;
    }
}

// Process Instagram data from either scraper
function processInstagramData(
    items: Record<string, unknown>[],
    cleanUsername: string,
    profileData?: Record<string, unknown>
): InstagramMetrics {
    // Log the raw data for debugging
    console.log(`   Processing ${items.length} items...`);
    if (items[0]) {
        console.log(`   Sample item keys:`, Object.keys(items[0]).slice(0, 15).join(', '));
    }

    // Check if Apify returned an error response
    const firstItem = items[0] as Record<string, unknown>;
    if (firstItem && (firstItem.error || firstItem.errorDescription)) {
        console.error(`   ❌ Apify returned error: ${firstItem.error || firstItem.errorDescription}`);
        throw new Error(`Instagram API error: ${firstItem.errorDescription || firstItem.error || 'Unknown error'}`);
    }

    // Use provided profileData or find it from items
    const profileItem = profileData || items.find((item: Record<string, unknown>) =>
        item.username === cleanUsername ||
        item.ownerUsername === cleanUsername ||
        !item.type // Profile items don't have 'type'
    ) || items[0];

    const profile: InstagramProfileData = {
        username: (profileItem.username as string) || (profileItem.ownerUsername as string) || cleanUsername,
        fullName: (profileItem.fullName as string) || (profileItem.full_name as string) || '',
        biography: (profileItem.biography as string) || (profileItem.bio as string) || '',
        followersCount: (profileItem.followersCount as number) || (profileItem.followers as number) || 0,
        followsCount: (profileItem.followsCount as number) || (profileItem.following as number) || 0,
        postsCount: (profileItem.postsCount as number) || (profileItem.posts as number) || 0,
        isVerified: (profileItem.verified as boolean) || (profileItem.isVerified as boolean) || false,
        profilePicUrl: (profileItem.profilePicUrl as string) || (profileItem.profilePicUrlHD as string) || '',
        externalUrl: (profileItem.externalUrl as string) || '',
        posts: [],
    };

    console.log(`   ✓ Profile: @${profile.username}`);
    console.log(`   ✓ Followers: ${profile.followersCount.toLocaleString()}`);
    console.log(`   ✓ Posts count: ${profile.postsCount}`);

    // Extract posts - they might be in items (from posts scrape) or nested in profileItem
    let posts: InstagramPost[] = [];

    // First try to get posts from items (excluding the profile item)
    const postItems = items.filter((item: Record<string, unknown>) =>
        item.type || item.productType || item.shortCode || item.id
    );

    if (postItems.length > 0) {
        posts = postItems.map((item: Record<string, unknown>) => ({
            id: (item.id as string) || (item.shortCode as string) || '',
            type: mapPostType((item.type as string) || (item.productType as string) || 'Image'),
            caption: (item.caption as string) || '',
            likesCount: (item.likesCount as number) || (item.likes as number) || 0,
            commentsCount: (item.commentsCount as number) || (item.comments as number) || 0,
            videoViewCount: (item.videoViewCount as number) || (item.videoViews as number) || (item.videoPlayCount as number) || undefined,
            timestamp: (item.timestamp as string) || (item.takenAt as string) || '',
            url: (item.url as string) || '',
            hashtags: extractHashtags((item.caption as string) || ''),
            comments: ((item.latestComments as Record<string, unknown>[]) || []).slice(0, 20).map((c: Record<string, unknown>) => ({
                text: (c.text as string) || '',
                ownerUsername: (c.ownerUsername as string) || '',
                timestamp: (c.timestamp as string) || '',
            })),
        }));
    } else {
        // Try nested posts in profileItem
        const timelineMedia = profileItem.edge_owner_to_timeline_media as Record<string, unknown> | undefined;
        const nestedPosts = (profileItem.latestPosts as Record<string, unknown>[]) ||
            (timelineMedia?.edges as Record<string, unknown>[]) || [];

        if (Array.isArray(nestedPosts)) {
            posts = nestedPosts.map((item: Record<string, unknown>) => {
                const node = (item.node as Record<string, unknown>) || item;
                return {
                    id: (node.id as string) || (node.shortCode as string) || '',
                    type: mapPostType((node.type as string) || (node.productType as string) || 'Image'),
                    caption: (node.caption as string) || '',
                    likesCount: (node.likesCount as number) || (node.likes as number) || 0,
                    commentsCount: (node.commentsCount as number) || (node.comments as number) || 0,
                    videoViewCount: (node.videoViewCount as number) || undefined,
                    timestamp: (node.timestamp as string) || '',
                    url: (node.url as string) || '',
                    hashtags: extractHashtags((node.caption as string) || ''),
                    comments: [],
                };
            });
        }
    }

    console.log(`   ✓ Posts extracted: ${posts.length}`);

    profile.posts = posts;

    // Calculate metrics
    const metrics = calculateInstagramMetrics(profile);

    console.log(`\n✅ Instagram scraped successfully!`);
    console.log(`   Followers: ${profile.followersCount.toLocaleString()}`);
    console.log(`   Posts analyzed: ${posts.length}`);
    console.log(`   Engagement rate: ${metrics.engagement.engagementRate}%\n`);

    return metrics;
}

function mapPostType(type: string): 'Image' | 'Video' | 'Sidecar' | 'Reel' {
    switch (type?.toLowerCase()) {
        case 'video':
        case 'reel':
            return 'Reel';
        case 'sidecar':
        case 'carousel':
            return 'Sidecar';
        case 'image':
        default:
            return 'Image';
    }
}

function extractHashtags(caption: string): string[] {
    const matches = caption.match(/#[\w]+/g);
    return matches ? matches.map(h => h.toLowerCase()) : [];
}

function calculateInstagramMetrics(profile: InstagramProfileData): InstagramMetrics {
    const posts = profile.posts;

    // Engagement calculations
    const totalLikes = posts.reduce((sum, p) => sum + p.likesCount, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.commentsCount, 0);
    const totalViews = posts
        .filter(p => p.videoViewCount)
        .reduce((sum, p) => sum + (p.videoViewCount || 0), 0);

    const avgLikes = posts.length > 0 ? totalLikes / posts.length : 0;
    const avgComments = posts.length > 0 ? totalComments / posts.length : 0;
    const videoPosts = posts.filter(p => p.videoViewCount);
    const avgViews = videoPosts.length > 0 ? totalViews / videoPosts.length : 0;

    const engagementRate = profile.followersCount > 0
        ? ((avgLikes + avgComments) / profile.followersCount) * 100
        : 0;

    // Content breakdown
    const contentBreakdown = {
        reels: posts.filter(p => p.type === 'Reel' || p.type === 'Video').length,
        carousels: posts.filter(p => p.type === 'Sidecar').length,
        images: posts.filter(p => p.type === 'Image').length,
        videos: posts.filter(p => p.type === 'Video').length,
    };

    // Sentiment analysis (basic keyword-based)
    const allComments = posts.flatMap(p => p.comments.map(c => c.text));
    const sentiment = analyzeSentiment(allComments);

    // Top performing posts
    const topPerformingPosts = [...posts]
        .sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount))
        .slice(0, 5);

    // Posting frequency
    const postDates = posts
        .map(p => new Date(p.timestamp))
        .filter(d => !isNaN(d.getTime()));

    let postsPerWeek = 0;
    let mostActiveDay = 'Unknown';

    if (postDates.length > 1) {
        const dayMs = 24 * 60 * 60 * 1000;
        const rangeMs = postDates[0].getTime() - postDates[postDates.length - 1].getTime();
        const weeks = rangeMs / (7 * dayMs);
        postsPerWeek = weeks > 0 ? posts.length / weeks : posts.length;

        const dayCount: { [key: string]: number } = {};
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        postDates.forEach(d => {
            const day = days[d.getDay()];
            dayCount[day] = (dayCount[day] || 0) + 1;
        });
        mostActiveDay = Object.entries(dayCount)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    }

    return {
        profile,
        engagement: {
            avgLikes: Math.round(avgLikes),
            avgComments: Math.round(avgComments),
            avgViews: Math.round(avgViews),
            engagementRate: parseFloat(engagementRate.toFixed(2)),
            totalInteractions: totalLikes + totalComments,
        },
        contentBreakdown,
        sentiment,
        topPerformingPosts,
        postingFrequency: {
            postsPerWeek: parseFloat(postsPerWeek.toFixed(1)),
            mostActiveDay,
        },
    };
}

function analyzeSentiment(comments: string[]): {
    positive: string[];
    neutral: string[];
    negative: string[];
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
} {
    const positiveKeywords = ['love', 'amazing', 'great', 'awesome', 'best', 'perfect', 'beautiful', 'excellent', 'fantastic', 'wonderful', '❤️', '🔥', '😍', '👏', '💯'];
    const negativeKeywords = ['bad', 'worst', 'terrible', 'awful', 'hate', 'poor', 'disappointed', 'waste', 'scam', 'fake', 'horrible', '👎', '😡', '😤'];

    const positive: string[] = [];
    const neutral: string[] = [];
    const negative: string[] = [];

    comments.forEach(comment => {
        const lower = comment.toLowerCase();
        if (positiveKeywords.some(k => lower.includes(k))) {
            positive.push(comment);
        } else if (negativeKeywords.some(k => lower.includes(k))) {
            negative.push(comment);
        } else {
            neutral.push(comment);
        }
    });

    return {
        positive: positive.slice(0, 10),
        neutral: neutral.slice(0, 10),
        negative: negative.slice(0, 10),
        positiveCount: positive.length,
        neutralCount: neutral.length,
        negativeCount: negative.length,
    };
}

// ============================================
// AMAZON SCRAPER (Supports Search URLs for ALL products)
// Uses curious_coder/amazon-scraper ($0.10 per 1000 products)
// ============================================

// ============================================
// AMAZON SCRAPER (Powered by ScrapingDog)
// ============================================

export async function scrapeAmazon(amazonUrl: string, brandName?: string, country: string = 'in'): Promise<AmazonMetrics> {
    const apiKey = process.env.SCRAPINGDOG_API_KEY;
    if (!apiKey) {
        throw new Error('SCRAPINGDOG_API_KEY is missing. Please add it to .env.local');
    }

    let isUrl = false;
    let query = '';
    let asin = '';
    let isProduct = false;
    let domain = country.toLowerCase() === 'in' ? 'in' : 'com';

    try {
        if (amazonUrl.startsWith('http')) {
            const urlObj = new URL(amazonUrl);
            isUrl = true;
            const hostname = urlObj.hostname;
            const tld = hostname.split('.').pop() || 'com';
            domain = tld === 'in' ? 'in' : 'com';

            const asinMatch = amazonUrl.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
            const searchMatch = amazonUrl.match(/[?&]k=([^&]+)/);

            isProduct = !!asinMatch;
            query = searchMatch ? decodeURIComponent(searchMatch[1]) : '';
            asin = asinMatch ? asinMatch[1] : '';
        } else {
            throw new Error('Not a URL');
        }
    } catch {
        isUrl = false;
        query = amazonUrl || brandName || '';
        isProduct = false;
        domain = 'in'; // Default to India for search if not specified otherwise
        console.log(`   Input is text/brand, treating as search query: "${query}" on Amazon.${domain}`);
    }

    if (!query && !asin) {
        throw new Error('No Amazon query or ASIN found.');
    }

    console.log(`\n🛒 Scraping Amazon via ScrapingDog...`);
    console.log(`   Query/ASIN: ${asin || query}`);
    console.log(`   Market: Amazon.${domain}`);
    console.log(`   Mode: ${isProduct ? 'Product' : 'Search'}`);

    try {
        let products: AmazonProductData[] = [];

        if (isProduct && asin) {
            const productUrl = `https://api.scrapingdog.com/amazon/product?api_key=${apiKey}&domain=${domain}&asin=${asin}&premium=false`;
            const res = await fetch(productUrl);
            if (!res.ok) throw new Error(`ScrapingDog Product API failed: ${res.status}`);
            const data = await res.json();

            if (data) {
                products.push({
                    title: data.title || '',
                    price: data.price || 'N/A',
                    rating: parseFloat(data.stars || data.rating) || 0,
                    reviewsCount: parseReviewCount(data.total_reviews || data.reviews || '0'),
                    images: data.images || [data.main_image],
                    description: data.description || '',
                    features: data.feature_bullets || [],
                    reviews: [],
                    asin: asin,
                    brand: data.brand || '',
                    salesVolume: 0,
                    isBestSeller: false,
                    isAmazonChoice: false,
                    url: data.url || amazonUrl
                });
            }
        } else if (query) {
            // Updated to use the specific parameters requested for .in domain
            const searchUrl = `https://api.scrapingdog.com/amazon/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1&country=${domain}&domain=${domain}&premium=false`;

            const res = await fetch(searchUrl);
            if (!res.ok) throw new Error(`ScrapingDog Search API failed: ${res.status}`);
            const data = await res.json();
            const results = data.search_results || data.results || [];

            products = results.map((item: any) => ({
                title: item.title || '',
                price: item.price || item.price_string || 'N/A',
                rating: parseFloat(item.stars || item.rating) || 0,
                reviewsCount: parseReviewCount(item.total_reviews || item.reviews || '0'),
                images: [item.image].filter(Boolean),
                description: '',
                features: [],
                reviews: [],
                asin: item.asin || '',
                brand: '',
                salesVolume: parseSalesVolume(item.bought_past_month || item.number_of_people_bought || item.bought_in_past_month),
                isBestSeller: item.is_best_seller || false,
                isAmazonChoice: item.is_amazon_choice || false,
                url: item.url || (item.asin ? `https://www.amazon.${domain}/dp/${item.asin}` : '')
            }));

            // Smart relevance filter
            if (query.length > 2) {
                const searchTerms = query.toLowerCase().split(/\s+/);
                const relevantProducts = products.filter(p => {
                    const titleLower = p.title.toLowerCase();
                    return searchTerms.some(term => term.length > 2 && titleLower.includes(term));
                });
                if (relevantProducts.length > 0) products = relevantProducts;
            }
        }

        if (products.length === 0) throw new Error('No products found on Amazon.');

        const totalProducts = products.length;
        const validProducts = products.filter(p => p.rating > 0);
        const avgRating = validProducts.length > 0
            ? validProducts.reduce((sum, p) => sum + p.rating, 0) / validProducts.length
            : 0;
        const totalReviews = products.reduce((sum, p) => sum + p.reviewsCount, 0);

        const totalMonthlySales = products.reduce((sum, p) => sum + p.salesVolume, 0);
        const bestSellers = products.filter(p => p.isBestSeller).length;
        const amazonChoices = products.filter(p => p.isAmazonChoice).length;

        const sortedByRating = [...validProducts].sort((a, b) => b.rating - a.rating);
        const sortedBySales = [...products].sort((a, b) => b.salesVolume - a.salesVolume); // Sort by actual sales
        const topRated = sortedByRating.slice(0, 3);
        const topBySales = sortedBySales.slice(0, 5); // Top 5 by sales volume
        const lowestRated = sortedByRating.slice(-3).reverse();

        console.log(`   ✓ Stats: ${totalMonthlySales}+ est. sales, ${bestSellers} Best Sellers`);

        return {
            product: products[0],
            products: products,
            reviewAnalysis: {
                avgRating: parseFloat(avgRating.toFixed(1)),
                totalReviews,
                totalProducts,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                pros: topRated.map(p => `${p.title.slice(0, 40)} (${p.rating}★)`),
                cons: lowestRated.filter(p => p.rating < 4).map(p => `${p.title.slice(0, 40)} (${p.rating}★)`),
                commonKeywords: [],
                topProducts: topBySales, // Now sorted by SALES, not rating
                lowestProducts: lowestRated,
            },
            salesAnalysis: {
                totalMonthlySales,
                bestSellersCount: bestSellers,
                amazonChoiceCount: amazonChoices,
                averagePrice: calculateAveragePrice(products, domain)
            }
        };

    } catch (error) {
        console.error(`   ❌ Amazon scrape error:`, error);
        throw error;
    }
}
function analyzeAmazonReviews(reviews: AmazonReview[], overallRating: number): AmazonMetrics['reviewAnalysis'] {
    // Rating distribution
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
        const rating = Math.round(r.rating);
        if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating]++;
        }
    });

    // Extract pros (from 4-5 star reviews)
    const positiveReviews = reviews.filter(r => r.rating >= 4);
    const negativeReviews = reviews.filter(r => r.rating <= 2);

    const pros = extractKeyThemes(positiveReviews.map(r => r.text), 5);
    const cons = extractKeyThemes(negativeReviews.map(r => r.text), 5);

    // Common keywords
    const allText = reviews.map(r => r.text).join(' ');
    const words = allText.toLowerCase().split(/\s+/);
    const wordCount: { [key: string]: number } = {};
    const stopWords = ['the', 'a', 'an', 'is', 'it', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'this', 'that', 'i', 'my', 'was', 'very', 'have', 'has', 'been'];

    words.forEach(word => {
        const clean = word.replace(/[^a-z]/g, '');
        if (clean.length > 3 && !stopWords.includes(clean)) {
            wordCount[clean] = (wordCount[clean] || 0) + 1;
        }
    });

    const commonKeywords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);

    return {
        avgRating: overallRating || reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
        totalReviews: reviews.length,
        ratingDistribution,
        pros,
        cons,
        commonKeywords,
    };
}

function extractKeyThemes(texts: string[], limit: number): string[] {
    // Simple theme extraction - in production, use LLM
    const themes: string[] = [];

    const patterns = [
        { regex: /good (quality|product|value)/gi, theme: 'Good quality' },
        { regex: /fast (delivery|shipping)/gi, theme: 'Fast delivery' },
        { regex: /easy to use/gi, theme: 'Easy to use' },
        { regex: /great (price|value)/gi, theme: 'Great value' },
        { regex: /works (well|great)/gi, theme: 'Works well' },
        { regex: /poor (quality|product)/gi, theme: 'Poor quality' },
        { regex: /waste of money/gi, theme: 'Not worth the price' },
        { regex: /not as (described|expected)/gi, theme: 'Not as described' },
        { regex: /slow (delivery|shipping)/gi, theme: 'Slow delivery' },
        { regex: /broke|broken/gi, theme: 'Durability issues' },
    ];

    const allText = texts.join(' ');
    patterns.forEach(({ regex, theme }) => {
        if (regex.test(allText)) {
            themes.push(theme);
        }
    });

    return themes.slice(0, limit);
}

// ============================================
// GOOGLE SEARCH / SEO SCRAPER
// ============================================

export async function scrapeSEO(
    brandName: string,
    keywords: string[],
    websiteUrl?: string
): Promise<SEOMetrics> {
    const apiKey = process.env.SCRAPINGDOG_API_KEY;

    if (!apiKey) {
        console.warn('⚠️ SCRAPINGDOG_API_KEY not set, skipping SEO scrape');
        return {
            brandKeywordRankings: [],
            competitorRankings: [],
            missingKeywords: keywords,
            topRankingPages: [],
        };
    }

    console.log(`🔍 Scraping SEO data for: ${brandName} (using ScrapingDog)...`);

    // Search queries to check
    const searchQueries = [
        brandName,
        ...keywords.slice(0, 3).map(k => k),
    ];

    const allResults: GoogleSearchResult[] = [];
    const brandRankings: { keyword: string; position: number; url: string }[] = [];
    let relatedSearches: { query: string; link: string }[] = [];

    // Run Google Search via ScrapingDog for each query
    for (const query of searchQueries.slice(0, 4)) { // Limit to save API credits
        try {
            console.log(`   🔎 Searching: "${query}"...`);

            const params = new URLSearchParams({
                api_key: apiKey,
                query: query,
                country: 'in',
                domain: 'google.co.in',  // Added per ScrapingDog docs
                results: '10',
            });

            const response = await fetch(`https://api.scrapingdog.com/google?${params.toString()}`, {
                signal: AbortSignal.timeout(20000),
            });

            if (!response.ok) {
                console.warn(`   ⚠️ ScrapingDog SEO failed for "${query}": ${response.status}`);
                continue;
            }

            const data = await response.json();
            const organicResults = data.organic_results || data.organic_data || [];

            // Capture related searches (only from brand name query)
            if (query === brandName && data.relatedSearches && relatedSearches.length === 0) {
                relatedSearches = (data.relatedSearches as { query: string; link: string }[])
                    .slice(0, 10)
                    .map((rs: { query: string; link: string }) => ({
                        query: rs.query,
                        link: rs.link,
                    }));
            }

            if (organicResults && organicResults.length > 0) {
                organicResults.forEach((result: Record<string, unknown>, index: number) => {
                    const searchResult: GoogleSearchResult = {
                        position: index + 1,
                        title: (result.title as string) || '',
                        url: (result.link as string) || (result.url as string) || '',
                        description: (result.snippet as string) || (result.description as string) || '',
                        domain: extractDomain((result.link as string) || (result.url as string) || ''),
                        source: (result.source as string) || undefined,
                    };
                    allResults.push(searchResult);

                    // Check if brand website ranks
                    const resultUrl = (result.link as string) || (result.url as string) || '';
                    if (websiteUrl && resultUrl.includes(extractDomain(websiteUrl))) {
                        brandRankings.push({
                            keyword: query,
                            position: index + 1,
                            url: resultUrl,
                        });
                    }
                });
            }
        } catch (error) {
            console.warn(`   ❌ SEO scrape failed for query: ${query}`, error instanceof Error ? error.message : 'Unknown');
        }
    }

    // Find keywords where brand doesn't rank
    const rankedKeywords = new Set(brandRankings.map(r => r.keyword));
    const missingKeywords = searchQueries.filter(q => !rankedKeywords.has(q));

    console.log(`✅ SEO scraped: ${allResults.length} results, ${brandRankings.length} brand rankings, ${relatedSearches.length} related queries`);

    return {
        brandKeywordRankings: allResults.slice(0, 20),
        competitorRankings: allResults.filter(r => !r.url.includes(extractDomain(websiteUrl || ''))),
        missingKeywords,
        topRankingPages: brandRankings,
        relatedSearches: relatedSearches.length > 0 ? relatedSearches : undefined,
    };
}

function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return url;
    }
}

// ============================================
// MAIN ORCHESTRATOR
// ============================================

export interface ScrapeInput {
    brandName: string;
    instagramHandle?: string;
    websiteUrl?: string;
    amazonProductUrl?: string;
    youtubeUrl?: string;
    seoKeywords?: string[];
    competitorHandles?: string[];
    competitorBrandNames?: string[];
    enableInstagram?: boolean;
    enableAmazon?: boolean;
    enableYouTube?: boolean;
    enableWebsiteAudit?: boolean;
    instagramPostsLimit?: number;
    country?: string;
}

export async function scrapeAllData(input: ScrapeInput): Promise<ScrapedData> {
    const errors: string[] = [];
    let instagram: InstagramMetrics | null = null;
    let amazon: AmazonMetrics | null = null;
    let seo: SEOMetrics | null = null;
    const competitors: { [handle: string]: InstagramMetrics } = {};
    let youtube: import('./youtube-scraper').YouTubeChannelData | null = null;
    let websiteAudit: import('./website-audit').WebsiteAuditData | null = null;
    // Reddit removed

    console.log('🚀 Starting highly optimized parallel scraping...');

    // Group 1: The "Big Three" + Independent APIs (Safe to run in parallel across different services)
    const primaryTasks = [];

    if (input.enableInstagram && input.instagramHandle) {
        const postsLimit = input.instagramPostsLimit || 80; // Default to 80 posts (~3 months)
        primaryTasks.push((async () => {
            console.log(`   📸 Scraping Instagram (${postsLimit} posts)...`);
            try {
                instagram = await scrapeInstagram(input.instagramHandle!, postsLimit);
                console.log(`   ✅ Instagram: ${instagram?.profile?.followersCount?.toLocaleString() || 0} followers, ${instagram?.profile?.posts?.length || 0} posts analyzed`);
            }
            catch (e) {
                console.log(`   ❌ Instagram failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
                errors.push(`Instagram: ${e instanceof Error ? e.message : 'Failed'}`);
            }
        })());
    }

    if (input.enableAmazon && (input.amazonProductUrl || input.brandName)) {
        primaryTasks.push((async () => {
            console.log('   🛒 Scraping Amazon...');
            try {
                amazon = await scrapeAmazon(
                    input.amazonProductUrl || '',
                    input.brandName,
                    input.country || 'in'
                );
                console.log(`   ✅ Amazon: ${amazon?.products?.length || 0} products found`);
            }
            catch (e) {
                console.log(`   ❌ Amazon failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
                errors.push(`Amazon: ${e instanceof Error ? e.message : 'Failed'}`);
            }
        })());
    }

    if (input.enableYouTube && input.youtubeUrl) {
        primaryTasks.push((async () => {
            console.log('   📺 Scraping YouTube...');
            try {
                const { scrapeYouTubeChannel } = await import('./youtube-scraper');
                youtube = await scrapeYouTubeChannel(input.youtubeUrl!);
                console.log(`   ✅ YouTube: ${youtube?.subscriberCount?.toLocaleString() || 0} subscribers`);
            } catch (e) {
                console.log(`   ❌ YouTube failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
                errors.push(`YouTube: ${e instanceof Error ? e.message : 'Failed'}`);
            }
        })());
    }

    if (input.enableWebsiteAudit && input.websiteUrl) {
        primaryTasks.push((async () => {
            console.log('   🌐 Auditing Website SEO...');
            try {
                const { scrapeWebsiteAudit } = await import('./website-audit');
                websiteAudit = await scrapeWebsiteAudit(input.websiteUrl!);
                console.log(`   ✅ Website: ${websiteAudit?.pagesAudited || 0} pages audited, Score: ${websiteAudit?.overallScore || 0}`);
            } catch (e) {
                console.log(`   ❌ Website Audit failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
                errors.push(`Website Audit: ${e instanceof Error ? e.message : 'Failed'}`);
            }
        })());
    }

    // Reddit removed - no longer scraping

    // Wait for primary tasks to finish
    await Promise.all(primaryTasks);
    console.log('   ✓ Primary data sources completed.');

    // Group 2: Google Trends & SEO (Sequential to be kind to search APIs on Free Plan)


    if (input.seoKeywords && input.seoKeywords.length > 0) {
        try {
            seo = await scrapeSEO(input.brandName, input.seoKeywords, input.websiteUrl);
        } catch (error) {
            errors.push(`SEO: ${error instanceof Error ? error.message : 'Failed'}`);
        }
    }

    // Scrape competitor Instagram profiles - Filter out the brand's own handle
    if (input.competitorHandles && input.competitorHandles.length > 0) {
        const filteredHandles = input.competitorHandles
            .map(h => h.trim().replace('@', ''))
            .filter(h => h.toLowerCase() !== input.instagramHandle?.toLowerCase());

        const compTasks = filteredHandles.slice(0, 3).map(async (handle) => {
            try {
                competitors[handle] = await scrapeInstagram(handle, 15);
            } catch (error) {
                errors.push(`Competitor ${handle}: ${error instanceof Error ? error.message : 'Failed'}`);
            }
        });
        await Promise.all(compTasks);
        console.log(`   ✓ ${Object.keys(competitors).length} Competitors analyzed.`);
    }

    if (errors.length > 0) {
        console.log(`⚠️ Some scrapers had issues: ${errors.length} errors recorded.`);
    }
    console.log('✅ All data collection complete!');

    return {
        instagram,
        amazon,
        seo,
        competitors: Object.keys(competitors).length > 0 ? competitors : null,
        youtube,

        websiteAudit,
        // Reddit removed
        scrapedAt: new Date().toISOString(),
        errors,
    };
}

// === AMAZON HELPER FUNCTIONS ===

function parseReviewCount(str: string | number): number {
    if (typeof str === 'number') return str;
    if (!str) return 0;

    // Handle '55.4K' -> 55400
    const cleanStr = str.toString().toUpperCase().replace(/,/g, '');
    let multiplier = 1;

    if (cleanStr.includes('K')) {
        multiplier = 1000;
    } else if (cleanStr.includes('M')) {
        multiplier = 1000000;
    }

    const num = parseFloat(cleanStr.replace(/[KM]/g, ''));
    return Math.round(num * multiplier) || 0;
}

function parseSalesVolume(str: string | undefined | number): number {
    if (!str) return 0;
    if (typeof str === 'number') return str;

    // Extract number and possible K/M suffix from '1K+ bought in past month'
    const cleanStr = str.toString().toUpperCase().replace(/,/g, '');
    const match = cleanStr.match(/(\d+(?:\.\d+)?)\s*([KM])?/);

    if (!match) return 0;

    const val = parseFloat(match[1]);
    const suffix = match[2];

    let multiplier = 1;
    if (suffix === 'K') multiplier = 1000;
    else if (suffix === 'M') multiplier = 1000000;

    return Math.round(val * multiplier);
}

function calculateAveragePrice(products: AmazonProductData[], domain: string = 'in'): string {
    const symbol = domain === 'in' ? '₹' : '$';
    const prices = products
        .map(p => {
            const cleanPrice = p.price.replace(/[^0-9.]/g, '');
            return parseFloat(cleanPrice);
        })
        .filter(p => !isNaN(p) && p > 0);

    if (prices.length === 0) return 'N/A';

    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return symbol + Math.round(avg).toLocaleString();
}

