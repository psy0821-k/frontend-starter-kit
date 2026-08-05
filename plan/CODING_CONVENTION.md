# CODING_CONVENTION.md

Frontend Starter Platform의 코딩 컨벤션 (코딩 스타일 + 규칙)입니다.
CLAUDE.md의 개발 원칙과 함께 읽으세요.

---

## 1. 파일 구조 & 네이밍

### 1.1 폴더 이름

**kebab-case** (소문자 + 하이픈)

```
src/shared/lib/hooks/  ✅
src/shared/lib/Hooks/  ❌
src/shared/lib/hooks   ❌
```

### 1.2 컴포넌트 파일명

**PascalCase** (.tsx)

```
src/components/ui/Button.tsx  ✅
src/components/ui/button.tsx  ❌
```

### 1.3 유틸 함수 파일명

**kebab-case** (.ts)

```
src/shared/lib/format-date.ts    ✅
src/shared/lib/formatDate.ts     ❌
```

### 1.4 타입/인터페이스 정의

**별도 `types` 폴더 또는 컴포넌트와 같은 파일**

```
src/types/api.ts         ✅  (공유 타입)
src/components/Button.tsx ✅  (컴포넌트 내 타입은 같은 파일)
```

### 1.5 테스트 파일명

**Component.spec.tsx**

```
Button.spec.tsx    ✅
Button.test.tsx    (허용)
```

### 1.6 컴포넌트 내보내기

**Named export**

```typescript
// ✅
export function Button() {}
export type ButtonProps = {};

// ❌
export default Button;
```

### 1.7 index.ts 사용

**특정 폴더(shared/ui)만 barrel export 사용**

```typescript
// src/shared/ui/index.ts ✅
export { Button } from './button';
export { Input } from './input';
// ...

// src/features/order/ui 에서는 사용 금지
// → 직접 import: import { OrderCard } from '@/features/order/ui/order-card';
```

### 1.8 경로 표기

**항상 절대 경로 (@/...)**

```typescript
// ✅
import { Button } from '@/shared/ui';
import { useAuth } from '@/shared/lib/hooks/use-auth';

// ❌
import { Button } from '../../../shared/ui';
```

### 1.9 동적 import

**next/dynamic 사용**

```typescript
// ✅
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('@/features/heavy'), {
  loading: () => <div>로딩 중...</div>,
});

// ❌
const HeavyComponent = React.lazy(() => import('@/features/heavy'));
```

### 1.10 프라이빗 파일 표시

**언더스코어 prefix (\_)**

```
_internal-helper.ts  (프라이빗)
helper.ts           (퍼블릭)
```

---

## 2. 변수 & 함수 네이밍

### 2.1 부울 변수명

**is, has, can, should prefix**

```typescript
// ✅
const isLoading = true;
const hasError = false;
const canSubmit = true;
const shouldRefresh = true;

// ❌
const loading = true;
const error = false;
```

### 2.2 상수명

**UPPER_SNAKE_CASE**

```typescript
// ✅
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;

// ❌
const maxRetryCount = 3;
const max_retry_count = 3;
```

### 2.3 이벤트 핸들러명

**handle + EventName**

```typescript
// ✅
const handleClick = () => {};
const handleFormSubmit = () => {};
const handleInputChange = () => {};

// ❌
const onClick = () => {};
const onFormSubmit = () => {};
```

### 2.4 콜백 함수 매개변수명

**구체적인 이름**

```typescript
// ✅
interface Props {
  onSuccess: (data: User) => void;
  onError: (error: ApiError) => void;
  onRetry: () => void;
}

// ❌
interface Props {
  cb: () => void;
  fn: () => void;
}
```

### 2.5 배열 변수명

**복수형**

```typescript
// ✅
const items: Item[] = [];
const users: User[] = [];

// ❌
const itemList: Item[] = [];
const user: User[] = [];
```

### 2.6 객체 구조분해 시 긴 이름

**별도 변수로 추출 또는 별칭 사용**

```typescript
// ✅
const { userName: name } = user;
const { createdAtTimestamp: createdAt } = record;

// 또는
const { userName, email } = user;
const name = userName;

// ❌
const { userName, createdAtTimestamp } = user;
// (너무 길 경우)
```

### 2.7 타입 정의 이름

**간단한 이름 (I/T prefix 없음)**

```typescript
// ✅
type User = { id: number; name: string };
interface Product { id: number; price: number; }

// ❌
type TUser = { ... };
interface IProduct { ... };
```

### 2.8 제네릭 타입명

**T, U, V (또는 구체적 이름)**

```typescript
// ✅
function createStore<T>(initialState: T) {}
function fetch<TResponse>(url: string) {}

// 복잡하면 구체적으로
function useQuery<TData, TError>(key: string) {}
```

### 2.9 에러 변수명

**error (또는 err)**

```typescript
// ✅
try {
  // ...
} catch (error) {
  console.error(error);
}

// ❌
catch (e) { ... }
catch (exception) { ... }
```

### 2.10 Ref 변수명

**+ Ref (camelCase)**

```typescript
// ✅
const buttonRef = useRef<HTMLButtonElement>(null);
const inputRef = useRef<HTMLInputElement>(null);

// ❌
const refButton = useRef(...);
const buttonReference = useRef(...);
```

---

## 3. 주석 & 문서화

### 3.1 JSDoc

**복잡한 로직만 작성 (간단한 함수는 불필요)**

```typescript
// ✅ 복잡한 함수
/**
 * Zod 스키마로부터 기본값 객체를 생성합니다.
 * @param schema - Zod 스키마
 * @returns 모든 필드가 기본값으로 초기화된 객체
 */
function extractDefaults<T>(schema: ZodSchema): T {}

// ✅ 간단한 함수 (JSDoc 불필요)
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR').format(date);
}
```

### 3.2 한 줄 주석

**코드 위에 작성 (한국어)**

```typescript
// 빈 상태일 때 기본 메시지 표시
if (items.length === 0) {
  return <div>항목이 없습니다</div>;
}
```

### 3.3 TODO/FIXME/NOTE

**구조화된 형식**

```typescript
// TODO: 성능 최적화 필요 (useCallback 추가)
// FIXME: 이 에러는 API 응답 구조 변경 후 수정 필요
// NOTE: 이 값은 런타임 환경변수에서 읽음
```

### 3.4 주석 언어

**한국어**

```typescript
// ✅
// 사용자 인증 여부 확인

// ❌
// Check user authentication
```

### 3.5 console.log

**개발 중 사용 가능, production 배포 전 제거**

```typescript
// 개발 중 OK
console.log('debug:', data);

// production에서는 제거
// 필요시 logger 라이브러리 사용
```

### 3.6 이전 코드 주석 처리

**하지 않음 (git history 있으므로)**

```typescript
// ❌ 하지 말 것
// const oldFunction = () => {};

// ✅ 필요하면 git log로 확인
```

### 3.7 문서화

**루트 + 폴더별 CLAUDE.md**

- 루트: CLAUDE.md (전역 규칙)
- `src/shared/CLAUDE.md` (공유 커널)
- `src/features/*/CLAUDE.md` (도메인별)

### 3.8 함수 내 섹션

**// Section Name 스타일**

```typescript
function processData(input: Data): Result {
  // 데이터 검증
  if (!input.isValid()) throw new Error('Invalid');

  // 변환
  const transformed = transform(input);

  // 캐싱
  cache.set(transformed);

  return transformed;
}
```

### 3.9 사용 예시

**JSDoc @example 또는 대표 구현 파일 지목**

```typescript
/**
 * @example
 * const result = useAppForm(loginSchema);
 * const { control, handleSubmit } = result;
 */
export function useAppForm<T>(schema: ZodType<T>) {}
```

---

## 4. 타입 시스템

### 4.1 any 사용

**완전 금지 (ESLint로 강제)**

```typescript
// ✅ unknown 사용 후 타입 가드
function handleData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // ...
  }
}

// ❌
function handleData(data: any) {}
```

### 4.2 Optional 타입

**T | undefined**

```typescript
// ✅
type User = { id: number; email?: string };
const getUser = (id?: number) => {};

// ❌
type User = { id: number; email: string | null };
```

### 4.3 Readonly

**필요한 부분만**

```typescript
// ✅ Props는 readonly 권장
type ButtonProps = {
  readonly label: string;
  readonly onClick: () => void;
};

// ✅ 상수 배열
const ALLOWED_ROLES: readonly string[] = ['admin', 'user'];
```

### 4.4 Pick, Omit, Partial

**명시적인 Pick 선호**

```typescript
// ✅ Pick: 의도가 명확
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit/Partial은 필요할 때만
type UserUpdate = Partial<Omit<User, 'id' | 'createdAt'>>;
```

### 4.5 Union vs Intersection

**Union: 타입 좁히기 | Intersection: 타입 확장**

```typescript
// Union (좁히기)
type Status = 'pending' | 'loading' | 'success' | 'error';

// Intersection (확장)
type AuthenticatedUser = User & { isAuthenticated: true };
```

### 4.6 제네릭 제약

**명확한 제약 필수**

```typescript
// ✅
function createStore<T extends Record<string, unknown>>(initialState: T) {}

// ❌ 제약 없음
function createStore<T>(initialState: T) {}
```

### 4.7 Error 타입

**커스텀 에러 클래스 (ApiError)**

```typescript
// ✅
class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string
  ) {}
}

// ❌
throw { message: 'error' };
throw 'error string';
```

### 4.8 Props 타입

**type 또는 interface (일관성 유지)**

```typescript
// ✅ type 선호 (더 유연함)
type ButtonProps = {
  label: string;
  onClick: () => void;
};

export function Button(props: ButtonProps) {}
```

### 4.9 타입 export

**public API는 항상 export, export type 명시**

```typescript
// ✅
export type { ButtonProps, ButtonSize };
export { Button };

// 또는
export type ButtonProps = {};
export function Button(props: ButtonProps) {}
```

### 4.10 조건부 타입

**필요한 부분만 (가독성 우선)**

```typescript
// ✅ 필요할 때만
type IsString<T> = T extends string ? true : false;

// ❌ 남용
type Complex<T> = T extends Array<infer U> ? (U extends Promise<infer V> ? V : never) : T;
```

---

## 5. 컴포넌트 작성

### 5.1 함수 컴포넌트만

**클래스 컴포넌트 사용하지 않음**

```typescript
// ✅
export function Button() {
  return <button />;
}

// ❌
class Button extends React.Component {}
```

### 5.2 Props 구조분해

**함수 매개변수에서**

```typescript
// ✅
export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌
export function Button(props: ButtonProps) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### 5.3 Children prop

**React.ReactNode**

```typescript
// ✅
type ContainerProps = {
  children: React.ReactNode;
};

// ❌
type ContainerProps = {
  children: any;
};
```

### 5.4 파일 내용 순서

**imports → type 정의 → 컴포넌트 → exports**

```typescript
import { Button } from '@/shared/ui';                    // 1. imports
import type { ButtonProps as SharedButtonProps } from '..'; // type import

type MyButtonProps = { variant: 'primary' | 'secondary' }; // 2. 타입

export function MyButton(props: MyButtonProps) {           // 3. 컴포넌트
  return <Button {...props} />;
}
```

### 5.5 기본값

**함수 매개변수 기본값**

```typescript
// ✅
function Button({ size = 'md', variant = 'primary' }: ButtonProps) {}

// ❌
Button.defaultProps = { size: 'md' };
```

### 5.6 조건부 렌더링

**if 문으로 early return (권장)**

```typescript
// ✅ Early return
function Component({ items }: Props) {
  if (!items.length) return <EmptyState />;

  return <ItemList items={items} />;
}

// 허용 (간단한 경우)
return isLoading ? <Spinner /> : <Content />;

// ❌ && 연산자 (React 에러 시 혼동)
return isLoading && <Spinner />;  // false 렌더링 가능
```

### 5.7 리스트 렌더링 key

**고유한 id 필수 (index 금지)**

```typescript
// ✅
items.map((item) => <Item key={item.id} {...item} />)

// ❌
items.map((item, index) => <Item key={index} {...item} />)
```

### 5.8 인라인 JSX vs 변수

**2줄 이상이면 변수로 추출**

```typescript
// ✅
const emptyState = (
  <div className="text-center">
    <p>항목이 없습니다</p>
  </div>
);

return isLoading ? <Spinner /> : emptyState;

// ❌
return isLoading ? <Spinner /> : (
  <div className="text-center">
    <p>항목이 없습니다</p>
  </div>
);
```

### 5.9 컴포넌트 크기

**100줄 미만 권장**

- 길어지면 로직을 커스텀 훅으로 추출하거나 컴포넌트 분리

### 5.10 로직 분리

**UI 로직과 비즈니스 로직 분리**

```typescript
// ✅ 비즈니스 로직 → 커스텀 훅
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount(c => c + 1) };
}

// UI 로직 → 컴포넌트
function Counter() {
  const { count, increment } = useCounter();
  return <button onClick={increment}>{count}</button>;
}
```

---

## 6. Hooks & 상태관리

### 6.1 useState 초기값

**상황에 따라 (lazy initialization도 가능)**

```typescript
// ✅
const [state, setState] = useState(0);
const [state, setState] = useState(() => expensiveComputation());
```

### 6.2 useEffect 의존성

**항상 명시 (ESLint 강제)**

```typescript
// ✅
useEffect(() => {
  // ...
}, [dependency1, dependency2]);

// ❌
useEffect(() => {
  // ...
});
```

### 6.3 useCallback

**필요할 때만 (성능 최적화)**

```typescript
// ✅ Props로 전달되는 콜백
const memoizedCallback = useCallback(() => {
  // ...
}, [dependency]);

// ❌ 과다 사용
const trivialCallback = useCallback(() => console.log('hi'), []);
```

### 6.4 useMemo

**필요할 때만**

```typescript
// ✅ 복잡한 계산
const expensiveValue = useMemo(() => {
  return computeHeavyValue(items);
}, [items]);

// ❌ 과다 사용
const trivialValue = useMemo(() => `Hello ${name}`, [name]);
```

### 6.5 커스텀 훅 네이밍

**use + 기능**

```typescript
// ✅
useCounter();
useAuth();
useLocalStorage();
useFetchProducts();

// ❌
counter();
getAuth();
localStorageManager();
```

### 6.6 상태관리 전략

**다음 기준에 따라:**

- **useState**: 로컬 UI 상태 (form input, toggle)
- **Zustand**: 글로벌 UI 상태 (theme, sidebar, modal)
- **TanStack Query**: 서버 상태 (API 응답)
- **Context API** (선택): 테마, 언어 등 자주 바뀌지 않는 값

```typescript
// ✅
const [isOpen, setIsOpen] = useState(false); // useState
const { theme, setTheme } = useThemeStore(); // Zustand
const { data } = useQuery(['products'], fetchProducts); // TanStack Query
```

### 6.7 TanStack Query

**모든 서버 상태는 Query 사용**

```typescript
// ✅
const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: () => apiClient.get('/products'),
});

// ❌ Zustand로 서버 상태 관리
const { products } = useStore(); // 동기화 문제 발생
```

### 6.8 에러 처리

**try-catch (async/await)**

```typescript
// ✅
async function handleSubmit() {
  try {
    const result = await apiClient.post('/users', data);
    // ...
  } catch (error) {
    if (error instanceof ApiError) {
      // ...
    }
  }
}
```

### 6.9 로딩 상태

**isLoading, isPending 구분**

```typescript
// TanStack Query에서 자동 제공
const { isPending, isLoading, data } = useQuery({...});

// isPending: 초기 로딩 중
// isLoading: 모든 로딩 상태 (배경 리페치 포함)
```

### 6.10 훅 호출 위치

**컴포넌트 body 최상단 (React Rules of Hooks)**

```typescript
// ✅
function Component() {
  const [state, setState] = useState(0);  // 최상단
  const { data } = useQuery({...});       // 최상단

  if (someCondition) return null;

  return <div />;
}

// ❌
function Component() {
  if (someCondition) return null;
  const [state, setState] = useState(0);  // 조건부 호출 금지!
}
```

---

## 7. 스타일링

### 7.1 Tailwind CSS 클래스 개수

**20개 미만 권장**

```typescript
// ✅
<button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition" />

// ❌ 너무 많음
<button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" />
```

넘으면 컴포넌트로 분리하거나 CVA 사용.

### 7.2 클래스 순서

**Tailwind 권장 순서 (자동 정렬은 하지 않음)**

순서: `layout` → `spacing` → `sizing` → `display` → `color` → `decoration` → `interaction`

```typescript
className =
  'flex items-center gap-4 w-full p-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer';
```

### 7.3 긴 className

**cn() 유틸 사용**

```typescript
// ✅
import { cn } from '@/shared/lib/cn';

<button
  className={cn(
    'px-4 py-2 rounded-lg transition',
    variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
    variant === 'secondary' && 'bg-gray-200 text-black hover:bg-gray-300',
    size === 'sm' && 'text-sm',
    size === 'lg' && 'text-lg',
  )}
/>
```

### 7.4 동적 클래스

**clsx 또는 cn() 사용**

```typescript
// ✅
className={clsx(
  'base-class',
  isActive && 'active-class',
  size === 'lg' && 'lg-class',
)}

// ❌
className={'base-class' + (isActive ? ' active' : '')}
```

### 7.5 커스텀 스타일

**Tailwind extend만 사용 (CSS-in-JS 불가)**

```typescript
// ✅ tailwind.config.ts
theme: {
  extend: {
    colors: { 'brand-primary': '#...' },
    spacing: { '9xl': '96px' },
  },
}

// ❌ styled-components, CSS modules
```

### 7.6 반응형 디자인

**Tailwind 반응형 prefix**

```typescript
// ✅
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />

// 모바일 우선 → 점진적 확대
```

### 7.7 디자인 토큰

**Tailwind theme.extend (현재 기본 색상)**

```typescript
// ✅ tailwind.config.ts
colors: {
  'bg-primary': 'hsl(var(--color-bg-primary) / <alpha-value>)',
  'text-primary': 'hsl(var(--color-text-primary) / <alpha-value>)',
}

// globals.css에서 CSS 변수로 정의
:root { --color-bg-primary: 0 0% 100%; }
[data-theme='dark'] { --color-bg-primary: 0 0% 8%; }
```

### 7.8 컴포넌트 스타일 전략

**CVA (Class Variance Authority) + Tailwind**

```typescript
// ✅
import { cva } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'px-4 py-2 rounded-lg transition font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-black hover:bg-gray-300',
      },
      size: {
        sm: 'text-sm px-3 py-1',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3',
      },
    },
  }
);

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

### 7.9 다크모드

**Tailwind dark: prefix + next-themes**

```typescript
// ✅ globals.css
html.dark {
  color-scheme: dark;
}

// ✅ 컴포넌트
<div className="bg-white dark:bg-black text-black dark:text-white" />

// ✅ app/layout.tsx
<ThemeProvider attribute="class">
  {children}
</ThemeProvider>
```

### 7.10 CSS 변수 네이밍

**--category-property or --property-level**

```typescript
// ✅
--color-primary          (색상)
--color-primary-dark     (변형)
--spacing-4              (간격)
--size-icon-sm           (크기)
--z-modal                (z-index)
--duration-normal        (애니메이션 기간)
```

---

## 8. 성능 & 최적화

### 8.1 이미지 최적화

**Next.js Image 컴포넌트**

```typescript
// ✅
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="hero"
  width={1200}
  height={600}
  priority={true}
  quality={75}
/>

// ❌
<img src="/hero.jpg" alt="hero" />
```

### 8.2 코드 분할

**라우트별 자동 분할 + 필요시 컴포넌트 단위 분할**

```typescript
// ✅ 라우트별 (자동)
// app/products/page.tsx
// app/users/page.tsx

// ✅ 컴포넌트 단위 (무거운 컴포넌트)
import dynamic from 'next/dynamic';

const HeavyEditor = dynamic(
  () => import('@/features/editor/rich-editor'),
  { loading: () => <LoadingSpinner /> }
);

// ❌ 모든 컴포넌트를 동적으로 (과다)
```

### 8.3 리렌더링 방지

**상황에 따라 (대부분 필요 없음)**

```typescript
// ✅ 프레젠테이션 컴포넌트만 memo
const Button = React.memo(({ onClick, label }: ButtonProps) => (
  <button onClick={onClick}>{label}</button>
));

// ❌ 모든 컴포넌트에 memo 사용
```

### 8.4 번들 크기 모니터링

**S2 이후, webpack-bundle-analyzer 도입**

```bash
# package.json
"analyze": "ANALYZE=true next build"

# Starter Platform 특성상 각 컴포넌트/패턴의 번들 영향도를 추적
```

### 8.5 렌더링 성능 디버깅

**필요할 때만 (Chrome DevTools Profiler)**

- Lighthouse (성능 감사)
- React DevTools Profiler (리렌더링 추적)
- Network 탭 (번들 로딩)

---

## 9. 테스트

### 9.1 테스트 범위

**중요한 부분만 (80% 커버리지 목표)**

- P0 컴포넌트의 주요 상호작용
- 중요한 유틸 함수
- 복잡한 커스텀 훅 로직

```typescript
// ✅ 테스트할 것
- useAppForm (폼 검증)
- Button (클릭 이벤트)
- formatDate (엣지 케이스)

// ⏭️ 나중에
- trivial 렌더링 (JSX)
- 간단한 통과 함수
```

### 9.2 테스트 스타일

**describe + test (또는 it)**

```typescript
// ✅
describe('Button', () => {
  test('should render with label', () => {
    // ...
  });

  test('should call onClick when clicked', () => {
    // ...
  });
});
```

### 9.3 AAA 패턴

**항상 사용 (Arrange-Act-Assert)**

```typescript
test('should submit form with valid data', () => {
  // Arrange: 테스트 셋업
  const handleSubmit = vi.fn();
  render(<LoginForm onSubmit={handleSubmit} />);
  const submitButton = screen.getByRole('button', { name: /submit/i });

  // Act: 동작 수행
  fireEvent.click(submitButton);

  // Assert: 결과 검증
  expect(handleSubmit).toHaveBeenCalledOnce();
});
```

### 9.4 모킹 전략

**상황에 따라:**

- **API**: Route Handler 목업 (현재 방식)
- **복잡한 외부 라이브러리**: Jest mocks
- **나중에 고려**: MSW (Mock Service Worker)

```typescript
// ✅ Route Handler 목업
app/api/products/route.ts에서 mock 데이터 반환

// 테스트에서
const { data } = await apiClient.get('/api/products');
```

### 9.5 스냅샷 테스트

**선택적으로 사용**

```typescript
// ✅ 사용처: 복잡한 UI 구조 변경 감지
test('should match snapshot', () => {
  const { container } = render(<ComplexComponent />);
  expect(container).toMatchSnapshot();
});

// ⏭️ 언제 필요한가?
// - 컴포넌트 스타일 시스템 정비 후
// - 시각적 회귀 테스트 도입 시 (Chromatic)
```

---

## 10. 보안 & 환경

### 10.1 환경변수

**Zod로 부팅 시점에 검증 (src/shared/config/env.ts)**

```typescript
// ✅
const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
});

// ❌
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // 타입 안전하지 않음
```

### 10.2 API 토큰

**httpOnly 쿠키에 저장 (BFF Layer 통해)**

```
클라이언트 → BFF (Route Handler) → 백엔드
             ↓
        httpOnly 쿠키 설정 (도용 방지)
```

### 10.3 민감 정보

**.env.local에 저장, git 제외 (.gitignore)**

```bash
# ✅ .gitignore
.env.local
.env*.local

# ❌ 커밋하지 말 것
API_SECRET_KEY=xxx
DATABASE_URL=xxx
```

---

## 11. Git & 커밋

### 11.1 커밋 메시지

**한국어 + 상세 설명**

```
S1: 기초 구조 설정 완료

- 폴더 구조 및 린트 설정
- ESLint 의존성 규칙 적용
- Husky + lint-staged 설정

Co-Authored-By: 협업자 <email@example.com>
```

### 11.2 Pre-commit Hook

**lint-staged 자동 실행**

```bash
# commit 전에 자동으로 실행
eslint --fix
prettier --write
```

### 11.3 Pre-push Hook

**타입 체크 + 테스트**

```bash
tsc --noEmit
npm run test -- --changed origin/main
```

---

## 12. 체크리스트

코드 작성 전에 다음을 확인하세요:

### 컴포넌트

- [ ] Props 타입 정의 (type 또는 interface)
- [ ] Named export
- [ ] 100줄 미만
- [ ] JSDoc (복잡한 경우만)
- [ ] 사용 예제 (CLAUDE.md 또는 @example)

### 유틸 함수

- [ ] 타입 명시 (any 금지)
- [ ] 반환 타입 명시
- [ ] JSDoc (복잡한 경우만)
- [ ] 테스트 (중요한 경우)

### 스타일

- [ ] Tailwind 20개 미만
- [ ] cn() 또는 clsx 사용
- [ ] 반응형 디자인 (모바일 우선)
- [ ] 다크모드 지원

### 타입

- [ ] any 사용 금지
- [ ] public API export
- [ ] 제약 명시 (제네릭)
- [ ] export type 명시

### 성능

- [ ] 이미지: Next.js Image
- [ ] 큰 컴포넌트: dynamic import
- [ ] 불필요한 렌더링 방지
- [ ] 번들 크기 모니터링 (S2 이후)

---

## 참고

- CLAUDE.md (전역 개발 원칙)
- plan/plan.md (기술 설계)
- ESLint 설정 (eslint.config.js)
- Prettier 설정 (prettier.config.js)
