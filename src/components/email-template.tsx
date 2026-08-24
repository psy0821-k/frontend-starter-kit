import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
  return (
    <div>
      <h1>{firstName}님 반갑습니다!</h1>
      <p>저희 사이트를 이용해주셔서 감사합니다</p>
      <p>회원가입 인증을 통해 회원가입을 마무리해주세요</p>
    </div>
  );
}
