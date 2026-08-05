import { getStarterKits } from '@/features/starter-kit/api/get-starter-kits';
import { groupStarterKitsByCategory } from '@/features/starter-kit/model/group-by-category';
import { StarterKitList } from '@/features/starter-kit/ui/starter-kit-list';

export default async function Home() {
  const starterKits = await getStarterKits();
  const sections = groupStarterKitsByCategory(starterKits);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Frontend Starter Platform</h1>
        <p className="text-xl text-muted-foreground">
          바로 시작할 수 있는 스타터 킷을 카테고리별로 확인해보세요
        </p>
      </div>
      <StarterKitList sections={sections} />
    </main>
  );
}
