'use client';

import React from 'react';

/**
 * NarrativeSection - Beautifully displays LLM-generated narrative text
 * 
 * Features:
 * - Renders markdown-like text with proper formatting
 * - Handles empty/null values gracefully
 * - Professional consulting-style typography
 * - Expandable for long content
 */

interface NarrativeSectionProps {
    title: string;
    content: string | undefined | null;
    icon?: string;
    accentColor?: string;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}

export function NarrativeSection({
    title,
    content,
    icon = '📝',
    accentColor = '#6366f1',
    collapsible = false,
    defaultCollapsed = false,
}: NarrativeSectionProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

    // Don't render if no content
    if (!content || content.trim() === '') {
        return null;
    }

    // Process content: split into paragraphs and handle basic formatting
    const paragraphs = content.split('\n\n').filter(p => p.trim());

    return (
        <div className="narrative-section" style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
            {/* Header */}
            <div
                className="narrative-header"
                onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: isCollapsed ? 0 : '16px',
                    cursor: collapsible ? 'pointer' : 'default',
                }}
            >
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    flex: 1,
                }}>
                    {title}
                </h3>
                {collapsible && (
                    <span style={{
                        color: '#64748b',
                        fontSize: '0.9rem',
                        transition: 'transform 0.2s',
                        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    }}>
                        ▼
                    </span>
                )}
            </div>

            {/* Content */}
            {!isCollapsed && (
                <div
                    className="narrative-content"
                    style={{
                        borderLeft: `3px solid ${accentColor}`,
                        paddingLeft: '20px',
                        marginLeft: '8px',
                    }}
                >
                    {paragraphs.map((paragraph, index) => (
                        <p
                            key={index}
                            style={{
                                color: '#334155',
                                fontSize: '0.95rem',
                                lineHeight: 1.7,
                                margin: index === paragraphs.length - 1 ? 0 : '0 0 16px 0',
                            }}
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * RecommendationsList - Displays LLM-generated recommendations beautifully
 */
interface Recommendation {
    priority?: string;
    action?: string;
    why?: string;
    expected_outcome?: string;
}

interface RecommendationsListProps {
    title: string;
    recommendations: (string | Recommendation)[];
    icon?: string;
}

export function RecommendationsList({
    title,
    recommendations,
    icon = '💡',
}: RecommendationsListProps) {
    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    const getPriorityColor = (priority?: string) => {
        switch (priority?.toLowerCase()) {
            case 'critical': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#eab308';
            default: return '#22c55e';
        }
    };

    const getPriorityEmoji = (priority?: string) => {
        switch (priority?.toLowerCase()) {
            case 'critical': return '🔴';
            case 'high': return '🟠';
            case 'medium': return '🟡';
            default: return '🟢';
        }
    };

    return (
        <div className="recommendations-section" style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
            }}>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#0f172a',
                }}>
                    {title}
                </h3>
            </div>

            {/* Recommendations List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendations.map((rec, index) => {
                    // Handle both string and object recommendations
                    const isString = typeof rec === 'string';
                    const text = isString ? rec : rec.action;
                    const priority = isString ? undefined : rec.priority;
                    const reason = isString ? undefined : rec.why;
                    const outcome = isString ? undefined : rec.expected_outcome;

                    if (!text) return null;

                    return (
                        <div
                            key={index}
                            style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                padding: '16px',
                                borderLeft: `4px solid ${getPriorityColor(priority)}`,
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>
                                    {priority ? getPriorityEmoji(priority) : `${index + 1}.`}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        margin: 0,
                                        color: '#0f172a',
                                        fontSize: '0.95rem',
                                        fontWeight: 500,
                                        lineHeight: 1.5,
                                    }}>
                                        {text}
                                    </p>
                                    {reason && (
                                        <p style={{
                                            margin: '8px 0 0 0',
                                            color: '#64748b',
                                            fontSize: '0.85rem',
                                            lineHeight: 1.5,
                                        }}>
                                            <strong>Why:</strong> {reason}
                                        </p>
                                    )}
                                    {outcome && (
                                        <p style={{
                                            margin: '4px 0 0 0',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            fontSize: '0.85rem',
                                            lineHeight: 1.5,
                                        }}>
                                            <strong>Expected:</strong> {outcome}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * MetricCard - Displays a single metric with value and label
 */
interface MetricCardProps {
    label: string;
    value: string | number;
    suffix?: string;
    icon?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
}

export function MetricCard({
    label,
    value,
    suffix = '',
    icon,
    trend,
    color = '#6366f1',
}: MetricCardProps) {
    const formatValue = (val: string | number): string => {
        if (typeof val === 'number') {
            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
            return val.toLocaleString();
        }
        return val;
    };

    const getTrendIcon = () => {
        switch (trend) {
            case 'up': return '↗️';
            case 'down': return '↘️';
            default: return '';
        }
    };

    return (
        <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
            {icon && <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>}
            <div style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: color,
                marginBottom: '4px',
            }}>
                {formatValue(value)}{suffix} {getTrendIcon()}
            </div>
            <div style={{
                fontSize: '0.85rem',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            }}>
                {label}
            </div>
        </div>
    );
}

/**
 * ContentPillarCard - Displays content pillar with ideas
 */
interface ContentPillar {
    pillar?: string;
    pillar_name?: string;
    description?: string;
    content_ideas?: string[];
}

interface ContentPillarCardProps {
    pillar: ContentPillar;
    index: number;
}

export function ContentPillarCard({ pillar, index }: ContentPillarCardProps) {
    const name = pillar.pillar || pillar.pillar_name || `Pillar ${index + 1}`;
    const ideas = pillar.content_ideas || [];

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];
    const color = colors[index % colors.length];

    return (
        <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            borderTop: `4px solid ${color}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
            <h4 style={{
                margin: '0 0 8px 0',
                color: color,
                fontSize: '1.1rem',
                fontWeight: 600,
            }}>
                {name}
            </h4>
            {pillar.description && (
                <p style={{
                    margin: '0 0 16px 0',
                    color: '#475569',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                }}>
                    {pillar.description}
                </p>
            )}
            {ideas.length > 0 && (
                <div style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '12px',
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                    }}>
                        Content Ideas
                    </div>
                    <ul style={{
                        margin: 0,
                        padding: '0 0 0 16px',
                        color: '#334155',
                        fontSize: '0.85rem',
                    }}>
                        {ideas.slice(0, 4).map((idea, i) => (
                            <li key={i} style={{ marginBottom: '4px' }}>{idea}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/**
 * ExecutiveSummaryCard - Hero card for executive summary
 */
interface ExecutiveSummaryCardProps {
    grade?: string;
    score?: number;
    narrative?: string;
    oneLiner?: string;
    keyWins?: string[];
    keyChallenges?: string[];
}

export function ExecutiveSummaryCard({
    grade = 'B',
    score = 70,
    narrative,
    oneLiner,
    keyWins = [],
    keyChallenges = [],
}: ExecutiveSummaryCardProps) {
    const getGradeColor = (g: string) => {
        if (g.startsWith('A')) return '#22c55e';
        if (g.startsWith('B')) return '#eab308';
        if (g.startsWith('C')) return '#f97316';
        return '#ef4444';
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
            {/* Grade & Score */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '24px',
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: getGradeColor(grade),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#fff',
                    boxShadow: `0 0 30px ${getGradeColor(grade)}40`,
                }}>
                    {grade}
                </div>
                <div>
                    <div style={{
                        fontSize: '0.85rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '4px',
                    }}>
                        Overall Brand Health
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#0f172a',
                    }}>
                        {score}/100
                    </div>
                </div>
            </div>

            {/* One-liner verdict */}
            {oneLiner && (
                <div style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    borderLeft: '4px solid #6366f1',
                }}>
                    <p style={{
                        margin: 0,
                        color: '#0f172a',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                    }}>
                        "{oneLiner}"
                    </p>
                </div>
            )}

            {/* Narrative */}
            {narrative && (
                <div style={{ marginBottom: '24px' }}>
                    {narrative.split('\n\n').map((para, i) => (
                        <p key={i} style={{
                            color: '#334155',
                            fontSize: '0.95rem',
                            lineHeight: 1.7,
                            margin: i === 0 ? 0 : '16px 0 0 0',
                        }}>
                            {para}
                        </p>
                    ))}
                </div>
            )}

            {/* Wins & Challenges */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
            }}>
                {keyWins.length > 0 && (
                    <div style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}>
                        <div style={{
                            fontSize: '0.8rem',
                            color: '#22c55e',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            marginBottom: '12px',
                        }}>
                            ✅ Key Wins
                        </div>
                        <ul style={{
                            margin: 0,
                            padding: '0 0 0 16px',
                            color: '#334155',
                            fontSize: '0.9rem',
                        }}>
                            {keyWins.slice(0, 4).map((win, i) => (
                                <li key={i} style={{ marginBottom: '8px', lineHeight: 1.4 }}>{win}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {keyChallenges.length > 0 && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}>
                        <div style={{
                            fontSize: '0.8rem',
                            color: '#ef4444',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            marginBottom: '12px',
                        }}>
                            ⚠️ Key Challenges
                        </div>
                        <ul style={{
                            margin: 0,
                            padding: '0 0 0 16px',
                            color: '#334155',
                            fontSize: '0.9rem',
                        }}>
                            {keyChallenges.slice(0, 4).map((challenge, i) => (
                                <li key={i} style={{ marginBottom: '8px', lineHeight: 1.4 }}>{challenge}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * RoadmapCard - Displays 30/90 day roadmap
 */
interface RoadmapCardProps {
    thirtyDayFocus?: string;
    ninetyDayVision?: string;
    strategicSummary?: string;
}

export function RoadmapCard({
    thirtyDayFocus,
    ninetyDayVision,
    strategicSummary,
}: RoadmapCardProps) {
    if (!thirtyDayFocus && !ninetyDayVision && !strategicSummary) {
        return null;
    }

    return (
        <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
            }}>
                <span style={{ fontSize: '1.5rem' }}>🗺️</span>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#0f172a',
                }}>
                    Strategic Roadmap
                </h3>
            </div>

            {strategicSummary && (
                <div style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    borderLeft: '4px solid #6366f1',
                }}>
                    <p style={{
                        margin: 0,
                        color: '#334155',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                    }}>
                        {strategicSummary}
                    </p>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
            }}>
                {thirtyDayFocus && (
                    <div style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}>
                        <div style={{
                            fontSize: '0.8rem',
                            color: '#22c55e',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <span>📅</span> 30-Day Focus
                        </div>
                        <p style={{
                            margin: 0,
                            color: '#334155',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                        }}>
                            {thirtyDayFocus}
                        </p>
                    </div>
                )}
                {ninetyDayVision && (
                    <div style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                    }}>
                        <div style={{
                            fontSize: '0.8rem',
                            color: '#8b5cf6',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <span>🎯</span> 90-Day Vision
                        </div>
                        <p style={{
                            margin: 0,
                            color: '#334155',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                        }}>
                            {ninetyDayVision}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default {
    NarrativeSection,
    RecommendationsList,
    MetricCard,
    ContentPillarCard,
    ExecutiveSummaryCard,
    RoadmapCard,
};
