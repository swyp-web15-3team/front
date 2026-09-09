'use client';
import * as Sentry from '@sentry/nextjs';

import { HorizontalCard } from '@/components/ui/HorizontalCard';
import { VerticalCard } from '@/components/ui/VerticalCard';
import {
  SampleModal1,
  useSampleModal1,
} from '@/components/common/SampleModal1';
import {
  SampleModal2,
  useSampleModal2,
} from '@/components/common/SampleModal2';

export default function UiPage() {
  const { open: openSampleModal1 } = useSampleModal1();
  const { open: openSampleModal2 } = useSampleModal2();

  const errorTestHandler = () => {
    Sentry.captureException(new Error('GlitchTip 브라우저 테스트 에러'));
  };
  const serverErrorTestHandler = () => {
    fetch('/api/error-test/server');
  };
  const edgeErrorTestHandler = () => {
    fetch('/api/error-test/edge');
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <button
          onClick={errorTestHandler}
          className="border-2 bg-amber-50 text-black"
        >
          client 에러 전송 버튼
        </button>
        <button
          onClick={serverErrorTestHandler}
          className="border-2 bg-amber-50 text-black"
        >
          server 에러 전송 버튼
        </button>
        <button
          onClick={edgeErrorTestHandler}
          className="border-2 bg-amber-50 text-black"
        >
          edge 에러 전송 버튼
        </button>
        <button
          onClick={openSampleModal1}
          className="border-2 bg-amber-50 text-black"
        >
          샘플 모달 열기1
        </button>{' '}
        <button
          onClick={openSampleModal2}
          className="border-2 bg-amber-50 text-black"
        >
          샘플 모달 열기2
        </button>
        <button
          onClick={() => console.log('콘솔로그 테스트')}
          className="border-2 bg-amber-50 text-black"
        >
          콘솔로그
        </button>
      </div>
      <SampleModal1 />
      <SampleModal2 />
      <VerticalCard
        className="w-60"
        product={{
          imageUrl: 'https://placehold.co/200x150.png',
          name: '야마자키 12년',
          originalName: '山崎 | Yamazaki 12yo',
          discountRate: -42,
          krPrice: 298000,
          jpPrice: 168500,
          jpPriceYen: 18500,
        }}
      />
      <HorizontalCard
        className="w-100"
        product={{
          imageUrl: 'https://placehold.co/200x150.png',
          name: '야마자키 12년',
          originalName: '山崎 | Yamazaki 12yo',
          discountRate: -42,
          krPrice: 298000,
          jpPrice: 168500,
          jpPriceYen: 18500,
        }}
      />
    </section>
  );
}
