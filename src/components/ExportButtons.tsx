'use client';

import type { AuditReport } from '@/types/audit';
/* eslint-disable @typescript-eslint/no-explicit-any */
import PptxGenJS from 'pptxgenjs';

interface ExportButtonsProps {
    report: AuditReport;
}

export default function ExportButtons({ report }: ExportButtonsProps) {

    const exportToPPT = async () => {
        const pptx = new PptxGenJS();
        pptx.title = `${report.brandInput.brand} - Brand Intelligence Audit`;
        pptx.author = 'Brand Audit Tool';

        // Title Slide
        const slide1 = pptx.addSlide();
        slide1.background = { color: '0f0f1a' };
        slide1.addText(`${report.brandInput.brand}`, {
            x: 0.5, y: 2.5, w: 9, h: 1,
            fontSize: 44, color: 'FFFFFF', bold: true, align: 'center',
        });
        slide1.addText('Brand Intelligence Audit Report', {
            x: 0.5, y: 3.5, w: 9, h: 0.5,
            fontSize: 24, color: '94a3b8', align: 'center',
        });
        slide1.addText(`Generated: ${new Date(report.generatedAt).toLocaleDateString()}`, {
            x: 0.5, y: 4.2, w: 9, h: 0.4,
            fontSize: 14, color: '64748b', align: 'center',
        });

        // Executive Summary Slide
        const slide2 = pptx.addSlide();
        slide2.background = { color: '0f0f1a' };
        slide2.addText('Executive Summary', {
            x: 0.5, y: 0.5, w: 9, h: 0.6,
            fontSize: 28, color: 'FFFFFF', bold: true,
        });

        // Health Score
        const healthScore = report.summary?.overall_health_score || 0;
        slide2.addText(`Health Score: ${healthScore}/100`, {
            x: 0.5, y: 1.3, w: 4, h: 0.5,
            fontSize: 18, color: healthScore >= 70 ? '10b981' : healthScore >= 40 ? 'f59e0b' : 'ef4444', bold: true,
        });

        // Overview
        slide2.addText(report.summary?.brand_overview || 'No overview available', {
            x: 0.5, y: 2, w: 9, h: 1,
            fontSize: 14, color: '94a3b8',
        });

        // Executive bullets
        const bullets = report.summary?.executive_summary_bullets || [];
        bullets.slice(0, 5).forEach((bullet, idx) => {
            slide2.addText(`• ${bullet}`, {
                x: 0.5, y: 3.2 + idx * 0.6, w: 9, h: 0.5,
                fontSize: 12, color: 'e2e8f0',
            });
        });

        // Social Media Slide
        if (report.social_media_audit) {
            const slide3 = pptx.addSlide();
            slide3.background = { color: '0f0f1a' };
            slide3.addText('Social Media Audit', {
                x: 0.5, y: 0.5, w: 9, h: 0.6,
                fontSize: 28, color: 'FFFFFF', bold: true,
            });

            const metrics = report.social_media_audit.engagement_analysis?.metrics;
            if (metrics) {
                const tableData: any = [
                    ['Metric', 'Value'],
                    ['Followers', metrics.followers?.toLocaleString() || 'N/A'],
                    ['Avg Likes', metrics.avg_likes_per_post?.toLocaleString() || 'N/A'],
                    ['Avg Comments', metrics.avg_comments_per_post?.toLocaleString() || 'N/A'],
                    ['Engagement Rate', `${(metrics.engagement_rate_percentage || 0).toFixed(2)}%`],
                ];

                slide3.addTable(tableData, {
                    x: 0.5, y: 1.5, w: 4, h: 2,
                    fontSize: 12,
                    color: 'e2e8f0',
                    fill: { color: '1e1e2e' },
                    border: { type: 'solid', color: '374151', pt: 1 },
                });
            }

            // Insights
            const insights = report.social_media_audit.engagement_analysis?.insights || [];
            insights.slice(0, 3).forEach((insight, idx) => {
                slide3.addText(`• ${insight}`, {
                    x: 5, y: 1.5 + idx * 0.6, w: 4.5, h: 0.5,
                    fontSize: 11, color: '94a3b8',
                });
            });
        }

        // SWOT Slide
        if (report.swot) {
            const slide4 = pptx.addSlide();
            slide4.background = { color: '0f0f1a' };
            slide4.addText('SWOT Analysis', {
                x: 0.5, y: 0.5, w: 9, h: 0.6,
                fontSize: 28, color: 'FFFFFF', bold: true,
            });

            // Strengths
            slide4.addText('Strengths', { x: 0.5, y: 1.3, w: 4, h: 0.4, fontSize: 16, color: '10b981', bold: true });
            (report.swot.strengths || []).slice(0, 3).forEach((item, idx) => {
                slide4.addText(`• ${item.point}`, {
                    x: 0.5, y: 1.8 + idx * 0.4, w: 4, h: 0.4, fontSize: 10, color: 'e2e8f0',
                });
            });

            // Weaknesses
            slide4.addText('Weaknesses', { x: 5, y: 1.3, w: 4, h: 0.4, fontSize: 16, color: 'ef4444', bold: true });
            (report.swot.weaknesses || []).slice(0, 3).forEach((item, idx) => {
                slide4.addText(`• ${item.point}`, {
                    x: 5, y: 1.8 + idx * 0.4, w: 4, h: 0.4, fontSize: 10, color: 'e2e8f0',
                });
            });

            // Opportunities
            slide4.addText('Opportunities', { x: 0.5, y: 3.5, w: 4, h: 0.4, fontSize: 16, color: '06b6d4', bold: true });
            (report.swot.opportunities || []).slice(0, 3).forEach((item, idx) => {
                slide4.addText(`• ${item.point}`, {
                    x: 0.5, y: 4 + idx * 0.4, w: 4, h: 0.4, fontSize: 10, color: 'e2e8f0',
                });
            });

            // Threats
            slide4.addText('Threats', { x: 5, y: 3.5, w: 4, h: 0.4, fontSize: 16, color: 'f59e0b', bold: true });
            (report.swot.threats || []).slice(0, 3).forEach((item, idx) => {
                slide4.addText(`• ${item.point}`, {
                    x: 5, y: 4 + idx * 0.4, w: 4, h: 0.4, fontSize: 10, color: 'e2e8f0',
                });
            });
        }

        // Action Items Slide
        if (report.action_items && report.action_items.length > 0) {
            const slide5 = pptx.addSlide();
            slide5.background = { color: '0f0f1a' };
            slide5.addText('Top Action Items', {
                x: 0.5, y: 0.5, w: 9, h: 0.6,
                fontSize: 28, color: 'FFFFFF', bold: true,
            });

            report.action_items.slice(0, 6).forEach((item, idx) => {
                const impactColor = item.expected_impact === 'high' ? '10b981' : item.expected_impact === 'medium' ? 'f59e0b' : '94a3b8';
                slide5.addText(`#${item.priority} ${item.title}`, {
                    x: 0.5, y: 1.3 + idx * 0.8, w: 9, h: 0.4,
                    fontSize: 14, color: 'FFFFFF', bold: true,
                });
                slide5.addText(`${item.description}`, {
                    x: 0.5, y: 1.65 + idx * 0.8, w: 8, h: 0.35,
                    fontSize: 10, color: '94a3b8',
                });
                slide5.addText(`${item.expected_impact} impact | ${item.timeframe?.replace('_', ' ')}`, {
                    x: 8, y: 1.3 + idx * 0.8, w: 1.5, h: 0.3,
                    fontSize: 8, color: impactColor,
                });
            });
        }

        // Save the file
        await pptx.writeFile({ fileName: `${report.brandInput.brand}_Brand_Audit.pptx` });
    };

    const exportToJSON = () => {
        const dataStr = JSON.stringify(report, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.brandInput.brand}_Brand_Audit.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToPDF = () => {
        window.print();
    };

    return (
        <div className="export-buttons">
            <button onClick={exportToPDF} className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
                Export PDF
            </button>
            <button onClick={exportToPPT} className="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export PPT
            </button>
            <button onClick={exportToJSON} className="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
                Export JSON
            </button>

            <style jsx>{`
                .export-buttons {
                    display: flex;
                    gap: var(--space-3);
                }
            `}</style>
        </div>
    );
}
