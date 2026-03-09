/**
 * Reddit API Integration
 * FREE official API for brand mentions and sentiment
 * 
 * Setup required:
 * 1. Go to https://www.reddit.com/prefs/apps
 * 2. Create a "script" type app
 * 3. Get client_id and client_secret
 * 4. Add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to .env.local
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface RedditPost {
    id: string;
    title: string;
    selftext: string;
    subreddit: string;
    author: string;
    score: number;
    upvote_ratio: number;
    num_comments: number;
    created_utc: number;
    url: string;
    permalink: string;
    is_self: boolean;
}

export interface RedditComment {
    id: string;
    body: string;
    author: string;
    score: number;
    subreddit: string;
    created_utc: number;
    permalink: string;
}

export interface RedditData {
    searchTerm: string;
    posts: RedditPost[];
    comments: RedditComment[];
    summary: {
        totalMentions: number;
        totalPosts: number;
        totalComments: number;
        averageScore: number;
        topSubreddits: { name: string; count: number }[];
        sentimentIndicator: 'positive' | 'neutral' | 'negative' | 'mixed';
        topPosts: {
            title: string;
            subreddit: string;
            score: number;
            url: string;
        }[];
        recentActivity: {
            last24h: number;
            lastWeek: number;
            lastMonth: number;
        };
    };
    scrapedAt: string;
}

// ============================================
// AUTH HELPER
// ============================================

async function getRedditAccessToken(): Promise<string | null> {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return null;
    }

    try {
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'BuzzResearcher/1.0',
            },
            body: 'grant_type=client_credentials',
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            console.error('Reddit auth error:', await response.text());
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Reddit auth failed:', error);
        return null;
    }
}

// ============================================
// MAIN API FUNCTION
// ============================================

export async function searchReddit(
    searchTerm: string,
    limit: number = 50
): Promise<RedditData> {
    console.log(`💬 Searching Reddit for: "${searchTerm}"`);

    const accessToken = await getRedditAccessToken();

    if (!accessToken) {
        console.log('⚠️ Reddit: No credentials configured, using public API');
        return searchRedditPublic(searchTerm, limit);
    }

    try {
        // Search for posts
        const searchUrl = new URL('https://oauth.reddit.com/search');
        searchUrl.searchParams.append('q', searchTerm);
        searchUrl.searchParams.append('sort', 'relevance');
        searchUrl.searchParams.append('limit', limit.toString());
        searchUrl.searchParams.append('type', 'link');

        const response = await fetch(searchUrl.toString(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'BuzzResearcher/1.0',
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            throw new Error(`Reddit API error: ${response.status}`);
        }

        const data = await response.json();
        return processRedditData(searchTerm, data);
    } catch (error) {
        console.error('Reddit API error:', error);
        return searchRedditPublic(searchTerm, limit);
    }
}

// ============================================
// PUBLIC API FALLBACK (No auth required, but rate limited)
// ============================================

async function searchRedditPublic(
    searchTerm: string,
    limit: number = 25
): Promise<RedditData> {
    try {
        const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(searchTerm)}&sort=relevance&limit=${limit}`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'BuzzResearcher/1.0 (brand research tool)',
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            throw new Error(`Reddit public API error: ${response.status}`);
        }

        const data = await response.json();
        return processRedditData(searchTerm, data);
    } catch (error) {
        console.error('Reddit public API error:', error);
        return getEmptyRedditData(searchTerm);
    }
}

// ============================================
// DATA PROCESSING
// ============================================

function processRedditData(searchTerm: string, data: Record<string, unknown>): RedditData {
    const posts: RedditPost[] = [];
    const now = Date.now() / 1000;
    const day = 86400;
    const week = day * 7;
    const month = day * 30;

    // Process posts
    const children = (data.data as Record<string, unknown>)?.children as Record<string, unknown>[] || [];

    for (const child of children) {
        const post = child.data as Record<string, unknown>;
        if (!post) continue;

        posts.push({
            id: post.id as string,
            title: post.title as string,
            selftext: (post.selftext as string || '').substring(0, 500),
            subreddit: post.subreddit as string,
            author: post.author as string,
            score: post.score as number || 0,
            upvote_ratio: post.upvote_ratio as number || 0,
            num_comments: post.num_comments as number || 0,
            created_utc: post.created_utc as number,
            url: post.url as string,
            permalink: `https://reddit.com${post.permalink}`,
            is_self: post.is_self as boolean,
        });
    }

    // Calculate subreddit distribution
    const subredditCounts: Record<string, number> = {};
    for (const post of posts) {
        subredditCounts[post.subreddit] = (subredditCounts[post.subreddit] || 0) + 1;
    }

    const topSubreddits = Object.entries(subredditCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name: `r/${name}`, count }));

    // Calculate sentiment indicator based on average score
    const avgScore = posts.length > 0
        ? posts.reduce((sum, p) => sum + p.score, 0) / posts.length
        : 0;

    let sentimentIndicator: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
    if (avgScore > 50) sentimentIndicator = 'positive';
    else if (avgScore < 0) sentimentIndicator = 'negative';
    else if (posts.some(p => p.score > 100) && posts.some(p => p.score < 0)) sentimentIndicator = 'mixed';

    // Calculate recent activity
    const recentActivity = {
        last24h: posts.filter(p => now - p.created_utc < day).length,
        lastWeek: posts.filter(p => now - p.created_utc < week).length,
        lastMonth: posts.filter(p => now - p.created_utc < month).length,
    };

    // Get top posts
    const topPosts = [...posts]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(p => ({
            title: p.title.substring(0, 100),
            subreddit: `r/${p.subreddit}`,
            score: p.score,
            url: p.permalink,
        }));

    console.log(`✅ Reddit: Found ${posts.length} posts across ${Object.keys(subredditCounts).length} subreddits`);

    return {
        searchTerm,
        posts,
        comments: [], // Would need separate API calls per post
        summary: {
            totalMentions: posts.length,
            totalPosts: posts.length,
            totalComments: posts.reduce((sum, p) => sum + p.num_comments, 0),
            averageScore: Math.round(avgScore),
            topSubreddits,
            sentimentIndicator,
            topPosts,
            recentActivity,
        },
        scrapedAt: new Date().toISOString(),
    };
}

function getEmptyRedditData(searchTerm: string): RedditData {
    return {
        searchTerm,
        posts: [],
        comments: [],
        summary: {
            totalMentions: 0,
            totalPosts: 0,
            totalComments: 0,
            averageScore: 0,
            topSubreddits: [],
            sentimentIndicator: 'neutral',
            topPosts: [],
            recentActivity: { last24h: 0, lastWeek: 0, lastMonth: 0 },
        },
        scrapedAt: new Date().toISOString(),
    };
}
