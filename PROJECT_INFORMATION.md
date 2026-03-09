# Brand Audit Tool - Project Documentation

## Overview

This is a **Brand Intelligence Audit Tool** that automatically scrapes data from multiple platforms (Instagram, YouTube, Amazon, Google Trends, Website) and uses AI (LLM) to generate comprehensive brand analysis reports with actionable insights.

---

## How The Project Works (Flow)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           USER FLOW                                          │
└──────────────────────────────────────────────────────────────────────────────┘

1. USER fills the form at http://localhost:3000
   ├── Brand Name: "Minimalist"
   ├── Industry: "Skincare"
   ├── Instagram: @beminimalist
   ├── Website URL: https://minimalist.co
   ├── YouTube URL: https://youtube.com/@minimalist (optional)
   ├── Amazon URL: Search URL (optional)
   ├── Competitors: @mamaearth, @plum_goodness (optional)
   └── Toggle: Google Trends, Website Audit

2. USER clicks "Generate Audit"

3. FRONTEND sends request to /api/audit

4. BACKEND processes in phases:

   ┌─────────────────────────────────────────────────────────────────┐
   │  PHASE 1: DATA SCRAPING (Parallel)                             │
   │  ├── Instagram Scraper (Apify) ────────► Profile + Posts       │
   │  ├── Amazon Scraper (Apify) ───────────► Products + Reviews    │
   │  ├── YouTube Scraper (Google API) ─────► Channel + Videos      │
   │  ├── Google Trends Scraper (Apify) ────► Search Interest       │
   │  ├── Website Audit (Apify) ────────────► SEO Scores            │
   │  └── Competitor Scrapers (Apify) ──────► Competitor Profiles   │
   └─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │  PHASE 2: LLM PROCESSING (Section-wise, Parallel)              │
   │  ├── Executive Section ─────► LLM Call 1 ──► Summary           │
   │  ├── Instagram Section ─────► LLM Call 2 ──► Social Analysis   │
   │  ├── Amazon Section ────────► LLM Call 3 ──► Marketplace       │
   │  ├── YouTube Section ───────► LLM Call 4 ──► Video Strategy    │
   │  └── Competitors Section ───► LLM Call 5 ──► Gap Analysis      │
   │                                                                 │
   │  PHASE 3: Recommendations (Depends on above)                    │
   │  └── Recommendations ───────► LLM Call 6 ──► Action Items      │
   └─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │  PHASE 4: COMBINE & RETURN                                      │
   │  ├── Raw scraped data (for charts)                             │
   │  ├── LLM-generated insights                                     │
   │  └── Transformed to dashboard format                            │
   └─────────────────────────────────────────────────────────────────┘

5. FRONTEND receives response and displays DASHBOARD
   ├── Health Score Circle
   ├── Executive Summary
   ├── Instagram Metrics + Charts
   ├── YouTube Stats + Video Tables
   ├── Google Trends Charts
   ├── Website Audit Gauges
   ├── SWOT Analysis
   └── Action Items
```

---

## Project Structure

```
brand-audit-tool/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main page (Form + Dashboard)
│   │   ├── globals.css                 # Global styles
│   │   └── api/
│   │       └── audit/
│   │           └── route.ts            # API endpoint (/api/audit)
│   │
│   ├── components/
│   │   ├── AuditForm.tsx               # Input form with toggles
│   │   ├── AuditDashboard.tsx          # Results dashboard (~2800 lines)
│   │   └── ExportButtons.tsx           # PPT/JSON export
│   │
│   ├── lib/
│   │   ├── apify-scrapers.ts           # Instagram, Amazon, Competitors, SEO
│   │   ├── youtube-scraper.ts          # YouTube Data API scraper
│   │   ├── google-trends.ts            # Google Trends (Apify)
│   │   ├── website-audit.ts            # Website SEO Audit (Apify)
│   │   ├── prompts.ts                  # Legacy LLM prompts
│   │   │
│   │   └── audit-sections/             # Section-wise LLM processing
│   │       ├── runner.ts               # Orchestrates all sections
│   │       ├── types.ts                # TypeScript types
│   │       └── prompts/
│   │           ├── executive.ts        # Executive summary prompt
│   │           ├── instagram.ts        # Instagram analysis prompt
│   │           ├── amazon.ts           # Amazon analysis prompt
│   │           ├── youtube.ts          # YouTube analysis prompt
│   │           ├── competitors.ts      # Competitor analysis prompt
│   │           └── recommendations.ts  # Action items prompt
│   │
│   └── types/
│       └── audit.ts                    # All TypeScript interfaces
│
├── .env.local                          # API keys (SECRET!)
├── package.json                        # Dependencies
└── PROJECT_INFORMATION.md              # This file
```

---

## API Keys Required

| Key | Provider | Cost | How to Get |
|-----|----------|------|------------|
| `APIFY_API_TOKEN` | Apify | Pay per use (~$5 free) | https://console.apify.com/account/integrations |
| `GROQ_API_KEY` | Groq | **FREE** | https://console.groq.com/keys |
| `YOUTUBE_API_KEY` | Google Cloud | **FREE** (10K/day) | https://console.cloud.google.com/apis/credentials |
| `GEMINI_API_KEY` | Google AI | Optional | https://aistudio.google.com/app/apikey |

---

## Data Sources & Scrapers

### 1. Instagram Scraper (`apify-scrapers.ts`)
- **Actor:** `apify/instagram-profile-scraper`
- **Cost:** ~$0.04 per profile
- **Data Collected:**
  - Profile: followers, following, posts count, verified status
  - Posts: last 30 posts with likes, comments, views
  - Comments: text for sentiment analysis

### 2. Amazon Scraper (`apify-scrapers.ts`)
- **Actor:** `junglee/amazon-scraper`
- **Cost:** ~$0.02 per search
- **Data Collected:**
  - Products: title, price, rating, reviews count
  - Reviews: text, rating, helpful votes

### 3. YouTube Scraper (`youtube-scraper.ts`)
- **API:** YouTube Data API v3 (googleapis npm)
- **Cost:** **FREE** (10,000 quota units/day)
- **Data Collected:**
  - Channel: subscribers, total views, video count
  - Videos: last 20 videos with views, likes, comments
  - Comments: last 30 comments from top videos

### 4. Google Trends Scraper (`google-trends.ts`)
- **Actor:** `emastra/google-trends-scraper` (Apify)
- **Cost:** ~$0.05 per search
- **Data Collected:**
  - Interest over time (12 months)
  - Interest by region (top states)
  - Related queries (top + rising)

### 5. Website Audit (`website-audit.ts`)
- **Actor:** `jancurn/website-seo-auditor` (Apify)
- **Cost:** ~$0.10 per website
- **Data Collected:**
  - Scores: Overall, Performance, SEO, Accessibility
  - Core Web Vitals: LCP, FID, CLS
  - Issues: List of problems found

### 6. Competitor Scraper
- Uses same Instagram scraper for competitor profiles
- **Cost:** ~$0.04 per competitor

---

## Formulas Used

### Instagram Engagement Rate
**File:** `src/lib/apify-scrapers.ts` (line ~280)
```
Engagement Rate = (Total Likes + Total Comments) / (Followers × Posts Analyzed) × 100
```

### YouTube Engagement Rate
**File:** `src/lib/youtube-scraper.ts` (line ~263)
```
Engagement Rate = (Total Likes + Total Comments) / Total Views × 100
```
Example: If 20 videos have 100,000 total likes + 5,000 comments and 2,000,000 total views:
- Engagement = (100,000 + 5,000) / 2,000,000 × 100 = 5.25%

### YouTube Shorts Percentage
**File:** `src/lib/youtube-scraper.ts` (line ~279)
```
Shorts % = (Number of Shorts) / (Total Videos Analyzed) × 100
```
Shorts are videos < 60 seconds duration.

### YouTube Uploads Per Week
**File:** `src/lib/youtube-scraper.ts` (line ~233)
```
Uploads/Week = (Videos Analyzed) / (Days between oldest and newest video) × 7
```

### Instagram Content Breakdown
**File:** `src/lib/apify-scrapers.ts` (line ~250)
```
Reels % = Number of Reels / Total Posts × 100
Carousels % = Number of Carousels / Total Posts × 100
Images % = Number of Single Images / Total Posts × 100
```

### Sentiment Analysis (Keyword-based)
**File:** `src/lib/apify-scrapers.ts` (line ~310)
```
Positive: Contains words like "love", "amazing", "great", "best", "awesome"
Negative: Contains words like "bad", "worst", "hate", "terrible", "poor"
Neutral: Everything else
```

### Social Media Score
**File:** `src/app/api/audit/route.ts` (line ~545)
```
If engagement > 5%: Score = 90
If engagement > 3%: Score = 80
If engagement > 1%: Score = 60
Otherwise: Score = 40
```

### Marketplace Score
**File:** `src/app/api/audit/route.ts` (line ~565)
```
If avg rating >= 4.5: Score = 90
If avg rating >= 4.0: Score = 80
If avg rating >= 3.5: Score = 65
Otherwise: Score = 50
```

### Overall Health Score
**File:** `src/app/api/audit/route.ts` (line ~507)
Calculated by LLM based on overall performance. Mapped from letter grade:
```
A+ = 95, A = 90, B+ = 80, B = 70, C = 60, D = 50, F = 40
```

---

## LLM Section-wise Processing

Instead of sending all data to LLM at once (which causes hallucination), we split into focused sections:

### Section 1: Executive Summary
**Prompt File:** `src/lib/audit-sections/prompts/executive.ts`
**Input:** Brand info + summary of all scraped data
**Output:**
- Overall score (A+, A, B+, B, C, D, F)
- Brand overview paragraph
- Top 3 wins
- Top 3 failures
- One-line verdict

### Section 2: Instagram Audit
**Prompt File:** `src/lib/audit-sections/prompts/instagram.ts`
**Input:** Instagram profile + posts + comments
**Output:**
- Health check (engagement rate, follower growth)
- Content analysis (format breakdown, buckets)
- Top/worst performing posts with reasons
- Sentiment analysis with themes
- Recommendations

### Section 3: Amazon Audit
**Prompt File:** `src/lib/audit-sections/prompts/amazon.ts`
**Input:** Products + reviews
**Output:**
- Product overview (ratings, price range)
- Review sentiment (positive/negative themes)
- Competitive pricing analysis
- Recommendations

### Section 4: YouTube Audit
**Prompt File:** `src/lib/audit-sections/prompts/youtube.ts`
**Input:** Channel stats + videos + comments
**Output:**
- Channel health score
- Content analysis (shorts vs long-form)
- Audience sentiment from comments
- Content gaps and opportunities
- Recommendations

### Section 5: Competitor Analysis
**Prompt File:** `src/lib/audit-sections/prompts/competitors.ts`
**Input:** Our Instagram + competitor Instagram data
**Output:**
- Competitor matrix (followers, engagement)
- Market position analysis
- Content comparison
- White space opportunities

### Section 6: Recommendations
**Prompt File:** `src/lib/audit-sections/prompts/recommendations.ts`
**Input:** Summary of all previous sections
**Output:**
- Priority actions (ranked)
- Content pillars with ideas
- 90-day roadmap
- Quick wins

---

## Dashboard Sections

### What Needs LLM (AI Analysis)
| Section | Why |
|---------|-----|
| Executive Summary | Needs AI to interpret and summarize |
| Instagram Insights | Needs AI to analyze content strategy |
| Amazon Review Analysis | Needs AI to extract themes from reviews |
| YouTube Content Strategy | Needs AI for content recommendations |
| Competitor Gap Analysis | Needs AI to compare and find opportunities |
| SWOT | Needs AI to synthesize all data |
| Action Items | Needs AI to prioritize recommendations |

### What Displays Directly (No LLM)
| Section | Why |
|---------|-----|
| YouTube Stats (subscribers, views) | Just numbers |
| YouTube Video Tables | Just data listing |
| YouTube Comments Heatmap | Keyword-based sentiment |
| Google Trends Charts | Just numbers |
| Website Audit Gauges | Just scores |
| Instagram Raw Metrics | Just numbers |

---

## Cost Per Audit

| Scraper | Typical Cost |
|---------|--------------|
| Instagram | ~$0.04 |
| Amazon (if enabled) | ~$0.02 |
| 2 Competitors (if enabled) | ~$0.08 |
| YouTube | **FREE** |
| Google Trends (if enabled) | ~$0.05 |
| Website Audit (if enabled) | ~$0.10 |
| LLM (Groq) | **FREE** |
| **TOTAL (all features)** | **~$0.29** |

---

## How to Run

1. Install dependencies:
```bash
npm install
```

2. Add API keys to `.env.local`:
```
APIFY_API_TOKEN=your_apify_token
GROQ_API_KEY=your_groq_key
YOUTUBE_API_KEY=your_youtube_key
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:3000

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main page that shows form or dashboard |
| `src/app/api/audit/route.ts` | API endpoint that orchestrates everything |
| `src/lib/apify-scrapers.ts` | All Apify scrapers (Instagram, Amazon, etc.) |
| `src/lib/youtube-scraper.ts` | YouTube API scraper |
| `src/lib/audit-sections/runner.ts` | Section-wise LLM orchestrator |
| `src/components/AuditDashboard.tsx` | Dashboard UI (~2800 lines) |
| `src/types/audit.ts` | All TypeScript interfaces |

---

## Troubleshooting

### YouTube Engagement is 0
- Check if videos are being fetched (look at video tables)
- Check terminal for debug logs showing the calculation
- Formula: (totalLikes + totalComments) / totalViews × 100

### Google Trends not showing
- Ensure `enableGoogleTrends` is true in form
- Check Apify token has credits
- Check terminal for "Google Trends scrape error"

### LLM returning errors
- Check GROQ_API_KEY is valid
- Check terminal for "LLM API error"
- Free tier has rate limits

### Instagram scraper failing
- Check Apify token has credits
- Username must be valid (no @ symbol passed)
- Check if account is private

---

## Future Improvements

1. **LinkedIn Scraper** - Add LinkedIn company page analysis
2. **Facebook Ads** - Add Meta Ad Library scraping
3. **Twitter/X** - Add Twitter analytics
4. **PDF Export** - Better PDF reports
5. **Historical Tracking** - Save audits to database
6. **Competitor Auto-Discovery** - Find competitors automatically

---

*Last Updated: December 12, 2024*
