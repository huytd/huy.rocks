import { marked } from 'marked';
import { ENABLED_PROJECTS } from './consts';

export interface Project {
    name: string;
    content: string;
};

export interface Day {
  title: string;
  project: string;
  slug: string;
  tokens: string[]
  rawTokens: marked.Token[]
};

export const DataService = {
    allProjects: async (): Promise<Project[]> => {
        let result: Project[] = [];
        for (let project of ENABLED_PROJECTS) {
            const res = await fetch(`https://raw.githubusercontent.com/huytd/${project}/master/DEVLOG.md`);
            const data = await res.text();
            result.push({
                name: project,
                content: data
            });
        }
        return result;
    },
    allPostsOfProject: async (project: Project): Promise<Day[]> => {
        const tokens = marked.lexer(project.content);
        const days: Day[] = [];
        let currentDay: Day | null = null;
        for (let token of tokens) {
            if (token.type === "heading" && token.depth === 1) {
                if (currentDay !== null) {
                    days.push(currentDay);
                }
                currentDay = {
                    title: token.text,
                    project: project.name,
                    slug: token.text.toLowerCase().replace(/[^\w]+/g, '-'),
                    tokens: [],
                    rawTokens: []
                } as Day;
            } else {
                if (currentDay !== null) {
                    currentDay.tokens.push(token.raw);
                    currentDay.rawTokens.push(token);
                }
            }
        }
        if (currentDay) days.push(currentDay);
        return days;
    },
    allPosts: async (): Promise<Day[]> => {
        const projects = await DataService.allProjects();
        const result = await Promise.all(projects.map(DataService.allPostsOfProject));
        return result.flat();
    }
};