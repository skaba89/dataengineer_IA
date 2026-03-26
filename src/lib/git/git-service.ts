// Git Integration Service - Connect to GitHub/GitLab repositories

export type GitProvider = 'github' | 'gitlab'

export interface GitConfig {
  provider: GitProvider
  accessToken: string
  repository?: string
  organization?: string
}

export interface Repository {
  id: string
  name: string
  fullName: string
  description: string | null
  url: string
  defaultBranch: string
  isPrivate: boolean
  stars: number
  forks: number
  updatedAt: string
}

export interface Branch {
  name: string
  commitSha: string
  lastUpdated: string
  protected: boolean
}

export interface Commit {
  sha: string
  message: string
  author: string
  date: string
  url: string
}

export interface PullRequest {
  id: number
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  author: string
  createdAt: string
  updatedAt: string
  url: string
  sourceBranch: string
  targetBranch: string
}

export interface FileContent {
  path: string
  content: string
  encoding: 'utf-8' | 'base64'
  size: number
  sha: string
}

export interface WebhookConfig {
  url: string
  events: string[]
  active: boolean
}

export interface SyncResult {
  success: boolean
  message: string
  filesChanged: number
  commits: number
  errors: string[]
}

/**
 * GitHub API client
 */
class GitHubClient {
  private accessToken: string
  private baseUrl = 'https://api.github.com'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Data-Engineering-Platform',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getRepositories(): Promise<Repository[]> {
    const repos = await this.request('/user/repos?per_page=100&sort=updated')
    return repos.map((repo: Record<string, unknown>) => ({
      id: String(repo.id),
      name: repo.name as string,
      fullName: repo.full_name as string,
      description: repo.description as string | null,
      url: repo.html_url as string,
      defaultBranch: repo.default_branch as string,
      isPrivate: repo.private as boolean,
      stars: repo.stargazers_count as number,
      forks: repo.forks_count as number,
      updatedAt: repo.updated_at as string,
    }))
  }

  async getBranches(owner: string, repo: string): Promise<Branch[]> {
    const branches = await this.request(`/repos/${owner}/${repo}/branches`)
    return branches.map((branch: Record<string, unknown>) => ({
      name: branch.name as string,
      commitSha: (branch.commit as Record<string, unknown>).sha as string,
      lastUpdated: new Date().toISOString(),
      protected: branch.protected as boolean,
    }))
  }

  async getCommits(owner: string, repo: string, branch = 'main'): Promise<Commit[]> {
    const commits = await this.request(`/repos/${owner}/${repo}/commits?sha=${branch}&per_page=50`)
    return commits.map((commit: Record<string, unknown>) => ({
      sha: commit.sha as string,
      message: (commit.commit as Record<string, unknown>).message as string,
      author: ((commit.commit as Record<string, unknown>).author as Record<string, unknown>).name as string,
      date: ((commit.commit as Record<string, unknown>).author as Record<string, unknown>).date as string,
      url: commit.html_url as string,
    }))
  }

  async getFile(owner: string, repo: string, path: string, ref = 'main'): Promise<FileContent> {
    const file = await this.request(`/repos/${owner}/${repo}/contents/${path}?ref=${ref}`)
    return {
      path: file.path as string,
      content: Buffer.from(file.content as string, 'base64').toString('utf-8'),
      encoding: 'utf-8',
      size: file.size as number,
      sha: file.sha as string,
    }
  }

  async createFile(
    owner: string, 
    repo: string, 
    path: string, 
    content: string, 
    message: string,
    branch = 'main'
  ): Promise<{ sha: string; url: string }> {
    const response = await this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
      }),
    })
    return {
      sha: response.content.sha as string,
      url: response.content.html_url as string,
    }
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string
  ): Promise<PullRequest> {
    const pr = await this.request(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({ title, body, head, base }),
    })
    return {
      id: pr.id as number,
      number: pr.number as number,
      title: pr.title as string,
      state: pr.state as 'open' | 'closed',
      author: (pr.user as Record<string, unknown>).login as string,
      createdAt: pr.created_at as string,
      updatedAt: pr.updated_at as string,
      url: pr.html_url as string,
      sourceBranch: pr.head.ref as string,
      targetBranch: pr.base.ref as string,
    }
  }

  async createWebhook(
    owner: string,
    repo: string,
    config: WebhookConfig
  ): Promise<{ id: number; url: string }> {
    const webhook = await this.request(`/repos/${owner}/${repo}/hooks`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'web',
        active: config.active,
        events: config.events,
        config: {
          url: config.url,
          content_type: 'json',
        },
      }),
    })
    return {
      id: webhook.id as number,
      url: webhook.url as string,
    }
  }
}

/**
 * GitLab API client
 */
class GitLabClient {
  private accessToken: string
  private baseUrl = 'https://gitlab.com/api/v4'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'PRIVATE-TOKEN': this.accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getRepositories(): Promise<Repository[]> {
    const projects = await this.request('/projects?membership=true&per_page=100&order_by=updated_at')
    return projects.map((project: Record<string, unknown>) => ({
      id: String(project.id),
      name: project.name as string,
      fullName: project.path_with_namespace as string,
      description: project.description as string | null,
      url: project.web_url as string,
      defaultBranch: project.default_branch as string || 'main',
      isPrivate: (project.visibility as string) === 'private',
      stars: project.star_count as number,
      forks: project.forks_count as number,
      updatedAt: project.last_activity_at as string,
    }))
  }

  async getBranches(projectId: string): Promise<Branch[]> {
    const branches = await this.request(`/projects/${encodeURIComponent(projectId)}/repository/branches`)
    return branches.map((branch: Record<string, unknown>) => ({
      name: branch.name as string,
      commitSha: (branch.commit as Record<string, unknown>).id as string,
      lastUpdated: (branch.commit as Record<string, unknown>).committed_date as string,
      protected: branch.protected as boolean,
    }))
  }

  async getCommits(projectId: string, branch = 'main'): Promise<Commit[]> {
    const commits = await this.request(
      `/projects/${encodeURIComponent(projectId)}/repository/commits?ref_name=${branch}&per_page=50`
    )
    return commits.map((commit: Record<string, unknown>) => ({
      sha: commit.id as string,
      message: commit.message as string,
      author: commit.author_name as string,
      date: commit.created_at as string,
      url: commit.web_url as string,
    }))
  }

  async getFile(projectId: string, path: string, ref = 'main'): Promise<FileContent> {
    const file = await this.request(
      `/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(path)}?ref=${ref}`
    )
    return {
      path: file.file_path as string,
      content: Buffer.from(file.content as string, 'base64').toString('utf-8'),
      encoding: 'utf-8',
      size: file.size as number,
      sha: file.blob_id as string,
    }
  }
}

/**
 * Create a Git client based on provider
 */
export function createGitClient(config: GitConfig): GitHubClient | GitLabClient {
  switch (config.provider) {
    case 'github':
      return new GitHubClient(config.accessToken)
    case 'gitlab':
      return new GitLabClient(config.accessToken)
    default:
      throw new Error(`Unsupported Git provider: ${config.provider}`)
  }
}

/**
 * Sync generated artifacts to Git repository
 */
export async function syncToRepository(
  config: GitConfig,
  owner: string,
  repo: string,
  files: Array<{ path: string; content: string }>,
  commitMessage: string,
  branch = 'main'
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    message: '',
    filesChanged: 0,
    commits: 0,
    errors: [],
  }

  try {
    const client = createGitClient(config)

    if (config.provider === 'github') {
      const githubClient = client as GitHubClient
      
      for (const file of files) {
        try {
          await githubClient.createFile(owner, repo, file.path, file.content, commitMessage, branch)
          result.filesChanged++
        } catch (error) {
          result.errors.push(`Failed to create ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    result.success = result.filesChanged > 0
    result.message = `Successfully synced ${result.filesChanged} files to ${repo}`
    result.commits = 1

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    result.message = 'Sync failed'
  }

  return result
}

/**
 * Generate repository structure for data project
 */
export function generateRepoStructure(projectName: string): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = []

  // README.md
  files.push({
    path: 'README.md',
    content: `# ${projectName}

## Overview

Data engineering project generated by AI Data Engineering Platform.

## Structure

\`\`\`
├── pipelines/          # ETL/ELT pipelines
├── models/             # dbt models
├── scripts/            # Utility scripts
├── config/             # Configuration files
├── tests/              # Tests
└── docs/               # Documentation
\`\`\`

## Getting Started

1. Install dependencies: \`pip install -r requirements.txt\`
2. Configure connections in \`config/\`
3. Run pipelines: \`python pipelines/main.py\`

## Generated by

AI Data Engineering Platform - Automated Data Solutions
`,
  })

  // requirements.txt
  files.push({
    path: 'requirements.txt',
    content: `# Data Engineering Dependencies
dbt-core>=1.5.0
pandas>=2.0.0
pyarrow>=12.0.0
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.0
google-cloud-bigquery>=3.0.0
apache-airflow>=2.7.0
great-expectations>=0.17.0
`,
  })

  // .gitignore
  files.push({
    path: '.gitignore',
    content: `# Python
__pycache__/
*.py[cod]
.env
.venv/
venv/

# Data
*.csv
*.parquet
data/raw/
data/processed/

# IDE
.vscode/
.idea/
*.swp

# Secrets
secrets/
*.pem
credentials.json

# Logs
logs/
*.log
`,
  })

  // dbt_project.yml
  files.push({
    path: 'dbt_project.yml',
    content: `name: '${projectName.toLowerCase().replace(/\\s+/g, '_')}'
version: '1.0.0'
config-version: 2

profile: 'default'

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]

target-path: "target"
clean-targets:
  - "target"
  - "dbt_packages"

models:
  ${projectName.toLowerCase().replace(/\\s+/g, '_')}:
    staging:
      +materialized: view
    intermediate:
      +materialized: view
    marts:
      +materialized: table
`,
  })

  // main pipeline
  files.push({
    path: 'pipelines/main.py',
    content: `"""
Main pipeline orchestration for ${projectName}
"""
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_pipeline():
    """Execute the main data pipeline"""
    logger.info(f"Starting pipeline at {datetime.now()}")
    
    # TODO: Add your pipeline logic here
    # 1. Extract data from sources
    # 2. Transform data
    # 3. Load to destination
    
    logger.info(f"Pipeline completed at {datetime.now()}")

if __name__ == "__main__":
    run_pipeline()
`,
  })

  return files
}
