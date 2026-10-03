import { NextResponse, type NextRequest } from 'next/server';

// 쿠키 이름은 app/api/auth/refresh/route.ts와 같아야 한다.
const REFRESH_TOKEN_COOKIE = 'refreshToken';

// 낙관적 검사: 쿠키 유무만 본다. 만료/무효 토큰은 통과하고, 이후 401 -> 재발급
// 실패 경로(lib/api/client.ts)가 /login으로 보낸다.
export function proxy(request: NextRequest) {
  if (request.cookies.has(REFRESH_TOKEN_COOKIE)) return;

  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL('/login', request.url);
  // 로그인 후 보던 페이지로 돌아오기 위한 경로. 소비하는 쪽(login-return)이 검증한다.
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ['/planner/:path*', '/mypage/:path*'] };
