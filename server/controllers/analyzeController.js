import { OpenAI } from 'openai';
import axios from 'axios';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

// Debug environment variables
console.log('Environment check in analyzeController:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length);

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || process.env.PAT_TOKEN
});

export const analyze = async (req, res) => {
    try {
        const { repo, commitId, owner, branch, repoLanguage } = req.body;
        console.log('Analyze request received:', { repo, commitId, owner, branch, repoLanguage });

        // Handle repo in format owner/repo
        let repoOwner = owner;
        let repoName = repo;
        if (repo.includes('/')) {
            [repoOwner, repoName] = repo.split('/');
        }

        if (!repoName || !repoOwner) {
            console.error('Missing required parameters:', { repo: repoName, owner: repoOwner });
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Get repository files
        const files = await getRepoFiles(`${repoOwner}/${repoName}`);
        console.log('Found files:', files.map(f => f.path));

        // Analyze code using OpenAI
        const analysis = await analyzeWithAI(files, repoLanguage);
        console.log('Analysis completed:', analysis);

        if (analysis.issues && analysis.issues.length > 0) {
            // Create a new branch for fixes
            const defaultBranch = branch || 'main';
            const fixBranchName = `fix/${Date.now()}`;

            // Get the latest commit SHA from the default branch
            const { data: refData } = await octokit.git.getRef({
                owner: repoOwner,
                repo: repoName,
                ref: `heads/${defaultBranch}`
            });
            const latestCommitSha = refData.object.sha;

            // Create a new branch
            await octokit.git.createRef({
                owner: repoOwner,
                repo: repoName,
                ref: `refs/heads/${fixBranchName}`,
                sha: latestCommitSha
            });

            // Apply fixes one by one
            for (const issue of analysis.issues) {
                const file = files.find(f => f.path === issue.file);
                if (!file) continue;

                // Get the current file content
                const { data: fileData } = await octokit.repos.getContent({
                    owner: repoOwner,
                    repo: repoName,
                    path: issue.file,
                    ref: fixBranchName
                });

                // Update the file with fixed content
                await octokit.repos.createOrUpdateFileContents({
                    owner: repoOwner,
                    repo: repoName,
                    path: issue.file,
                    message: `fix: ${issue.description}`,
                    content: Buffer.from(issue.example.split('// After:')[1].trim()).toString('base64'),
                    branch: fixBranchName,
                    sha: fileData.sha
                });
            }

            // Create pull request
            const { data: pr } = await octokit.pulls.create({
                owner: repoOwner,
                repo: repoName,
                title: '[Scriptocol] Automated fixes',
                body: `This PR contains automated fixes generated by Scriptocol.

### Issues Fixed:
${analysis.issues.map(issue => `- **${issue.type}** (${issue.severity}): ${issue.description}
  - File: \`${issue.file}\` (lines ${issue.line})
  - Impact: ${issue.impact}
  - Fix: ${issue.suggestion}
`).join('\n')}`,
                head: fixBranchName,
                base: defaultBranch,
                labels: ['automated-pr', 'scriptocol']
            });

            return res.json({
                message: 'Analysis completed successfully',
                issues: analysis.issues,
                pr: pr,
                status: 'success'
            });
        } else {
            return res.json({
                message: 'No issues found',
                issues: [],
                status: 'success'
            });
        }
    } catch (error) {
        console.error('Error in analyze:', error);
        return res.status(500).json({ 
            error: error.message,
            status: 'error'
        });
    }
};

export async function getRepoFiles(repo) {
    try {
        // Ensure repo is in the format owner/repo
        if (!repo.includes('/')) {
            throw new Error('Repository must be in the format owner/repo');
        }

        console.log('Fetching contents for repository:', repo);
        const response = await axios.get(`https://api.github.com/repos/${repo}/contents`, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        console.log('Found files:', response.data.map(file => file.name));
        
        const files = [];
        for (const item of response.data) {
            if (item.type === 'file') {
                try {
                    const content = await axios.get(item.download_url);
                    files.push({
                        name: item.name,
                        path: item.path,
                        content: content.data
                    });
                } catch (error) {
                    console.error(`Error fetching content for ${item.path}:`, error.message);
                }
            } else if (item.type === 'dir') {
                // Recursively get contents of directories
                const dirFiles = await getDirectoryContents(repo, item.path);
                files.push(...dirFiles);
            }
        }
        
        return files;
    } catch (error) {
        console.error('Error getting repo files:', error);
        throw error;
    }
}

async function getDirectoryContents(repo, path) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${repo}/contents/${path}`, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const files = [];
        for (const item of response.data) {
            if (item.type === 'file') {
                try {
                    const content = await axios.get(item.download_url);
                    files.push({
                        name: item.name,
                        path: item.path,
                        content: content.data
                    });
                } catch (error) {
                    console.error(`Error fetching content for ${item.path}:`, error.message);
                }
            } else if (item.type === 'dir') {
                // Recursively get contents of subdirectories
                const dirFiles = await getDirectoryContents(repo, item.path);
                files.push(...dirFiles);
            }
        }
        return files;
    } catch (error) {
        console.error(`Error getting contents for directory ${path}:`, error);
        return [];
    }
}

export async function analyzeWithAI(files, lang) {
    try {
        // Filter to only include code files
        const codeFiles = files.filter(file => {
            const ext = file.path.split('.').pop().toLowerCase();
            return ['js', 'jsx', 'ts', 'tsx', 'py', 'go'].includes(ext);
        });

        // Process files in chunks of 2 to avoid token limits
        const issues = [];
        for (let i = 0; i < codeFiles.length; i += 2) {
            const chunk = codeFiles.slice(i, i + 2);
            const fileContents = chunk.map(file => `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``).join('\n\n');
            
            const prompt = `Quickly analyze these ${lang} files for critical issues. Focus on:
1. Security vulnerabilities
2. Performance bottlenecks
3. Error handling gaps
4. Code quality issues

${fileContents}

Respond with a JSON array of issues in this format:
{
    "issues": [
        {
            "type": "security|performance|errorHandling|quality",
            "severity": "high|medium",
            "description": "brief issue description",
            "impact": "what could happen",
            "file": "exact file path",
            "line": "line numbers",
            "suggestion": "concrete fix",
            "example": "before/after code example"
        }
    ]
}`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [
                    { role: "system", content: "You are a critical code reviewer. Find real issues quickly." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0].message.content);
            if (result.issues) {
                issues.push(...result.issues);
            }
        }

        return { issues };
    } catch (error) {
        console.error('Error analyzing with AI:', error);
        throw error;
    }
}

async function generateFixes(analysis, files, lang) {
    try {
        const fixes = [];
        
        for (const issue of analysis.issues) {
            const file = files.find(f => f.path === issue.file);
            if (!file) continue;
            
            const prompt = `Fix the following issue in this ${lang} code:

Issue: ${issue.description}
Suggestion: ${issue.suggestion}

File: ${file.path}
\`\`\`
${file.content}
\`\`\`

Provide only the fixed code without explanations.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [
                    { role: "system", content: "You are a code fixing expert. Provide only the fixed code without explanations." },
                    { role: "user", content: prompt }
                ]
            });

            fixes.push({
                file: issue.file,
                originalContent: file.content,
                fixedContent: completion.choices[0].message.content.trim(),
                issue: issue
            });
        }
        
        return fixes;
    } catch (error) {
        console.error('Error generating fixes:', error);
        throw error;
    }
}