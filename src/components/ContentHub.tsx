import React, { useState } from 'react';
import {
  Play,
  FileText,
  ThumbsUp,
  Bookmark,
  MessageSquare,
  Shield,
  Plus,
  Tag,
  Clock,
  Sparkles,
  Share2,
  CheckCircle,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';
import type { ContentPost, CommentItem, UserRole } from '../types/index.ts';

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
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'REELS' | 'ARTICLES' | 'QNA'>('ALL');
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
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Curated Executive Knowledge Hub</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Leadership Reels, Articles &amp; Async Q&amp;A</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Short executive videos and articles crafted by verified IT Leaders. All member contributions undergo administrative moderation before public distribution.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Contribute Insight or Reel</span>
        </button>
      </div>

      {/* Tag Pills & Format Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {tagsList.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full font-medium transition ${
                selectedTag === tag
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 bg-slate-900 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {(['ALL', 'REELS', 'ARTICLES'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setActiveTab(fmt)}
              className={`px-3 py-1 rounded font-medium transition ${
                activeTab === fmt ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {fmt === 'ALL' && 'All Types'}
              {fmt === 'REELS' && 'Reels (≤3m)'}
              {fmt === 'ARTICLES' && 'Articles'}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visiblePosts.map((post) => {
          const isPending = post.status === 'PENDING_APPROVAL';

          return (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`bg-slate-900 border rounded-2xl overflow-hidden cursor-pointer transition hover:border-slate-700 hover:shadow-xl flex flex-col justify-between ${
                isPending ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Media thumbnail preview if reel */}
                {post.type === 'REEL' ? (
                  <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition"></div>
                    <div className="w-12 h-12 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition z-10">
                      <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 z-10">
                      {Math.floor((post.durationSeconds || 60) / 60)}:
                      {((post.durationSeconds || 60) % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                ) : (
                  <div className="h-24 bg-gradient-to-r from-slate-950 to-slate-900 p-4 border-b border-slate-800/60 flex items-center justify-between">
                    <FileText className="w-8 h-8 text-sky-400/80" />
                    <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      Micro-Article
                    </span>
                  </div>
                )}

                {/* Content info */}
                <div className="p-4 space-y-2">
                  {isPending && (
                    <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Admin Moderation</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    {post.tags.map((t) => (
                      <span key={t} className="text-[10px] text-sky-400 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-bold text-slate-100 text-sm line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {post.bodyText}
                  </p>
                </div>
              </div>

              {/* Author and Engagement Bar */}
              <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-[10px]">
                    {post.authorNickname.slice(0, 1)}
                  </div>
                  <span className="font-medium text-slate-300 truncate max-w-[110px]">
                    {post.authorNickname}
                  </span>
                  {post.authorRole === 'LEADER' && (
                    <span title="Verified IT Leader">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleUpvote(post.id);
                    }}
                    className={`flex items-center space-x-1 hover:text-sky-400 transition ${
                      post.hasUpvoted ? 'text-sky-400 font-semibold' : ''
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.upvotes}</span>
                  </button>

                  <span className="flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.commentsCount}</span>
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
            </div>
          );
        })}
      </div>

      {/* Post Viewer / Async Q&A Discussion Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {selectedPost.type}
                </span>
                <span className="text-xs text-slate-400">&bull; By {selectedPost.authorNickname}</span>
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPost.tags.map((t) => (
                    <span key={t} className="text-[11px] font-mono text-sky-400">
                      {t}
                    </span>
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
                          <span className="text-[10px] text-slate-500">
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
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-xl transition text-xs flex items-center space-x-1"
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
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Contribute Content &amp; Leadership Tips</span>
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
                    className="accent-sky-500"
                  />
                  <span className="text-slate-200 font-medium">Short Video Reel (≤ 180s)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={newPostType === 'ARTICLE'}
                    onChange={() => setNewPostType('ARTICLE')}
                    className="accent-sky-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Topic Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="#Behavioral, #ExecutivePresence"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
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
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition shadow"
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
