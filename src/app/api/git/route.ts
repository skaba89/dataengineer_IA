// Git API - Integrate with GitHub/GitLab repositories

import { NextRequest, NextResponse } from 'next/server'
import {
  createGitClient,
  getRepositories,
  syncToRepository,
  generateRepoStructure,
  type GitProvider,
} from '@/lib/git/git-service'

// GET /api/git - List repositories or get repository details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') as GitProvider | null
    const accessToken = searchParams.get('accessToken')
    const action = searchParams.get('action')
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')

    if (!provider || !accessToken) {
      return NextResponse.json({
        success: true,
        supportedProviders: [
          {
            name: 'github',
            displayName: 'GitHub',
            authUrl: 'https://github.com/settings/tokens',
            requiredScopes: ['repo', 'user'],
          },
          {
            name: 'gitlab',
            displayName: 'GitLab',
            authUrl: 'https://gitlab.com/-/profile/personal_access_tokens',
            requiredScopes: ['api', 'read_repository', 'write_repository'],
          },
        ],
        capabilities: [
          'list_repositories',
          'get_branches',
          'get_commits',
          'get_file_content',
          'create_file',
          'create_pull_request',
          'create_webhook',
          'sync_artifacts',
        ],
      })
    }

    const client = createGitClient({ provider, accessToken })

    switch (action) {
      case 'repos':
        const repositories = await client.getRepositories()
        return NextResponse.json({
          success: true,
          repositories,
          total: repositories.length,
        })

      case 'branches':
        if (!owner || !repo) {
          return NextResponse.json(
            { success: false, error: 'owner and repo are required for branches' },
            { status: 400 }
          )
        }
        const branches = provider === 'github' 
          ? await (client as ReturnType<typeof createGitClient>).getBranches?.(owner, repo) || []
          : await (client as ReturnType<typeof createGitClient>).getBranches?.(repo) || []
        return NextResponse.json({
          success: true,
          branches,
        })

      case 'commits':
        if (!owner || !repo) {
          return NextResponse.json(
            { success: false, error: 'owner and repo are required for commits' },
            { status: 400 }
          )
        }
        const commits = provider === 'github'
          ? await (client as ReturnType<typeof createGitClient>).getCommits?.(owner, repo) || []
          : await (client as ReturnType<typeof createGitClient>).getCommits?.(repo) || []
        return NextResponse.json({
          success: true,
          commits,
        })

      default:
        const repos = await client.getRepositories()
        return NextResponse.json({
          success: true,
          repositories: repos,
        })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/git - Create files, PRs, or sync artifacts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, provider, accessToken, owner, repo, projectName, files, branch, message } = body

    if (!provider || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'provider and accessToken are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'sync_project':
        if (!owner || !repo || !projectName) {
          return NextResponse.json(
            { success: false, error: 'owner, repo, and projectName are required for sync' },
            { status: 400 }
          )
        }
        
        const generatedFiles = generateRepoStructure(projectName)
        const syncResult = await syncToRepository(
          { provider, accessToken },
          owner,
          repo,
          files || generatedFiles,
          message || `feat: Initialize ${projectName} data project`,
          branch || 'main'
        )
        
        return NextResponse.json({
          success: syncResult.success,
          result: syncResult,
        })

      case 'create_file':
        if (!owner || !repo || !files) {
          return NextResponse.json(
            { success: false, error: 'owner, repo, and files are required' },
            { status: 400 }
          )
        }
        
        const client = createGitClient({ provider, accessToken })
        
        if (provider === 'github') {
          const results = []
          for (const file of files) {
            const result = await (client as ReturnType<typeof createGitClient>).createFile?.(
              owner, repo, file.path, file.content, file.message || 'Add file', branch || 'main'
            )
            results.push(result)
          }
          return NextResponse.json({
            success: true,
            files: results,
          })
        }
        
        return NextResponse.json(
          { success: false, error: 'File creation not implemented for this provider' },
          { status: 400 }
        )

      case 'create_pr':
        if (!owner || !repo) {
          return NextResponse.json(
            { success: false, error: 'owner and repo are required for PR creation' },
            { status: 400 }
          )
        }
        
        const gitClient = createGitClient({ provider, accessToken })
        
        if (provider === 'github') {
          const pr = await (gitClient as ReturnType<typeof createGitClient>).createPullRequest?.(
            owner, repo, body.title, body.body, body.head, body.base
          )
          return NextResponse.json({
            success: true,
            pullRequest: pr,
          })
        }
        
        return NextResponse.json(
          { success: false, error: 'PR creation not implemented for this provider' },
          { status: 400 }
        )

      case 'create_webhook':
        if (!owner || !repo || !body.webhookUrl) {
          return NextResponse.json(
            { success: false, error: 'owner, repo, and webhookUrl are required' },
            { status: 400 }
          )
        }
        
        const hookClient = createGitClient({ provider, accessToken })
        
        if (provider === 'github') {
          const webhook = await (hookClient as ReturnType<typeof createGitClient>).createWebhook?.(
            owner, repo, {
              url: body.webhookUrl,
              events: body.events || ['push', 'pull_request'],
              active: true,
            }
          )
          return NextResponse.json({
            success: true,
            webhook,
          })
        }
        
        return NextResponse.json(
          { success: false, error: 'Webhook creation not implemented for this provider' },
          { status: 400 }
        )

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
