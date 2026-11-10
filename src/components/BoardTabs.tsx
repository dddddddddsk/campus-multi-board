import React from 'react';
import { Board, User } from '../types';
import { PlusCircle, Megaphone, MessageSquare, HelpCircle, Users, Building2, ShieldAlert } from 'lucide-react';

interface BoardTabsProps {
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  canManageBoards: boolean;
  onOpenCreateBoard: () => void;
}

export const BoardTabs: React.FC<BoardTabsProps> = ({
  boards,
  activeBoardId,
  onSelectBoard,
  canManageBoards,
  onOpenCreateBoard,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Megaphone':
        return <Megaphone className="w-4 h-4 text-rose-500" />;
      case 'HelpCircle':
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case 'Users':
        return <Users className="w-4 h-4 text-emerald-500" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-indigo-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          {boards.map((board) => {
            const isSelected = board.id === activeBoardId;
            return (
              <button
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {getIcon(board.icon)}
                <span>{board.name}</span>
                {board.isNoticeOnly && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}
                  >
                    공지 전용
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {canManageBoards && (
          <button
            onClick={onOpenCreateBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors whitespace-nowrap"
            title="현재 공간에 새로운 전용 게시판 개설 (관리자 전용)"
          >
            <PlusCircle className="w-4 h-4" />
            + 게시판 추가 및 권한 설정
          </button>
        )}
      </div>
    </div>
  );
};
