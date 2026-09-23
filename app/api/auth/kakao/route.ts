import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { message: 'Kakao OAuth 환경변수가 설정되지 않았습니다' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  // ?prompt=login 이면 카카오 계정 선택 화면을 강제한다 (다른 계정 테스트용)
  const prompt = new URL(request.url).searchParams.get('prompt');
  if (prompt) params.set('prompt', prompt);

  return NextResponse.redirect(
    `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
  );
}
