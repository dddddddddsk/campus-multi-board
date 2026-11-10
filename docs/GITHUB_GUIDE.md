# 🚀 GitHub 업로드 및 배포 가이드 (GitHub & Deployment Guide)

본 가이드는 본 프로젝트(`campus-board`)를 로컬 Git 저장소로 초기화하고 GitHub 원격 레포지토리에 업로드하는 절차를 안내합니다.

---

## 1. 사전 준비 (Prerequisites)

- Git이 설치되어 있어야 합니다. (터미널에서 `git --version` 확인)
- [GitHub](https://github.com) 계정이 필요합니다.

---

## 2. GitHub 레포지토리 생성

1. [GitHub](https://github.com)에 로그인 후 우측 상단의 **[+] ➔ [New repository]**를 클릭합니다.
2. 저장소 이름을 입력합니다. (예: `campus-multi-board`)
3. 공개 범위(Public 또는 Private)를 선택합니다.
4. `Initialize this repository with a README`는 **체크 해제**(이미 로컬에 완성된 README가 존재)합니다.
5. **[Create repository]** 버튼을 클릭합니다.

---

## 3. 로컬 프로젝트 Git 초기화 및 커밋 (PowerShell / Bash)

터미널을 열고 프로젝트 디렉터리로 이동한 후 아래 명령어를 순서대로 실행합니다:

```powershell
# 1. 프로젝트 폴더로 이동
cd "C:\Users\2026001114\.gemini\antigravity\scratch\campus-board"

# 2. Git 저장소 초기화
git init

# 3. 브랜치명을 main으로 변경
git branch -M main

# 4. 전체 파일 스테이징
git add .

# 5. 첫 번째 커밋 생성
git commit -m "feat: 캠퍼스 멀티 보드 시스템 및 3단계 진화 아키텍처 구현"
```

---

## 4. GitHub 원격 저장소 연결 및 푸시 (Push)

GitHub에서 생성한 본인의 원격 저장소 주소(예: `https://github.com/YOUR_USERNAME/campus-multi-board.git`)를 연결합니다:

```powershell
# 원격 저장소 연결 (본인의 GitHub 사용자명과 레포지토리명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/campus-multi-board.git

# 원격 저장소로 푸시
git push -u origin main
```

> **TIP:** 만약 GitHub 로그인 창이 뜨면 GitHub 자격 증명(Personal Access Token 또는 브라우저 인증)을 완료하시면 됩니다.

---

## 5. 포함된 문서 목록 안내

GitHub에 푸시되면 다음 구조로 문서와 코드가 일목요연하게 표시됩니다:

```
campus-board/
├── README.md                      # GitHub 저장소 메인 대시보드 리드미
├── docs/
│   ├── ARCHITECTURE.md            # 기술 아키텍처, ERD, 시퀀스 다이어그램
│   ├── FEATURES.md                # 구현 기능 명세서 및 6인 R&R
│   ├── PROMPT_AND_AGENT_LOG.md    # 프롬프트 및 에이전트 인터랙션 기록
│   └── GITHUB_GUIDE.md            # GitHub 업로드 및 배포 가이드
├── src/                           # 프론트엔드 전체 소스 코드
├── package.json
└── vite.config.ts
```

---

## 6. Vercel 원클릭 배포 (선택 사항)

GitHub에 푸시한 후 [Vercel](https://vercel.com)에 로그인하여 해당 GitHub 레포지토리를 임포트(Import)하면 단 1분 만에 전 세계 어디서나 접속할 수 있는 라이브 데모 URL을 무료로 발급받을 수 있습니다.
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
