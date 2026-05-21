/* ── Profile Types ── */

export interface Skill {
  name: string;
  proficiency: number; // 1–10
}

export interface MySkill {
  hard_skills: Skill[];
  soft_skills: Skill[];
}

export type DeploymentStatus =
  | 'not_deployed'
  | 'internal'
  | 'public'
  | 'production';

export interface Project {
  name: string;
  tech_stack: string[];
  deployment_status: DeploymentStatus;
}

export interface Profile {
  name: string;
  skills: MySkill;
  experience_years: number;
  projects: Project[];
  preferred_roles: string[];
  location: string;
}

/* ── JD Parser Types ── */

export interface JDSkill {
  name: string;
  level: string | null;
  mandatory: boolean;
}

export interface RequiredSkills {
  hard_skills: JDSkill[];
  soft_skills: JDSkill[];
}

export interface Flag {
  flag_type: 'Red' | 'Green';
  desc: string;
}

export interface ParsedJD {
  company_name: string;
  role_title: string;
  required_skills: RequiredSkills;
  seniority_level:
    | 'Intern'
    | 'Junior'
    | 'Mid-Level'
    | 'Senior'
    | 'Staff'
    | 'Principal'
    | 'Leadership';
  flags: Flag[];
}

/* ── API Types ── */

export interface AnalyzeRequest {
  job_desc: string;
  profile: Profile;
}

export interface AnalyzeResponse {
  thread_id: string;
  parsed_jd: ParsedJD;
}

export interface ResumeRequest {
  thread_id: string;
  feedback: string | null;
}

export interface ResumeResponse {
  final_report: string;
}
