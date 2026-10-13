export function openGoogleMaps(address?: string): void {
  if (typeof window === 'undefined' || !address) return;

  const userAgent = navigator.userAgent.toLowerCase();
  const encodedAddress = encodeURIComponent(address);

  // 일반 주소를 검색/위치 지정용으로 사용
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  const isAndroid = /android/i.test(userAgent);
  const isIOS =
    /iphone|ipad|ipod/i.test(userAgent) ||
    (userAgent.includes('mac') && navigator.maxTouchPoints > 1);

  if (isAndroid) {
    const intentUrl = `intent://maps.google.com/maps?q=${encodedAddress}#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
    window.location.href = intentUrl;
    return;
  }

  if (isIOS) {
    // iOS 구글 맵 앱에서도 q 파라미터로 주소 전달 가능
    const appUrl = `comgooglemaps://?q=${encodedAddress}`;
    let didHide = false;
    const handleVisibilityChange = () => {
      if (document.hidden) didHide = true;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    window.location.href = appUrl;

    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!didHide && !document.hidden) {
        window.location.href = webUrl;
      }
    }, 1500);
    return;
  }

  window.open(webUrl, '_blank', 'noopener,noreferrer');
}
