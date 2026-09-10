import { networkInterfaces } from 'node:os';
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// 같은 네트워크의 모바일 기기 등에서 dev 서버(HMR 포함)에 접속할 수 있도록,
// 이 머신의 사설 네트워크 IPv4 주소를 자동으로 찾아 허용 목록에 쓴다.
// 팀원마다 로컬 IP가 다르고 DHCP로 바뀌기도 해서 수동 설정 대신 자동 감지한다.
// VirtualBox Host-Only 어댑터의 MAC OUI(예: 08:00:27:.. / 0a:00:27:..)는 항상
// 2~3번째 옥텟이 00:27이다. 이 어댑터는 호스트-VM 간 격리된 가상 네트워크라
// 실제 기기에서 접속할 수 없으므로 목록에서 제외한다.
function isVirtualBoxAdapter(mac: string): boolean {
  const segments = mac.toLowerCase().split(':');
  return segments[1] === '00' && segments[2] === '27';
}

function getLocalNetworkOrigins(): string[] {
  const origins = Object.values(networkInterfaces())
    .flat()
    .filter(
      (entry) =>
        entry &&
        entry.family === 'IPv4' &&
        !entry.internal &&
        !isVirtualBoxAdapter(entry.mac)
    )
    .map((entry) => entry!.address);

  if (origins.length > 0) {
    const port = process.env.PORT ?? 3000;
    console.log('[allowedDevOrigins] 허용된 로컬 IP:', origins);
    console.log(
      '[allowedDevOrigins] 다만 이 컴퓨터와 같은 네트워크(같은 와이파이/공유기 등)에 연결된 기기에서만 접속됩니다.'
    );
    console.log(
      '[allowedDevOrigins] 다른 기기에서 테스트하려면 아래 주소로 접속하세요:'
    );
    for (const origin of origins) {
      console.log(`  http://${origin}:${port}`);
    }
  }

  return origins;
}

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [new URL('https://placehold.co/**')],
  },
  allowedDevOrigins: getLocalNetworkOrigins(),
};

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: {
    disable: true,
  },
  telemetry: false,
});
