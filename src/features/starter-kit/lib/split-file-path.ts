interface SplitFilePath {
  /** 마지막 세그먼트. 예: 'login-form.tsx' */
  fileName: string;
  /** 앞쪽 폴더 경로(끝에 / 포함). 루트 파일이면 빈 문자열. 예: 'src/features/auth/ui/' */
  directory: string;
}

/**
 * 전체 경로를 폴더와 파일명으로 나눕니다.
 *
 * DB에는 전체 경로를 한 컬럼에 저장하고(조합·검증 코드를 줄이기 위함),
 * 표시할 때만 이 함수로 나눠 파일명을 강조하고 폴더를 약하게 보여줍니다.
 *
 * @example
 * splitFilePath('src/features/auth/ui/login-form.tsx')
 * // { fileName: 'login-form.tsx', directory: 'src/features/auth/ui/' }
 */
export function splitFilePath(filePath: string): SplitFilePath {
  const lastSlashIndex = filePath.lastIndexOf('/');

  if (lastSlashIndex === -1) {
    return { fileName: filePath, directory: '' };
  }

  return {
    fileName: filePath.slice(lastSlashIndex + 1),
    directory: filePath.slice(0, lastSlashIndex + 1),
  };
}
