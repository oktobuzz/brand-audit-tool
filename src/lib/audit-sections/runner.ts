/**
 * Section Runner - Orchestrates section-wise LLM processing
 * 
 * This module:
 * 1. Runs each section independently with focused prompts
 * 2. Executes sections in parallel for speed
 * 3. Combines outputs into final report
 * 4. Handles errors per section (doesn't fail entire audit)
 */

import { ScrapedData, InstagramMetrics, AmazonMetrics } from '../apify-scrapers';
import { YouTubeChannelData } from '../youtube-scraper';
import {
    BrandInfo,
    SectionResult,
    AuditReport,
    ExecutiveSummaryOutput,
    InstagramAuditOutput,
    AmazonAuditOutput,
    YouTubeAuditOutput,
    CompetitorAnalysisOutput,
    RecommendationsOutput,
} from './types';

import {
    EXECUTIVE_PROMPT,
    extractExecutiveInput,
    validateExecutiveOutput,
} from './prompts/executive';

import {
    INSTAGRAM_PROMPT,
    extractInstagramInput,
    shouldRunInstagram,
    validateInstagramOutput,
} from './prompts/instagram';

import {
    AMAZON_PROMPT,
    extractAmazonInput,
    shouldRunAmazon,
    validateAmazonOutput,
} from './prompts/amazon';

import {
    YOUTUBE_PROMPT,
    extractYouTubeInput,
    shouldRunYouTube,
    validateYouTubeOutput,
} from './prompts/youtube';

import {
    COMPETITORS_PROMPT,
    extractCompetitorsInput,
    shouldRunCompetitors,
    validateCompetitorsOutput,
} from './prompts/competitors';

import {
    RECOMMENDATIONS_PROMPT,
    extractRecommendationsInput,
    validateRecommendationsOutput,
} from './prompts/recommendations';


// ============================================
// LLM CALL FUNCTION
// ============================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const INSIGHT_PROVIDER = process.env.INSIGHT_PROVIDER || 'gemini';

async function callLLM(prompt: string, inputData: unknown): Promise<string> {
    const fullPrompt = prompt.replace('{INPUT_DATA}', JSON.stringify(inputData, null, 2));
    console.log(`  🤖 Using LLM provider: ${INSIGHT_PROVIDER}`);

    // Use Gemini if configured
    if (INSIGHT_PROVIDER === 'gemini') {
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 8000,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    // Fall back to Groq
    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'user', content: fullPrompt }
            ],
            temperature: 0.1,
            max_tokens: 4000,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function parseJSONResponse(response: string): unknown {
    let cleaned = response.trim();

    // Remove markdown code blocks if present
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    // Try direct parsing first
    try {
        return JSON.parse(cleaned);
    } catch (firstError) {
        // Try to extract JSON from the response
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            let extracted = jsonMatch[0];

            // Fix common JSON issues
            // Remove trailing commas before } or ]
            extracted = extracted.replace(/,(\s*[}\]])/g, '$1');

            // Fix unescaped quotes in strings (basic attempt)
            // This handles cases like "text with "quotes" inside"
            extracted = extracted.replace(/:\s*"([^"]*?)(?<!\\)"(?!\s*[,}\]])/g, (match, content) => {
                return `: "${content.replace(/"/g, '\\"')}"`;
            });

            try {
                return JSON.parse(extracted);
            } catch (secondError) {
                // Last resort: try to fix line by line
                const lines = extracted.split('\n');
                const fixedLines = lines.map(line => {
                    // Remove any control characters
                    return line.replace(/[\x00-\x1F\x7F]/g, ' ');
                });
                const fixedJson = fixedLines.join('\n');

                try {
                    return JSON.parse(fixedJson);
                } catch (thirdError) {
                    console.error('JSON parsing failed after all attempts. Raw response:', response.slice(0, 500));
                    throw new Error(`Failed to parse LLM response as JSON: ${firstError instanceof Error ? firstError.message : 'Unknown error'}`);
                }
            }
        }

        throw new Error(`No valid JSON found in response. Response starts with: ${cleaned.slice(0, 100)}`);
    }
}

// ============================================
// SECTION PROCESSORS
// ============================================

async function processExecutiveSection(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo
): Promise<SectionResult<ExecutiveSummaryOutput>> {
    const startTime = Date.now();
    console.log('   🧠 Processing Executive Summary...');

    try {
        const input = extractExecutiveInput(scrapedData, brandInfo);
        const response = await callLLM(EXECUTIVE_PROMPT, input);
        const parsed = parseJSONResponse(response);

        if (!validateExecutiveOutput(parsed)) {
            throw new Error('Invalid executive summary output format');
        }

        console.log(`   ✅ Executive Summary done (${Date.now() - startTime}ms)`);
        return {
            sectionId: 'executive',
            sectionName: 'Executive Summary',
            success: true,
            data: parsed,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        console.log(`   ❌ Executive Summary failed: ${error instanceof Error ? error.message : 'Unknown'}`);
        return {
            sectionId: 'executive',
            sectionName: 'Executive Summary',
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

async function processInstagramSection(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo
): Promise<SectionResult<InstagramAuditOutput> | null> {
    if (!shouldRunInstagram(scrapedData)) {
        return null; // Skip if no Instagram data
    }

    const startTime = Date.now();

    try {
        const input = extractInstagramInput(scrapedData.instagram!, brandInfo);
        const response = await callLLM(INSTAGRAM_PROMPT, input);
        const parsed = parseJSONResponse(response);

        if (!validateInstagramOutput(parsed)) {
            throw new Error('Invalid Instagram audit output format');
        }

        return {
            sectionId: 'instagram',
            sectionName: 'Instagram Audit',
            success: true,
            data: parsed,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        console.error('Instagram section error:', error);
        return {
            sectionId: 'instagram',
            sectionName: 'Instagram Audit',
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

async function processAmazonSection(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo
): Promise<SectionResult<AmazonAuditOutput> | null> {
    if (!shouldRunAmazon(scrapedData)) {
        return null; // Skip if no Amazon data
    }

    const startTime = Date.now();

    try {
        const input = extractAmazonInput(scrapedData.amazon!, brandInfo);
        const response = await callLLM(AMAZON_PROMPT, input);
        const parsed = parseJSONResponse(response);

        if (!validateAmazonOutput(parsed)) {
            throw new Error('Invalid Amazon audit output format');
        }

        return {
            sectionId: 'amazon',
            sectionName: 'Amazon Audit',
            success: true,
            data: parsed,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        console.error('Amazon section error:', error);
        return {
            sectionId: 'amazon',
            sectionName: 'Amazon Audit',
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

async function processYouTubeSection(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo
): Promise<SectionResult<YouTubeAuditOutput> | null> {
    if (!shouldRunYouTube(scrapedData)) {
        return null; // Skip if no YouTube data
    }

    const startTime = Date.now();

    try {
        const input = extractYouTubeInput(scrapedData.youtube as YouTubeChannelData, brandInfo);
        const response = await callLLM(YOUTUBE_PROMPT, input);
        const parsed = parseJSONResponse(response);

        if (!validateYouTubeOutput(parsed)) {
            throw new Error('Invalid YouTube audit output format');
        }

        return {
            sectionId: 'youtube',
            sectionName: 'YouTube Audit',
            success: true,
            data: parsed,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        console.error('YouTube section error:', error);
        return {
            sectionId: 'youtube',
            sectionName: 'YouTube Audit',
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

async function processCompetitorsSection(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo,
    ourHandle: string
): Promise<SectionResult<CompetitorAnalysisOutput> | null> {
    if (!shouldRunCompetitors(scrapedData) || !scrapedData.instagram) {
        return null; // Skip if no competitor data
    }

    const startTime = Date.now();

    try {
        const input = extractCompetitorsInput(
            scrapedData.instagram,
            scrapedData.competitors!,
            brandInfo,
            ourHandle
        );
        const response = await callLLM(COMPETITORS_PROMPT, input);
        const parsed = parseJSONResponse(response);

        if (!validateCompetitorsOutput(parsed)) {
            throw new Error('Invalid competitor analysis output format');
        }

        return {
            sectionId: 'competitors',
            sectionName: 'Competitor Analysis',
            success: true,
            data: parsed,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        console.error('Competitors section error:', error);
        return {
            sectionId: 'competitors',
            sectionName: 'Competitor Analysis',
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

async function processRecommendationsSection(
    brandInfo: BrandInfo,
    instagramResult: SectionResult<InstagramAuditOutput> | null,
    amazonResult: SectionResult<AmazonAuditOutput> | null,
    competitorsResult: SectionResult<CompetitorAnalysisOutput> | null,
    websiteAudit: import('../website-audit').WebsiteAuditData | null,
    youtubeResult: SectionResult<YouTubeAuditOutput> | null
): Promise<SectionResult<RecommendationsOutput>> {
    const startTime = Date.now();

    try {
        // Build summary from other sections
        const sectionSummaries: Record<string, { issues: string[]; status: string; gaps: string[] }> = {};
        const availableDataSources: string[] = [];

        if (instagramResult?.success && instagramResult.data) {
            availableDataSources.push('Instagram');
            const ig = instagramResult.data;
            sectionSummaries.instagram = {
                issues: ig.worst_performing_posts?.map(p => p.why_it_failed) || [],
                status: (ig.health_check?.engagement_rate || 0) > 3 ? 'good' :
                    (ig.health_check?.engagement_rate || 0) > 1 ? 'average' : 'poor',
                gaps: ig.recommendations?.map(r => r.action) || [],
            };
        }

        if (amazonResult?.success && amazonResult.data) {
            availableDataSources.push('Amazon');
            const az = amazonResult.data;
            sectionSummaries.amazon = {
                issues: az.review_sentiment?.common_complaints || [],
                status: (az.overview?.avg_rating || 0) > 4 ? 'good' :
                    (az.overview?.avg_rating || 0) > 3.5 ? 'average' : 'poor',
                gaps: az.recommendations?.map(r => r.action) || [],
            };
        }

        if (competitorsResult?.success && competitorsResult.data) {
            availableDataSources.push('Competitors');
            const comp = competitorsResult.data;
            sectionSummaries.competitors = {
                position: comp.market_position?.our_position || 'Unknown',
                threats: comp.competitor_matrix?.map(c => c.content_strength) || [],
                opportunities: comp.white_space_opportunities || [],
            } as unknown as { issues: string[]; status: string; gaps: string[] };
        }

        if (websiteAudit) {
            availableDataSources.push('Website SEO');
            sectionSummaries.website = {
                status: websiteAudit.overallScore > 80 ? 'good' : websiteAudit.overallScore > 60 ? 'average' : 'poor',
                issues: websiteAudit.issues.map(i => i.message).slice(0, 5),
                score: websiteAudit.overallScore
            } as any;
        }



        if (youtubeResult?.success && youtubeResult.data) {
            availableDataSources.push('YouTube');
            sectionSummaries.youtube = {
                status: (youtubeResult.data.channel_health?.overall_score || 0) > 50 ? 'strong' : 'emerging',
                gaps: youtubeResult.data.competitor_opportunity?.content_gaps || []
            } as any;
        }

        const input = extractRecommendationsInput(
            sectionSummaries as Parameters<typeof extractRecommendationsInput>[0],
            brandInfo,
            availableDataSources
        );
        const response = await callLLM(RECOMMENDATIONS_PROMPT, input);
        const parsed = parseJSONResponse(response);

        if (!validateRecommendationsOutput(parsed)) {
            throw new Error('Invalid recommendations output format');
        }

        return {
            sectionId: 'recommendations',
            sectionName: 'Recommendations & Roadmap',
            success: true,
            data: parsed,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        console.error('Recommendations section error:', error);
        return {
            sectionId: 'recommendations',
            sectionName: 'Recommendations & Roadmap',
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

// ============================================
// MAIN RUNNER - Orchestrates all sections
// ============================================

export interface RunnerInput {
    brandInfo: BrandInfo;
    scrapedData: ScrapedData;
    instagramHandle: string;
}

export async function runAllSections(input: RunnerInput): Promise<AuditReport> {
    const startTime = Date.now();
    const { brandInfo, scrapedData, instagramHandle } = input;

    console.log('🚀 Starting section-wise audit processing...');

    // Phase 1: Run data sections in parallel
    console.log('📊 Phase 1: Processing data sections...');
    const [executiveResult, instagramResult, amazonResult, youtubeResult, competitorsResult] = await Promise.all([
        processExecutiveSection(scrapedData, brandInfo),
        processInstagramSection(scrapedData, brandInfo),
        processAmazonSection(scrapedData, brandInfo),
        processYouTubeSection(scrapedData, brandInfo),
        processCompetitorsSection(scrapedData, brandInfo, instagramHandle),
    ]);

    // Log progress
    const phase1Sections = [executiveResult, instagramResult, amazonResult, youtubeResult, competitorsResult].filter(Boolean);
    const phase1Success = phase1Sections.filter(s => s?.success).length;
    console.log(`✅ Phase 1 complete: ${phase1Success}/${phase1Sections.length} sections succeeded`);

    // Phase 2: Run recommendations (depends on other sections)
    console.log('💡 Phase 2: Generating recommendations...');
    const recommendationsResult = await processRecommendationsSection(
        brandInfo,
        instagramResult,
        amazonResult,
        competitorsResult,
        scrapedData.websiteAudit || null,
        youtubeResult
    );

    // Build final report
    const allResults = [executiveResult, instagramResult, amazonResult, youtubeResult, competitorsResult, recommendationsResult];
    const validResults = allResults.filter((r): r is NonNullable<typeof r> => r !== null);
    const successCount = validResults.filter(r => r.success).length;
    const failCount = validResults.filter(r => !r.success).length;

    console.log(`📋 Audit complete: ${successCount} succeeded, ${failCount} failed`);

    return {
        brandInfo,
        generatedAt: new Date().toISOString(),
        sections: {
            executive: executiveResult,
            instagram: instagramResult || undefined,
            amazon: amazonResult || undefined,
            youtube: youtubeResult || undefined,
            competitors: competitorsResult || undefined,
            recommendations: recommendationsResult,
        },
        scrapedData,
        metadata: {
            totalProcessingTime: Date.now() - startTime,
            sectionsRun: validResults.length,
            sectionsSucceeded: successCount,
            sectionsFailed: failCount,
        },
    };
}


// ============================================
// EXPORT FOR EXTERNAL USE
// ============================================

export type { BrandInfo, AuditReport, SectionResult };
