import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Space,
  Board,
  Post,
  Comment,
  EvolutionMode,
  ModerationLog,
} from './types';
import { CampusBoardStore } from './lib/storage';
import { Header } from './components/Header';
import { SpaceNavigation } from './components/SpaceNavigation';
import { BoardTabs } from './components/BoardTabs';
import { PostCard } from './components/PostCard';
import { PostDetailModal } from './components/PostDetailModal';
import { PostFormModal } from './components/PostFormModal';
import { ModerationCenterModal } from './components/ModerationCenterModal';
import { BoardManageModal } from './components/BoardManageModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import {
  Search,
  Plus,
  Filter,
  Lock,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle,
} from 'lucide-react';

export function App() {
  // 상태
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('space-cs');
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>('board-cs-free');
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [evolutionMode, setEvolutionMode] = useState<EvolutionMode>('COMPLEX_MULTI');

  // 필터 및 검색
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'notices' | 'myPosts'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'likes'>('latest');

  // 모달 제어
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [isBoardManageOpen, setIsBoardManageOpen] = useState(false);
  const [isArchitectureGuideOpen, setIsArchitectureGuideOpen] = useState(false);

  // 토스트 메시지
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 초기 데이터 로드
  const reloadData = () => {
    const loadedUsers = CampusBoardStore.getUsers();
    setUsers(loadedUsers);

    if (!currentUser) {
      setCurrentUser(loadedUsers[0]);
    } else {
      const refreshedUser = loadedUsers.find((u) => u.id === currentUser.id) || loadedUsers[0];
      setCurrentUser(refreshedUser);
    }

    setSpaces(CampusBoardStore.getSpaces());
    setBoards(CampusBoardStore.getBoards());
    setPosts(CampusBoardStore.getPosts());
    setComments(CampusBoardStore.getComments());
    setModerationLogs(CampusBoardStore.getModerationLogs());
    setEvolutionMode(CampusBoardStore.getEvolutionMode());
  };

  useEffect(() => {
    reloadData();
  }, []);

  if (!currentUser) return null;

  // 진화 모드 변경
  const handleEvolutionModeChange = (mode: EvolutionMode) => {
    setEvolutionMode(mode);
    CampusBoardStore.setEvolutionMode(mode);

    if (mode === 'SINGLE') {
      setActiveSpaceId('space-cs');
      setActiveBoardId('board-cs-free');
      showToast('1단계: [단순 게시판] 모드로 전환되었습니다. 단일 게시판에서 작성자 권한을 관리합니다.', 'info');
    } else if (mode === 'MULTI') {
      setActiveSpaceId('space-cs');
      showToast('2단계: [다중 게시판] 모드로 전환되었습니다. 목적별 게시판 탭과 권한을 관리합니다.', 'info');
    } else {
      showToast('3단계: [복합 다중 게시판] 모드로 전환되었습니다. 공간별 분리 및 공간 간 접근 차단이 활성화됩니다.', 'info');
    }
  };

  // 현재 공간 및 게시판 정보
  const currentSpace = spaces.find((s) => s.id === activeSpaceId) || spaces[0];

  // 공간 간 접근 차단 검증
  const isAccessDenied = evolutionMode === 'COMPLEX_MULTI' && !CampusBoardStore.checkSpaceAccess(currentUser, activeSpaceId);

  // 현재 공간에 속한 게시판 목록
  const availableBoards = useMemo(() => {
    if (evolutionMode === 'SINGLE') {
      return boards.filter((b) => b.id === 'board-cs-free');
    }
    return boards.filter((b) => b.spaceId === activeSpaceId);
  }, [boards, activeSpaceId, evolutionMode]);

  // 활성 게시판 자동 보정
  useEffect(() => {
    if (availableBoards.length > 0 && !availableBoards.some((b) => b.id === activeBoardId)) {
      setActiveBoardId(availableBoards[0].id);
    }
  }, [availableBoards, activeBoardId]);

  const currentBoard = availableBoards.find((b) => b.id === activeBoardId) || availableBoards[0];

  // 관리자 권한 확인
  const isCurrentSpaceAdmin = CampusBoardStore.isSpaceAdmin(currentUser, activeSpaceId);

  // 숨김 처리된 게시물 수 (관리자 심사용)
  const hiddenPosts = posts.filter((p) => p.status === 'hidden_by_ai');

  // 필터링 및 정렬된 게시물 목록
  const displayedPosts = useMemo(() => {
    if (isAccessDenied) return [];

    let list = posts.filter((p) => {
      // 1) 게시판 일치 여부
      if (evolutionMode === 'SINGLE') {
        if (p.boardId !== 'board-cs-free') return false;
      } else {
        if (p.spaceId !== activeSpaceId || p.boardId !== activeBoardId) return false;
      }

      // 2) AI 숨김 처리 여부: 관리자 또는 본인 글만 볼 수 있음
      if (p.status === 'hidden_by_ai') {
        if (p.authorId !== currentUser.id && !isCurrentSpaceAdmin && currentUser.role !== 'SUPER_ADMIN') {
          return false;
        }
      }

      // 3) 필터
      if (filterType === 'notices' && !p.isNotice) return false;
      if (filterType === 'myPosts' && p.authorId !== currentUser.id) return false;

      // 4) 검색
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchContent = p.content.toLowerCase().includes(query);
        const matchAuthor = p.authorName.toLowerCase().includes(query);
        if (!matchTitle && !matchContent && !matchAuthor) return false;
      }

      return true;
    });

    // 정렬 (공지사항은 항상 최상단)
    list.sort((a, b) => {
      if (a.isNotice !== b.isNotice) {
        return a.isNotice ? -1 : 1;
      }
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'likes') return b.likes.length - a.likes.length;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [
    posts,
    evolutionMode,
    activeSpaceId,
    activeBoardId,
    isAccessDenied,
    filterType,
    searchQuery,
    sortBy,
    currentUser,
    isCurrentSpaceAdmin,
  ]);

  // 글쓰기 권한 검증
  const canWriteInCurrentBoard = currentBoard ? CampusBoardStore.canWritePost(currentUser, currentBoard) : false;

  // 핸들러: 글쓰기/수정 제출
  const handlePostSubmit = (data: { title: string; content: string; isNotice: boolean }) => {
    if (editingPost) {
      // 수정
      const res = CampusBoardStore.updatePost(editingPost.id, data, currentUser);
      if (res.success) {
        if (res.isHiddenByAi) {
          showToast('⚠️ 수정한 내용에 부적절한 표현이 감지되어 AI에 의해 자동 숨김 처리되었습니다.', 'warning');
        } else {
          showToast('게시글이 성공적으로 수정되었습니다.', 'success');
        }
      } else {
        showToast(res.error || '수정 실패', 'warning');
      }
      setEditingPost(null);
    } else {
      // 신규 등록
      const res = CampusBoardStore.createPost({
        spaceId: activeSpaceId,
        boardId: activeBoardId,
        title: data.title,
        content: data.content,
        author: currentUser,
        isNotice: data.isNotice,
      });

      if (res.isHiddenByAi) {
        showToast(`⚠️ [AI 감지] 부적절한 게시물로 판단되어 자동 숨김 처리되었습니다: ${res.aiReason}`, 'warning');
      } else {
        showToast('게시글이 성공적으로 등록되었습니다.', 'success');
      }
    }

    setIsFormModalOpen(false);
    reloadData();
  };

  // 핸들러: 게시글 삭제
  const handleDeletePost = (post: Post) => {
    if (window.confirm(`'${post.title}' 게시글을 삭제하시겠습니까?`)) {
      const res = CampusBoardStore.deletePost(post.id, currentUser);
      if (res.success) {
        showToast('게시글이 삭제되었습니다.', 'info');
        if (selectedPost && selectedPost.id === post.id) {
          setSelectedPost(null);
        }
        reloadData();
      } else {
        showToast(res.error || '삭제 권한이 없습니다.', 'warning');
      }
    }
  };

  // 핸들러: 좋아요 토글
  const handleToggleLike = (post: Post) => {
    CampusBoardStore.toggleLike(post.id, currentUser.id);
    reloadData();
    if (selectedPost && selectedPost.id === post.id) {
      const updated = CampusBoardStore.getPosts().find((p) => p.id === post.id);
      if (updated) setSelectedPost(updated);
    }
  };

  // 핸들러: 댓글 등록
  const handleAddComment = (postId: string, content: string) => {
    const res = CampusBoardStore.addComment(postId, content, currentUser);
    if (res.isHiddenByAi) {
      showToast('⚠️ 작성하신 댓글이 AI 안전 필터에 의해 숨김 처리되었습니다.', 'warning');
    } else {
      showToast('댓글이 등록되었습니다.', 'success');
    }
    reloadData();
  };

  // 핸들러: 댓글 삭제
  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      const success = CampusBoardStore.deleteComment(commentId, currentUser);
      if (success) {
        showToast('댓글이 삭제되었습니다.', 'info');
        reloadData();
      } else {
        showToast('댓글 삭제 권한이 없습니다.', 'warning');
      }
    }
  };

  // 핸들러: AI 숨김 복원
  const handleRestorePost = (postId: string) => {
    CampusBoardStore.restoreHiddenPost(postId, currentUser);
    showToast('✓ 게시글을 다시 공개로 전환(복원)했습니다.', 'success');
    reloadData();
    if (selectedPost && selectedPost.id === postId) {
      const updated = CampusBoardStore.getPosts().find((p) => p.id === postId);
      if (updated) setSelectedPost(updated);
    }
  };

  // 핸들러: AI 숨김 영구 삭제
  const handlePermanentDelete = (postId: string) => {
    if (window.confirm('이 유해 게시글을 시스템에서 영구히 삭제하시겠습니까?')) {
      CampusBoardStore.permanentDeletePost(postId, currentUser);
      showToast('✕ 게시글이 영구 삭제되었습니다.', 'info');
      reloadData();
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null);
      }
    }
  };

  // 핸들러: 새 게시판 생성
  const handleCreateBoard = (data: {
    spaceId: string;
    name: string;
    description: string;
    icon: string;
    isNoticeOnly: boolean;
    allowedWriteRoles: any[];
  }) => {
    const newBoard = CampusBoardStore.createBoard(data);
    showToast(`'${newBoard.name}' 게시판이 새로 개설되었습니다.`, 'success');
    reloadData();
    setActiveBoardId(newBoard.id);
  };

  // 핸들러: 데이터 초기화
  const handleReset = () => {
    if (window.confirm('모든 데이터를 초기 샘플 상태로 되돌리시겠습니까?')) {
      CampusBoardStore.resetToDefault();
      reloadData();
      showToast('데이터가 초기 샘플 상태로 복원되었습니다.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* 글로벌 토스트 알림 */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 max-w-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toastMessage.type === 'warning'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'warning' ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 헤더 컴포넌트 */}
      <Header
        currentUser={currentUser}
        users={users}
        onSelectUser={(u) => {
          setCurrentUser(u);
          showToast(`'${u.name}' 사용자로 시뮬레이션 역할을 전환했습니다.`, 'info');
        }}
        evolutionMode={evolutionMode}
        onChangeEvolutionMode={handleEvolutionModeChange}
        hiddenPostsCount={hiddenPosts.length}
        onOpenModeration={() => setIsModerationOpen(true)}
        onOpenArchitectureGuide={() => setIsArchitectureGuideOpen(true)}
        onResetData={handleReset}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 3단계: 복합 다중 게시판 모드일 때만 공간 선택기(Space Navigation) 노출 */}
        {evolutionMode === 'COMPLEX_MULTI' && (
          <SpaceNavigation
            spaces={spaces}
            activeSpaceId={activeSpaceId}
            currentUser={currentUser}
            onSelectSpace={(sId) => setActiveSpaceId(sId)}
          />
        )}

        {/* 공간 간 접근 차단 화면 (Tenant Isolation Guard) */}
        {isAccessDenied ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-rose-200 shadow-sm my-6 max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Tenant Access Denied
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                공간 간 접근 차단 정책이 적용되었습니다
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              현재 로그인된 <strong>{currentUser.name}</strong>({currentUser.department})님은{' '}
              <strong className="text-rose-600 font-bold">{currentSpace.name}</strong> 소속 멤버가 아닙니다.
              <br />
              <span className="text-xs text-slate-500">
                (복합 다중 게시판 체계에서는 인가되지 않은 타 부서/학부의 게시판 및 게시글 접근이 엄격히 통제됩니다.)
              </span>
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveSpaceId(currentUser.spaceMemberships[0] || 'space-cs')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-1.5"
              >
                소속 인가된 내 공간으로 돌아가기
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 2단계 & 3단계: 다중 게시판 탭 */}
            {evolutionMode !== 'SINGLE' && (
              <BoardTabs
                boards={availableBoards}
                activeBoardId={activeBoardId}
                onSelectBoard={(bId) => setActiveBoardId(bId)}
                canManageBoards={isCurrentSpaceAdmin}
                onOpenCreateBoard={() => setIsBoardManageOpen(true)}
              />
            )}

            {/* 현재 게시판 배너 및 검색/컨트롤 바 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      {currentBoard ? currentBoard.name : '게시판'}
                    </h2>
                    {evolutionMode === 'SINGLE' && (
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        단일 게시판 모드
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentBoard?.description || '게시글을 읽고 작성하는 공간입니다.'}
                  </p>
                </div>

                {/* 글쓰기 버튼 */}
                <div className="flex items-center gap-2">
                  {canWriteInCurrentBoard ? (
                    <button
                      onClick={() => {
                        setEditingPost(null);
                        setIsFormModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      글쓰기
                    </button>
                  ) : (
                    <div
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200"
                      title="이 게시판은 공지사항 전용이거나 학생 글쓰기가 제한되어 있습니다."
                    >
                      🔒 작성 권한 없음 (공지 전용)
                    </div>
                  )}
                </div>
              </div>

              {/* 검색 및 필터 바 */}
              <div className="pt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* 검색 인풋 */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="제목, 본문 내용, 작성자 검색..."
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                  />
                </div>

                {/* 필터 탭 (전체, 공지, 내 글) */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      filterType === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    전체 글
                  </button>
                  <button
                    onClick={() => setFilterType('notices')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      filterType === 'notices' ? 'bg-white text-amber-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    공지사항만
                  </button>
                  <button
                    onClick={() => setFilterType('myPosts')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      filterType === 'myPosts' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    내가 쓴 글
                  </button>
                </div>

                {/* 정렬 셀렉터 */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium"
                >
                  <option value="latest">최신순</option>
                  <option value="views">조회수순</option>
                  <option value="likes">좋아요순</option>
                </select>
              </div>
            </div>

            {/* 게시글 목록 피드 */}
            <div className="space-y-3">
              {displayedPosts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
                  <p className="text-slate-400 text-sm">해당 조건에 맞는 게시글이 없습니다.</p>
                  {canWriteInCurrentBoard && (
                    <button
                      onClick={() => {
                        setEditingPost(null);
                        setIsFormModalOpen(true);
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      첫 번째 글을 작성해보세요!
                    </button>
                  )}
                </div>
              ) : (
                displayedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    isSpaceAdmin={isCurrentSpaceAdmin}
                    onSelectPost={(p) => {
                      CampusBoardStore.incrementViews(p.id);
                      setSelectedPost(p);
                      reloadData();
                    }}
                    onEditPost={(p) => {
                      setEditingPost(p);
                      setIsFormModalOpen(true);
                    }}
                    onDeletePost={handleDeletePost}
                    onToggleLike={handleToggleLike}
                    onReviewHiddenPost={(p) => {
                      setIsModerationOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* 모달 1: 게시글 상세 및 댓글 모달 */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          comments={comments.filter((c) => c.postId === selectedPost.id)}
          currentUser={currentUser}
          isSpaceAdmin={isCurrentSpaceAdmin}
          onClose={() => setSelectedPost(null)}
          onToggleLike={handleToggleLike}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onDeletePost={handleDeletePost}
          onEditPost={(p) => {
            setEditingPost(p);
            setIsFormModalOpen(true);
          }}
          onRestorePost={handleRestorePost}
          onPermanentDeletePost={handlePermanentDelete}
        />
      )}

      {/* 모달 2: 게시글 작성/수정 모달 */}
      {isFormModalOpen && currentBoard && (
        <PostFormModal
          board={currentBoard}
          currentUser={currentUser}
          initialPost={editingPost}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingPost(null);
          }}
          onSubmit={handlePostSubmit}
        />
      )}

      {/* 모달 3: AI 모더레이션 센터 모달 */}
      {isModerationOpen && (
        <ModerationCenterModal
          hiddenPosts={hiddenPosts}
          moderationLogs={moderationLogs}
          currentUser={currentUser}
          isSpaceAdmin={isCurrentSpaceAdmin}
          onClose={() => setIsModerationOpen(false)}
          onRestorePost={handleRestorePost}
          onPermanentDeletePost={handlePermanentDelete}
        />
      )}

      {/* 모달 4: 새 게시판 추가 모달 */}
      {isBoardManageOpen && (
        <BoardManageModal
          currentSpace={currentSpace}
          onClose={() => setIsBoardManageOpen(false)}
          onCreateBoard={handleCreateBoard}
        />
      )}

      {/* 모달 5: 진화 체계 아키텍처 가이드 모달 */}
      {isArchitectureGuideOpen && (
        <ArchitectureModal onClose={() => setIsArchitectureGuideOpen(false)} />
      )}
    </div>
  );
}

export default App;
