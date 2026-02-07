export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
}

export interface Tutorial {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
}

export interface Skill {
  name: string;
  level: number;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}
