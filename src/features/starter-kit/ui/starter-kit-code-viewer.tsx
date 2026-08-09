'use client';

import { useState } from 'react';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { VerticalTabs } from '@/shared/ui/vertical-tabs';
import { splitFilePath } from '../lib/split-file-path';
import type { TemplateFile } from '../model/types';
import { CodeBlock } from './code-block';

interface StarterKitCodeViewerProps {
  files: TemplateFile[];
}

/**
 * 파일별 코드 뷰어.
 *
 * CodePen처럼 언어(HTML/CSS/JS)로 나누지 않고 **파일 경로**로 나눕니다.
 * CodePen은 언어가 3개로 고정이라 3분할이 성립하지만, 이 프로젝트는 파일 수가
 * 가변(1~N)이라 같은 방식이 성립하지 않습니다. 특히 Feature 단위 자산은
 * api/model/ui로 나뉘어 파일이 10개를 넘기므로, 파일 개수와 무관하게 동일하게
 * 동작하는 세로 탭(좌측 목록 + 우측 코드)을 채택했습니다.
 *
 * 데스크톱은 좌우 분할, 모바일은 상하 분할로 전환합니다 — 좁은 화면에서
 * 좌우로 나누면 목록과 코드 둘 다 읽을 수 없기 때문입니다.
 */
export function StarterKitCodeViewer({ files }: StarterKitCodeViewerProps) {
  if (files.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        등록된 코드가 없습니다.
      </p>
    );
  }

  return <CodeViewerTabs files={files} />;
}

function CodeViewerTabs({ files }: StarterKitCodeViewerProps) {
  const sortedFiles = [...files].sort((a, b) => a.sort_order - b.sort_order);
  const [activeFilePath, setActiveFilePath] = useState(sortedFiles[0].file_path);
  const activeFile =
    sortedFiles.find((file) => file.file_path === activeFilePath) ?? sortedFiles[0];

  return (
    <VerticalTabs
      value={activeFilePath}
      onValueChange={(value) => setActiveFilePath(String(value))}
      className="flex flex-col gap-3 lg:flex-row lg:gap-4"
    >
      {/*
        모바일에서는 가로 목록이라 가로 스크롤이 필요하지만, 데스크톱에서는
        세로 목록이므로 가로 스크롤을 끈다. overflow-x-visible이 아니라 hidden을
        쓰는 이유는 overflow-y가 auto일 때 CSS가 visible을 auto로 강제 변환해
        스크롤바가 그대로 남기 때문이다.
      */}
      <TabsList
        variant="line"
        className="h-fit w-full shrink-0 gap-0.5 overflow-x-auto p-0 lg:max-h-[70vh] lg:w-64 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto xl:w-72"
      >
        {sortedFiles.map((file) => {
          const { fileName, directory } = splitFilePath(file.file_path);

          return (
            <TabsTrigger
              key={file.file_path}
              value={file.file_path}
              className="h-auto w-full shrink-0 flex-col items-start gap-0.5 px-3 py-2 text-left"
            >
              {/* 폴더 경로가 이 프로젝트의 핵심 정보라 파일명과 함께 항상 노출한다. */}
              {directory && (
                <span className="max-w-full truncate text-[0.6875rem] leading-tight text-muted-foreground">
                  {directory}
                </span>
              )}
              <span className="max-w-full truncate font-medium">{fileName}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/*
        활성 파일의 패널만 렌더링한다. 모든 패널을 두면 Base UI가 전환 애니메이션
        종료를 기다리는데, 이 프로젝트는 패널에 transition을 주지 않아
        transitionend가 영영 발생하지 않고 비활성 패널이 계속 보이는 상태로 남는다.
        파일이 10개를 넘는 Feature 자산에서 코드 블록을 한꺼번에 마운트하지 않는
        이점도 함께 얻는다.
      */}
      <TabsContent value={activeFile.file_path} className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 truncate text-xs text-muted-foreground">
            {activeFile.file_path}
          </code>
          <Badge variant="outline" className="shrink-0">
            {activeFile.language}
          </Badge>
        </div>
        <CodeBlock code={activeFile.code} filePath={activeFile.file_path} />
      </TabsContent>
    </VerticalTabs>
  );
}
