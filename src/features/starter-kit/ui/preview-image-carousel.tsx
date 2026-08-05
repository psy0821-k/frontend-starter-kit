'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FallbackImage } from '@/shared/ui/fallback-image';

interface PreviewImageCarouselProps {
  images: string[];
  title: string;
}

/**
 * 요약 모달 내 미리보기 이미지 캐러셀.
 * 이미지가 1장이면 좌우 네비게이션 없이 단일 이미지만 노출합니다.
 */
export function PreviewImageCarousel({ images, title }: PreviewImageCarouselProps) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const showNav = images.length > 1;

  return (
    <div className="relative">
      <FallbackImage
        src={images[index]}
        alt={`${title} 미리보기 이미지 ${index + 1}/${images.length}`}
        className="aspect-video w-full rounded-lg"
      />
      {showNav && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-1/2 left-2 -translate-y-1/2"
            onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)}
          >
            <ChevronLeft aria-hidden="true" />
            <span className="sr-only">이전 이미지</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-1/2 right-2 -translate-y-1/2"
            onClick={() => setIndex((prev) => (prev + 1) % images.length)}
          >
            <ChevronRight aria-hidden="true" />
            <span className="sr-only">다음 이미지</span>
          </Button>
        </>
      )}
    </div>
  );
}
