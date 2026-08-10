// DevOps 포트폴리오 템플릿 공용 타입 정의

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ProjectItem {
  name: string;
  period: string;
  summary: string;
  metrics: string[];
  stack: string[];
}

export interface CareerItem {
  year: string;
  role: string;
  company: string;
  description: string;
}

export interface PipelineStage {
  label: string;
  detail: string;
}
