'use client';

import { useState } from 'react';
import UserIcon from '@heroicons/react/24/solid/UserIcon';
import Image from 'next/image';

interface ProfileImageProps {
  src: string;
  size?: number;
}

export function ProfileImage({ src, size = 50 }: ProfileImageProps) {
  const [hasError, setHasError] = useState(false);

  // 프로필 이미지가 없거나 로딩에 실패하면 기본 아이콘을 보여준다.
  if (!src || hasError) {
    return (
      <div
        className="bg-surface-sunken text-fg-muted flex items-center justify-center rounded-full"
        style={{ width: size, height: size }}
      >
        <UserIcon style={{ width: size * 0.6, height: size * 0.6 }} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="Profile Image"
      width={size}
      height={size}
      className="bg-surface-sunken rounded-full"
      onError={() => setHasError(true)}
    />
  );
}
