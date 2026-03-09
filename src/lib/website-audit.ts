/**
 * Website SEO Auditor
 * Uses native fetch + cheerio for reliable website SEO analysis
 * Works in Next.js API routes - No Crawlee issues!
 */

import * as cheerio from 'cheerio';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PageAuditResult {
    url: string;
    title: string;
    isLoaded: boolean;
    isGoogleAnalyticsObject: boolean;
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
    responseTime: number;
}

export interface SEOIssue {
    type: 'error' | 'warning' | 'info';
    category: string;
    page: string;
    message: string;
}

export interface WebsiteAuditData {
    mainUrl: string;
    pagesAudited: number;

    // Summary scores (calculated from page data)
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

    // Individual page results
    pages: PageAuditResult[];

    // Issues found across all pages
    issues: SEOIssue[];

    scrapedAt: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function countWords(text: string): number {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(word => word.length > 0).length;
}

function getBaseUrl(url: string): string {
    try {
        const parsed = new URL(url);
        return `${parsed.protocol}//${parsed.host}`;
    } catch {
        return url;
    }
}

function normalizeUrl(url: string, baseUrl: string): string | null {
    try {
        // Skip non-http links
        if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:') || url.startsWith('#')) {
            return null;
        }

        // Handle relative URLs
        if (url.startsWith('/')) {
            return baseUrl + url;
        }

        // Handle absolute URLs - only same domain
        if (url.startsWith('http')) {
            const parsed = new URL(url);
            const baseParsed = new URL(baseUrl);
            if (parsed.host === baseParsed.host) {
                return url.split('?')[0].split('#')[0]; // Remove query params and hash
            }
            return null; // External link
        }

        return null;
    } catch {
        return null;
    }
}

async function fetchPage(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(15000), // 15 second timeout
        });

        if (!response.ok) {
            return null;
        }

        return await response.text();
    } catch {
        return null;
    }
}

// ============================================
// MAIN SCRAPER FUNCTION
// ============================================

export async function scrapeWebsiteAudit(websiteUrl: string, maxPages: number = 10): Promise<WebsiteAuditData> {
    console.log(`🌐 Running website SEO audit for: ${websiteUrl} (using fetch + cheerio)`);

    const pages: PageAuditResult[] = [];
    const baseUrl = getBaseUrl(websiteUrl);
    const visitedUrls = new Set<string>();
    const urlsToVisit: string[] = [websiteUrl];
    let robotsFileExists = false;
    let faviconExists = false;

    try {
        // First, check for robots.txt and favicon
        console.log('  → Checking robots.txt and favicon...');
        try {
            const robotsResponse = await fetch(`${baseUrl}/robots.txt`, { signal: AbortSignal.timeout(5000) });
            robotsFileExists = robotsResponse.ok;
            console.log(`  → robots.txt: ${robotsFileExists ? '✅ Found' : '❌ Not found'}`);
        } catch {
            robotsFileExists = false;
        }

        try {
            const faviconResponse = await fetch(`${baseUrl}/favicon.ico`, { signal: AbortSignal.timeout(5000) });
            faviconExists = faviconResponse.ok;
            console.log(`  → favicon.ico: ${faviconExists ? '✅ Found' : '❌ Not found'}`);
        } catch {
            faviconExists = false;
        }

        // Crawl pages in batches of 3 to optimize speed while respecting rate limits
        console.log('  → Starting optimized batch crawl...');

        while (urlsToVisit.length > 0 && visitedUrls.size < maxPages) {
            const batch: string[] = [];

            // Prepare a batch of up to 3 unique URLs
            while (batch.length < 3 && urlsToVisit.length > 0 && (visitedUrls.size + batch.length) < maxPages) {
                const url = urlsToVisit.shift()!;
                if (!visitedUrls.has(url)) {
                    batch.push(url);
                }
            }

            if (batch.length === 0) break;

            // Mark batch as visited immediately to prevent duplicates
            batch.forEach(u => visitedUrls.add(u));

            console.log(`  📄 Batch Crawl: [${batch.map(u => u.replace(baseUrl, '') || '/').join(', ')}]`);

            await Promise.all(batch.map(async (url) => {
                const startTime = Date.now();
                const html = await fetchPage(url);
                const responseTime = Date.now() - startTime;

                if (!html) {
                    console.log(`  ❌ Failed to fetch: ${url}`);
                    return;
                }

                const $ = cheerio.load(html);

                // Extract page data
                const title = $('title').text().trim() || '';
                const metaDescription = $('meta[name="description"]').attr('content') || '';
                const h1Elements = $('h1');
                const h1Text = h1Elements.first().text().trim() || '';
                const hasH1 = h1Elements.length > 0;
                const hasOnlyOneH1 = h1Elements.length === 1;

                // Count links and discover new URLs
                const links = $('a[href]');
                const linksCount = links.length;

                links.each((_, el) => {
                    const href = $(el).attr('href');
                    if (href) {
                        const normalizedUrl = normalizeUrl(href, baseUrl);
                        if (normalizedUrl && !visitedUrls.has(normalizedUrl) && !urlsToVisit.includes(normalizedUrl)) {
                            const ext = normalizedUrl.split('.').pop()?.toLowerCase() || '';
                            const skipExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'css', 'js', 'zip', 'mp4', 'mp3'];
                            if (!skipExtensions.includes(ext)) {
                                urlsToVisit.push(normalizedUrl);
                            }
                        }
                    }
                });

                // Count images and check for optimization
                const images = $('img');
                let notOptimizedImagesCount = 0;
                images.each((_, img) => {
                    const alt = $(img).attr('alt');
                    if (!alt || alt.trim() === '') {
                        notOptimizedImagesCount++;
                    }
                });

                const bodyText = $('body').text();
                const wordsCount = countWords(bodyText);

                // Google Analytics check
                const htmlContent = $.html();
                const hasGoogleAnalytics =
                    htmlContent.includes('google-analytics.com') ||
                    htmlContent.includes('googletagmanager.com') ||
                    htmlContent.includes('gtag(') ||
                    htmlContent.includes('ga(');

                pages.push({
                    url,
                    title,
                    isLoaded: true,
                    isGoogleAnalyticsObject: hasGoogleAnalytics,
                    metaDescription,
                    isMetaDescriptionEnoughLong: metaDescription.length >= 120 && metaDescription.length <= 160,
                    isTitleEnoughLong: title.length >= 30 && title.length <= 60,
                    isH1: hasH1,
                    h1: h1Text,
                    isH1OnlyOne: hasOnlyOneH1,
                    linksCount,
                    notOptimizedImagesCount,
                    wordsCount,
                    robotsFileExists,
                    faviconExists,
                    brokenLinksCount: 0,
                    responseTime,
                });
            }));

            // Small cooldown between batches
            if (urlsToVisit.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }

        console.log(`  → Crawled ${pages.length} pages`);

        if (pages.length === 0) {
            throw new Error('No pages could be crawled');
        }

        // Generate issues and aggregate stats
        const issues: SEOIssue[] = [];

        let totalLinks = 0;
        let totalBrokenLinks = 0;
        let totalWords = 0;
        let totalNotOptimizedImages = 0;
        let pagesWithH1 = 0;
        let pagesWithSingleH1 = 0;
        let pagesWithMetaDescription = 0;
        let pagesWithOptimalTitle = 0;
        let pagesWithRobotsTxt = 0;
        let pagesWithFavicon = 0;
        let pagesWithAnalytics = 0;

        for (const pageResult of pages) {
            const shortUrl = pageResult.url.replace(baseUrl, '/').slice(0, 50) || '/';

            // Aggregate stats
            totalLinks += pageResult.linksCount;
            totalBrokenLinks += pageResult.brokenLinksCount;
            totalWords += pageResult.wordsCount;
            totalNotOptimizedImages += pageResult.notOptimizedImagesCount;

            if (pageResult.isH1) pagesWithH1++;
            if (pageResult.isH1OnlyOne) pagesWithSingleH1++;
            if (pageResult.metaDescription && pageResult.isMetaDescriptionEnoughLong) pagesWithMetaDescription++;
            if (pageResult.isTitleEnoughLong) pagesWithOptimalTitle++;
            if (pageResult.robotsFileExists) pagesWithRobotsTxt++;
            if (pageResult.faviconExists) pagesWithFavicon++;
            if (pageResult.isGoogleAnalyticsObject) pagesWithAnalytics++;

            // Generate issues per page
            if (!pageResult.isH1) {
                issues.push({
                    type: 'error',
                    category: 'SEO',
                    page: shortUrl,
                    message: 'Missing H1 tag',
                });
            } else if (!pageResult.isH1OnlyOne) {
                issues.push({
                    type: 'warning',
                    category: 'SEO',
                    page: shortUrl,
                    message: 'Multiple H1 tags found',
                });
            }

            if (!pageResult.metaDescription) {
                issues.push({
                    type: 'error',
                    category: 'SEO',
                    page: shortUrl,
                    message: 'Missing meta description',
                });
            } else if (!pageResult.isMetaDescriptionEnoughLong) {
                issues.push({
                    type: 'warning',
                    category: 'SEO',
                    page: shortUrl,
                    message: 'Meta description length not optimal (should be 120-160 chars)',
                });
            }

            if (!pageResult.isTitleEnoughLong) {
                issues.push({
                    type: 'warning',
                    category: 'SEO',
                    page: shortUrl,
                    message: 'Title tag needs optimization (should be 30-60 chars)',
                });
            }

            if (pageResult.notOptimizedImagesCount > 0) {
                issues.push({
                    type: 'warning',
                    category: 'Performance',
                    page: shortUrl,
                    message: `${pageResult.notOptimizedImagesCount} image(s) missing alt text`,
                });
            }
        }

        // Add global issues
        if (!robotsFileExists) {
            issues.push({
                type: 'info',
                category: 'Technical',
                page: '/',
                message: 'No robots.txt found',
            });
        }

        if (!faviconExists) {
            issues.push({
                type: 'info',
                category: 'Branding',
                page: '/',
                message: 'No favicon found',
            });
        }

        // Calculate scores (0-100) using Lighthouse-inspired weighting
        const pagesAudited = pages.length;
        const avgWordsPerPage = pagesAudited > 0 ? Math.round(totalWords / pagesAudited) : 0;
        const avgResponseTime = pagesAudited > 0 ? pages.reduce((a, b) => a + b.responseTime, 0) / pagesAudited : 0;
        const hasHttps = websiteUrl.startsWith('https');

        // 1. SEO Score (Weights: Meta 25%, H1 25%, Title 20%, Alt Tags 20%, Best Practices 10%)
        const altTextScore = (1 - Math.min(1, totalNotOptimizedImages / (pagesAudited * 2 || 1))) * 100;
        const seoScore = Math.round(
            ((pagesWithMetaDescription / pagesAudited) * 25) +
            (((pagesWithH1 + pagesWithSingleH1) / (pagesAudited * 2)) * 25) +
            ((pagesWithOptimalTitle / pagesAudited) * 20) +
            (altTextScore * 0.20) +
            (((pagesWithRobotsTxt + pagesWithFavicon) / (pagesAudited * 2)) * 10)
        );

        // 2. Technical Score (Weights: Analytics 30%, Discovery 30%, Security 20%, Performance 20%)
        // Performance score: <500ms = 100, 500-1500ms = 50-99, >1500ms = <50
        const performanceScore = Math.max(0, Math.min(100, 100 - ((avgResponseTime - 500) / 10)));
        const technicalScore = Math.round(
            ((pagesWithAnalytics / pagesAudited) * 30) +
            (((pagesWithRobotsTxt + pagesWithFavicon) / (pagesAudited * 2)) * 30) +
            ((hasHttps ? 1 : 0) * 20) +
            (performanceScore * 0.20)
        );

        // 3. Content Score (Weights: Word Count 60%, Depth 40%)
        // Google values E-E-A-T. High quality info pages usually have >800 words.
        const contentRatio = Math.min(1, avgWordsPerPage / 800);
        const depthRatio = pages.filter(p => p.wordsCount > 500).length / pagesAudited;
        const contentScore = Math.round((contentRatio * 60) + (depthRatio * 40));

        // Final Aggregate (Weighted Average)
        const overallScore = Math.round((seoScore * 0.45) + (technicalScore * 0.30) + (contentScore * 0.25));

        console.log('✅ Website audit completed');
        console.log(`   Pages audited: ${pagesAudited}`);
        console.log(`   Overall score: ${overallScore}`);
        console.log(`   Issues found: ${issues.length}`);

        return {
            mainUrl: websiteUrl,
            pagesAudited,
            overallScore,
            seoScore,
            contentScore,
            technicalScore,
            totalLinks,
            totalBrokenLinks,
            totalWords,
            totalNotOptimizedImages,
            avgWordsPerPage,
            pagesWithH1,
            pagesWithSingleH1,
            pagesWithMetaDescription,
            pagesWithOptimalTitle,
            pagesWithRobotsTxt: robotsFileExists ? pagesAudited : 0,
            pagesWithFavicon: faviconExists ? pagesAudited : 0,
            pagesWithAnalytics,
            pages,
            issues,
            scrapedAt: new Date().toISOString(),
        };

    } catch (error) {
        console.error('❌ Website audit error:', error);
        throw new Error(`Failed to audit website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
