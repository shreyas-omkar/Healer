import { Octokit } from '@octokit/rest';
import axios from 'axios';

export const fixCode = async (req, res) => {
    try {
        const { repo, fixes } = req.body;
        if (!repo || !fixes || !fixes.length) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [owner, repoName] = repo.split('/');
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
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

// Helper function to apply a fix to the code
function applyFix(content, suggestion) {
    // This is a simplified version. In reality, you'd want to:
    // 1. Parse the code to understand its structure
    // 2. Locate the exact position where the fix needs to be applied
    // 3. Apply the fix while preserving the code structure
    // 4. Run tests to ensure the fix didn't break anything
    
    // For now, we'll just append the suggestion as a comment
    return `${content}\n// TODO: ${suggestion}\n`;
}
