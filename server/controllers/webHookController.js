import axios from "axios";
import { Octokit } from '@octokit/rest';
import { getRepoFiles, analyzeWithAI } from "./analyzeController.js";

// Initialize Octokit with environment variables
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || process.env.PAT_TOKEN
});

export const webHook = async (req, res) => {
    let responseSent = false;

    const sendResponse = (status, data) => {
        if (!responseSent) {
            responseSent = true;
            // Clean the data object to prevent circular references
            const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    // Remove circular references
                    if (value.socket || value.parser) {
                        return undefined;
                    }
                    // Clean nested objects
                    return Object.fromEntries(
                        Object.entries(value).filter(([_, v]) => v !== undefined)
                    );
                }
                return value;
            }));
            res.status(status).json(cleanData);
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
        console.log('Repository details:', {
            name: payload.repository?.name,
            owner: payload.repository?.owner?.login,
            full_name: payload.repository?.full_name,
            clone_url: payload.repository?.clone_url
        });

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

        // Get repository files and analyze with AI
        const repoString = `${owner}/${repo}`;
        console.log('Calling getRepoFiles with:', repoString);
        try {
            const files = await getRepoFiles(repoString);
            console.log('Successfully got repo files:', files.length);
            const analysis = await analyzeWithAI(files, repoLanguage);
            console.log('Analysis complete:', analysis.length, 'issues found');
        } catch (error) {
            console.error('Error in repository processing:', error);
            throw error;
        }

        if (!analysis || analysis.length === 0) {
            return sendResponse(200, {
                message: 'No issues found in the codebase',
                status: 'success'
            });
        }

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
            for (const issue of analysis) {
                try {
                    if (!issue.fixedCode) {
                        console.error(`No fixed code provided for ${issue.file}`);
                        continue;
                    }

                    // Create or update the file with fixed content
                    await octokit.repos.createOrUpdateFileContents({
                        owner,
                        repo,
                        path: issue.file,
                        message: `fix: ${issue.description}`,
                        content: Buffer.from(issue.fixedCode).toString('base64'),
                        branch: fixBranchName
                    });
                } catch (error) {
                    console.error(`Error updating file ${issue.file}:`, error);
                    // Continue with other files even if one fails
                }
            }

            // Create pull request
            const { data: pr } = await octokit.pulls.create({
                owner,
                repo,
                title: '[Scriptocol] AI-Generated Fixes',
                body: `This PR contains automated fixes generated by Scriptocol's AI analysis.

### Issues Fixed:
${analysis.map(issue => `- **${issue.type}** (${issue.severity}): ${issue.description}
  - File: \`${issue.file}\` (lines ${issue.line})
  - Impact: ${issue.impact}
  - Fix: ${issue.suggestion}
`).join('\n')}`,
                head: fixBranchName,
                base: defaultBranch,
                labels: ['automated-pr', 'scriptocol']
            });

            console.log('PR created successfully:', pr.html_url);

            // Clean PR data before sending response
            const cleanPr = {
                html_url: pr.html_url,
                number: pr.number,
                title: pr.title,
                state: pr.state
            };

            return sendResponse(200, {
                message: `Found ${analysis.length} issues to fix`,
                issues: analysis,
                pr: cleanPr,
                status: 'success'
            });
        } catch (error) {
            console.error('Error creating PR:', error);
            return sendResponse(500, {
                message: 'Error creating PR',
                error: error.message,
                issues: analysis,
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
