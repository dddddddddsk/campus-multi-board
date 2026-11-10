import React from 'react';
import {
  ShieldAlert,
  UserCheck,
  Layers,
  Sparkles,
  HelpCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { User, EvolutionMode, Role } from '../types';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  evolutionMode: EvolutionMode;
  onChangeEvolutionMode: (mode: EvolutionMode) => void;
  hiddenPostsCount: number;
  onOpenModeration: () => void;
  onOpenArchitectureGuide: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSelectUser,
  evolutionMode,
  onChangeEvolutionMode,
  hiddenPostsCount,
  onOpenModeration,
  onOpenArchitectureGuide,
  onResetData,
}) => {
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'STUDENT':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">학생</span>;
      case 'CLASS_REP':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">과대표 (공지등록)</span>;
      case 'PROFESSOR':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded">교수 (공지등록)</span>;
      case 'SPACE_ADMIN':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded">학교 부서 관리자</span>;
      case 'SUPER_ADMIN':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded">총괄 관리자</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* 상단 시뮬레이션 제어 바 */}
      <div className="bg-slate-900 text-slate-100 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            사용자 역할 시뮬레이션:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {users.map((u) => {
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className={`px-2.5 py-1 rounded transition-colors text-xs font-medium ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={`${u.department} - 소속 공간: ${u.spaceMemberships.join(', ')}`}
                >
                  {u.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetData}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            title="초기 샘플 데이터로 복구"
          >
            <RotateCcw className="w-3 h-3" />
            데이터 초기화
          </button>
        </div>
      </div>

      {/* 메인 헤더 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-black shadow-md shadow-blue-500/20">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">캠퍼스 학생 게시판 체계</h1>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-500">
              현재 접속자: <strong className="text-slate-800 font-semibold">{currentUser.name}</strong> ({currentUser.department}) · {getRoleBadge(currentUser.role)}
            </p>
          </div>
        </div>

        {/* 3단계 체계 선택기 (단순 -> 다중 -> 복합 다중) */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => onChangeEvolutionMode('SINGLE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              evolutionMode === 'SINGLE'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1️⃣ 단순 게시판
          </button>
          <button
            onClick={() => onChangeEvolutionMode('MULTI')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              evolutionMode === 'MULTI'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2️⃣ 다중 게시판
          </button>
          <button
            onClick={() => onChangeEvolutionMode('COMPLEX_MULTI')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              evolutionMode === 'COMPLEX_MULTI'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3️⃣ 복합 다중 게시판 (공간 격리)
          </button>
        </div>

        {/* 유틸리티 액션 버튼들 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenArchitectureGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            3단계 체계 가이드
          </button>

          {/* AI 모더레이션 센터 버튼 */}
          <button
            onClick={onOpenModeration}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            title="AI가 부적절하여 자동 숨김 처리한 게시글 심사"
          >
            <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
            AI 모더레이션 센터
            {hiddenPostsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                {hiddenPostsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
