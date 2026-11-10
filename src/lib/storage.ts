import {
  User,
  Space,
  Board,
  Post,
  Comment,
  Role,
  EvolutionMode,
  ModerationLog,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SPACES,
  INITIAL_BOARDS,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
} from './mockData';
import { analyzeContentWithAI } from './aiFilter';

const STORAGE_KEYS = {
  USERS: 'campus_board_users',
  SPACES: 'campus_board_spaces',
  BOARDS: 'campus_board_boards',
  POSTS: 'campus_board_posts',
  COMMENTS: 'campus_board_comments',
  CURRENT_USER: 'campus_board_current_user',
  ACTIVE_SPACE: 'campus_board_active_space',
  ACTIVE_BOARD: 'campus_board_active_board',
  EVOLUTION_MODE: 'campus_board_evolution_mode',
  MODERATION_LOGS: 'campus_board_moderation_logs',
};

// 헬퍼: 안전한 로컬스토리지 로드
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

export class CampusBoardStore {
  // 상태
  static getUsers(): User[] {
    return loadFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getSpaces(): Space[] {
    return loadFromStorage<Space[]>(STORAGE_KEYS.SPACES, INITIAL_SPACES);
  }

  static getBoards(): Board[] {
    return loadFromStorage<Board[]>(STORAGE_KEYS.BOARDS, INITIAL_BOARDS);
  }

  static getPosts(): Post[] {
    return loadFromStorage<Post[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  }

  static getComments(): Comment[] {
    return loadFromStorage<Comment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  }

  static getModerationLogs(): ModerationLog[] {
    return loadFromStorage<ModerationLog[]>(STORAGE_KEYS.MODERATION_LOGS, []);
  }

  static getEvolutionMode(): EvolutionMode {
    return loadFromStorage<EvolutionMode>(STORAGE_KEYS.EVOLUTION_MODE, 'COMPLEX_MULTI');
  }

  static setEvolutionMode(mode: EvolutionMode): void {
    saveToStorage(STORAGE_KEYS.EVOLUTION_MODE, mode);
  }

  // 초기화 (Reset to default)
  static resetToDefault(): void {
    saveToStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    saveToStorage(STORAGE_KEYS.SPACES, INITIAL_SPACES);
    saveToStorage(STORAGE_KEYS.BOARDS, INITIAL_BOARDS);
    saveToStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    saveToStorage(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    saveToStorage(STORAGE_KEYS.MODERATION_LOGS, []);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0].id);
    saveToStorage(STORAGE_KEYS.ACTIVE_SPACE, 'space-cs');
    saveToStorage(STORAGE_KEYS.ACTIVE_BOARD, 'board-cs-free');
  }

  // 권한 검증 유틸리티
  static isSpaceAdmin(user: User, spaceId: string): boolean {
    if (user.role === 'SUPER_ADMIN') return true;
    if (user.role === 'SPACE_ADMIN') {
      const space = this.getSpaces().find((s) => s.id === spaceId);
      return space ? space.adminIds.includes(user.id) : false;
    }
    return false;
  }

  static checkSpaceAccess(user: User, spaceId: string): boolean {
    if (user.role === 'SUPER_ADMIN') return true;
    return user.spaceMemberships.includes(spaceId);
  }

  static canWritePost(user: User, board: Board): boolean {
    if (user.role === 'SUPER_ADMIN') return true;
    return board.allowedWriteRoles.includes(user.role);
  }

  static canPostNotice(user: User, board: Board): boolean {
    if (user.role === 'SUPER_ADMIN') return true;
    // 요구사항: 공지사항을 등록하는 사람 = 교수, 과대, 관리자
    return ['CLASS_REP', 'PROFESSOR', 'SPACE_ADMIN', 'SUPER_ADMIN'].includes(user.role);
  }

  // 게시글 CRUD 및 AI 감지
  static createPost(params: {
    spaceId: string;
    boardId: string;
    title: string;
    content: string;
    author: User;
    isNotice: boolean;
  }): { post: Post; isHiddenByAi: boolean; aiReason?: string } {
    const posts = this.getPosts();
    const boards = this.getBoards();
    const targetBoard = boards.find((b) => b.id === params.boardId);

    // AI 콘텐츠 유해도 검사
    const aiResult = analyzeContentWithAI(`${params.title} ${params.content}`);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      spaceId: params.spaceId,
      boardId: params.boardId,
      title: params.title,
      content: params.content,
      authorId: params.author.id,
      authorName: params.author.name,
      authorRole: params.author.role,
      authorDept: params.author.department,
      isNotice: params.isNotice,
      views: 0,
      likes: [],
      commentCount: 0,
      status: aiResult.isToxic ? 'hidden_by_ai' : 'active',
      aiFlagReason: aiResult.isToxic ? aiResult.reason : undefined,
      aiFlagScore: aiResult.isToxic ? aiResult.score : undefined,
      reviewedByAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.unshift(newPost);
    saveToStorage(STORAGE_KEYS.POSTS, posts);

    // AI에 의해 숨겨진 경우 모더레이션 로그 기록
    if (aiResult.isToxic) {
      const logs = this.getModerationLogs();
      logs.unshift({
        id: `mod-${Date.now()}`,
        targetType: 'post',
        targetId: newPost.id,
        titleOrPreview: newPost.title,
        aiReason: aiResult.reason || '부적절한 내용 감지',
        action: 'auto_hidden',
        timestamp: new Date().toISOString(),
      });
      saveToStorage(STORAGE_KEYS.MODERATION_LOGS, logs);
    }

    return {
      post: newPost,
      isHiddenByAi: aiResult.isToxic,
      aiReason: aiResult.reason,
    };
  }

  static updatePost(
    postId: string,
    updates: { title: string; content: string; isNotice?: boolean },
    editor: User
  ): { success: boolean; error?: string; isHiddenByAi?: boolean } {
    const posts = this.getPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) return { success: false, error: '게시글을 찾을 수 없습니다.' };

    const targetPost = posts[index];
    if (targetPost.authorId !== editor.id && !this.isSpaceAdmin(editor, targetPost.spaceId)) {
      return { success: false, error: '수정 권한이 없습니다. (작성자 본인만 수정 가능)' };
    }

    // 수정 시에도 AI 재검사
    const aiResult = analyzeContentWithAI(`${updates.title} ${updates.content}`);

    posts[index] = {
      ...targetPost,
      title: updates.title,
      content: updates.content,
      isNotice: updates.isNotice !== undefined ? updates.isNotice : targetPost.isNotice,
      status: aiResult.isToxic ? 'hidden_by_ai' : 'active',
      aiFlagReason: aiResult.isToxic ? aiResult.reason : undefined,
      aiFlagScore: aiResult.isToxic ? aiResult.score : undefined,
      updatedAt: new Date().toISOString(),
    };

    saveToStorage(STORAGE_KEYS.POSTS, posts);
    return { success: true, isHiddenByAi: aiResult.isToxic };
  }

  static deletePost(postId: string, user: User): { success: boolean; error?: string } {
    const posts = this.getPosts();
    const target = posts.find((p) => p.id === postId);
    if (!target) return { success: false, error: '게시글이 존재하지 않습니다.' };

    const isAdmin = this.isSpaceAdmin(user, target.spaceId);
    if (target.authorId !== user.id && !isAdmin) {
      return { success: false, error: '삭제 권한이 없습니다. (작성자 본인 또는 공간 관리자만 가능)' };
    }

    const filtered = posts.filter((p) => p.id !== postId);
    saveToStorage(STORAGE_KEYS.POSTS, filtered);
    return { success: true };
  }

  static incrementViews(postId: string): void {
    const posts = this.getPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index !== -1) {
      posts[index].views += 1;
      saveToStorage(STORAGE_KEYS.POSTS, posts);
    }
  }

  static toggleLike(postId: string, userId: string): void {
    const posts = this.getPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index !== -1) {
      const post = posts[index];
      const hasLiked = post.likes.includes(userId);
      if (hasLiked) {
        post.likes = post.likes.filter((id) => id !== userId);
      } else {
        post.likes.push(userId);
      }
      saveToStorage(STORAGE_KEYS.POSTS, posts);
    }
  }

  // 댓글 CRUD
  static addComment(postId: string, content: string, author: User): { comment: Comment; isHiddenByAi: boolean } {
    const comments = this.getComments();
    const aiResult = analyzeContentWithAI(content);

    const newComment: Comment = {
      id: `cmt-${Date.now()}`,
      postId,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      content,
      status: aiResult.isToxic ? 'hidden_by_ai' : 'active',
      aiFlagReason: aiResult.isToxic ? aiResult.reason : undefined,
      createdAt: new Date().toISOString(),
    };

    comments.push(newComment);
    saveToStorage(STORAGE_KEYS.COMMENTS, comments);

    // 게시글 댓글 카운트 갱신
    const posts = this.getPosts();
    const postIdx = posts.findIndex((p) => p.id === postId);
    if (postIdx !== -1) {
      posts[postIdx].commentCount += 1;
      saveToStorage(STORAGE_KEYS.POSTS, posts);
    }

    return { comment: newComment, isHiddenByAi: aiResult.isToxic };
  }

  static deleteComment(commentId: string, user: User): boolean {
    const comments = this.getComments();
    const target = comments.find((c) => c.id === commentId);
    if (!target) return false;

    // 작성자 본인 또는 관리자만 삭제 가능
    if (target.authorId !== user.id && user.role !== 'SPACE_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return false;
    }

    const filtered = comments.filter((c) => c.id !== commentId);
    saveToStorage(STORAGE_KEYS.COMMENTS, filtered);

    // 댓글 수 감소
    const posts = this.getPosts();
    const postIdx = posts.findIndex((p) => p.id === target.postId);
    if (postIdx !== -1) {
      posts[postIdx].commentCount = Math.max(0, posts[postIdx].commentCount - 1);
      saveToStorage(STORAGE_KEYS.POSTS, posts);
    }

    return true;
  }

  // AI 모더레이션 관리자 기능
  static restoreHiddenPost(postId: string, admin: User): boolean {
    const posts = this.getPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) return false;

    posts[index].status = 'active';
    posts[index].reviewedByAdmin = true;
    saveToStorage(STORAGE_KEYS.POSTS, posts);

    const logs = this.getModerationLogs();
    logs.unshift({
      id: `mod-${Date.now()}`,
      targetType: 'post',
      targetId: postId,
      titleOrPreview: posts[index].title,
      aiReason: posts[index].aiFlagReason || 'AI 검토 사유',
      action: 'admin_restored',
      moderatorId: admin.id,
      moderatorName: admin.name,
      timestamp: new Date().toISOString(),
    });
    saveToStorage(STORAGE_KEYS.MODERATION_LOGS, logs);

    return true;
  }

  static permanentDeletePost(postId: string, admin: User): boolean {
    const posts = this.getPosts();
    const target = posts.find((p) => p.id === postId);
    if (!target) return false;

    const filtered = posts.filter((p) => p.id !== postId);
    saveToStorage(STORAGE_KEYS.POSTS, filtered);

    const logs = this.getModerationLogs();
    logs.unshift({
      id: `mod-${Date.now()}`,
      targetType: 'post',
      targetId: postId,
      titleOrPreview: target.title,
      aiReason: target.aiFlagReason || '관리자에 의한 영구 삭제',
      action: 'admin_deleted',
      moderatorId: admin.id,
      moderatorName: admin.name,
      timestamp: new Date().toISOString(),
    });
    saveToStorage(STORAGE_KEYS.MODERATION_LOGS, logs);

    return true;
  }

  // 다중 게시판 관리 (게시판 추가, 수정, 삭제)
  static createBoard(params: {
    spaceId: string;
    name: string;
    description: string;
    icon: string;
    isNoticeOnly: boolean;
    allowedWriteRoles: Role[];
  }): Board {
    const boards = this.getBoards();
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      spaceId: params.spaceId,
      name: params.name,
      description: params.description,
      icon: params.icon,
      isNoticeOnly: params.isNoticeOnly,
      allowedWriteRoles: params.allowedWriteRoles,
      noticePostRoles: ['CLASS_REP', 'PROFESSOR', 'SPACE_ADMIN', 'SUPER_ADMIN'],
      createdAt: new Date().toISOString(),
    };
    boards.push(newBoard);
    saveToStorage(STORAGE_KEYS.BOARDS, boards);
    return newBoard;
  }

  static deleteBoard(boardId: string): boolean {
    const boards = this.getBoards();
    const filtered = boards.filter((b) => b.id !== boardId);
    saveToStorage(STORAGE_KEYS.BOARDS, filtered);

    // 해당 게시판의 게시물들도 정리
    const posts = this.getPosts().filter((p) => p.boardId !== boardId);
    saveToStorage(STORAGE_KEYS.POSTS, posts);
    return true;
  }
}
