/**
 * 콤마 구분 문자열을 배열로 변환합니다.
 *
 * 폼에서 태그·기능·기술스택을 단일 문자열로 받는 이유는 useAppForm이
 * `ZodType<T, T>`를 요구해 스키마에서 `.transform()`을 쓸 수 없기 때문입니다.
 * 변환은 제출 직전에 이 함수로 수행합니다.
 *
 * @example
 * splitCommaList('Next.js, Tailwind ,, Stripe') // ['Next.js', 'Tailwind', 'Stripe']
 * splitCommaList('   ')                          // []
 */
export function splitCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
