import React, { useState } from 'react';
import { Post, Comment, User, Role } from '../types';
import {
  X,
  Pin,
  Heart,
  Send,
  Trash2,
  Sparkles,
  ShieldAlert,
  Edit3,
  CornerDownRight,
  User as UserIcon,
} from 'lucide-react';
import { analyzeContentWithAI } from '../lib/aiFilter';

interface PostDetailModalProps {
  post: Post | null;
  comments: Comment[];
  currentUser: User;
  isSpaceAdmin: boolean;
  onClose: () => void;
  onToggleLike: (post: Post) => void;
  onAddComment: (postId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onDeletePost: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onRestorePost?: (postId: string) => void;
  onPermanentDeletePost?: (postId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  comments,
  currentUser,
  isSpaceAdmin,
  onClose,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onDeletePost,
  onEditPost,
  onRestorePost,
  onPermanentDeletePost,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [commentAiWarning, setCommentAiWarning] = useState<string | null>(null);

  if (!post) return null;

  const isAuthor = post.authorId === currentUser.id;
  const canDelete = isAuthor || isSpaceAdmin || currentUser.role === 'SUPER_ADMIN';
  const canEdit = isAuthor || currentUser.role === 'SUPER_ADMIN';
  const hasLiked = post.likes.includes(currentUser.id);
  const isHiddenByAi = post.status === 'hidden_by_ai';

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCommentInput(val);
    const aiCheck = analyzeContentWithAI(val);
    if (aiCheck.isToxic) {
      setCommentAiWarning(aiCheck.reason || '부적절한 단어가 포함되었습니다.');
    } else {
      setCommentAiWarning(null);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(post.id, commentInput.trim());
    setCommentInput('');
    setCommentAiWarning(null);
  };

  const formattedDate = new Date(post.createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* 모달 상단 헤더 */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {post.isNotice && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                <Pin className="w-3 h-3 text-amber-700" />
                공지사항
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500">
              {post.authorDept}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEditPost(post);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                수정
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDeletePost(post);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 모달 본문 영역 (스크롤) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* AI 숨김 처리 경고 및 관리자 조치 버튼 */}
          {isHiddenByAi && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-rose-600 animate-pulse" />
                AI 안전 필터에 의해 숨김 처리된 게시글입니다.
              </div>
              <p className="text-xs text-rose-700 font-mono bg-white/70 p-2 rounded-lg border border-rose-200">
                {post.aiFlagReason} (위험도: {post.aiFlagScore || 90}점)
              </p>
              {isSpaceAdmin && (
                <div className="flex items-center gap-2 pt-1">
                  {onRestorePost && (
                    <button
                      onClick={() => onRestorePost(post.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      ✓ 다시 공개로 전환 (승인 복원)
                    </button>
                  )}
                  {onPermanentDeletePost && (
                    <button
                      onClick={() => onPermanentDeletePost(post.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      ✕ 영구 삭제 처리
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 제목 및 작성자 정보 */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug mb-2">
              {post.title}
            </h2>
            <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">{post.authorName}</span>
                <span>·</span>
                <span>{formattedDate}</span>
                <span>·</span>
                <span>조회수 {post.views}</span>
              </div>
              {isAuthor && (
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  작성자 본인
                </span>
              )}
            </div>
          </div>

          {/* 본문 내용 */}
          <div className="py-2 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px]">
            {post.content}
          </div>

          {/* 좋아요 버튼 영역 */}
          <div className="flex items-center justify-center pt-3 pb-2 border-b border-slate-100">
            <button
              onClick={() => onToggleLike(post)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                hasLiked
                  ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-xs ring-1 ring-rose-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              좋아요 {post.likes.length}
            </button>
          </div>

          {/* 댓글 목록 */}
          <div className="pt-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
              댓글 {comments.length}개
            </h4>

            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
              </p>
            ) : (
              <div className="space-y-2.5">
                {comments.map((comment) => {
                  const isCommentAuthor = comment.authorId === currentUser.id;
                  const canDeleteComment = isCommentAuthor || isSpaceAdmin || currentUser.role === 'SUPER_ADMIN';
                  const isCommentHidden = comment.status === 'hidden_by_ai';

                  return (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-xl border text-xs ${
                        isCommentHidden
                          ? 'border-rose-200 bg-rose-50/50'
                          : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{comment.authorName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isCommentAuthor && (
                            <span className="text-[9px] font-semibold text-blue-600 bg-blue-100/60 px-1 rounded">
                              본인
                            </span>
                          )}
                        </div>
                        {canDeleteComment && (
                          <button
                            onClick={() => onDeleteComment(comment.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                            title="댓글 삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {isCommentHidden ? (
                        <p className="text-rose-700 font-medium">
                          ⚠️ AI에 의해 유해 댓글로 숨김 처리되었습니다. ({comment.aiFlagReason})
                        </p>
                      ) : (
                        <p className="text-slate-700 leading-normal whitespace-pre-wrap">{comment.content}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 댓글 작성 입력 폼 */}
        <form onSubmit={handleCommentSubmit} className="p-3.5 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
          {commentAiWarning && (
            <div className="mb-2 p-1.5 rounded-lg bg-rose-100 border border-rose-200 text-[11px] text-rose-800 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              {commentAiWarning} (등록 시 숨김 처리됨)
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={handleCommentChange}
              placeholder="댓글을 입력하세요... (건전한 캠퍼스 문화를 지켜주세요)"
              className="flex-1 text-xs sm:text-sm px-3.5 py-2 bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
