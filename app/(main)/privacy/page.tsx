import type { Metadata } from 'next';

import { PolicyDocument } from '@/components/common/PolicyDocument';
import { PRIVACY_POLICY } from '@/constants/policies';

export const metadata: Metadata = {
  title: '개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-page-title mb-8">{PRIVACY_POLICY.title}</h1>
      <PolicyDocument doc={PRIVACY_POLICY} />
    </>
  );
}
