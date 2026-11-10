import React, { useState, useEffect } from 'react';
import { Post, User, Board } from '../types';
import { X, Pin, Sparkles, AlertCircle, Info } from 'lucide-react';
import { analyzeContentWithAI } from '../lib/aiFilter';

interface PostFormModalProps {
  board: Board;
  currentUser: User;
  initialPost?: Post | null;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; isNotice: boolean }) => void;
}

export const PostFormModal: React.FC<PostFormModalProps> = ({
  board,
  currentUser,
  initialPost,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialPost ? initialPost.title : '');
  const [content, setContent] = useState(initialPost ? initialPost.content : '');
  const [isNotice, setIsNotice] = useState(initialPost ? initialPost.isNotice : false);

  // 공지사항 등록 권한 체크 (교수, 과대, 부서 관리자, 총괄)
  const canSetNotice = ['CLASS_REP', 'PROFESSOR', 'SPACE_ADMIN', 'SUPER_ADMIN'].includes(currentUser.role);

  // 실시간 AI 검사
  const [aiWarning, setAiWarning] = useState<{ isToxic: boolean; reason?: string; score: number }>({
    isToxic: false,
    score: 0,
  });

  useEffect(() => {
    const combined = `${title} ${content}`;
    const result = analyzeContentWithAI(combined);
    setAiWarning(result);
  }, [title, content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      isNotice: canSetNotice ? isNotice : false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 모달 헤더 */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialPost ? '게시글 수정' : `${board.name} 새 글 쓰기`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              작성자: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.department})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* AI 감지 알림 배너 */}
          {aiWarning.isToxic && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-bold">⚠️ AI 부적절 콘텐츠 실시간 감지 (유해도 {aiWarning.score}점)</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{aiWarning.reason}</p>
                <p className="text-[10px] text-rose-600 mt-1">
                  * 이 글을 등록하면 즉시 숨김 처리되며, 관리자가 승인하기 전까지 일반 학우들에게 노출되지 않습니다.
                </p>
              </div>
            </div>
          )}

          {/* 공지사항 설정 영역 (권한 검증) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Pin className={`w-4 h-4 ${canSetNotice ? 'text-amber-600' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-bold text-slate-800">상단 고정 공지사항으로 등록</span>
                <p className="text-[11px] text-slate-500">
                  {canSetNotice
                    ? '목록 최상단에 강조 배너로 고정됩니다.'
                    : '공지사항 등록 권한이 없습니다. (교수 및 과대표 전용 권한)'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isNotice}
                disabled={!canSetNotice}
                onChange={(e) => setIsNotice(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  canSetNotice ? 'peer-checked:bg-amber-500 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                }`}
              ></div>
            </label>
          </div>

          {/* 제목 입력 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">제목</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="게시글 제목을 입력하세요"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* 본문 내용 입력 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">내용</label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요... (건전하고 유익한 캠퍼스 정보 공유)"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed resize-none"
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all ${
                aiWarning.isToxic
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {initialPost ? '수정 완료' : aiWarning.isToxic ? '숨김 상태로 등록하기' : '게시글 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
