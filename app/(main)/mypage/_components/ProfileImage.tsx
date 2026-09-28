'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProfileImageProps {
  src: string;
  size?: number;
}

export function ProfileImage({ src, size = 50 }: ProfileImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className="bg-surface-sunken rounded-full"
        style={{ width: size, height: size }}
      />
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
