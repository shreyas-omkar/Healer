import { Octokit } from '@octokit/rest';
import axios from 'axios';

export const fixCode = async (req, res) => {
    try {
        const { repo, fixes } = req.body;
        if (!repo || !fixes || !fixes.length) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!process.env.PAT_TOKEN) {
            return res.status(500).json({
                error: 'Configuration Error',
                message: 'PAT_TOKEN environment variable is not set. Please configure it in your environment settings.',
                details: 'This token is required for GitHub API access.'
            });
        }

        const [owner, repoName] = repo.split('/');
        const octokit = new Octokit({
            auth: process.env.PAT_TOKEN
        });

        // Create a new branch for fixes
        const defaultBranch = 'main';
        const fixBranchName = `fix/${Date.now()}`;

        // Get the latest commit SHA from the default branch
        const { data: refData } = await octokit.git.getRef({
            owner,
            repo: repoName,
            ref: `heads/${defaultBranch}`
        });
        const latestCommitSha = refData.object.sha;

        // Create a new branch
        await octokit.git.createRef({
            owner,
            repo: repoName,
            ref: `refs/heads/${fixBranchName}`,
            sha: latestCommitSha
        });

        // Apply fixes one by one
        for (const fix of fixes) {
            const { file, description, suggestion } = fix;
            
            // Get the current file content
            const { data: fileData } = await octokit.repos.getContent({
                owner,
                repo: repoName,
                path: file,
                ref: fixBranchName
            });

            // Decode content from base64
            const currentContent = Buffer.from(fileData.content, 'base64').toString();
            
            // Apply the fix (this is a simplified version - in reality, you'd want to
            // use a more sophisticated approach to apply the fixes)
            const fixedContent = applyFix(currentContent, suggestion);

            // Update the file with fixed content
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo: repoName,
                path: file,
                message: `fix: ${description}`,
                content: Buffer.from(fixedContent).toString('base64'),
                branch: fixBranchName,
                sha: fileData.sha
            });
        }

        return res.status(200).json({
            message: 'Fixes applied successfully',
            branch: fixBranchName
        });

    } catch (error) {
        console.error('Error fixing code:', error);
        return res.status(500).json({
            error: 'Failed to apply fixes',
            details: error.message
        });
    }
};


function applyFix(content, suggestion) {
   
    return `${content}\n// TODO: ${suggestion}\n`;
}
