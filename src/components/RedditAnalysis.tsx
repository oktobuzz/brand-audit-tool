'use client';

import { RedditData } from '@/lib/reddit';

interface RedditAnalysisProps {
    data: RedditData;
}

export default function RedditAnalysis({ data }: RedditAnalysisProps) {
    if (!data || !data.summary) return null;

    const { summary } = data;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">💬</span> Reddit Community Insights
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${summary.sentimentIndicator === 'positive' ? 'bg-green-100 text-green-700' :
                    summary.sentimentIndicator === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {summary.sentimentIndicator.charAt(0).toUpperCase() + summary.sentimentIndicator.slice(1)} Sentiment
                </span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="text-sm text-orange-600 mb-1">Total Mentions</div>
                    <div className="text-2xl font-bold text-orange-900">{summary.totalMentions}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">Total Comments</div>
                    <div className="text-2xl font-bold text-blue-900">{summary.totalComments}</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-sm text-purple-600 mb-1">Avg. Upvotes</div>
                    <div className="text-2xl font-bold text-purple-900">{summary.averageScore}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-sm text-slate-600 mb-1">Active Subreddits</div>
                    <div className="text-2xl font-bold text-slate-900">{summary.topSubreddits.length}</div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Top Discussions */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Top Discussions
                    </h3>
                    <div className="space-y-3">
                        {summary.topPosts.slice(0, 5).map((post, i) => (
                            <a
                                key={i}
                                href={post.url.startsWith('http') ? post.url : `https://reddit.com${post.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
                            >
                                <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600 line-clamp-2 mb-1">
                                    {post.title}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="font-medium text-orange-600">{post.subreddit}</span>
                                    <span>⬆️ {post.score} upvotes</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Top Communities */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Top Communities
                    </h3>
                    <div className="space-y-3">
                        {summary.topSubreddits.map((sub, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="font-medium text-slate-700">{sub.name}</span>
                                <span className="bg-white px-2 py-1 rounded text-xs font-medium text-slate-600 border border-slate-200">
                                    {sub.count} mentions
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
