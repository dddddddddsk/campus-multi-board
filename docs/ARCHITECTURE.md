# 🏛️ 캠퍼스 멀티 보드 시스템 기술 아키텍처 사양서 (System Architecture)

본 문서는 **캠퍼스 멀티 보드 시스템(Campus Multi-Board System)**의 설계 원칙, 3단계 확장 체계, 데이터 모델, 테넌트 격리(Tenant Isolation), 그리고 AI 부적절물 탐지 파이프라인을 기술합니다.

---

## 1. 3단계 진화형 아키텍처 개요

본 프로젝트는 단순 게시판에서 출발하여 다중 게시판, 최종적으로 독립된 공간별 멀티 테넌트 게시판으로 확장 가능한 점진적 아키텍처를 채택했습니다.

```mermaid
graph TD
    subgraph Step1 ["Step 1: 단순 게시판 (Single Board)"]
        B1[단일 게시판: 자유게시판]
        P1[게시글 CRUD]
        U1[사용자 및 작성자 권한]
        B1 --> P1 --> U1
    end

    subgraph Step2 ["Step 2: 다중 게시판 (Multi Board)"]
        B2_1[📢 학과 공지사항]
        B2_2[💬 자유게시판]
        B2_3[❓ Q&A 게시판]
        B2_4[🤝 스터디 모집]
        MGT[게시판 동적 생성 및 역할별 쓰기 권한 설정]
        MGT --> B2_1
        MGT --> B2_2
        MGT --> B2_3
        MGT --> B2_4
    end

    subgraph Step3 ["Step 3: 복합 다중 공간 시스템 (Multi-Tenant Spaces)"]
        S_CS["💻 컴퓨터공학부 공간 (Space CS)"]
        S_BIZ["📊 경영대학 공간 (Space BIZ)"]
        S_UNIV["🏫 중앙광장 / 학생지원처 (Space Univ)"]
        
        ISOLATION{공간 간 접근 차단 정책<br/>Tenant Isolation Engine}
        
        S_CS --- ISOLATION
        S_BIZ --- ISOLATION
        S_UNIV --- ISOLATION
    end

    Step1 ==> Step2 ==> Step3
```

---

## 2. 계층별 시스템 구조 (Layered Architecture)

```
campus-board/
├── src/
│   ├── types/               # TypeScript 인터페이스 및 열거형 타입
│   │   └── index.ts         # User, Space, Board, Post, Comment, Role
│   ├── lib/                 # 비즈니스 로직 및 코어 모듈
│   │   ├── aiFilter.ts      # AI 유해 콘텐츠 실시간 분석 엔진
│   │   ├── storage.ts       # 데이터 저장소 및 보안/권한 검증 레이어
│   │   └── mockData.ts      # 캠퍼스 표준 시드 데이터 (6인 사용자, 공간, 게시판)
│   ├── components/          # 재사용 가능한 UI 프레젠테이션 컴포넌트
│   │   ├── Header.tsx                 # 사용자 전환 바 & 3단계 모드 스위처
│   │   ├── SpaceNavigation.tsx        # 멀티 테넌트 공간 선택 및 접근 차단
│   │   ├── BoardTabs.tsx              # 다중 게시판 탭 & 관리자 추가 기능
│   │   ├── PostCard.tsx               # 게시글 카드 (공지 뱃지, AI 숨김 태그)
│   │   ├── PostDetailModal.tsx        # 상세 보기, 댓글 관리, 권한별 조치
│   │   ├── PostFormModal.tsx          # 글쓰기/수정, 공지 권한 검증, 실시간 AI 피드백
│   │   ├── ModerationCenterModal.tsx  # AI 모더레이션 센터 (복원/영구삭제)
│   │   ├── BoardManageModal.tsx       # 게시판 개설 및 역할 권한 설정 모달
│   │   └── ArchitectureModal.tsx      # 시스템 아키텍처 대화형 가이드 모달
│   ├── App.tsx              # 전역 상태 바인딩, 필터/검색, 라우팅 뷰 제어
│   ├── main.tsx
│   └── index.css            # Tailwind CSS v4 스타일링
```

---

## 3. 데이터 모델 관계 다이어그램 (ERD)

```mermaid
erDiagram
    SPACE ||--o{ BOARD : "contains"
    SPACE ||--o{ USER : "membership"
    BOARD ||--o{ POST : "includes"
    POST ||--o{ COMMENT : "has"
    USER ||--o{ POST : "authors"
    USER ||--o{ COMMENT : "writes"

    SPACE {
        string id PK
        string name
        string code
        string[] adminIds
        string[] allowedMemberIds
    }

    BOARD {
        string id PK
        string spaceId FK
        string name
        boolean isNoticeOnly
        Role[] allowedWriteRoles
        Role[] noticePostRoles
    }

    POST {
        string id PK
        string spaceId FK
        string boardId FK
        string authorId FK
        string title
        string content
        boolean isNotice
        string status "active | hidden_by_ai | deleted_by_admin"
        string aiFlagReason
        int aiFlagScore
    }

    COMMENT {
        string id PK
        string postId FK
        string authorId FK
        string content
        string status
    }

    USER {
        string id PK
        string name
        string studentId
        Role role
        string department
        string[] spaceMemberships
    }
```

---

## 4. 핵심 보안 및 권한 정책 (Security & RBAC)

### 4.1 공간 간 접근 차단 (Tenant Isolation)
- `checkSpaceAccess(user: User, spaceId: string): boolean`
- 사용자의 `spaceMemberships`에 대상 `spaceId`가 존재하지 않을 경우, 데이터 패치 및 렌더링을 원천 차단하고 `Tenant Access Denied` 보안 화면을 반환합니다.
- 최고 관리자(`SUPER_ADMIN`)만 전체 공간에 접근 가능한 거버넌스 권한을 부여받습니다.

### 4.2 작성자 권한 및 공지사항 등록 권한
- **게시글/댓글 수정**: 작성자 본인(`post.authorId === user.id`)만 수정 가능
- **게시글/댓글 삭제**: 작성자 본인 또는 해당 공간의 담당 부서 관리자(`isSpaceAdmin`)만 가능
- **공지사항 등록 권한**: 일반 학생은 공지 등록 불가, 오직 `CLASS_REP(과대)`, `PROFESSOR(교수)`, `SPACE_ADMIN(부서 관리자)`, `SUPER_ADMIN(총괄)`에게만 허용

---

## 5. AI 부적절물 자동 필터링 파이프라인

```mermaid
sequenceDiagram
    autonumber
    actor User as 작성자 (학생/교수)
    participant Client as PostFormModal
    participant Engine as aiFilter Engine
    participant Store as CampusBoardStore
    actor Admin as 학교 부서 관리자
    
    User->>Client: 제목 및 본문 입력
    Client->>Engine: analyzeContentWithAI(text)
    Engine-->>Client: 실시간 유해도 분석 (isToxic, score, reason)
    
    alt 유해 키워드 감지 시
        Client->>User: ⚠️ 실시간 AI 경고 배너 표출
    end
    
    User->>Client: 등록 버튼 클릭
    Client->>Store: createPost(...)
    
    alt 유해 게시물로 판정된 경우
        Store->>Store: status = 'hidden_by_ai' 설정<br/>일반 피드에서 은닉
        Store->>Store: ModerationLog 기록
        Store-->>User: "AI에 의해 자동 숨김 처리되었습니다" 알림
        Admin->>Store: [AI 모더레이션 센터] 접속
        Admin->>Store: 검토 후 [다시 공개 복원] 또는 [영구 삭제] 확정
    else 정상 게시물
        Store->>Store: status = 'active'
        Store-->>User: 즉시 전체 공개
    end
```
