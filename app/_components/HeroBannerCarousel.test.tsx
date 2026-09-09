import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Banner,
  HeroBannerCarousel,
} from '@/app/_components/HeroBannerCarousel';

function makeBanner(overrides: Partial<Banner> = {}): Banner {
  return {
    id: '1',
    imageUrl: 'https://placehold.co/300x600',
    badge: '배지',
    changeRate: 1.5,
    nameEn: 'Name EN',
    nameKr: '이름',
    krAvgPrice: 10000,
    jpLowestPriceYen: 1000,
    jpLowestPriceKr: 9000,
    href: '/products/1',
    ...overrides,
  };
}

describe('HeroBannerCarousel', () => {
  it('banners가 빈 배열이면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<HeroBannerCarousel banners={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('banners가 1개면 슬라이드/닷 없이 카드만 렌더링한다', () => {
    render(<HeroBannerCarousel banners={[makeBanner({ nameEn: 'Solo' })]} />);

    expect(screen.getByText('Solo')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('banners가 여러 개면 각 배너 수만큼 닷을 렌더링한다', () => {
    const banners = [
      makeBanner({ id: '1', nameEn: 'A' }),
      makeBanner({ id: '2', nameEn: 'B' }),
      makeBanner({ id: '3', nameEn: 'C' }),
    ];

    render(<HeroBannerCarousel banners={banners} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('첫 배너에 해당하는 닷이 aria-selected="true"다', () => {
    const banners = [
      makeBanner({ id: '1', nameEn: 'A' }),
      makeBanner({ id: '2', nameEn: 'B' }),
    ];

    render(<HeroBannerCarousel banners={banners} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('닷을 클릭하면 해당 배너의 닷이 활성화된다', async () => {
    const banners = [
      makeBanner({ id: '1', nameEn: 'A' }),
      makeBanner({ id: '2', nameEn: 'B' }),
    ];

    render(<HeroBannerCarousel banners={banners} />);

    const tabs = screen.getAllByRole('tab');
    act(() => {
      tabs[1].click();
    });

    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
  });
});
