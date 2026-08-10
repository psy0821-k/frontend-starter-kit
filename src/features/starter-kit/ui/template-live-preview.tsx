'use client';

import { useTheme } from 'next-themes';
import { Sandpack, type SandpackFiles } from '@codesandbox/sandpack-react';
import type { TemplateFile } from '../model/types';

interface TemplateLivePreviewProps {
  files: TemplateFile[];
}

/**
 * Sandpack이 즉석 번들링을 시작할 수 있는 확장자만 허용한다. 폼 검증(zod)이
 * 이미 이를 강제하지만, 관리자가 API/DB를 직접 조작해 다른 확장자에
 * is_entry를 지정할 가능성까지 방어한다 — 확장자가 안 맞으면 Sandpack이
 * default export를 찾지 못해 에러 화면을 띄우는 대신, 이 컴포넌트 자체를
 * 렌더링하지 않는다(엔트리 없음과 동일하게 취급).
 */
const ENTRY_FILE_EXTENSIONS = ['.tsx', '.jsx'];

/**
 * 등록된 코드를 배포 없이 브라우저에서 즉석 번들링해 실제 렌더링 결과를
 * 보여줍니다. CodePen처럼 좌측 코드 에디터 + 우측 프리뷰를 함께 노출합니다
 * (showTabs: true) — plain text 뷰어인 아래 "코드" 섹션과는 목적이 달라
 * 내용이 겹쳐도 그대로 둡니다(하나는 읽기용, 하나는 실행 결과 확인용).
 * React/ReactDOM 외 외부 패키지는 지원하지 않습니다 — 그런 import가 있으면
 * Sandpack이 자체 에러 화면을 보여줍니다.
 *
 * 엔트리 파일이 없는 템플릿에는 이 컴포넌트를 렌더링하지 않습니다
 * (호출부인 page.tsx가 판단합니다).
 */
export function TemplateLivePreview({ files }: TemplateLivePreviewProps) {
  // 사이트 전역 라이트/다크 토글을 Sandpack에도 그대로 반영한다. 이 컴포넌트가
  // is_entry 유무로 null을 반환할 수 있어(early return) 조건부 훅 호출을
  // 피하려면 useTheme을 최상단에서 호출해야 한다.
  const { resolvedTheme } = useTheme();

  const entry = files.find(
    (file) => file.is_entry && ENTRY_FILE_EXTENSIONS.some((ext) => file.file_path.endsWith(ext))
  );
  if (!entry) {
    return null;
  }

  const entryPath = `/${entry.file_path}`;
  // "코드" 섹션(StarterKitCodeViewer)과 파일 탭 순서를 일치시킨다 — sort_order는
  // "보여주고 싶은 순서"(진입점 먼저)를 담는 필드라, 두 섹션이 서로 다른 순서로
  // 보이면 같은 데이터인데 다른 구성처럼 오인될 수 있다.
  const sortedFiles = [...files].sort((a, b) => a.sort_order - b.sort_order);
  const sandpackFiles: SandpackFiles = Object.fromEntries(
    sortedFiles.map((file) => [`/${file.file_path}`, { code: file.code, active: file === entry }])
  );

  // 등록된 엔트리 파일은 컴포넌트만 default export하면 되고, ReactDOM 마운트
  // 호출은 항상 동일하므로 여기서 자동 생성해 부트스트랩 파일로 감춘다.
  // Sandpack의 customSetup.entry는 "번들 시작점"이라 마운트 코드가 반드시
  // 그 파일 안에 있어야 하므로, 사용자가 등록한 파일을 entry로 직접
  // 지정하지 않는다.
  const bootstrapPath = '/__live-preview-entry.tsx';
  sandpackFiles[bootstrapPath] = {
    code: `import ReactDOM from 'react-dom/client';
import Entry from '${entryPath.replace(/\.tsx?$/, '')}';

ReactDOM.createRoot(document.getElementById('root')!).render(<Entry />);
`,
    hidden: true,
  };

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-semibold">렌더링된 화면</h2>
      <Sandpack
        template="react-ts"
        files={sandpackFiles}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        customSetup={{ entry: bootstrapPath }}
        options={{ showTabs: true, showLineNumbers: true, editorHeight: 420 }}
      />
    </section>
  );
}
