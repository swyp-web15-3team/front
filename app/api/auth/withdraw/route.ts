import { NextRequest, NextResponse } from 'next/server';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export async function POST(request: NextRequest) {
  // ponytail: 백엔드 /users/withdraw 미연동 상태의 더미 응답. 정책/연동 확정되면 실제 axios 호출로 교체.
  await request.json().catch(() => null);

  const response = NextResponse.json({ success: true });
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
