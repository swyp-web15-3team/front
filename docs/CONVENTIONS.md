# 팀 컨벤션

프론트엔드 팀이 합의한 개발 컨벤션이다. 코드 작성 시 이 문서를 참고한다. 아래 항목은 전부 확정된 규칙이다.

## 기술 스택 & 선택 기준

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · TanStack Query v5 · Zustand · axios · React Hook Form + Zod · Vitest + Testing Library · ESLint/Prettier(+prettier-plugin-tailwindcss) · Sentry SDK → 자체 호스팅 GlitchTip · pnpm · Node >= 22 · clsx, tailwind-merge, husky, lint-staged 설치됨. 전체 패키지 버전은 `package.json`을 기준으로 한다.

아래는 여러 선택지가 있거나 선택 이유를 알아야 하는 항목이다.

- **axios (fetch 아님)**: 인터셉터 기반 인증 토큰 첨부/공통 에러 처리를 위해 사용한다. 신규 코드는 axios로 작성한다.
- **Zustand (Redux/Context 아님)**: 서버 상태는 TanStack Query가 전담하므로, 클라이언트 상태는 보일러플레이트 없는 가벼운 도구로 관리한다. 전역 상태가 필요할 때도 Zustand로 통일한다.
- **React Hook Form + Zod**: 폼 상태 관리와 유효성 검증을 분리해서 사용한다. 검증 스키마는 Zod로 통일한다.
- **clsx + tailwind-merge → `cn` 함수**: 조건부/충돌 클래스 처리는 `lib/utils.ts`의 `cn(...)` 함수([lib/utils.ts:4](lib/utils.ts#L4))로 통일한다. `cn`은 내부적으로 `clsx`로 조건부 클래스를 조합하고 `tailwind-merge`로 충돌 클래스를 정리한다. className은 `cn`으로 조합한다 (예: `className={cn("base-class", isActive && "active-class")}`).
- **Sentry SDK → 자체 호스팅 GlitchTip**: 에러 트래킹 백엔드가 일반 Sentry SaaS가 아니라 자체 호스팅 GlitchTip이다. DSN과 대시보드 URL이 사내 인프라를 가리킨다.
- **pnpm (npm/yarn 아님)**: lockfile은 `pnpm-lock.yaml`만 커밋 대상으로 한다. 패키지 설치는 pnpm 명령으로 수행한다.
- **Node >= 22**: CI/배포 환경과 로컬 버전을 일치시킨다.

## 폴더 구조

`tsconfig.json`의 `@/*` alias는 루트 기준 (`src/` 없음).

```
app/                     # 라우트 전용 (page, layout, loading, error 등)
  (route-group)/
    _components/         # 해당 라우트에서만 쓰는 컴포넌트
components/
  ui/                     # 버튼, 인풋 등 재사용 UI 프리미티브
  common/                 # 여러 페이지에서 쓰는 조합 컴포넌트
hooks/
  queries/                # TanStack Query 훅 (use-user.ts 등)
lib/
  api/                    # axios 인스턴스, 도메인별 API 함수
  schemas/                # Zod 스키마
  utils.ts
store/                    # zustand 스토어
types/                    # 공용 타입/인터페이스
constants/                # 상수, enum
```

페이지 전용 컴포넌트는 `app/(route)/_components/`에 둔다. 2곳 이상에서 쓰이는 컴포넌트는 `components/`에 둔다.

### 네이밍

| 대상               | 규칙                                        |
| ------------------ | ------------------------------------------- |
| 컴포넌트 파일/함수 | PascalCase (예: `UserCard.tsx`)             |
| 훅                 | 파일 `use-` + kebab-case, export는 `useXxx` (예: `use-auth.ts` → `useAuth`) |
| 유틸/상수 파일     | kebab-case (예: `format-date.ts`)           |
| 폴더명             | kebab-case (예: `user-profile/`)            |
| 타입/인터페이스    | PascalCase (예: `User`, `UserListResponse`) |
| API 응답 필드      | 서버 컨벤션 그대로 유지 (예: 서버가 snake_case면 그대로) |
| Props 타입         | `ComponentName` + `Props`, `interface`로 선언 (예: `UserCardProps`) |

### export 방식

| 대상 | 방식 |
| --- | --- |
| 컴포넌트 | named export (예: `export function UserCard() {}`) |
| 훅 | named export |
| 유틸 함수 | named export |
| `app/` 라우트 파일 (`page.tsx`, `layout.tsx` 등) | default export |

## Server / Client Component 기준

기본값은 Server Component다. 아래 조건 중 하나에 해당하면 파일 최상단에 `"use client"`를 붙인다.

- `useState`, `useEffect`, `useRef` 등 React 훅을 사용하는 경우
- 이벤트 핸들러(`onClick`, `onChange` 등)가 필요한 경우
- TanStack Query, Zustand를 사용하는 경우
- 브라우저 전용 API(`window`, `localStorage` 등)를 사용하는 경우

`"use client"`는 트리 아래쪽의 leaf 컴포넌트에 붙여서, 상호작용이 필요한 부분만 클라이언트 컴포넌트로 유지한다.

### 데이터 페칭 패턴

- 페이지 최초 진입 시 필요한 데이터는 Server Component에서 axios로 직접 fetch해 props로 내려준다
- 리페칭, 페이지네이션, 사용자 액션에 의한 재조회는 Client Component에서 TanStack Query로 처리한다
- 최초 데이터는 서버에서 한 번 로드하고, 이후 상호작용은 TanStack Query가 이어받는 구조를 기본 패턴으로 한다

## Import 규칙

- 모듈 참조는 `@/` alias를 사용한다 (예: `import { Button } from "@/components/ui/Button"`)
- import 순서는 ESLint/Prettier가 자동 정렬한다

## API 통신

- 백엔드 서버가 별도로 존재한다. 일반 요청은 클라이언트에서 axios로 백엔드를 직접 호출한다. 인증 등 보안이 필요한 요청은 Next.js Route Handler(`app/api/.../route.ts`)를 경유한다
- axios 인스턴스는 `lib/api/client.ts`에 둔다. baseURL은 `NEXT_PUBLIC_API_URL`을 사용하고, 인터셉터에서 인증 토큰 첨부와 공통 에러 처리를 수행한다
- API 함수는 도메인별로 분리한다 (예: `lib/api/user.ts`, `lib/api/auth.ts`)
- TanStack Query 훅은 `hooks/queries/use-user.ts`처럼 도메인별로 분리하고, 이름은 `useXxxQuery` / `useXxxMutation`으로 짓는다

### API 요청 라우팅 기준 (axios 직접 호출 vs Route Handler)

아래 요청은 Next.js Route Handler(`app/api/.../route.ts`)를 경유한다:

- 로그인, 회원가입, 토큰 재발급/로그아웃
- 결제, 환불 등 금전 관련 요청
- 비밀번호 변경, 개인정보(이메일/전화번호 등) 수정
- 서버에서만 접근 가능한 secret key/token이 필요한 외부 API 호출

그 외 요청(목록 조회, 상세 조회, 일반 CRUD 등)은 클라이언트에서 axios로 백엔드를 직접 호출한다. 새 API를 추가할 때 위 목록에 해당하는지를 기준으로 판단하고, 해당하지 않으면 axios 직접 호출을 기본값으로 한다.

### axios 인터셉터 공통 에러 처리

`lib/api/client.ts`의 response 인터셉터는 다음과 같이 동작한다:

- **401**: 토큰 재발급을 1회 시도한다. 재발급도 실패하면 auth store를 초기화하고 `/login`으로 리다이렉트한다
- **403**: 공통 토스트("권한이 없습니다")를 띄우고 에러를 reject한다
- **500번대**: `Sentry.captureException`으로 기록하고, 공통 토스트("일시적인 오류가 발생했습니다")를 띄운 뒤 reject한다
- **그 외 4xx** (400, 404, 422 등): 인터셉터는 그대로 reject하고, 화면별 에러 메시지는 각 컴포넌트/훅의 `onError`에서 처리한다
- 인터셉터가 처리한 에러도 항상 reject해서 TanStack Query의 `onError` / `isError`로 이어지게 한다

### Query Key Factory

쿼리 키는 배열과 도메인별 팩토리 함수로 관리한다. 모든 도메인(user, auth, post 등)은 아래 템플릿을 그대로 따르고, 새 도메인 훅 파일을 만들 때는 접두어만 바꿔 사용한다.

```ts
// hooks/queries/use-user.ts

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserListFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

## 상태관리

- 서버 데이터 (목록, 상세 등)는 TanStack Query로 관리한다
- 여러 컴포넌트가 공유하는 클라이언트 전용 상태(로그인 여부, 모달 열림 등)는 Zustand로 관리한다
- 한 컴포넌트 내부에서만 쓰는 상태는 `useState`로 관리한다

## 폼 & 유효성 검증

- 폼은 React Hook Form과 Zod를 `zodResolver`로 연결해 구성한다
- Zod 스키마는 `lib/schemas/`에 두고 폼 컴포넌트에서 import한다

## 스타일링

- Tailwind 클래스 순서는 `prettier-plugin-tailwindcss`가 자동 정렬한다
- 조건부/충돌 클래스는 `lib/utils.ts`의 `cn(...)` 함수로 조합한다

## 에러 트래킹

- `@sentry/nextjs`가 연동되어 있으며, 배포 시 `NEXT_PUBLIC_SENTRY_DSN`을 GitHub Actions secret으로 주입한다
- 명시적으로 남겨야 하는 에러는 `Sentry.captureException`으로 기록한다

### captureException 호출 기준

아래의 경우 `Sentry.captureException`을 호출해 기록한다:

- axios 인터셉터를 거치지 않는 try/catch (예: 클라이언트에서 직접 실행하는 비동기 로직, 파일 업로드 등)
- 결제, 로그인/인증 관련 요청 실패
- 폼 제출(mutation) 실패 중 서버 500번대 에러

아래의 경우는 정상적인 유효성 검증 실패로 간주하고 기록 대상에서 제외한다:

- Zod 유효성 검증 실패
- 서버가 4xx로 응답하는 예상된 비즈니스 에러 (예: "이미 존재하는 이메일입니다")

판단 기준: 사용자 입력 실수로 발생하는 에러는 기록 대상에서 제외하고, 예상하지 못한 실패는 기록 대상으로 삼는다.

## 테스트

- Vitest + Testing Library로 세팅되어 있다
- `components/ui`와 유틸 함수 위주로 작성한다

## 코드 포맷팅 / Git

- 커밋 전 `pnpm lint`를 실행한다
- `pre-commit` hook이 `lint-staged`로 스테이징된 `*.{js,jsx,ts,tsx}` 파일에 `eslint --fix`를 실행한다

### 커밋 메시지 형식

`<이모지> <타입>: <작업내용>` 형식을 사용한다 (예: `🎉 add: 로그인 페이지 생성`). `commit-msg` hook([scripts/commit.mjs](scripts/commit.mjs))이 아래 타입 목록과 형식을 검사하며, 형식에 맞지 않으면 커밋이 거부된다. `pnpm commit` 명령으로 타입/내용을 선택해 형식에 맞는 메시지를 생성할 수 있다.

| 이모지 | 타입 | 작업내용 |
| --- | --- | --- |
| ✨ | update | 해당 파일에 새로운 기능이 생김 |
| 🎉 | add | 없던 파일을 생성함, 초기 세팅 |
| 🐛 | bugfix | 버그 수정 |
| ♻️ | refactor | 코드 리팩토링 |
| 🔧 | fix | 코드 수정 |
| 🚚 | move | 파일 옮김/정리 |
| 🔥 | del | 기능/파일을 삭제 |
| ✅ | test | 테스트 코드를 작성 |
| 💄 | style | css |
| 🙈 | gitfix | gitignore 수정 |
| 📦 | script | package.json 변경(npm 설치 등) |

`Merge`/`Revert`로 시작하는 커밋 메시지는 이 형식 검사에서 예외로 처리된다.

### 브랜치명 규칙

`feat/기능명`, `fix/버그명`, `chore/작업명` 형식을 사용한다. `pre-commit` hook이 현재 브랜치명을 검사하며, `main`/`master`/`develop`을 제외하고 이 형식에 맞지 않으면 커밋이 거부된다.

### PR 규칙

PR 템플릿이나 리뷰 규칙은 husky로 강제되지 않는다. 별도 합의가 있다면 이 섹션에 추가한다.
