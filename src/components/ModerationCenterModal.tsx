import React, { useState } from 'react';
import { Post, User, ModerationLog } from '../types';
import {
  X,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  History,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface ModerationCenterModalProps {
  hiddenPosts: Post[];
  moderationLogs: ModerationLog[];
  currentUser: User;
  isSpaceAdmin: boolean;
  onClose: () => void;
  onRestorePost: (postId: string) => void;
  onPermanentDeletePost: (postId: string) => void;
}

export const ModerationCenterModal: React.FC<ModerationCenterModalProps> = ({
  hiddenPosts,
  moderationLogs,
  currentUser,
  isSpaceAdmin,
  onClose,
  onRestorePost,
  onPermanentDeletePost,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 헤더 */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                AI 부적절 게시물 심사 및 관리자 센터
                <span className="text-[11px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                  대기 {hiddenPosts.length}건
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI가 유해 키워드를 자동 감지하여 숨김 처리한 게시글을 관리자가 검토하여 재판정합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'queue'
                  ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              심사 대기열 ({hiddenPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              조치 이력 (Audit Logs)
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            관리자 권한: <strong className={isSpaceAdmin ? 'text-emerald-600' : 'text-slate-500'}>
              {isSpaceAdmin ? '심사/삭제 승인 가능' : '열람 전용 (관리자만 처리 가능)'}
            </strong>
          </div>
        </div>

        {/* 본문 콘텐츠 */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'queue' ? (
            hiddenPosts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">심사 대기 중인 유해 게시글이 없습니다.</h4>
                <p className="text-xs text-slate-500">
                  모든 게시글이 안전하거나 관리자 조치가 완료된 상태입니다.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {hiddenPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-rose-800 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded">
                            AI 자동 숨김 처리됨
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            작성자: {post.authorName}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(post.createdAt).toLocaleString('ko-KR')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{post.title}</h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-rose-600 bg-white px-2 py-1 rounded-md border border-rose-200">
                          위험도: {post.aiFlagScore || 90}점
                        </span>
                      </div>
                    </div>

                    {/* AI 탐지 사유 */}
                    <div className="p-2.5 rounded-lg bg-white border border-rose-200 text-xs text-rose-900 font-mono">
                      <strong>AI 감지 사유:</strong> {post.aiFlagReason}
                    </div>

                    {/* 본문 미리보기 */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                      {post.content}
                    </div>

                    {/* 관리자 판정 조치 버튼 */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-100">
                      {isSpaceAdmin ? (
                        <>
                          <button
                            onClick={() => onRestorePost(post.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            다시 공개로 전환 (승인 복원)
                          </button>
                          <button
                            onClick={() => onPermanentDeletePost(post.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            영구 삭제 처리
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          * 부서 관리자 또는 총괄 관리자만 복원/삭제 조치를 수행할 수 있습니다.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // 감사 로그 탭
            <div className="space-y-2">
              {moderationLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">아직 처리된 이력이 없습니다.</p>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">일시</th>
                        <th className="p-2.5">구분</th>
                        <th className="p-2.5">대상 게시물</th>
                        <th className="p-2.5">사유</th>
                        <th className="p-2.5">조치 결과</th>
                        <th className="p-2.5">처리자</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {moderationLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString('ko-KR')}
                          </td>
                          <td className="p-2.5 font-medium">{log.targetType.toUpperCase()}</td>
                          <td className="p-2.5 font-bold text-slate-800 line-clamp-1 max-w-[150px]">
                            {log.titleOrPreview}
                          </td>
                          <td className="p-2.5 text-slate-500 font-mono text-[11px]">{log.aiReason}</td>
                          <td className="p-2.5">
                            {log.action === 'auto_hidden' && (
                              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                                AI 자동 숨김
                              </span>
                            )}
                            {log.action === 'admin_restored' && (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                관리자 복원 완료
                              </span>
                            )}
                            {log.action === 'admin_deleted' && (
                              <span className="text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                영구 삭제됨
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-medium text-slate-700">
                            {log.moderatorName || 'AI 시스템'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
