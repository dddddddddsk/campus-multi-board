import React, { useState } from 'react';
import { Space, Role } from '../types';
import { X, Plus, Shield } from 'lucide-react';

interface BoardManageModalProps {
  currentSpace: Space;
  onClose: () => void;
  onCreateBoard: (boardData: {
    spaceId: string;
    name: string;
    description: string;
    icon: string;
    isNoticeOnly: boolean;
    allowedWriteRoles: Role[];
  }) => void;
}

export const BoardManageModal: React.FC<BoardManageModalProps> = ({
  currentSpace,
  onClose,
  onCreateBoard,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('MessageSquare');
  const [isNoticeOnly, setIsNoticeOnly] = useState(false);
  const [allowedRoles, setAllowedRoles] = useState<Role[]>([
    'STUDENT',
    'CLASS_REP',
    'PROFESSOR',
    'SPACE_ADMIN',
  ]);

  const toggleRole = (role: Role) => {
    if (allowedRoles.includes(role)) {
      setAllowedRoles(allowedRoles.filter((r) => r !== role));
    } else {
      setAllowedRoles([...allowedRoles, role]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateBoard({
      spaceId: currentSpace.id,
      name: name.trim(),
      description: description.trim(),
      icon,
      isNoticeOnly,
      allowedWriteRoles: isNoticeOnly ? ['CLASS_REP', 'PROFESSOR', 'SPACE_ADMIN', 'SUPER_ADMIN'] : allowedRoles,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">새 게시판 개설 및 권한 관리</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              공간: <strong className="text-blue-600 font-semibold">{currentSpace.name}</strong>
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">게시판 명칭</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 📖 강의 족보 및 필기 공유"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">게시판 소개</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="게시판의 운영 목적을 입력하세요"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">대표 아이콘</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="MessageSquare">💬 일반 대화 (MessageSquare)</option>
                <option value="Megaphone">📢 공지사항 (Megaphone)</option>
                <option value="HelpCircle">❓ 질문과 답변 (HelpCircle)</option>
                <option value="Users">🤝 스터디/모임 (Users)</option>
                <option value="Building2">🏫 학사 행정 (Building2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">게시판 성격</label>
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNoticeOnly}
                    onChange={(e) => setIsNoticeOnly(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  공지사항 전용 게시판
                </label>
              </div>
            </div>
          </div>

          {!isNoticeOnly && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                글쓰기 작성 허용 역할군 (Role Permissions)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { role: 'STUDENT' as Role, label: '학생 (STUDENT)' },
                  { role: 'CLASS_REP' as Role, label: '과대표 (CLASS_REP)' },
                  { role: 'PROFESSOR' as Role, label: '교수 (PROFESSOR)' },
                  { role: 'SPACE_ADMIN' as Role, label: '부서 관리자 (SPACE_ADMIN)' },
                ].map((item) => (
                  <label key={item.role} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowedRoles.includes(item.role)}
                      onChange={() => toggleRole(item.role)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              게시판 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
