'use client';
import * as Sentry from '@sentry/nextjs';

import { Button } from '@/components/ui/Button';
import { HorizontalCard } from '@/components/ui/HorizontalCard';
import { VerticalCard } from '@/components/ui/VerticalCard';
import {
  SampleModal1,
  useSampleModal1,
} from '@/components/common/SampleModal1';
import { useSaveItemModal } from '@/components/common/SaveItemModal';

export default function UiPage() {
  const { open: openSampleModal1 } = useSampleModal1();
  const { open: openSaveItemModal } = useSaveItemModal();

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
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={errorTestHandler}>
          client 에러 전송 버튼
        </Button>
        <Button variant="secondary" onClick={serverErrorTestHandler}>
          server 에러 전송 버튼
        </Button>
        <Button variant="secondary" onClick={edgeErrorTestHandler}>
          edge 에러 전송 버튼
        </Button>
        <Button variant="secondary" onClick={openSampleModal1}>
          샘플 모달 열기1
        </Button>
        <Button
          variant="secondary"
          onClick={() => console.log('콘솔로그 테스트')}
        >
          콘솔로그
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            openSaveItemModal({
              id: 101,
              name: '야마자키 12년(더미)',
              originalName: '山崎 | Yamazaki 12yo',
              imageUrl: 'https://placehold.co/200x150.png',
            })
          }
        >
          저장 모달 열기
        </Button>
      </div>
      <SampleModal1 />
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
          volumeMl: 700,
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
