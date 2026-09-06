import Link from 'next/link';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { LogoutButton } from '@/features/auth/ui/logout-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const focusRingClassName =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
const linkClassName = `rounded-sm ${focusRingClassName}`;

async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="fixed top-0 right-0 left-0 z-20 h-14 border-b border-border bg-background">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={'/'} className={linkClassName}>
          Yoon.dev
        </Link>
        <nav className="flex items-center gap-4" aria-label="주요 메뉴">
          <Link href="/templates" className={linkClassName}>
            템플릿
          </Link>
          <Link href="/features" className={linkClassName}>
            기능
          </Link>
          <Link href="/mypage" className={linkClassName}>
            마이페이지
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className={`rounded-full ${focusRingClassName}`}
                    aria-label={`${user.nickname}님 메뉴 열기`}
                  />
                }
              >
                <Avatar>
                  <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{user.nickname}님</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem nativeButton render={<LogoutButton />} />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login" className={linkClassName}>
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
