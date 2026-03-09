/**
 * HYBRID RUNNER - Executes hybrid prompts and handles responses safely
 * 
 * Key Features:
 * 1. Robust JSON parsing with multiple fallback strategies
 * 2. Safe data access - never throws on missing fields
 * 3. Graceful degradation - partial data is still displayed
 * 4. Rich narrative combined with structured metrics
 */

import { ScrapedData } from '../apify-scrapers';
import { BrandInfo } from './types';
import {
    HYBRID_EXECUTIVE_PROMPT,
    HYBRID_INSTAGRAM_PROMPT,
    HYBRID_AMAZON_PROMPT,
    HYBRID_YOUTUBE_PROMPT,
    HYBRID_COMPETITOR_PROMPT,
    HYBRID_RECOMMENDATIONS_PROMPT,
    HybridExecutiveOutput,
    HybridInstagramOutput,
    HybridAmazonOutput,
    HybridYouTubeOutput,
    HybridCompetitorOutput,
    HybridRecommendationsOutput,
    extractHybridExecutiveInput,
    extractHybridInstagramInput,
    extractHybridAmazonInput,
    extractHybridYouTubeInput,
    extractHybridCompetitorInput,
    safeGet,
} from './prompts/hybrid-prompts';

// ============================================
// LLM CONFIGURATION
// ============================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const INSIGHT_PROVIDER = process.env.INSIGHT_PROVIDER || 'gemini';

// ============================================
// LLM CALL WITH ROBUST ERROR HANDLING
// ============================================

async function callLLMSafe(prompt: string, inputData: unknown, sectionName: string): Promise<string> {
    const fullPrompt = prompt
        .replace('{INPUT_DATA}', JSON.stringify(inputData, null, 2))
        .replace(/{brand_name}/g, (inputData as Record<string, unknown>)?.brand_name as string || 'Brand')
        .replace(/{industry}/g, (inputData as Record<string, unknown>)?.industry as string || 'Industry');

    console.log(`  🤖 [${sectionName}] Calling ${INSIGHT_PROVIDER}...`);

    try {
        if (INSIGHT_PROVIDER === 'gemini') {
            if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: fullPrompt }] }],
                        generationConfig: {
                            temperature: 0.2,  // Slightly higher for more natural narratives
                            maxOutputTokens: 8000,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${error.slice(0, 200)}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        }

        // Try Groq
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
                        messages: [{ role: 'user', content: fullPrompt }],
                        temperature: 0.2,
                        max_tokens: 4000,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.choices[0].message.content;
                }
                console.warn(`  ⚠️ [${sectionName}] Groq failed with status ${response.status}, falling back to OpenAI...`);
            } catch (e) {
                console.warn(`  ⚠️ [${sectionName}] Groq fetch failed, falling back to OpenAI...`, e);
            }
        }

        // OpenAI Fallback (gpt-4o-mini)
        if (!OPENAI_API_KEY) throw new Error('Neither GROQ_API_KEY nor OPENAI_API_KEY is configured');

        console.log(`  🤖 [${sectionName}] Calling OpenAI (gpt-4o-mini) fallback...`);
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: fullPrompt }],
                temperature: 0.2,
                max_tokens: 4000,
            }),
        });

        if (!openaiResponse.ok) {
            const error = await openaiResponse.text();
            throw new Error(`OpenAI API error: ${openaiResponse.status} - ${error.slice(0, 200)}`);
        }

        const data = await openaiResponse.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error(`  ❌ [${sectionName}] LLM call failed:`, error);
        throw error;
    }
}

// ============================================
// BULLETPROOF JSON PARSER
// ============================================

function parseJSONSafe(response: string, sectionName: string): Record<string, unknown> {
    let cleaned = response.trim();

    // Step 1: Remove markdown code blocks
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    // Step 2: Try direct parse
    try {
        const parsed = JSON.parse(cleaned);
        console.log(`  ✅ [${sectionName}] JSON parsed successfully`);
        return parsed;
    } catch (e1) {
        console.log(`  ⚠️ [${sectionName}] Direct JSON parse failed, trying extraction...`);
    }

    // Step 3: Extract JSON from response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        let extracted = jsonMatch[0];

        // Fix common issues
        extracted = extracted.replace(/,\s*([}\]])/g, '$1');  // Remove trailing commas
        extracted = extracted.replace(/[\x00-\x1F\x7F]/g, ' ');  // Remove control chars
        extracted = extracted.replace(/\n/g, '\\n');  // Escape newlines in strings properly

        // Try to parse extracted JSON
        try {
            const parsed = JSON.parse(extracted.replace(/\\n/g, '\n'));
            console.log(`  ✅ [${sectionName}] JSON extracted and parsed`);
            return parsed;
        } catch (e2) {
            // Try with newlines as spaces
            try {
                const parsed = JSON.parse(extracted.replace(/\\n/g, ' '));
                console.log(`  ✅ [${sectionName}] JSON parsed with newline substitution`);
                return parsed;
            } catch (e3) {
                console.error(`  ❌ [${sectionName}] All JSON parsing attempts failed`);
            }
        }
    }

    // Step 4: Return a minimal fallback object
    console.log(`  ⚠️ [${sectionName}] Returning fallback object with raw response`);
    return {
        _raw_response: cleaned,
        _parse_error: true,
        narrative: cleaned.slice(0, 2000),  // Use raw text as narrative
    };
}

// ============================================
// HYBRID SECTION RESULT TYPE
// ============================================

export interface HybridSectionResult<T> {
    sectionId: string;
    sectionName: string;
    success: boolean;
    data: T | null;
    rawResponse?: string;  // Keep raw response for debugging
    error?: string;
    processingTime: number;
}

// ============================================
// SECTION PROCESSORS
// ============================================

async function processHybridExecutive(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo
): Promise<HybridSectionResult<HybridExecutiveOutput>> {
    const startTime = Date.now();
    const sectionName = 'Executive Summary';

    console.log(`\n  📊 Processing ${sectionName}...`);

    try {
        const input = extractHybridExecutiveInput(scrapedData, brandInfo);
        const response = await callLLMSafe(HYBRID_EXECUTIVE_PROMPT, input, sectionName);
        const parsed = parseJSONSafe(response, sectionName);

        // Safe extraction with defaults
        const result: HybridExecutiveOutput = {
            overall_grade: safeGet(parsed, 'overall_grade', 'B'),
            executive_narrative: safeGet(parsed, 'executive_narrative',
                `${brandInfo.name} operates in the ${brandInfo.industry} industry with a developing digital presence.`),
            key_wins: safeGet(parsed, 'key_wins', []) as string[],
            key_challenges: safeGet(parsed, 'key_challenges', []) as string[],
            one_liner: safeGet(parsed, 'one_liner', 'A brand with growth potential.'),
        };

        return {
            sectionId: 'executive',
            sectionName,
            success: true,
            data: result,
            rawResponse: response,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        return {
            sectionId: 'executive',
            sectionName,
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

async function processHybridInstagram(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo
): Promise<HybridSectionResult<HybridInstagramOutput> | null> {
    if (!scrapedData.instagram || !scrapedData.instagram.profile.followersCount) {
        return null;
    }

    const startTime = Date.now();
    const sectionName = 'Instagram Analysis';

    console.log(`\n  📸 Processing ${sectionName}...`);

    try {
        const input = extractHybridInstagramInput(scrapedData.instagram, brandInfo);
        const response = await callLLMSafe(HYBRID_INSTAGRAM_PROMPT, input, sectionName);
        const parsed = parseJSONSafe(response, sectionName);

        const result: HybridInstagramOutput = {
            analysis_narrative: safeGet(parsed, 'analysis_narrative',
                'Instagram analysis is being processed...'),
            content_strategy_verdict: safeGet(parsed, 'content_strategy_verdict', ''),
            top_posts_analysis: safeGet(parsed, 'top_posts_analysis', ''),
            improvement_areas: safeGet(parsed, 'improvement_areas', ''),
            recommendations: safeGet(parsed, 'recommendations', []) as string[],
        };

        return {
            sectionId: 'instagram',
            sectionName,
            success: true,
            data: result,
            rawResponse: response,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        return {
            sectionId: 'instagram',
            sectionName,
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

async function processHybridAmazon(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo
): Promise<HybridSectionResult<HybridAmazonOutput> | null> {
    if (!scrapedData.amazon) {
        return null;
    }

    const startTime = Date.now();
    const sectionName = 'Amazon Analysis';

    console.log(`\n  🛒 Processing ${sectionName}...`);

    try {
        const input = extractHybridAmazonInput(scrapedData.amazon, brandInfo);
        const response = await callLLMSafe(HYBRID_AMAZON_PROMPT, input, sectionName);
        const parsed = parseJSONSafe(response, sectionName);

        const result: HybridAmazonOutput = {
            marketplace_narrative: safeGet(parsed, 'marketplace_narrative', ''),
            product_performance: safeGet(parsed, 'product_performance', ''),
            customer_voice: safeGet(parsed, 'customer_voice', ''),
            competitive_position: safeGet(parsed, 'competitive_position', ''),
            recommendations: safeGet(parsed, 'recommendations', []) as string[],
        };

        return {
            sectionId: 'amazon',
            sectionName,
            success: true,
            data: result,
            rawResponse: response,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        return {
            sectionId: 'amazon',
            sectionName,
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

async function processHybridYouTube(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo
): Promise<HybridSectionResult<HybridYouTubeOutput> | null> {
    if (!scrapedData.youtube || !scrapedData.youtube.subscriberCount) {
        return null;
    }

    const startTime = Date.now();
    const sectionName = 'YouTube Analysis';

    console.log(`\n  📺 Processing ${sectionName}...`);

    try {
        const input = extractHybridYouTubeInput(scrapedData.youtube, brandInfo);
        const response = await callLLMSafe(HYBRID_YOUTUBE_PROMPT, input, sectionName);
        const parsed = parseJSONSafe(response, sectionName);

        const result: HybridYouTubeOutput = {
            channel_narrative: safeGet(parsed, 'channel_narrative', ''),
            content_strategy: safeGet(parsed, 'content_strategy', ''),
            audience_sentiment: safeGet(parsed, 'audience_sentiment', ''),
            growth_opportunities: safeGet(parsed, 'growth_opportunities', ''),
            recommendations: safeGet(parsed, 'recommendations', []) as string[],
        };

        return {
            sectionId: 'youtube',
            sectionName,
            success: true,
            data: result,
            rawResponse: response,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        return {
            sectionId: 'youtube',
            sectionName,
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

async function processHybridCompetitors(
    scrapedData: ScrapedData,
    brandInfo: BrandInfo,
    instagramHandle: string
): Promise<HybridSectionResult<HybridCompetitorOutput> | null> {
    if (!scrapedData.competitors || Object.keys(scrapedData.competitors).length === 0) {
        return null;
    }
    if (!scrapedData.instagram) {
        return null;
    }

    const startTime = Date.now();
    const sectionName = 'Competitor Analysis';

    console.log(`\n  ⚔️ Processing ${sectionName}...`);

    try {
        const input = extractHybridCompetitorInput(scrapedData.instagram, scrapedData.competitors, brandInfo);
        const response = await callLLMSafe(HYBRID_COMPETITOR_PROMPT, input, sectionName);
        const parsed = parseJSONSafe(response, sectionName);

        const result: HybridCompetitorOutput = {
            competitive_landscape: safeGet(parsed, 'competitive_landscape', ''),
            positioning_analysis: safeGet(parsed, 'positioning_analysis', ''),
            competitor_insights: safeGet(parsed, 'competitor_insights', ''),
            white_space: safeGet(parsed, 'white_space', ''),
            recommendations: safeGet(parsed, 'recommendations', []) as string[],
        };

        return {
            sectionId: 'competitors',
            sectionName,
            success: true,
            data: result,
            rawResponse: response,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        return {
            sectionId: 'competitors',
            sectionName,
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

async function processHybridRecommendations(
    brandInfo: BrandInfo,
    executiveResult: HybridSectionResult<HybridExecutiveOutput> | null,
    instagramResult: HybridSectionResult<HybridInstagramOutput> | null,
    amazonResult: HybridSectionResult<HybridAmazonOutput> | null,
    youtubeResult: HybridSectionResult<HybridYouTubeOutput> | null,
    competitorResult: HybridSectionResult<HybridCompetitorOutput> | null
): Promise<HybridSectionResult<HybridRecommendationsOutput>> {
    const startTime = Date.now();
    const sectionName = 'Recommendations';

    console.log(`\n  💡 Processing ${sectionName}...`);

    // Compile insights from all sections
    const insights: Record<string, unknown> = {
        brand_name: brandInfo.name,
        industry: brandInfo.industry,
    };

    if (executiveResult?.data) {
        insights.executive_summary = {
            grade: executiveResult.data.overall_grade,
            wins: executiveResult.data.key_wins,
            challenges: executiveResult.data.key_challenges,
        };
    }

    if (instagramResult?.data) {
        insights.instagram_insights = {
            key_analysis: instagramResult.data.analysis_narrative?.slice(0, 500),
            improvements_needed: instagramResult.data.improvement_areas,
        };
    }

    if (amazonResult?.data) {
        insights.amazon_insights = {
            marketplace_status: amazonResult.data.marketplace_narrative?.slice(0, 300),
            customer_feedback: amazonResult.data.customer_voice?.slice(0, 300),
        };
    }

    if (youtubeResult?.data) {
        insights.youtube_insights = {
            channel_status: youtubeResult.data.channel_narrative?.slice(0, 300),
            growth_areas: youtubeResult.data.growth_opportunities?.slice(0, 300),
        };
    }

    if (competitorResult?.data) {
        insights.competitive_insights = {
            positioning: competitorResult.data.positioning_analysis?.slice(0, 300),
            opportunities: competitorResult.data.white_space?.slice(0, 300),
        };
    }

    try {
        const response = await callLLMSafe(HYBRID_RECOMMENDATIONS_PROMPT, insights, sectionName);
        const parsed = parseJSONSafe(response, sectionName);

        // Extract priority actions with safe defaults
        const rawActions = safeGet(parsed, 'priority_actions', []) as unknown[];
        const priorityActions = rawActions.map((action: unknown) => {
            const a = action as Record<string, unknown>;
            return {
                priority: (safeGet(a, 'priority', 'medium') as string) as 'critical' | 'high' | 'medium',
                action: safeGet(a, 'action', ''),
                why: safeGet(a, 'why', ''),
                expected_outcome: safeGet(a, 'expected_outcome', ''),
            };
        }).filter(a => a.action);  // Remove empty actions

        // Extract content pillars
        const rawPillars = safeGet(parsed, 'content_pillars', []) as unknown[];
        const contentPillars = rawPillars.map((pillar: unknown) => {
            const p = pillar as Record<string, unknown>;
            return {
                pillar_name: safeGet(p, 'pillar_name', ''),
                description: safeGet(p, 'description', ''),
                content_ideas: safeGet(p, 'content_ideas', []) as string[],
            };
        }).filter(p => p.pillar_name);

        const result: HybridRecommendationsOutput = {
            strategic_summary: safeGet(parsed, 'strategic_summary',
                `Focus on building a stronger digital presence for ${brandInfo.name}.`),
            priority_actions: priorityActions,
            content_pillars: contentPillars,
            thirty_day_focus: safeGet(parsed, 'thirty_day_focus', ''),
            ninety_day_vision: safeGet(parsed, 'ninety_day_vision', ''),
        };

        return {
            sectionId: 'recommendations',
            sectionName,
            success: true,
            data: result,
            rawResponse: response,
            processingTime: Date.now() - startTime,
        };
    } catch (error) {
        return {
            sectionId: 'recommendations',
            sectionName,
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}

// ============================================
// HYBRID AUDIT REPORT
// ============================================

export interface HybridAuditReport {
    brandInfo: BrandInfo;
    generatedAt: string;
    sections: {
        executive: HybridSectionResult<HybridExecutiveOutput> | null;
        instagram: HybridSectionResult<HybridInstagramOutput> | null;
        amazon: HybridSectionResult<HybridAmazonOutput> | null;
        youtube: HybridSectionResult<HybridYouTubeOutput> | null;
        competitors: HybridSectionResult<HybridCompetitorOutput> | null;
        recommendations: HybridSectionResult<HybridRecommendationsOutput> | null;
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
// MAIN RUNNER
// ============================================

export interface HybridRunnerInput {
    brandInfo: BrandInfo;
    scrapedData: ScrapedData;
    instagramHandle: string;
}

export async function runHybridAudit(input: HybridRunnerInput): Promise<HybridAuditReport> {
    const startTime = Date.now();
    const { brandInfo, scrapedData, instagramHandle } = input;

    console.log('\n🚀 Starting HYBRID Audit Processing...');
    console.log(`   Brand: ${brandInfo.name}`);
    console.log(`   Industry: ${brandInfo.industry}`);

    // Phase 1: Run sections in parallel
    console.log('\n📊 Phase 1: Processing all data sections...');
    const [executiveResult, instagramResult, amazonResult, youtubeResult, competitorResult] = await Promise.all([
        processHybridExecutive(scrapedData, brandInfo),
        processHybridInstagram(scrapedData, brandInfo),
        processHybridAmazon(scrapedData, brandInfo),
        processHybridYouTube(scrapedData, brandInfo),
        processHybridCompetitors(scrapedData, brandInfo, instagramHandle),
    ]);

    // Log Phase 1 results
    const phase1Results = [executiveResult, instagramResult, amazonResult, youtubeResult, competitorResult].filter(Boolean);
    const phase1Success = phase1Results.filter(r => r?.success).length;
    console.log(`\n✅ Phase 1 Complete: ${phase1Success}/${phase1Results.length} sections succeeded`);

    // Phase 2: Generate recommendations based on Phase 1 insights
    console.log('\n💡 Phase 2: Generating strategic recommendations...');
    const recommendationsResult = await processHybridRecommendations(
        brandInfo,
        executiveResult,
        instagramResult,
        amazonResult,
        youtubeResult,
        competitorResult
    );

    // Build final report
    const allResults = [executiveResult, instagramResult, amazonResult, youtubeResult, competitorResult, recommendationsResult];
    const validResults = allResults.filter(Boolean);
    const successCount = validResults.filter(r => r?.success).length;
    const failCount = validResults.filter(r => r && !r.success).length;

    const report: HybridAuditReport = {
        brandInfo,
        generatedAt: new Date().toISOString(),
        sections: {
            executive: executiveResult,
            instagram: instagramResult,
            amazon: amazonResult,
            youtube: youtubeResult,
            competitors: competitorResult,
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

    console.log(`\n🎉 HYBRID Audit Complete!`);
    console.log(`   Total time: ${Math.round(report.metadata.totalProcessingTime / 1000)}s`);
    console.log(`   Sections: ${successCount} succeeded, ${failCount} failed`);

    return report;
}

export type { BrandInfo, HybridExecutiveOutput, HybridInstagramOutput, HybridAmazonOutput, HybridYouTubeOutput, HybridCompetitorOutput, HybridRecommendationsOutput };
