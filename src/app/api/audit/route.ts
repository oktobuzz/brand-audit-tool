import { NextResponse } from 'next/server';
import { INSIGHT_LLM_PROMPT } from '@/lib/prompts';
import { scrapeAllData, type ScrapeInput, type ScrapedData } from '@/lib/apify-scrapers';
import { runAllSections, type BrandInfo as SectionBrandInfo } from '@/lib/audit-sections/runner';
import { runHybridAudit, type HybridAuditReport } from '@/lib/audit-sections/hybrid-runner';

// Get API keys from environment variables (backend only)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const INSIGHT_PROVIDER = process.env.INSIGHT_PROVIDER || 'groq';

interface BrandInput {
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

// ============================================
// LLM API CALLS
// ============================================

async function callGeminiAPI(inputJson: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-exp-1206:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: INSIGHT_LLM_PROMPT }, { text: `\n\nHere is the input data:\n${inputJson}` }] }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 8000 }
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

async function callOpenAIAPI(inputJson: string): Promise<string> {
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: INSIGHT_LLM_PROMPT },
                { role: 'user', content: inputJson }
            ],
            temperature: 0.1,
            max_tokens: 8000,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callGroqAPI(inputJson: string): Promise<string> {
    if (GROQ_API_KEY) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: INSIGHT_LLM_PROMPT },
                        { role: 'user', content: inputJson }
                    ],
                    temperature: 0.1,
                    max_tokens: 16000,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }
            console.warn(`Groq API returned ${response.status}, falling back to OpenAI...`);
        } catch (e) {
            console.warn(`Groq fetch failed, falling back to OpenAI...`, e);
        }
    }

    if (!OPENAI_API_KEY) {
        throw new Error('Neither GROQ_API_KEY nor OPENAI_API_KEY is configured');
    }

    console.log('🤖 Falling back to OpenAI (gpt-4o-mini)...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: INSIGHT_LLM_PROMPT },
                { role: 'user', content: inputJson }
            ],
            temperature: 0.1,
            max_tokens: 16000,
        }),
    });

    if (!openaiResponse.ok) {
        const error = await openaiResponse.text();
        throw new Error(`OpenAI API fallback error: ${openaiResponse.status} - ${error}`);
    }

    const data = await openaiResponse.json();
    return data.choices[0].message.content;
}

// ============================================
// BUILD INPUT FOR LLM
// ============================================

function buildScrapedDataInput(brandInput: BrandInput, scrapedData: ScrapedData): string {
    const input: Record<string, unknown> = {
        brand_metadata: {
            name: brandInput.brand,
            website: brandInput.website,
            instagram: brandInput.instagram,
            country: brandInput.country,
            industry: brandInput.industry,
        },
        // EXPLICIT DATA AVAILABILITY FLAGS - LLM must respect these
        data_availability: {
            instagram_scraped: !!scrapedData.instagram,
            amazon_scraped: !!scrapedData.amazon,
            competitors_scraped: !!scrapedData.competitors && Object.keys(scrapedData.competitors).length > 0,
            seo_scraped: !!scrapedData.seo,
            youtube_scraped: !!scrapedData.youtube,
            website_audit_done: !!scrapedData.websiteAudit,
        },
        instructions: `
IMPORTANT: Check data_availability flags above before making any claims.
- If amazon_scraped is false: Do NOT mention Amazon ratings, A+ content, or product variety
- If competitors_scraped is false: Do NOT compare to competitors
- If youtube_scraped is false: Do NOT mention YouTube metrics

- If website_audit_done is false: Do NOT mention SEO scores or website performance
- For any section with no data, explicitly state "Data not provided"
        `,
        scraped_data: {},
        analysis_type: 'comprehensive_audit',
    };


    // Add Instagram data
    if (scrapedData.instagram) {
        const ig = scrapedData.instagram;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (input.scraped_data as any).social_media = {
            instagram: {
                profile: {
                    username: ig.profile.username,
                    followers: ig.profile.followersCount,
                    following: ig.profile.followsCount,
                    posts_count: ig.profile.postsCount,
                    bio: ig.profile.biography,
                    is_verified: ig.profile.isVerified,
                },
                engagement: {
                    avg_likes: ig.engagement.avgLikes,
                    avg_comments: ig.engagement.avgComments,
                    avg_views: ig.engagement.avgViews,
                    engagement_rate: ig.engagement.engagementRate,
                    total_interactions: ig.engagement.totalInteractions,
                },
                content_breakdown: {
                    reels_percentage: Math.round((ig.contentBreakdown.reels / ig.profile.posts.length) * 100) || 0,
                    carousels_percentage: Math.round((ig.contentBreakdown.carousels / ig.profile.posts.length) * 100) || 0,
                    images_percentage: Math.round((ig.contentBreakdown.images / ig.profile.posts.length) * 100) || 0,
                },
                sentiment: {
                    positive_count: ig.sentiment.positiveCount,
                    neutral_count: ig.sentiment.neutralCount,
                    negative_count: ig.sentiment.negativeCount,
                    sample_positive: ig.sentiment.positive.slice(0, 3),
                    sample_negative: ig.sentiment.negative.slice(0, 3),
                },
                // Calculate posting frequency from actual timestamps
                posting_analysis: (() => {
                    const posts = ig.profile.posts;
                    if (!posts || posts.length === 0) {
                        return { posts_analyzed: 0, frequency: 'No posts found' };
                    }

                    // Get valid timestamps
                    const timestamps = posts
                        .map(p => new Date(p.timestamp).getTime())
                        .filter(t => !isNaN(t))
                        .sort((a, b) => a - b);

                    if (timestamps.length < 2) {
                        return {
                            posts_analyzed: posts.length,
                            frequency: 'Insufficient data for frequency calculation',
                            note: 'Only 1 post timestamp available'
                        };
                    }

                    const oldestPost = new Date(timestamps[0]);
                    const newestPost = new Date(timestamps[timestamps.length - 1]);
                    const daysDiff = Math.max(1, (newestPost.getTime() - oldestPost.getTime()) / (1000 * 60 * 60 * 24));
                    const weeksDiff = daysDiff / 7;
                    const postsPerWeek = weeksDiff > 0 ? (timestamps.length / weeksDiff).toFixed(1) : 'N/A';
                    const postsPerDay = (timestamps.length / daysDiff).toFixed(1);

                    return {
                        posts_analyzed: posts.length,
                        date_range: {
                            oldest: oldestPost.toISOString().split('T')[0],
                            newest: newestPost.toISOString().split('T')[0],
                            days_covered: Math.round(daysDiff),
                        },
                        calculated_frequency: {
                            posts_per_week: parseFloat(postsPerWeek as string) || 0,
                            posts_per_day: parseFloat(postsPerDay),
                        }
                    };
                })(),
                top_posts: ig.topPerformingPosts.slice(0, 3).map(p => ({
                    type: p.type,
                    likes: p.likesCount,
                    comments: p.commentsCount,
                    caption_preview: p.caption.slice(0, 100),
                })),
            },
        };
    }

    // Add Amazon data
    if (scrapedData.amazon) {
        const az = scrapedData.amazon;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (input.scraped_data as any).marketplace = {
            amazon: {
                product_title: az.product.title,
                price: az.product.price,
                rating: az.reviewAnalysis.avgRating,
                total_reviews: az.reviewAnalysis.totalReviews,
                rating_distribution: az.reviewAnalysis.ratingDistribution,
                pros: az.reviewAnalysis.pros,
                cons: az.reviewAnalysis.cons,
                common_keywords: az.reviewAnalysis.commonKeywords,
            },
        };
    }

    // Add SEO data
    if (scrapedData.seo) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (input.scraped_data as any).seo = {
            brand_rankings: scrapedData.seo.topRankingPages,
            missing_keywords: scrapedData.seo.missingKeywords,
            competitor_rankings: scrapedData.seo.competitorRankings.slice(0, 10).map(r => ({
                domain: r.domain,
                position: r.position,
                title: r.title,
            })),
        };
    }

    // Add competitor data
    if (scrapedData.competitors) {
        const competitorSummary: Record<string, unknown> = {};
        for (const [handle, data] of Object.entries(scrapedData.competitors)) {
            competitorSummary[handle] = {
                followers: data.profile.followersCount,
                engagement_rate: data.engagement.engagementRate,
                avg_likes: data.engagement.avgLikes,
                content_mix: data.contentBreakdown,
            };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (input.scraped_data as any).competitors = competitorSummary;
    }

    // Add YouTube data
    if (scrapedData.youtube) {
        const yt = scrapedData.youtube;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (input.scraped_data as any).youtube = {
            channel_name: yt.channelName,
            subscribers: yt.subscriberCount,
            total_views: yt.viewCount,
            video_count: yt.videoCount,
            avg_views: yt.avgViews,
            avg_likes: yt.avgLikes,
            avg_comments: yt.avgComments,
            engagement_rate: yt.engagementRate,
            shorts_percentage: yt.shortsPercentage,
            uploads_per_week: yt.uploadsPerWeek,
            top_videos: yt.topVideos.slice(0, 5).map(v => ({
                title: v.title,
                views: v.viewCount,
                likes: v.likeCount,
                is_short: v.isShort,
            })),
            recent_comments: yt.recentComments.slice(0, 10).map(c => c.text),
        };
    }



    // Add Website Audit data
    if (scrapedData.websiteAudit) {
        const wa = scrapedData.websiteAudit;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (input.scraped_data as any).website_audit = {
            main_url: wa.mainUrl,
            pages_audited: wa.pagesAudited,
            overall_score: wa.overallScore,
            seo_score: wa.seoScore,
            content_score: wa.contentScore,
            technical_score: wa.technicalScore,
            total_links: wa.totalLinks,
            total_broken_links: wa.totalBrokenLinks,
            avg_words_per_page: wa.avgWordsPerPage,
            pages_with_h1: wa.pagesWithH1,
            pages_with_meta_description: wa.pagesWithMetaDescription,
            issues_count: wa.issues.length,
            top_issues: wa.issues.slice(0, 15),
        };
    }

    // NOTE: Facebook/Meta Ads scraping will be added via Apify later

    return JSON.stringify(input, null, 2);
}


function buildManualInput(brandInput: BrandInput, manualResearch: string): string {
    return JSON.stringify({
        brand_metadata: {
            name: brandInput.brand,
            website: brandInput.website,
            instagram: brandInput.instagram,
            country: brandInput.country,
            industry: brandInput.industry,
        },
        analysis_narrative: manualResearch,
        analysis_type: 'manual_research_audit',
    }, null, 2);
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get('content-type') || '';

        let brandInput: BrandInput;
        let mode: 'scrape' | 'manual';
        let manualResearch: string | undefined;
        let pdfText: string | undefined;

        // Handle multipart form data (for PDF uploads)
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();

            brandInput = {
                brand: formData.get('brand') as string || '',
                website: formData.get('website') as string || '',
                instagram: formData.get('instagram') as string || '',
                country: formData.get('country') as string || '',
                industry: formData.get('industry') as string || '',
                amazonUrl: formData.get('amazonUrl') as string || '',
                youtubeUrl: formData.get('youtubeUrl') as string || '',
                seoKeywords: formData.get('seoKeywords') as string || '',
                competitors: formData.get('competitors') as string || '',
                enableInstagram: formData.get('enableInstagram') === 'true',
                enableAmazon: formData.get('enableAmazon') === 'true',
                enableYouTube: formData.get('enableYouTube') === 'true',
                enableWebsiteAudit: formData.get('enableWebsiteAudit') === 'true',
            };

            mode = (formData.get('mode') as 'scrape' | 'manual') || 'manual';
            manualResearch = formData.get('manualResearch') as string;

            // Handle PDF file
            const pdfFile = formData.get('pdfFile') as File | null;
            if (pdfFile && pdfFile.size > 0) {
                try {
                    const pdfBuffer = await pdfFile.arrayBuffer();
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    const pdfParse = require('pdf-parse');
                    const pdfData = await pdfParse(Buffer.from(pdfBuffer));
                    pdfText = pdfData.text;
                } catch (pdfError) {
                    console.error('PDF parsing error:', pdfError);
                    throw new Error('Failed to parse PDF file.');
                }
            }
        } else {
            const body = await request.json();
            brandInput = body.brandInput;
            mode = body.mode || 'manual';
            manualResearch = body.manualResearch;
        }

        // Validate required fields
        if (!brandInput.brand || !brandInput.industry) {
            return NextResponse.json(
                { error: 'Brand name and industry are required' },
                { status: 400 }
            );
        }

        let inputForLLM: string;
        let scrapedData: ScrapedData | null = null;

        if (mode === 'scrape') {
            // ============================================
            // SCRAPE MODE: Use APIs to get real data
            // ============================================

            // Check if APIFY is needed (ONLY for Instagram now - SEO and Amazon use ScrapingDog)
            const needsApify = (brandInput.enableInstagram && brandInput.instagram);

            if (needsApify && !process.env.APIFY_API_TOKEN) {
                return NextResponse.json(
                    { error: 'APIFY_API_TOKEN not configured. Add it to .env.local for Instagram scraping.' },
                    { status: 500 }
                );
            }

            console.log('🚀 Starting live data scraping...');

            // Build scrape input - only include Instagram if enabled and provided
            const scrapeInput: ScrapeInput = {
                brandName: brandInput.brand,
                instagramHandle: (brandInput.enableInstagram && brandInput.instagram) ? brandInput.instagram : undefined,
                websiteUrl: brandInput.website || undefined,
                amazonProductUrl: brandInput.amazonUrl || undefined,
                youtubeUrl: brandInput.youtubeUrl || undefined,
                seoKeywords: brandInput.seoKeywords
                    ? brandInput.seoKeywords.split(',').map(k => k.trim()).filter(k => k)
                    : undefined,
                competitorHandles: brandInput.competitors
                    ? brandInput.competitors.split(',').map(h => h.trim().replace('@', '')).filter(h => h)
                    : undefined,
                enableInstagram: brandInput.enableInstagram ?? false,
                enableAmazon: brandInput.enableAmazon ?? false,
                enableYouTube: brandInput.enableYouTube ?? false,
                country: brandInput.country || 'IN',
            };

            // Run all scrapers
            scrapedData = await scrapeAllData(scrapeInput);

            if (!scrapedData) {
                throw new Error('Data collection failed. Please check your API keys and try again.');
            }

            if (scrapedData.errors.length > 0) {
                console.warn('⚠️ Some scrapers failed:', scrapedData.errors);
            }

            console.log('✅ Scraping complete!');

            // ============================================
            // HYBRID LLM PROCESSING (Rich Narratives + Structured Data)
            // ============================================

            console.log('🧠 Starting HYBRID LLM processing...');

            const sectionBrandInfo: SectionBrandInfo = {
                name: brandInput.brand,
                industry: brandInput.industry,
                website: brandInput.website || undefined,
                country: brandInput.country || undefined,
            };

            // Use HYBRID runner for rich narrative output
            const hybridResult = await runHybridAudit({
                brandInfo: sectionBrandInfo,
                scrapedData: scrapedData,
                instagramHandle: brandInput.instagram,
            });

            console.log(`✅ Hybrid processing complete: ${hybridResult.metadata.sectionsSucceeded}/${hybridResult.metadata.sectionsRun} sections succeeded`);

            // Extract hybrid section data
            const execData = hybridResult.sections.executive?.data;
            const igData = hybridResult.sections.instagram?.data;
            const azData = hybridResult.sections.amazon?.data;
            const ytData = hybridResult.sections.youtube?.data;
            const compData = hybridResult.sections.competitors?.data;
            const recsData = hybridResult.sections.recommendations?.data;

            // Calculate numeric score from letter grade
            const getNumericScore = (grade: string): number => {
                switch (grade) {
                    case 'A+': return 95;
                    case 'A': return 90;
                    case 'B+': return 80;
                    case 'B': return 70;
                    case 'C': return 60;
                    case 'D': return 50;
                    default: return 40;
                }
            };

            // Build final report with HYBRID format (narratives + metrics)
            console.log('\n🔍 [DEBUG] RAW SWOT SOURCES:');
            console.log('  - White Space (Opp):', compData?.white_space ? '✅ Found' : '❌ Missing');
            console.log('  - YouTube Growth (Opp):', ytData?.growth_opportunities ? '✅ Found' : '❌ Missing');
            console.log('  - 30 Day Focus (Opp):', recsData?.thirty_day_focus ? '✅ Found' : '❌ Missing');
            console.log('  - Comp Landscape (Threat):', compData?.competitive_landscape ? '✅ Found' : '❌ Missing');
            console.log('  - Amazon Comp (Threat):', azData?.competitive_position ? '✅ Found' : '❌ Missing');

            const report = {
                brandInput,
                scrapedData: scrapedData || null,

                // Hybrid section outputs (for debugging and advanced display)
                hybridSections: hybridResult.sections,

                // === EXECUTIVE SUMMARY (Hybrid Narrative + Score) ===
                summary: execData ? {
                    overall_health_score: getNumericScore(execData.overall_grade || 'B'),
                    overall_grade: execData.overall_grade || 'B',
                    brand_overview: execData.executive_narrative || '',
                    executive_narrative: execData.executive_narrative || '',
                    priority_action: execData.key_wins?.[0] || 'Focus on engagement',
                    executive_summary_bullets: [
                        execData.one_liner || '',
                        ...(execData.key_wins || []).slice(0, 2).map((w: string) => `✅ ${w}`),
                        ...(execData.key_challenges || []).slice(0, 2).map((f: string) => `⚠️ ${f}`),
                    ].filter(Boolean),
                    key_wins: execData.key_wins || [],
                    key_challenges: execData.key_challenges || [],
                    one_liner: execData.one_liner || '',
                } : null,

                // === SOCIAL MEDIA AUDIT (HYBRID: Real metrics + LLM narratives) ===
                social_media_audit: (igData || scrapedData?.instagram) ? {
                    social_media_score: Math.round(
                        ((scrapedData?.instagram?.engagement?.engagementRate || 0) > 5 ? 90 :
                            (scrapedData?.instagram?.engagement?.engagementRate || 0) > 3 ? 80 :
                                (scrapedData?.instagram?.engagement?.engagementRate || 0) > 1 ? 60 : 40)
                    ),
                    // REAL METRICS from scraped data (accurate numbers)
                    engagement_analysis: {
                        metrics: {
                            followers: scrapedData?.instagram?.profile?.followersCount || 0,
                            engagement_rate: scrapedData?.instagram?.engagement?.engagementRate || 0,
                            avg_likes_per_post: scrapedData?.instagram?.engagement?.avgLikes || 0,
                            avg_comments_per_post: scrapedData?.instagram?.engagement?.avgComments || 0,
                        },
                        // LLM-generated insights (narrative analysis)
                        insights: igData?.recommendations || [],
                    },
                    // REAL METRICS from scraped data
                    content_breakdown: {
                        reels_percentage: scrapedData?.instagram?.contentBreakdown?.reels || 0,
                        carousel_percentage: scrapedData?.instagram?.contentBreakdown?.carousels || 0,
                        static_percentage: scrapedData?.instagram?.contentBreakdown?.images || 0,
                    },
                    // REAL sentiment counts from scraped data
                    sentiment_analysis: {
                        positive_percentage: scrapedData?.instagram?.sentiment?.positiveCount || 0,
                        negative_percentage: scrapedData?.instagram?.sentiment?.negativeCount || 0,
                        neutral_percentage: scrapedData?.instagram?.sentiment?.neutralCount || 0,
                    },

                    // === HYBRID NARRATIVE FIELDS (Rich text from LLM) ===
                    analysis_narrative: igData?.analysis_narrative || '',
                    content_strategy_verdict: igData?.content_strategy_verdict || '',
                    top_posts_analysis: igData?.top_posts_analysis || '',
                    improvement_areas: igData?.improvement_areas || '',
                    recommendations_narrative: igData?.recommendations || [],
                } : null,

                // === MARKETPLACE AUDIT (HYBRID: Real metrics + LLM narratives) ===
                marketplace_audit: (azData || scrapedData?.amazon) ? {
                    marketplace_score: Math.round(
                        (scrapedData?.amazon?.reviewAnalysis?.avgRating || 0) >= 4.5 ? 90 :
                            (scrapedData?.amazon?.reviewAnalysis?.avgRating || 0) >= 4.0 ? 80 :
                                (scrapedData?.amazon?.reviewAnalysis?.avgRating || 0) >= 3.5 ? 65 : 50
                    ),
                    // REAL METRICS from scraped data
                    overview: {
                        total_products: scrapedData?.amazon?.products?.length || 0,
                        avg_rating: scrapedData?.amazon?.reviewAnalysis?.avgRating || 0,
                        total_reviews: scrapedData?.amazon?.reviewAnalysis?.totalReviews || 0,
                        best_sellers: scrapedData?.amazon?.salesAnalysis?.bestSellersCount || 0,
                    },
                    review_themes: scrapedData?.amazon?.reviewAnalysis || null,

                    // === HYBRID NARRATIVE FIELDS ===
                    marketplace_narrative: azData?.marketplace_narrative || '',
                    product_performance: azData?.product_performance || '',
                    customer_voice: azData?.customer_voice || '',
                    competitive_position: azData?.competitive_position || '',
                    recommendations: azData?.recommendations || [],
                } : null,

                // === YOUTUBE AUDIT (HYBRID: Real metrics + LLM narratives) ===
                youtube_audit: (ytData || scrapedData?.youtube) ? {
                    // REAL METRICS from scraped data
                    channel_metrics: {
                        subscribers: scrapedData?.youtube?.subscriberCount || 0,
                        total_views: scrapedData?.youtube?.viewCount || 0,
                        videos_count: scrapedData?.youtube?.videoCount || 0,
                        avg_views: scrapedData?.youtube?.avgViews || 0,
                        engagement_rate: scrapedData?.youtube?.engagementRate || 0,
                    },

                    // === HYBRID NARRATIVE FIELDS ===
                    channel_narrative: ytData?.channel_narrative || '',
                    content_strategy: ytData?.content_strategy || '',
                    audience_sentiment: ytData?.audience_sentiment || '',
                    growth_opportunities: ytData?.growth_opportunities || '',
                    recommendations: ytData?.recommendations || [],

                    // Keep raw data for advanced display
                    raw: scrapedData?.youtube || null,
                } : null,

                // === COMPETITOR BENCHMARK (HYBRID) ===
                competitor_benchmark: compData ? {
                    competitive_landscape: compData.competitive_landscape || '',
                    positioning_analysis: compData.positioning_analysis || '',
                    competitor_insights: compData.competitor_insights || '',
                    white_space: compData.white_space || '',
                    recommendations: compData.recommendations || [],
                } : null,

                // === WEBSITE AUDIT ===
                website_audit: scrapedData.websiteAudit || null,



                // === SWOT (Generate from hybrid executive data) ===
                swot: {
                    strengths: [
                        ...(execData?.key_wins?.map((w: string) => ({ point: w, evidence: 'Data analysis' })) || []),
                        ...(scrapedData?.websiteAudit && scrapedData.websiteAudit.overallScore > 80 ? [{ point: 'Strong Website SEO Architecture', evidence: `${scrapedData.websiteAudit.overallScore}/100 SEO Score` }] : [])
                    ],
                    weaknesses: [
                        ...(execData?.key_challenges?.map((f: string) => ({ point: f, evidence: 'Data analysis' })) || []),
                        ...(scrapedData?.websiteAudit && scrapedData.websiteAudit.overallScore < 60 ? [{ point: 'Technical SEO Gaps', evidence: 'Missing meta tags or slow performance' }] : [])
                    ],
                    opportunities: [
                        ...(compData?.white_space ? [{ point: compData.white_space, rationale: 'Competitor Gap' }] : []),
                        ...(ytData?.growth_opportunities ? [{ point: ytData.growth_opportunities, rationale: 'YouTube Growth' }] : []),
                        ...(recsData?.thirty_day_focus ? [{ point: recsData.thirty_day_focus, rationale: 'Immediate Win' }] : []),

                    ].slice(0, 4), // Limit to top 4
                    threats: [
                        ...(compData?.competitive_landscape ? [{ point: 'Competitive Pressure', rationale: compData.competitive_landscape }] : []),
                        ...(azData?.competitive_position ? [{ point: 'Marketplace Competition', rationale: azData.competitive_position }] : []),
                        // Use key challenges as potential threats if list is too short
                        ...(execData?.key_challenges || []).slice(2, 4).map((c: string) => ({ point: c, rationale: 'External Challenge' }))
                    ].slice(0, 4), // Limit to top 4
                },

                // === ACTION ITEMS (HYBRID format - priority_actions with why/expected_outcome) ===
                action_items: (recsData?.priority_actions || []).map((action: {
                    priority: string;
                    action: string;
                    why: string;
                    expected_outcome: string;
                }, index: number) => ({
                    priority: index + 1,
                    title: action.action || 'Action item',
                    description: action.expected_outcome || action.why || '',
                    expected_impact: action.priority === 'critical' ? 'high' :
                        action.priority === 'high' ? 'high' : 'medium',
                    timeframe: action.priority === 'critical' ? 'immediate' :
                        action.priority === 'high' ? 'short_term' : 'medium_term',
                    category: 'brand',
                    why: action.why || '',
                })),

                // === CONTENT PILLARS (HYBRID format) ===
                content_pillars: (recsData?.content_pillars || []).map((pillar: {
                    pillar_name: string;
                    description: string;
                    content_ideas: string[];
                }) => ({
                    pillar: pillar.pillar_name || '',
                    description: pillar.description || '',
                    content_ideas: pillar.content_ideas || [],
                })),

                // === ROADMAP (HYBRID format) ===
                thirty_day_focus: recsData?.thirty_day_focus || '',
                ninety_day_vision: recsData?.ninety_day_vision || '',
                strategic_summary: recsData?.strategic_summary || '',

                generatedAt: new Date().toISOString(),
                metadata: hybridResult.metadata,
            };

            return NextResponse.json({ success: true, report });


        } else {
            // ============================================
            // MANUAL MODE: Use pasted text or PDF (Single LLM call)
            // ============================================

            const researchContent = pdfText || manualResearch || '';

            if (!researchContent.trim()) {
                return NextResponse.json(
                    { error: 'Please provide research content' },
                    { status: 400 }
                );
            }

            console.log('📝 Processing manual research input...');
            inputForLLM = buildManualInput(brandInput, researchContent);

            // For manual mode, use single LLM call
            console.log(`🧠 Calling ${INSIGHT_PROVIDER} for insights...`);

            let insightResponse: string;
            if (INSIGHT_PROVIDER === 'openai') {
                insightResponse = await callOpenAIAPI(inputForLLM);
            } else if (INSIGHT_PROVIDER === 'groq') {
                insightResponse = await callGroqAPI(inputForLLM);
            } else {
                insightResponse = await callGeminiAPI(inputForLLM);
            }

            console.log('✅ Insight generation complete');

            // Parse LLM response
            let cleanedJson = insightResponse.trim();
            if (cleanedJson.startsWith('```json')) cleanedJson = cleanedJson.slice(7);
            if (cleanedJson.startsWith('```')) cleanedJson = cleanedJson.slice(3);
            if (cleanedJson.endsWith('```')) cleanedJson = cleanedJson.slice(0, -3);
            cleanedJson = cleanedJson.trim();

            let auditResult;
            try {
                auditResult = JSON.parse(cleanedJson);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.log('Raw response:', cleanedJson.slice(0, 500));
                throw new Error('Failed to parse LLM response as JSON');
            }

            // Build final report
            const report = {
                brandInput,
                scrapedData: scrapedData || null,
                ...auditResult,
                generatedAt: new Date().toISOString(),
            };

            return NextResponse.json({ success: true, report });
        }


    } catch (error) {
        console.error('❌ Audit API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
