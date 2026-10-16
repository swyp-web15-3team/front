import type { Metadata } from 'next';

import { PolicyDocument } from '@/components/common/PolicyDocument';
import { TERMS_OF_SERVICE } from '@/constants/policies';

export const metadata: Metadata = {
  title: '이용약관',
};

export default function TermsPage() {
  return (
    <>
      <h1 className="text-page-title mb-8">{TERMS_OF_SERVICE.title}</h1>
      <PolicyDocument doc={TERMS_OF_SERVICE} />
    </>
  );
}
