import { NextRequest, NextResponse } from 'next/server';

// ponytail: 백엔드 미연동 상태라 카카오 인가 code를 검증/교환하지 않고 바로 로그인 성공 처리한다.
// 백엔드 연동 후에는 code를 백엔드에 전달해 accessToken을 발급받도록 교체할 것.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/login/callback', request.url));
}
