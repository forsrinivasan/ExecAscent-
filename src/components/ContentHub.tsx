import React, { useState } from 'react';
import {
  Play,
  FileText,
  ThumbsUp,
  Bookmark,
  MessageSquare,
  Shield,
  Plus,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';
import type { ContentPost, CommentItem, UserRole } from '../types/index.ts';
import { useExecutiveTheme } from '../theme/ThemeContext.tsx';
import { BOARDROOM_HERO_IMAGE } from '../data/mockData.ts';

interface ContentHubProps {
  posts: ContentPost[];
  comments: CommentItem[];
  currentUserNickname: string;
  currentUserId: string;
  currentUserRole: UserRole;
  onPostSubmit: (post: ContentPost) => void;
  onAddComment: (comment: CommentItem) => void;
  onToggleUpvote: (postId: string) => void;
  onToggleSave: (postId: string) => void;
}

export const ContentHub: React.FC<ContentHubProps> = ({
  posts,
  comments,
  currentUserNickname,
  currentUserId,
  currentUserRole,
  onPostSubmit,
  onAddComment,
  onToggleUpvote,
  onToggleSave,
}) => {
  const { theme, themeConfig } = useExecutiveTheme();
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'REELS' | 'ARTICLES'>('ALL');
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New post submission state
  const [newPostType, setNewPostType] = useState<'REEL' | 'ARTICLE'>('REEL');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTags, setNewTags] = useState('#Behavioral, #ExecutivePresence');
  const [newMediaUrl, setNewMediaUrl] = useState(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );

  // Comment input
  const [commentInput, setCommentInput] = useState('');

  const tagsList = ['ALL', '#Behavioral', '#Situational', '#ExecutivePresence', '#HRRound', '#Leadership'];

  // Filter posts (only APPROVED posts show publicly, plus author's own PENDING posts)
  const visiblePosts = posts.filter((p) => {
    const isApproved = p.status === 'APPROVED';
    const isMyPending = p.authorId === currentUserId && p.status === 'PENDING_APPROVAL';
    const isAdmin = currentUserRole === 'ADMIN';

    if (!isApproved && !isMyPending && !isAdmin) return false;

    if (activeTab === 'REELS' && p.type !== 'REEL') return false;
    if (activeTab === 'ARTICLES' && p.type !== 'ARTICLE') return false;

    if (selectedTag !== 'ALL') {
      return p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
    }
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const parsedTags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const post: ContentPost = {
      id: `post-${Date.now()}`,
      authorId: currentUserId,
      authorNickname: currentUserNickname,
      authorRole: currentUserRole,
      type: newPostType,
      title: newTitle.trim(),
      bodyText: newBody.trim(),
      mediaUrl: newPostType === 'REEL' ? newMediaUrl : undefined,
      durationSeconds: newPostType === 'REEL' ? 90 : undefined,
      tags: parsedTags.length > 0 ? parsedTags : ['#CareerProgression'],
      status: 'PENDING_APPROVAL', // Mandatory Admin Moderation Gateway
      upvotes: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    onPostSubmit(post);
    setShowCreateModal(false);
    setNewTitle('');
    setNewBody('');
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentInput.trim()) return;

    const newComment: CommentItem = {
      id: `com-${Date.now()}`,
      postId: selectedPost.id,
      authorId: currentUserId,
      authorNickname: currentUserNickname,
      authorRole: currentUserRole,
      isVerifiedLeader: currentUserRole === 'LEADER' || currentUserRole === 'ADMIN',
      content: commentInput.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
    };

    onAddComment(newComment);
    setCommentInput('');
  };

  return (
    <div className="space-y-8">
      {/* Editorial Hero Header with Architectural Backdrop */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src={BOARDROOM_HERO_IMAGE}
            alt="Executive Strategy Forum"
            className="w-full h-full object-cover opacity-25 filter brightness-75 contrast-125"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent"></div>
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Executive Knowledge</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 font-normal">Volunteer Director &amp; VP Insights</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Leadership Reels, Architecture Cases &amp; Async Q&amp;A
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-world situational strategies, incident command heuristics, and behavioral frameworks submitted by seasoned IT executives. All member contributions undergo administrative moderation before public distribution.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg flex items-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Contribute Insight or Reel</span>
          </button>
        </div>
      </div>

      {/* Interactive Filter Toolbar & Segmented Format Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        {/* Topic Filters (Buttons with Active States) */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-800/80">
          {tagsList.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Format Selector */}
        <div className="flex space-x-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs">
          {(['ALL', 'REELS', 'ARTICLES'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setActiveTab(fmt)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === fmt
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {fmt === 'ALL' && 'All Formats'}
              {fmt === 'REELS' && 'Reels (≤ 180s)'}
              {fmt === 'ARTICLES' && 'Articles'}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid with Zero-Pill Discipline */}
      {visiblePosts.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-4 max-w-lg mx-auto my-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-200">Content Feed is Clear</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              All dummy posts have been removed. As Super Admin or verified leaders, publish the first real executive playbook, micro-article, or video reel.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow"
          >
            Publish First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePosts.map((post) => {
          const isPending = post.status === 'PENDING_APPROVAL';

          return (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`bg-slate-900/90 border rounded-2xl overflow-hidden cursor-pointer transition duration-200 hover:border-slate-700 hover:shadow-xl flex flex-col justify-between ${
                isPending ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800/80'
              }`}
            >
              <div>
                {/* Media thumbnail preview if reel */}
                {post.type === 'REEL' ? (
                  <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition"></div>
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition z-10">
                      <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                    </div>
                    {/* Unboxed duration metadata */}
                    <div className="absolute bottom-2.5 right-3 text-[11px] font-mono text-slate-300 z-10 bg-slate-950/80 px-2 py-0.5 rounded">
                      {Math.floor((post.durationSeconds || 60) / 60)}:
                      {((post.durationSeconds || 60) % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                ) : (
                  <div className="h-20 bg-gradient-to-r from-slate-950 to-slate-900/80 p-4 border-b border-slate-800/60 flex items-center justify-between">
                    <FileText className="w-6 h-6 text-sky-400/80" />
                    <span className="text-xs text-slate-400 font-mono">Micro-Article</span>
                  </div>
                )}

                {/* Content info & Zero-Pill unboxed metadata */}
                <div className="p-5 space-y-2.5">
                  {isPending && (
                    <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Admin Moderation</span>
                    </div>
                  )}

                  {/* Clean unboxed tags with subtle middle dots */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="text-amber-400/90 font-medium">{post.tags[0] || 'Leadership'}</span>
                    {post.tags[1] && (
                      <>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-400">{post.tags[1]}</span>
                      </>
                    )}
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-500 font-mono">{post.type}</span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {post.bodyText}
                  </p>
                </div>
              </div>

              {/* Author and Engagement Bar */}
              <div className="p-5 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2.5">
                  {post.authorAvatar ? (
                    <img
                      src={post.authorAvatar}
                      alt={post.authorNickname}
                      className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-xs">
                      {post.authorNickname.slice(0, 1)}
                    </div>
                  )}
                  <span className="font-semibold text-slate-200 truncate max-w-[120px]">
                    {post.authorNickname}
                  </span>
                  {post.authorRole === 'LEADER' && (
                    <span title="Verified IT Leader">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-slate-400">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleUpvote(post.id);
                    }}
                    className={`flex items-center space-x-1 hover:text-amber-400 transition ${
                      post.hasUpvoted ? 'text-amber-400 font-semibold' : ''
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{post.upvotes}</span>
                  </button>

                  <span className="flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{post.commentsCount}</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(post.id);
                    }}
                    className={`hover:text-amber-400 transition ${
                      post.hasSaved ? 'text-amber-400' : ''
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      )}

      {/* Post Viewer / Async Q&A Discussion Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="font-mono uppercase text-slate-300 font-semibold">{selectedPost.type}</span>
                <span aria-hidden="true">·</span>
                <span>By {selectedPost.authorNickname}</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
              {selectedPost.type === 'REEL' && selectedPost.mediaUrl && (
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800">
                  <video
                    src={selectedPost.mediaUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div>
                <h2 className="text-lg font-bold text-slate-100">{selectedPost.title}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  {selectedPost.tags.map((t, idx) => (
                    <React.Fragment key={t}>
                      {idx > 0 && <span aria-hidden="true" className="text-slate-600">·</span>}
                      <span className="text-amber-400/90 font-mono">{t}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                {selectedPost.bodyText}
              </div>

              {/* Threaded Comments & Verified Leader Answers */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Community Discussion &amp; Leader Insights</span>
                </h4>

                <div className="space-y-3">
                  {comments
                    .filter((c) => c.postId === selectedPost.id)
                    .map((com) => (
                      <div
                        key={com.id}
                        className={`p-3.5 rounded-xl border ${
                          com.isVerifiedLeader
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-200">{com.authorNickname}</span>
                            {com.isVerifiedLeader && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded flex items-center space-x-1 font-semibold">
                                <Shield className="w-3 h-3 text-amber-400" />
                                <span>Verified Leader Answer</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(com.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{com.content}</p>
                      </div>
                    ))}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Ask a follow-up or share your leadership insight..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl transition text-xs flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Modal (Mandatory Moderation Notice) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Contribute Content &amp; Leadership Heuristics</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            {/* Mandatory Moderation Warning */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Mandatory Moderation Gateway:</strong> All user-contributed articles and video reels enter <code>PENDING_APPROVAL</code> status and require Admin / Coordinator approval before appearing in the public feed.
              </p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={newPostType === 'REEL'}
                    onChange={() => setNewPostType('REEL')}
                    className="accent-amber-500"
                  />
                  <span className="text-slate-200 font-medium">Short Video Reel (≤ 180s)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={newPostType === 'ARTICLE'}
                    onChange={() => setNewPostType('ARTICLE')}
                    className="accent-amber-500"
                  />
                  <span className="text-slate-200 font-medium">Micro-Article / Insight</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., How to frame cross-functional trade-offs..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {newPostType === 'REEL' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Video Media URL</label>
                  <input
                    type="text"
                    required
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Content / Insights Text</label>
                <textarea
                  rows={4}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Key advice, architectural heuristics, or executive pointers..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Topic Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="#Behavioral, #ExecutivePresence"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition shadow"
                >
                  Submit to Admin Moderation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
