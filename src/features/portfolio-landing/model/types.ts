export interface TerminalIdentity {
  name: string;
  role: string;
  location: string;
  avatarUrl: string;
  commandLines: string[];
}

export interface PortfolioProject {
  id: string;
  path: string;
  title: string;
  summary: string;
  stack: string[];
  year: string;
  href: string;
}

export interface ContactChannel {
  label: string;
  value: string;
  href: string;
}
