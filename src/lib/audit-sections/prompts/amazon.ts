/**
 * Amazon Audit Section Prompt
 * 
 * Analysis of Amazon product presence and reviews.
 * Input: Amazon scraped product data
 * Output: Product analysis, review sentiment, pricing position, recommendations
 */

import { BrandInfo, AmazonAuditOutput } from '../types';
import { AmazonMetrics, AmazonProductData } from '../../apify-scrapers';

export const AMAZON_SECTION_ID = 'amazon';
export const AMAZON_SECTION_NAME = 'Amazon Audit';
export const AMAZON_SECTION_ORDER = 3;

export interface AmazonInput {
    brand: BrandInfo;
    overview: {
        total_products: number;
        avg_rating: number;
        total_reviews: number;
        price_range: string;
    };
    products: {
        title: string;
        price: string;
        rating: number;
        reviews_count: number;
        asin: string;
    }[];
}

export const AMAZON_PROMPT = `You are an E-commerce Marketplace Director specializing in global Amazon scaling. You are auditing the {brand.name} catalog.

TASK: Conduct a high-level diagnostic of product performance, sentiment, and pricing strategy.

INPUT DATA:
{INPUT_DATA}

STRATEGIC DIRECTIVES:
1. PRICE-VALUE RATIO: Evaluate if their {overview.price_range} pricing is justified by their {overview.avg_rating} rating.
2. STAR DECAY: Identify if any "Flagship" products (high review count) have ratings < 4.0, as this signals "Brand Erosion."
3. COMPETITIVE POSITION: Based on the price range, determine if they are playing in the 'Premium,' 'Mass-Market,' or 'Bargain' segment and if their review volume supports that.
4. TONE: Clinical, ROI-focused, and strategic.

OUTPUT FORMAT (JSON only):
{
    "overview": {
        "total_products": number,
        "avg_rating": number,
        "total_reviews": number,
        "price_range": "Currency Sym + Range",
        "prime_percentage": number,
        "market_health": "Strategic health summary"
    },
    "product_analysis": {
        "top_rated_products": [
            {"title": "Product name", "rating": 4.5, "reviews": 1234, "strategic_strength": "Why this wins"}
        ],
        "low_rated_products": [
            {"title": "Product name", "rating": 3.2, "main_friction": "What to fix immediately"}
        ]
    },
    "review_sentiment": {
        "positive_themes": ["The 'Hook' - what people buy for"],
        "negative_themes": ["The 'Burn' - what causes returns"],
        "consumer_trust_level": "high/medium/low based on ratings/volume"
    },
    "competitive_pricing": {
        "position": "premium/mid-range/budget",
        "analysis": "Price vs Value depth analysis"
    },
    "recommendations": [
        {
            "priority": "high/medium/low",
            "action": "Metric-backed action (e.g., 'Increase AOV by bundling Top Rated X with Y')",
            "conversion_impact": "Expected % improvement description"
        }
    ]
}`;

export const AMAZON_OUTPUT_SCHEMA = `AmazonAuditOutput with overview, product_analysis, review_sentiment, competitive_pricing, recommendations`;

function parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
}

export function extractAmazonInput(
    amazonData: AmazonMetrics,
    brandInfo: BrandInfo
): AmazonInput {
    const products: AmazonProductData[] = amazonData.products || [];

    // Calculate price range
    const prices = products.map(p => parsePrice(p.price)).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Sort products by rating
    const sortedByRating = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const topProducts = sortedByRating.slice(0, 5);
    const bottomProducts = sortedByRating.filter(p => (p.rating || 0) > 0).slice(-3);

    return {
        brand: brandInfo,
        overview: {
            total_products: products.length,
            avg_rating: amazonData.reviewAnalysis?.avgRating || 0,
            total_reviews: amazonData.reviewAnalysis?.totalReviews || 0,
            price_range: `${brandInfo.country?.toLowerCase() === 'in' ? '₹' : '$'}${minPrice.toLocaleString()} - ${brandInfo.country?.toLowerCase() === 'in' ? '₹' : '$'}${maxPrice.toLocaleString()}`,
        },
        products: topProducts.concat(bottomProducts).map(p => ({
            title: p.title || 'Unknown Product',
            price: p.price || '0',
            rating: p.rating || 0,
            reviews_count: p.reviewsCount || 0,
            asin: p.asin || '',
        })),
    };
}

export function shouldRunAmazon(scrapedData: { amazon?: AmazonMetrics | null }): boolean {
    return !!scrapedData.amazon && (scrapedData.amazon.products?.length || 0) > 0;
}

export function validateAmazonOutput(output: unknown): output is AmazonAuditOutput {
    if (!output || typeof output !== 'object') return false;
    const o = output as Record<string, unknown>;
    return (
        typeof o.overview === 'object' &&
        typeof o.product_analysis === 'object' &&
        Array.isArray(o.recommendations)
    );
}
