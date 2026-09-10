'use client';

import Image from 'next/image';

interface CardShopProps {
  shopName: string;
  price: string; // 숫자에 쉼표, 단위까지 있는 문자열로 받음
  subPrice?: string; // 숫자에 쉼표, 단위까지 있는 문자열로 받음
  addressName: string;
  mapAddress?: string; // 지도 주소(구글지도 기준)
}

export function CardShop({
  shopName,
  price,
  subPrice,
  addressName,
  mapAddress,
}: CardShopProps) {
  /**
   * 주어진 검색어(주소, 장소명 등)로 구글 지도를 엽니다.
   *
   * 검색어의 정확도에 따라 결과 화면이 달라집니다.
   * - 건물명 등 정확한 주소가 아닌 검색어를 입력하면 여러 장소가 나열된 목록 화면이 나옵니다.
   * - 주소를 정확하게 모두 입력하면 해당 장소 하나가 바로 선택되어 표시됩니다.
   *
   * 플랫폼별로 앱 실행 방식도 다릅니다.
   * - Android: 구글 지도 앱을 Intent로 실행하고, 앱이 없으면 자동으로 웹 지도로 폴백합니다.
   * - iOS(아이폰/아이패드): 구글 지도 앱(comgooglemaps://) 실행을 시도하고,
   *   1.5초 내에 페이지가 백그라운드로 전환되지 않으면(=앱이 없다고 판단) 웹 지도로 이동합니다.
   * - 그 외(PC 등): 새 탭에서 구글 지도 웹 페이지를 엽니다.
   *
   * SSR 환경(window 없음)에서는 아무 동작도 하지 않습니다.
   *
   * @param query 검색할 주소 또는 장소명 (예: "스타벅스", "스타벅스 강남R점")
   */
  const openGoogleMapsApp = (query?: string): void => {
    if (typeof window === 'undefined' || !query) return;

    const userAgent = navigator.userAgent.toLowerCase();
    const encodedQuery = encodeURIComponent(query);

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

    const isAndroid = /android/i.test(userAgent);
    const isIOS =
      /iphone|ipad|ipod/i.test(userAgent) ||
      (userAgent.includes('mac') && navigator.maxTouchPoints > 1);

    if (isAndroid) {
      const intentUrl = `intent://maps.google.com/maps?q=${encodedQuery}#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
      window.location.href = intentUrl;
      return;
    }

    if (isIOS) {
      const appUrl = `comgooglemaps://?q=${encodedQuery}`;
      let didHide = false;
      const handleVisibilityChange = () => {
        if (document.hidden) didHide = true;
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      window.location.href = appUrl;

      setTimeout(() => {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
        if (!didHide && !document.hidden) {
          window.location.href = webUrl;
        }
      }, 1500);
      return;
    }
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="flex gap-2">
        <Image
          src="https://placehold.co/40x40.png"
          alt={shopName}
          width={40}
          height={40}
        />
        <div>
          <p>
            <span>{price}</span>
            <span>{subPrice}</span>
          </p>
          <p
            className="cursor-pointer text-sm text-gray-500"
            onClick={() => openGoogleMapsApp(mapAddress)}
          >
            {addressName}
          </p>
        </div>
      </div>
    </>
  );
}
