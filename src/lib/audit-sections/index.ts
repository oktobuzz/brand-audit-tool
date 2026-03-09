/**
 * Audit Sections - Main Export
 * 
 * This module provides a modular, section-wise audit system.
 * Each section is processed independently for better accuracy and less hallucination.
 * 
 * To add a new section:
 * 1. Create a new prompt file in ./prompts/
 * 2. Add the section type to ./types.ts
 * 3. Add the processor to ./runner.ts
 * 4. Export from this file
 */

// Types
export * from './types';

// Runner
export { runAllSections, type RunnerInput } from './runner';

// Individual section prompts (for customization)
export {
    EXECUTIVE_PROMPT,
    extractExecutiveInput,
    validateExecutiveOutput,
} from './prompts/executive';

export {
    INSTAGRAM_PROMPT,
    extractInstagramInput,
    shouldRunInstagram,
    validateInstagramOutput,
} from './prompts/instagram';

export {
    AMAZON_PROMPT,
    extractAmazonInput,
    shouldRunAmazon,
    validateAmazonOutput,
} from './prompts/amazon';

export {
    COMPETITORS_PROMPT,
    extractCompetitorsInput,
    shouldRunCompetitors,
    validateCompetitorsOutput,
} from './prompts/competitors';

export {
    RECOMMENDATIONS_PROMPT,
    extractRecommendationsInput,
    validateRecommendationsOutput,
} from './prompts/recommendations';
