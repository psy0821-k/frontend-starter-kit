import { ArrowUpRightIcon } from 'lucide-react';
import type { PortfolioProject } from '../model/types';

interface ProjectEntryProps {
  project: PortfolioProject;
}

/**
 * 프로젝트 하나를 나타내는 디렉터리 행.
 * 클릭 가능한 전체 행이 하나의 링크 역할을 하도록 anchor로 감싼다.
 */
export function ProjectEntry({ project }: ProjectEntryProps) {
  return (
    <a
      href={project.href}
      className="group flex flex-col gap-3 py-6 transition-colors hover:bg-[#221e19] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex-1">
        <p className="mb-1 font-mono text-xs text-[#e8632c]">{project.path}</p>
        <h3 className="mb-1 text-lg font-semibold text-[#faf6ee]">{project.title}</h3>
        <p className="text-sm text-[#8a8578]">{project.summary}</p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-[#3a352c] px-2.5 py-0.5 font-mono text-xs text-[#8a8578]"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-[#8a8578]">
        <span>{project.year}</span>
        <ArrowUpRightIcon
          aria-hidden
          className="size-4 text-[#e8632c] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </a>
  );
}
