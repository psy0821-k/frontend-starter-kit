import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { NicknameForm } from '@/features/mypage/ui/nickname-form';
import { getMyBookmarks } from '@/features/mypage/api/get-my-bookmarks';
import { MyBookmarkList } from '@/features/mypage/ui/my-bookmark-list';

export default async function MyPage() {
  const user = await getCurrentUser();

  if (user === null) {
    redirect('/auth/login');
    return null;
  }

  const bookmarks = await getMyBookmarks(user.id);

  return (
    <>
      <NicknameForm currentNickname={user.nickname} />
      <MyBookmarkList items={bookmarks} />
    </>
  );
}
