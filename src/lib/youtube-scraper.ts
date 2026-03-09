/**
 * YouTube Data API Scraper
 * Uses official YouTube Data API v3 (FREE - 10,000 quota/day)
 */

import { google } from 'googleapis';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnailUrl: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    duration: string;
    durationSeconds: number;
    isShort: boolean;
}

export interface YouTubeComment {
    text: string;
    author: string;
    likeCount: number;
    publishedAt: string;
}

export interface YouTubeChannelData {
    channelId: string;
    channelName: string;
    customUrl: string;
    description: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    thumbnailUrl: string;
    bannerUrl: string;
    createdAt: string;

    // Calculated metrics
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    shortsPercentage: number;
    uploadsPerWeek: number;

    // Recent videos
    recentVideos: YouTubeVideo[];
    topVideos: YouTubeVideo[];

    // Comments sample
    recentComments: YouTubeComment[];

    scrapedAt: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function parseDuration(duration: string): number {
    // Parse ISO 8601 duration (PT1H2M3S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
}

function isShortVideo(durationSeconds: number): boolean {
    return durationSeconds <= 60; // Shorts are 60 seconds or less
}

function extractChannelId(url: string): string | null {
    // Handle different YouTube URL formats
    const patterns = [
        /youtube\.com\/channel\/([^\/\?]+)/,
        /youtube\.com\/@([^\/\?]+)/,
        /youtube\.com\/c\/([^\/\?]+)/,
        /youtube\.com\/user\/([^\/\?]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

// ============================================
// MAIN SCRAPER FUNCTION
// ============================================

export async function scrapeYouTubeChannel(
    channelUrl: string,
    videosToFetch: number = 20
): Promise<YouTubeChannelData> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY not configured. Get free key at https://console.cloud.google.com/apis/credentials');
    }

    const youtube = google.youtube({ version: 'v3', auth: apiKey });

    // Extract channel identifier from URL
    const channelIdentifier = extractChannelId(channelUrl);
    if (!channelIdentifier) {
        throw new Error('Invalid YouTube channel URL');
    }

    console.log(`🎬 Fetching YouTube data for: ${channelIdentifier}`);

    try {
        // Step 1: Get channel ID (handle @username format)
        let channelId = channelIdentifier;

        if (channelUrl.includes('@')) {
            // Need to search for the channel by handle
            console.log('  → Resolving channel handle...');
            const searchResponse = await youtube.search.list({
                part: ['snippet'],
                q: channelIdentifier,
                type: ['channel'],
                maxResults: 1,
            });

            channelId = searchResponse.data.items?.[0]?.snippet?.channelId || channelIdentifier;
        }

        // Step 2: Get channel details
        console.log('  → Fetching channel details...');
        const channelResponse = await youtube.channels.list({
            part: ['snippet', 'statistics', 'brandingSettings', 'contentDetails'],
            id: [channelId],
        });

        const channel = channelResponse.data.items?.[0];
        if (!channel) {
            throw new Error('Channel not found');
        }

        const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

        // Step 3: Get recent videos from uploads playlist
        console.log('  → Fetching recent videos...');
        const playlistResponse = await youtube.playlistItems.list({
            part: ['snippet', 'contentDetails'],
            playlistId: uploadsPlaylistId || '',
            maxResults: videosToFetch,
        });

        const videoIds = playlistResponse.data.items?.map(item => item.contentDetails?.videoId).filter(Boolean) as string[];

        // Step 4: Get video details (views, likes, duration)
        console.log('  → Fetching video statistics...');
        const videosResponse = await youtube.videos.list({
            part: ['snippet', 'statistics', 'contentDetails'],
            id: videoIds,
        });

        const videos: YouTubeVideo[] = (videosResponse.data.items || []).map(video => {
            const durationSeconds = parseDuration(video.contentDetails?.duration || '');
            return {
                id: video.id || '',
                title: video.snippet?.title || '',
                description: (video.snippet?.description || '').slice(0, 200),
                publishedAt: video.snippet?.publishedAt || '',
                thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
                viewCount: parseInt(video.statistics?.viewCount || '0'),
                likeCount: parseInt(video.statistics?.likeCount || '0'),
                commentCount: parseInt(video.statistics?.commentCount || '0'),
                duration: video.contentDetails?.duration || '',
                durationSeconds,
                isShort: isShortVideo(durationSeconds),
            };
        });

        // Step 5: Get comments from top videos
        console.log('  → Fetching recent comments...');
        const recentComments: YouTubeComment[] = [];

        // Get comments from first 3 videos
        for (const video of videos.slice(0, 3)) {
            try {
                const commentsResponse = await youtube.commentThreads.list({
                    part: ['snippet'],
                    videoId: video.id,
                    maxResults: 10,
                    order: 'relevance',
                });

                const videoComments = (commentsResponse.data.items || []).map(item => ({
                    text: item.snippet?.topLevelComment?.snippet?.textDisplay || '',
                    author: item.snippet?.topLevelComment?.snippet?.authorDisplayName || '',
                    likeCount: item.snippet?.topLevelComment?.snippet?.likeCount || 0,
                    publishedAt: item.snippet?.topLevelComment?.snippet?.publishedAt || '',
                }));

                recentComments.push(...videoComments);
            } catch (error) {
                // Comments might be disabled, continue
                console.log(`  ⚠️ Could not fetch comments for video ${video.id}`);
            }
        }

        // Calculate metrics
        const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
        const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);
        const totalComments = videos.reduce((sum, v) => sum + v.commentCount, 0);
        const shortsCount = videos.filter(v => v.isShort).length;

        console.log(`  → Found ${videos.length} videos, ${shortsCount} shorts`);
        console.log(`  → Total: ${totalViews} views, ${totalLikes} likes, ${totalComments} comments`);

        const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
        const avgLikes = videos.length > 0 ? Math.round(totalLikes / videos.length) : 0;
        const avgComments = videos.length > 0 ? Math.round(totalComments / videos.length) : 0;

        console.log(`  → Averages: ${avgViews} views, ${avgLikes} likes, ${avgComments} comments per video`);

        // Calculate upload frequency (videos per week)
        const oldestVideo = videos[videos.length - 1];
        const newestVideo = videos[0];
        let uploadsPerWeek = 0;
        if (oldestVideo && newestVideo) {
            const daysDiff = (new Date(newestVideo.publishedAt).getTime() - new Date(oldestVideo.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
            uploadsPerWeek = daysDiff > 0 ? Math.round((videos.length / daysDiff) * 7 * 10) / 10 : 0;
        }

        // Sort by views for top videos
        const topVideos = [...videos].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

        console.log('✅ YouTube data fetched successfully');


        return {
            channelId: channel.id || '',
            channelName: channel.snippet?.title || '',
            customUrl: channel.snippet?.customUrl || '',
            description: channel.snippet?.description || '',
            subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
            videoCount: parseInt(channel.statistics?.videoCount || '0'),
            viewCount: parseInt(channel.statistics?.viewCount || '0'),
            thumbnailUrl: channel.snippet?.thumbnails?.high?.url || '',
            bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || '',
            createdAt: channel.snippet?.publishedAt || '',

            avgViews,
            avgLikes,
            avgComments,
            // Calculate engagement rate: (total likes + total comments) / total views * 100
            engagementRate: (() => {
                if (totalViews > 0) {
                    const rate = Math.round(((totalLikes + totalComments) / totalViews) * 10000) / 100;
                    console.log(`  → Engagement: (${totalLikes}L + ${totalComments}C) / ${totalViews}V × 100 = ${rate}%`);
                    return rate;
                }
                // Fallback if no views
                const subscriberCount = parseInt(channel.statistics?.subscriberCount || '0');
                if (subscriberCount > 0 && totalLikes > 0) {
                    const rate = Math.round((totalLikes / subscriberCount) * 1000) / 10;
                    console.log(`  → Engagement (fallback): ${totalLikes}L / ${subscriberCount}S × 100 = ${rate}%`);
                    return rate;
                }
                console.log('  ⚠️ Could not calculate engagement rate');
                return 0;
            })(),

            shortsPercentage: videos.length > 0 ? Math.round((shortsCount / videos.length) * 100) : 0,
            uploadsPerWeek,


            recentVideos: videos,
            topVideos,
            recentComments: recentComments.slice(0, 30),

            scrapedAt: new Date().toISOString(),
        };

    } catch (error) {
        console.error('❌ YouTube scraping error:', error);
        throw new Error(`Failed to fetch YouTube data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
