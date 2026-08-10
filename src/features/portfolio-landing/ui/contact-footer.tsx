import type { ContactChannel } from '../model/types';

interface ContactFooterProps {
  channels: ContactChannel[];
}

/**
 * 연락 채널을 커맨드 플래그(--email, --github) 형태로 나열하는 푸터.
 * 히어로의 터미널 은유를 페이지 끝까지 일관되게 가져간다.
 */
export function ContactFooter({ channels }: ContactFooterProps) {
  return (
    <footer className="bg-[#151312] px-6 py-16 text-[#faf6ee] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="mb-6 font-mono text-sm">
          <span className="text-[#e8632c]">$</span> contact --open
        </p>

        <ul className="flex flex-col gap-3 font-mono text-sm">
          {channels.map((channel) => (
            <li key={channel.label} className="flex gap-3">
              <span className="w-24 shrink-0 text-[#8a8578]">--{channel.label}</span>
              <a
                href={channel.href}
                className="text-[#faf6ee] underline decoration-[#3a352c] underline-offset-4 hover:decoration-[#e8632c]"
              >
                {channel.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
