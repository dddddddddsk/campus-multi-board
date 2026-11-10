export type Role = 'STUDENT' | 'CLASS_REP' | 'PROFESSOR' | 'SPACE_ADMIN' | 'SUPER_ADMIN';

export type EvolutionMode = 'SINGLE' | 'MULTI' | 'COMPLEX_MULTI';

export interface User {
  id: string;
  name: string;
  studentId: string; // 학번 또는 교번/사번
  role: Role;
  department: string;
  spaceMemberships: string[]; // 소속 공간 ID 목록
  avatar?: string;
}

export interface Space {
  id: string;
  name: string;
  code: string;
  description: string;
  adminIds: string[]; // 공간 관리자 (학교 관련 부서 사람)
  allowedMemberIds: string[]; // 소속 사용자 목록 (공간 간 접근 차단용)
  createdAt: string;
}

export interface Board {
  id: string;
  spaceId: string;
  name: string;
  description: string;
  icon: string;
  isNoticeOnly?: boolean; // 공지사항 전용 게시판 여부
  allowedWriteRoles: Role[]; // 작성 허용 역할
  noticePostRoles: Role[]; // 공지 등록 허용 역할 (교수, 과대)
  postCount?: number;
  createdAt: string;
}

export type PostStatus = 'active' | 'hidden_by_ai' | 'deleted_by_admin';

export interface Post {
  id: string;
  spaceId: string;
  boardId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorDept: string;
  isNotice: boolean; // 상단 고정 공지
  views: number;
  likes: string[]; // liked user IDs
  commentCount: number;
  status: PostStatus;
  aiFlagReason?: string; // AI가 숨김 처리한 사유
  aiFlagScore?: number; // 위험도 점수 (0-100)
  reviewedByAdmin?: boolean; // 관리자 재확인 여부
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  status: 'active' | 'hidden_by_ai';
  aiFlagReason?: string;
  createdAt: string;
}

export interface ModerationLog {
  id: string;
  targetType: 'post' | 'comment';
  targetId: string;
  titleOrPreview: string;
  aiReason: string;
  action: 'auto_hidden' | 'admin_restored' | 'admin_deleted';
  moderatorId?: string;
  moderatorName?: string;
  timestamp: string;
}
