import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/shared/lib/cn';

type CodeTextareaProps = React.ComponentProps<typeof Textarea>;

/**
 * 코드 입력용 Textarea.
 *
 * 등폭 폰트와 맞춤법 검사 해제만 주입합니다. CodeMirror·Monaco 같은 에디터를
 * 도입하지 않는 이유는 수백 KB~수 MB 번들을 관리자 1명이 쓰는 저빈도 페이지에
 * 싣게 되기 때문입니다. 실사용은 대부분 붙여넣기라 실익도 작습니다.
 *
 * Tab 키를 가로채 들여쓰기로 바꾸지도 않습니다 — 키보드 사용자가 폼을 빠져나갈
 * 수 없게 되는 키보드 트랩이 됩니다.
 */
export function CodeTextarea({ className, ...props }: CodeTextareaProps) {
  return (
    <Textarea
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      rows={10}
      className={cn('resize-y font-mono text-xs leading-relaxed sm:text-sm', className)}
      {...props}
    />
  );
}
