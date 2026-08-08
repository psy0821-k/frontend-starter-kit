import { CheckIcon, XIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { PASSWORD_REQUIREMENTS } from '@/features/auth/model/password-requirements';

interface PasswordRequirementListProps {
  password: string;
}

/**
 * 비밀번호 조건 충족 여부를 타이핑 중 실시간으로 보여주는 체크리스트.
 * aria-live="polite"로 스크린리더 사용자도 조건 충족 변화를 인지할 수 있게 한다.
 */
export function PasswordRequirementList({ password }: PasswordRequirementListProps) {
  return (
    <ul aria-live="polite" className="mt-1.5 flex flex-col gap-1">
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const isMet = requirement.test(password);

        return (
          <li
            key={requirement.id}
            className={cn(
              'flex items-center gap-1.5 text-xs',
              isMet ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {isMet ? (
              <CheckIcon aria-hidden="true" className="size-3.5" />
            ) : (
              <XIcon aria-hidden="true" className="size-3.5" />
            )}
            <span>
              {requirement.label}
              <span className="sr-only">{isMet ? ' 조건 충족' : ' 조건 미충족'}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
