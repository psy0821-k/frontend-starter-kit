'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PreviewImageCarousel } from './preview-image-carousel';
import type { StarterKit } from '../model/types';

interface StarterKitSummaryModalProps {
  starterKit: StarterKit | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * 카드 클릭 시 열리는 스타터 킷 요약 정보 모달.
 * starterKit이 null이면 닫힌 상태로 렌더링합니다.
 */
export function StarterKitSummaryModal({ starterKit, onOpenChange }: StarterKitSummaryModalProps) {
  const router = useRouter();

  return (
    <Dialog open={starterKit !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {starterKit && (
          <>
            <DialogHeader>
              <DialogTitle>{starterKit.title}</DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                {starterKit.description}
              </DialogDescription>
            </DialogHeader>

            <PreviewImageCarousel images={starterKit.preview_images} title={starterKit.title} />

            <section>
              <h3 className="mb-2 text-sm font-medium">주요 기능</h3>
              <ul className="list-inside list-disc space-y-1 text-base leading-relaxed text-muted-foreground">
                {starterKit.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-medium">사용 기술</h3>
              <div className="flex flex-wrap gap-1.5">
                {starterKit.tech_stack.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </section>

            <DialogFooter>
              <Button type="button" onClick={() => router.push(`/templates/${starterKit.id}`)}>
                자세히 보기
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
