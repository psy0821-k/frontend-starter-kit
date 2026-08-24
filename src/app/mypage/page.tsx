import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { NicknameForm } from '@/features/mypage/ui/nickname-form';

export default async function MyPage() {
  const user = await getCurrentUser();

  if (user === null) {
    redirect('/auth/login');
    return null;
  }

  return <NicknameForm currentNickname={user.nickname} />;
}
