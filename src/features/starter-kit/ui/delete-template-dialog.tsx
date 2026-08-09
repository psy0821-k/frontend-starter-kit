'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/shared/api/error';
import { deleteTemplate } from '../api/delete-template';

interface DeleteTemplateDialogProps {
  templateId: string;
  templateTitle: string;
}

/**
 * 템플릿 삭제 확인 다이얼로그.
 *
 * 삭제 API 호출·에러 표시·완료 후 라우팅까지 이 컴포넌트가 전담한다 —
 * "삭제"라는 특정 액션에 특화된 정책이라 아직 다른 도메인에서 재사용된 적
 * 없는 이 시점에는 shared/ui로 올리지 않는다("2회 규칙").
 *
 * 성공 시 별도 토스트 없이 목록으로 리다이렉트하는 것 자체가 완료 신호다
 * (docs/templates/feature/delete/spec-fixed.md 참조). 실패 시에만 다이얼로그를
 * 닫지 않고 내부에 에러 메시지를 표시한다.
 */
export function DeleteTemplateDialog({ templateId, templateTitle }: DeleteTemplateDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      await deleteTemplate(templateId);
      router.push('/templates');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '템플릿 삭제에 실패했습니다');
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isDeleting) setIsOpen(open);
      }}
    >
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        삭제
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>템플릿을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{templateTitle}&rdquo;을(를) 삭제하면 되돌릴 수 없습니다. 등록된 파일과 썸네일도
            함께 삭제됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={() => void handleDelete()}>
            {isDeleting ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
