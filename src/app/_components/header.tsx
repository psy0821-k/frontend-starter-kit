import Link from 'next/link';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { LogoutButton } from '@/features/auth/ui/logout-button';

const linkClassName =
  'rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

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
          <Link href="/about" className={linkClassName}>
            소개
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user.nickname}님</span>
              <LogoutButton />
            </div>
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
