import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

import { PROJECT_NAME } from '@/constants/name';

export const alt = `${PROJECT_NAME} - 한국·일본 위스키 가격 비교`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// ImageResponse 기본 폰트에는 한글이 없다. 이미지에 쓰는 글자만 담은 서브셋 폰트를 쓰므로
// 문구를 바꾸면 assets/fonts의 폰트도 새 글자를 포함하도록 다시 받아야 한다
const TAGLINE = '한국·일본 위스키 가격 비교 · 컬렉션 · 플래너';

export default async function Image() {
  const [font, logo] = await Promise.all([
    readFile(
      join(process.cwd(), 'assets/fonts/noto-sans-kr-700-og-subset.ttf')
    ),
    readFile(join(process.cwd(), 'public/logo.svg'), 'base64'),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        background: '#ffffff',
        fontFamily: 'Noto Sans KR',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse는 next/image를 쓸 수 없다 */}
      <img
        src={`data:image/svg+xml;base64,${logo}`}
        width={320}
        height={164}
        alt=""
      />
      <div style={{ fontSize: 96, color: '#101828' }}>{PROJECT_NAME}</div>
      <div style={{ fontSize: 40, color: '#ff8904' }}>{TAGLINE}</div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Noto Sans KR', data: font, weight: 700, style: 'normal' },
      ],
    }
  );
}
