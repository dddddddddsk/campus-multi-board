import React from 'react';
import { Space, User } from '../types';
import { Building, ShieldCheck, Lock, Users, AlertTriangle } from 'lucide-react';

interface SpaceNavigationProps {
  spaces: Space[];
  activeSpaceId: string;
  currentUser: User;
  onSelectSpace: (spaceId: string) => void;
}

export const SpaceNavigation: React.FC<SpaceNavigationProps> = ({
  spaces,
  activeSpaceId,
  currentUser,
  onSelectSpace,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 mb-6">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">운영 공간 선택 (Multi-Space Tenant)</h2>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            공간 간 접근 차단 활성화됨
          </span>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">
          * 각 공간별 전용 게시판과 사용자가 독립적으로 격리 관리됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {spaces.map((space) => {
          const isSelected = space.id === activeSpaceId;
          const isMember = currentUser.role === 'SUPER_ADMIN' || currentUser.spaceMemberships.includes(space.id);
          const isAdmin = currentUser.role === 'SUPER_ADMIN' || space.adminIds.includes(currentUser.id);

          return (
            <div
              key={space.id}
              onClick={() => onSelectSpace(space.id)}
              className={`relative cursor-pointer p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
              } ${!isMember ? 'opacity-80' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    {space.name}
                  </span>
                  {isMember ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      소속 인가됨
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                      <Lock className="w-3 h-3 text-rose-600" />
                      비인가 공간
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{space.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  소속 {space.allowedMemberIds.length}명
                </span>
                {isAdmin && (
                  <span className="text-blue-600 font-bold bg-blue-100/70 px-1.5 py-0.5 rounded">
                    공간 관리자 권한 보유
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
