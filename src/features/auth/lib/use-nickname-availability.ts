import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';
import { useDebouncedValue } from '@/shared/lib/hooks/use-debounced-value';

const NICKNAME_CHECK_DEBOUNCE_MS = 500;

type NicknameAvailabilityStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

interface CheckNicknameResponse {
  available: boolean;
}

/**
 * 닉네임 입력이 500ms 동안 멈추면 /api/auth/check-nickname을 조회한다.
 * 디바운스 로직은 기존 use-debounced-value.ts를 재사용한다.
 */
export function useNicknameAvailability(nickname: string): NicknameAvailabilityStatus {
  const [status, setStatus] = useState<NicknameAvailabilityStatus>('idle');
  const debouncedNickname = useDebouncedValue(nickname, NICKNAME_CHECK_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedNickname.trim() === '') {
      setStatus('idle');
      return;
    }

    let isCancelled = false;
    setStatus('checking');

    apiClient
      .post<CheckNicknameResponse>('/api/auth/check-nickname', { nickname: debouncedNickname })
      .then((result) => {
        if (!isCancelled) {
          setStatus(result.available ? 'available' : 'unavailable');
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setStatus('error');
        }
        if (!(error instanceof ApiError)) {
          throw error;
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedNickname]);

  return status;
}
