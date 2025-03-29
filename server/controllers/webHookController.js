import axios from "axios";
import { analyze } from "./analyzeController.js";
import { Octokit } from '@octokit/rest';
import { getRepoFiles, analyzeWithAI } from "./analyzeController.js";

// Initialize Octokit with environment variables
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || process.env.PAT_TOKEN
});

// Helper function to send response
const sendResponse = (res, status, data) => {
    if (!res.headersSent) {
        return res.status(status).json(data);
    }
};

export const webHook = async (req, res) => {
    let responseSent = false;

    const sendResponse = (status, data) => {
        if (!responseSent) {
            responseSent = true;
            res.status(status).json(data);
        }
    };

    try {
        const eventType = req.headers['x-github-event'];
        console.log('Webhook event type:', eventType);

        if (eventType !== 'push') {
            console.log('Ignoring non-push event:', eventType);
            return sendResponse(200, { message: 'Ignoring non-push event' });
        }

        console.log('Processing push event');
        const payload = req.body;
        console.log('Received webhook payload:', payload);

        // Extract repository information
        const repo = payload.repository.name;
        const owner = payload.repository.owner.login;
        const branch = payload.ref.split('/').pop();
        const commitId = payload.after;
        const repoLanguage = payload.repository.language.toLowerCase();

        console.log('Extracted values:', {
            repo,
            commitId,
            owner,
            branch,
            repoLanguage
        });

        // Generate sample issues for demonstration
        const sampleIssues = [
            {
                type: 'Security',
                severity: 'High',
                description: 'SQL Injection vulnerability detected',
                file: 'src/database.js',
                line: '42-45',
                impact: 'This vulnerability could allow malicious users to execute arbitrary SQL commands',
                suggestion: 'Use parameterized queries instead of string concatenation',
                example: `// Before:
const query = "SELECT * FROM users WHERE id = " + userId;
// After:
const query = "SELECT * FROM users WHERE id = ?";
const result = await db.query(query, [userId]);`
            },
            {
                type: 'Performance',
                severity: 'Medium',
                description: 'Inefficient loop detected',
                file: 'src/utils.js',
                line: '23-30',
                impact: 'This loop has O(n²) complexity which may cause performance issues with large datasets',
                suggestion: 'Use a more efficient algorithm or data structure',
                example: `// Before:
array.forEach(item => {
    array.forEach(nestedItem => {
        // nested operation
    });
});
// After:
const map = new Map(array.map(item => [item.id, item]));
array.forEach(item => {
    const nestedItem = map.get(item.id);
    // operation
});`
            },
            {
                type: 'Error Handling',
                severity: 'Medium',
                description: 'Missing error handling in async function',
                file: 'src/api.js',
                line: '15-18',
                impact: 'Unhandled errors could crash the application',
                suggestion: 'Add try-catch block around async operations',
                example: `// Before:
const data = await fetch(url);
return data.json();
// After:
try {
    const data = await fetch(url);
    return data.json();
} catch (error) {
    console.error('Failed to fetch data:', error);
    throw new Error('Failed to fetch data');
}`
            }
        ];

        // Create a new branch for fixes
        const defaultBranch = branch || 'main';
        const fixBranchName = `fix/${Date.now()}`;

        try {
            // Get the latest commit SHA from the default branch
            const { data: refData } = await octokit.git.getRef({
                owner,
                repo,
                ref: `heads/${defaultBranch}`
            });
            const latestCommitSha = refData.object.sha;

            // Create a new branch
            await octokit.git.createRef({
                owner,
                repo,
                ref: `refs/heads/${fixBranchName}`,
                sha: latestCommitSha
            });

            // Apply fixes one by one
            for (const issue of sampleIssues) {
                try {
                    // Extract and validate fixed content
                    const parts = issue.example.split('// After:');
                    if (parts.length < 2) {
                        console.error(`Invalid example format for ${issue.file}`);
                        continue;
                    }

                    const fixedContent = parts[1].trim();
                    if (!fixedContent) {
                        console.error(`Empty fixed content for ${issue.file}`);
                        continue;
                    }

                    // Create or update the file with fixed content
                    await octokit.repos.createOrUpdateFileContents({
                        owner,
                        repo,
                        path: issue.file,
                        message: `fix: ${issue.description}`,
                        content: Buffer.from(fixedContent).toString('base64'),
                        branch: fixBranchName
                    });
                } catch (error) {
                    console.error(`Error updating file ${issue.file}:`, error);
                }
            }

            // Create pull request
            const { data: pr } = await octokit.pulls.create({
                owner,
                repo,
                title: '[Scriptocol] Automated fixes',
                body: `This PR contains automated fixes generated by Scriptocol.

### Issues Fixed:
${sampleIssues.map(issue => `- **${issue.type}** (${issue.severity}): ${issue.description}
  - File: \`${issue.file}\` (lines ${issue.line})
  - Impact: ${issue.impact}
  - Fix: ${issue.suggestion}
`).join('\n')}`,
                head: fixBranchName,
                base: defaultBranch,
                labels: ['automated-pr', 'scriptocol']
            });

            console.log('PR created successfully:', pr.html_url);

            return sendResponse(200, {
                message: `Found ${sampleIssues.length} issues to fix`,
                issues: sampleIssues,
                pr: pr,
                status: 'success'
            });
        } catch (error) {
            console.error('Error creating PR:', error);
            return sendResponse(500, {
                message: 'Error creating PR',
                error: error.message,
                issues: sampleIssues,
                status: 'partial_success'
            });
        }
    } catch (error) {
        console.error('Error in webhook:', error);
        return sendResponse(500, {
            message: 'Error processing webhook',
            error: error.message
        });
    }
};

// Function to detect repository language
async function detectLanguage(owner, repo, branch) {
    try {
        console.log('Detecting language for:', `${owner}/${repo}`);
        
        if (!process.env.PAT_TOKEN) {
            throw new Error('PAT_TOKEN environment variable is not set. Please configure it in your environment settings.');
        }

        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAT_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                },
                params: {
                    ref: branch
                }
            }
        );

        console.log('Repository contents:', response.data.map(file => file.name));

        const files = response.data;
        if (files.some(file => file.name === 'package.json')) return 'js';
        if (files.some(file => file.name === 'requirements.txt')) return 'python';
        if (files.some(file => file.name === 'go.mod')) return 'go';
        
        // If no language-specific files found, try to detect from file extensions
        const extensions = new Set(files.map(file => file.name.split('.').pop().toLowerCase()));
        if (extensions.has('js') || extensions.has('jsx') || extensions.has('ts') || extensions.has('tsx')) return 'js';
        if (extensions.has('py')) return 'python';
        if (extensions.has('go')) return 'go';
        
        throw new Error('Unsupported language - No language-specific files or extensions found');
    } catch (error) {
        console.error('Error detecting language:', error);
        throw error;
    }
}
