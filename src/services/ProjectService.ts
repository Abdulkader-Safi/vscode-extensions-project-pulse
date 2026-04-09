import * as vscode from "vscode";
import type {
  Project,
  LastCheckResults,
  MonitoringConfig,
} from "../types/project";
import { generateId } from "../utils/uuid";

const PROJECTS_KEY = "projectPulse.projects";

export class ProjectService {
  constructor(private context: vscode.ExtensionContext) {}

  getAll(): Project[] {
    return this.context.globalState.get<Project[]>(PROJECTS_KEY, []);
  }

  getById(id: string): Project | undefined {
    return this.getAll().find((p) => p.id === id);
  }

  async add(data: {
    name: string;
    url: string;
    client: string;
    techStack: string[];
    description: string;
    monitoring: MonitoringConfig;
  }): Promise<Project> {
    const projects = this.getAll();

    const emptyLastCheck: LastCheckResults = {
      ssl: null,
      dns: null,
      uptime: null,
      security: null,
      lighthouse: null,
      headers: null,
      timestamp: null,
    };

    const project: Project = {
      id: generateId(),
      name: data.name,
      url: data.url,
      client: data.client,
      techStack: data.techStack,
      description: data.description,
      createdAt: new Date().toISOString(),
      monitoring: data.monitoring,
      lastCheck: emptyLastCheck,
      status: "unknown",
    };

    projects.push(project);
    await this.context.globalState.update(PROJECTS_KEY, projects);
    return project;
  }

  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    const projects = this.getAll();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }

    projects[index] = { ...projects[index], ...updates };
    await this.context.globalState.update(PROJECTS_KEY, projects);
    return projects[index];
  }

  async updateLastCheck(
    id: string,
    checkType: keyof LastCheckResults,
    result: any,
  ): Promise<Project | null> {
    const projects = this.getAll();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }

    const project = projects[index];
    project.lastCheck[checkType] = result;
    project.lastCheck.timestamp = new Date().toISOString();
    projects[index] = project;

    await this.context.globalState.update(PROJECTS_KEY, projects);
    return project;
  }

  async delete(id: string): Promise<boolean> {
    const projects = this.getAll();
    const filtered = projects.filter((p) => p.id !== id);
    if (filtered.length === projects.length) {
      return false;
    }
    await this.context.globalState.update(PROJECTS_KEY, filtered);
    return true;
  }
}
