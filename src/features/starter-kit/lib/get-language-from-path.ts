import { DEFAULT_CODE_LANGUAGE } from '../model/constants';

/**
 * 확장자 → 언어 라벨 매핑.
 * 사용자에게 언어를 직접 고르게 하지 않는 이유는 .tsx 파일에 python을 선택할
 * 자유만 주기 때문입니다. 경로에서 추론하되, 값은 DB에 저장해 추론 규칙이
 * 바뀌어도 과거 데이터가 흔들리지 않게 합니다.
 */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  mjs: 'javascript',
  cjs: 'javascript',
  json: 'json',
  css: 'css',
  scss: 'scss',
  html: 'html',
  md: 'markdown',
  mdx: 'mdx',
  sql: 'sql',
  sh: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  env: 'bash',
};

/**
 * 파일 경로에서 언어를 추론합니다. 알 수 없으면 'plaintext'를 반환합니다.
 *
 * @example
 * getLanguageFromPath('src/features/auth/ui/login-form.tsx') // 'tsx'
 * getLanguageFromPath('.env.example')                        // 'plaintext'
 */
export function getLanguageFromPath(filePath: string): string {
  const fileName = filePath.split('/').pop() ?? '';
  const lastDotIndex = fileName.lastIndexOf('.');

  // 확장자가 없거나 '.env'처럼 점으로 시작하는 파일은 추론하지 않는다.
  if (lastDotIndex <= 0) {
    return DEFAULT_CODE_LANGUAGE;
  }

  const extension = fileName.slice(lastDotIndex + 1).toLowerCase();
  return EXTENSION_TO_LANGUAGE[extension] ?? DEFAULT_CODE_LANGUAGE;
}
