'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * 이미지 로딩 실패 시 고정 placeholder 아이콘을 보여주는 img 래퍼.
 * 카드 썸네일, 모달 미리보기 캐러셀에서 공통으로 사용합니다.
 */
export function FallbackImage({ src, alt, className }: FallbackImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn('flex items-center justify-center bg-muted text-muted-foreground', className)}
      >
        <ImageOff className="size-8" aria-hidden="true" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn('object-cover', className)}
      onError={() => setHasError(true)}
    />
  );
}
