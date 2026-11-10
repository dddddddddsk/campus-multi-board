import React from 'react';
import { Post, User, Role } from '../types';
import {
  Pin,
  Eye,
  Heart,
  MessageSquare,
  AlertOctagon,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  currentUser: User;
  isSpaceAdmin: boolean;
  onSelectPost: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (post: Post) => void;
  onToggleLike: (post: Post) => void;
  onReviewHiddenPost?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  isSpaceAdmin,
  onSelectPost,
  onEditPost,
  onDeletePost,
  onToggleLike,
  onReviewHiddenPost,
}) => {
  const isAuthor = post.authorId === currentUser.id;
  const canDelete = isAuthor || isSpaceAdmin || currentUser.role === 'SUPER_ADMIN';
  const canEdit = isAuthor || currentUser.role === 'SUPER_ADMIN';
  const hasLiked = post.likes.includes(currentUser.id);
  const isHiddenByAi = post.status === 'hidden_by_ai';

  const getRoleTag = (role: Role) => {
    switch (role) {
      case 'CLASS_REP':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">과대</span>;
      case 'PROFESSOR':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded">교수</span>;
      case 'SPACE_ADMIN':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">부서 관리자</span>;
      case 'SUPER_ADMIN':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded">총괄 관리자</span>;
      default:
        return <span className="bg-blue-50 text-blue-700 text-[10px] font-medium px-1.5 py-0.5 rounded">학생</span>;
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`rounded-2xl border transition-all p-4.5 bg-white ${
        post.isNotice
          ? 'border-amber-300 bg-amber-50/30 shadow-xs'
          : isHiddenByAi
          ? 'border-rose-300 bg-rose-50/40 ring-1 ring-rose-200'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* AI에 의해 숨김 처리된 게시글 경고 배너 */}
      {isHiddenByAi && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-100/80 border border-rose-300 flex items-start justify-between gap-2 text-xs text-rose-900">
          <div className="flex items-start gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <p className="font-bold flex items-center gap-1 text-rose-800">
                AI 부적절 감지로 자동 숨김 처리됨 (일반 사용자 열람 제한)
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5 font-mono">{post.aiFlagReason}</p>
            </div>
          </div>
          {isSpaceAdmin && onReviewHiddenPost && (
            <button
              onClick={() => onReviewHiddenPost(post)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              관리자 심사
            </button>
          )}
        </div>
      )}

      {/* 헤더: 공지 배너 및 메타데이터 */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {post.isNotice && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
              <Pin className="w-3 h-3 text-amber-700" />
              필독 공지사항
            </span>
          )}
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
            {post.authorName}
          </span>
          {getRoleTag(post.authorRole)}
          <span className="text-xs text-slate-400">· {formattedDate}</span>
        </div>

        {/* 작성자 권한 관리 버튼 (수정/삭제) */}
        <div className="flex items-center gap-1">
          {canEdit && (
            <button
              onClick={() => onEditPost(post)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="게시글 수정 (작성자 권한)"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDeletePost(post)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="게시글 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 게시글 제목 및 본문 미리보기 */}
      <div onClick={() => onSelectPost(post)} className="cursor-pointer group">
        <h3
          className={`text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-1 ${
            post.isNotice ? 'text-slate-950 font-extrabold' : ''
          }`}
        >
          {post.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {post.content}
        </p>
      </div>

      {/* 푸터: 반응 (조회수, 좋아요, 댓글) */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            조회 {post.views}
          </span>
          <button
            onClick={() => onToggleLike(post)}
            className={`flex items-center gap-1 transition-colors ${
              hasLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            좋아요 {post.likes.length}
          </button>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            댓글 {post.commentCount}
          </span>
        </div>

        {isAuthor && (
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            내 작성글
          </span>
        )}
      </div>
    </div>
  );
};
