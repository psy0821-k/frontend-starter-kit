import Link from 'next/link';

const linkClassName =
  'rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-20 h-14 border-b border-border bg-background">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={'/'} className={linkClassName}>
          Yoon.dev
        </Link>
        <nav className="flex gap-4" aria-label="주요 메뉴">
          <Link href="/templates" className={linkClassName}>
            템플릿
          </Link>
          <Link href="/features" className={linkClassName}>
            기능
          </Link>
          <Link href="/about" className={linkClassName}>
            소개
          </Link>
          <Link href="/auth/login" className={linkClassName}>
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
