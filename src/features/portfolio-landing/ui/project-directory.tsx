import type { PortfolioProject } from '../model/types';
import { ProjectEntry } from './project-entry';

interface ProjectDirectoryProps {
  projects: PortfolioProject[];
}

/**
 * 프로젝트 목록을 파일 트리(~/projects/xxx) 형태로 보여주는 섹션.
 * 순번 대신 경로 표기를 써서 "탐색 가능한 디렉터리"라는 은유를 유지한다.
 */
export function ProjectDirectory({ projects }: ProjectDirectoryProps) {
  return (
    <section className="bg-[#1b1815] px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="mb-8 font-mono text-xs tracking-widest text-[#8a8578] uppercase">
          ~/projects
        </p>

        <div className="flex flex-col divide-y divide-[#3a352c] border-y border-[#3a352c]">
          {projects.map((project) => (
            <ProjectEntry key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
