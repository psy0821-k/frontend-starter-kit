import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { NicknameForm } from '@/features/mypage/ui/nickname-form';
import { getMyBookmarks } from '@/features/mypage/api/get-my-bookmarks';
import { MyBookmarkList } from '@/features/mypage/ui/my-bookmark-list';
import { WithdrawDialog } from '@/features/mypage/ui/withdraw-dialog';

export default async function MyPage() {
  const user = await getCurrentUser();

  if (user === null) {
    redirect('/auth/login');
    return null;
  }

  const bookmarks = await getMyBookmarks(user.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">마이페이지</h1>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">계정 정보</h2>
        <NicknameForm currentNickname={user.nickname} />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">내 북마크</h2>
        <MyBookmarkList items={bookmarks} />
      </section>

      <section className="border-t border-border pt-6">
        <h2 className="mb-3 text-xl font-semibold text-destructive">위험 구역</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          계정을 삭제하면 모든 데이터가 영구적으로 제거되며 되돌릴 수 없습니다.
        </p>
        <WithdrawDialog currentNickname={user.nickname} />
      </section>
    </main>
  );
}
