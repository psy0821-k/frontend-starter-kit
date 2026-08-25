'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/shared/api/error';
import { apiClient } from '@/shared/api/client';

export interface WithdrawDialogProps {
  currentNickname: string;
}

/**
 * 회원 탈퇴 확인 다이얼로그.
 * 입력값이 currentNickname과 정확히 일치할 때만(exact match, trim/대소문자 무시 없음)
 * "탈퇴하기" 버튼이 활성화된다.
 *
 * 성공 시 계정이 삭제되지만 브라우저에 남은 세션 쿠키는 자동으로 무효화되지 않으므로,
 * 로그아웃 API를 호출해 쿠키를 제거하고 router.refresh()로 Header(서버 컴포넌트)의
 * 로그인 상태를 갱신한 뒤 홈으로 이동한다. 실패 시 delete-template-dialog.tsx와 동일하게
 * 다이얼로그를 닫지 않고 내부에 에러 메시지를 표시한다.
 */
export function WithdrawDialog({ currentNickname }: WithdrawDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isMatched = input === currentNickname;

  const handleWithdraw = async () => {
    setError(null);
    setIsWithdrawing(true);

    try {
      await apiClient.delete('/api/mypage/withdraw');
      await apiClient.post('/api/auth/logout');
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원 탈퇴에 실패했습니다');
      setIsWithdrawing(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isWithdrawing) {
          setIsOpen(open);
          if (!open) {
            setInput('');
            setError(null);
          }
        }
      }}
    >
      <DialogTrigger render={<Button variant="destructive" />}>회원 탈퇴</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>정말 탈퇴하시겠어요?</DialogTitle>
          <DialogDescription>
            탈퇴하면 계정이 삭제되며 되돌릴 수 없습니다. 계속하려면 닉네임 &ldquo;
            {currentNickname}&rdquo;을(를) 정확히 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <Input value={input} onChange={(e) => setInput(e.target.value)} disabled={isWithdrawing} />

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={!isMatched || isWithdrawing}
            onClick={() => void handleWithdraw()}
          >
            {isWithdrawing ? '탈퇴 중...' : '탈퇴하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
