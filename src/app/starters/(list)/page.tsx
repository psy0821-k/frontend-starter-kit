import { STARTERS } from '@/features/starter-catalog/model/starters';
import { StarterList } from '@/features/starter-catalog/ui/starter-list';

/**
 * 스타터 카탈로그 목록 페이지.
 * 선택 가능한 스타터(포트폴리오, ERP)를 카드 그리드로 노출합니다.
 */
export default function StartersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">스타터</h1>
        <p className="text-xl text-muted-foreground">
          프로젝트의 시작점이 되는 스타터를 선택해 바로 데모를 확인해보세요
        </p>
      </div>
      <StarterList starters={STARTERS} />
    </main>
  );
}
