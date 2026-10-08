import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

import { PROJECT_NAME } from '@/constants/name';

export const alt = PROJECT_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// 서비스명·소개 문구는 공유 미리보기에 텍스트로 따로 표시되므로 이미지에는 로고만 둔다.
// 정사각형으로 잘려 보이는 경우에도 로고가 남도록 가운데 630px 안에 들어가는 크기로 그린다
export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public/logo.svg'), 'base64');

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse는 next/image를 쓸 수 없다 */}
      <img
        src={`data:image/svg+xml;base64,${logo}`}
        width={480}
        height={246}
        alt=""
      />
    </div>,
    size
  );
}
