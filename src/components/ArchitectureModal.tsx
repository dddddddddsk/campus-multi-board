import React from 'react';
import { X, Layers, ShieldCheck, Check, Sparkles, Building, Lock } from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold">학생 게시판 체계 진화형 아키텍처</h3>
              <p className="text-xs text-slate-400 mt-0.5">단순 게시판 ➔ 다중 게시판 ➔ 복합 다중 공간 시스템</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
          {/* 3단계 비교 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1단계 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">Step 1</span>
                <span className="text-slate-500 text-xs">기본형</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">단순 게시판</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                단 1개의 단일 게시판에서 모든 게시글을 작성하고 열람합니다.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  게시글 CRUD & 회원 체계
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  작성자 본인 수정/삭제 권한 통제
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  학생 vs 교수 vs 과대 역할 분리
                </li>
              </ul>
            </div>

            {/* 2단계 */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded">Step 2</span>
                <span className="text-blue-600 text-xs font-semibold">확장형</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">다중 게시판</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                목적별(공지, 자유, Q&A, 스터디 등)로 여러 게시판을 분리 운영합니다.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700 pt-2 border-t border-blue-200">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  동적 게시판 추가 및 카테고리화
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  게시판별 세부 권한 (쓰기/공지 권한)
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  공지 전용(교수, 과대) 통제
                </li>
              </ul>
            </div>

            {/* 3단계 */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">Step 3</span>
                <span className="text-indigo-600 text-xs font-semibold">멀티 테넌트</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">복합 다중 게시판</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                공간(학부, 단과대, 행정부서)별로 독립된 여러 게시판과 사용자를 격리합니다.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700 pt-2 border-t border-indigo-200">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <strong>공간 간 접근 차단 (Isolation)</strong>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  여러 운영자가 각자의 공간 자율 관리
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  공간별 독자적 멤버십 & 게시판 보유
                </li>
              </ul>
            </div>
          </div>

          {/* 역할별 권한 매트릭스 */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              캠퍼스 사용자 역할 및 책임 (R&R)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-2">역할</th>
                    <th className="p-2">읽기/검색</th>
                    <th className="p-2">일반 글/댓글</th>
                    <th className="p-2">공지사항 등록</th>
                    <th className="p-2">AI 숨김 심사</th>
                    <th className="p-2">게시판 관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-bold text-blue-700">학생 (김철수)</td>
                    <td className="p-2 text-emerald-600">가능 (인가공간)</td>
                    <td className="p-2 text-emerald-600">가능 (본인 관리)</td>
                    <td className="p-2 text-slate-400">불가</td>
                    <td className="p-2 text-slate-400">불가</td>
                    <td className="p-2 text-slate-400">불가</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-emerald-700">과대표 (이영희)</td>
                    <td className="p-2 text-emerald-600">가능 (인가공간)</td>
                    <td className="p-2 text-emerald-600">가능 (본인 관리)</td>
                    <td className="p-2 text-emerald-600 font-bold">가능</td>
                    <td className="p-2 text-slate-400">불가</td>
                    <td className="p-2 text-slate-400">불가</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-purple-700">교수 (박교수)</td>
                    <td className="p-2 text-emerald-600">가능 (인가공간)</td>
                    <td className="p-2 text-emerald-600">가능 (본인 관리)</td>
                    <td className="p-2 text-emerald-600 font-bold">가능</td>
                    <td className="p-2 text-slate-400">불가</td>
                    <td className="p-2 text-slate-400">불가</td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="p-2 font-bold text-amber-800">학교 부서 관리자 (최지원)</td>
                    <td className="p-2 text-emerald-600">가능 (소속공간)</td>
                    <td className="p-2 text-emerald-600">가능</td>
                    <td className="p-2 text-emerald-600 font-bold">가능</td>
                    <td className="p-2 text-emerald-600 font-bold">승인/영구삭제</td>
                    <td className="p-2 text-emerald-600 font-bold">게시판 생성/권한</td>
                  </tr>
                  <tr className="bg-rose-50/50">
                    <td className="p-2 font-bold text-rose-800">총괄운영자 (대학본부)</td>
                    <td className="p-2 text-emerald-600 font-bold">전체 공간</td>
                    <td className="p-2 text-emerald-600 font-bold">전체 공간</td>
                    <td className="p-2 text-emerald-600 font-bold">전체 공간</td>
                    <td className="p-2 text-emerald-600 font-bold">전체 공간 심사</td>
                    <td className="p-2 text-emerald-600 font-bold">전체 공간 총괄</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI 유해 콘텐츠 모더레이션 파이프라인 */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-600" />
              AI 부적절 게시물 2단계 방어 체계 (Human-in-the-Loop AI)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-rose-700">1단계: AI 실시간 자동 탐지 & 숨김</span>
                <p className="text-slate-600 leading-relaxed">
                  작성자가 글/댓글을 등록할 때 비속어, 사기/스팸, 학사부정, 폭력성 등을 AI가 즉시 감지하여 상태를 `hidden_by_ai`로 지정하고 일반 학우 피드에서 차단합니다.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-emerald-700">2단계: 관리자 최종 심사 & 재판정</span>
                <p className="text-slate-600 leading-relaxed">
                  학교 관련 부서 관리자가 'AI 모더레이션 센터'에서 탐지 사유와 원문을 재확인하여 **오탐 시 다시 공개로 복원**, **유해물 시 영구 삭제**를 확정합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
