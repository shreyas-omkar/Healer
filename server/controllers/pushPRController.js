import { Octokit } from '@octokit/rest';

export const pushPR = async (req, res) => {
    try {
        const { repo, title, body, branch } = req.body;
        
        if (!repo || !title || !body || !branch) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: { repo, title, body, branch }
            });
        }

        const [owner, repoName] = repo.split('/');
        const octokit = new Octokit({
            auth: process.env.PAT_TOKEN
        });

        // Trigger the GitHub Actions workflow for PR creation
        await octokit.rest.actions.createWorkflowDispatch({
            owner,
            repo: repoName,
            workflow_id: 'pull_request.yml',
            ref: 'main',
            inputs: {
                branch: branch
            }
        });

        return res.status(200).json({
            message: 'Pull request workflow triggered successfully',
            branch: branch
        });

    } catch (error) {
        console.error('Error triggering pull request workflow:', error);
        return res.status(500).json({
            error: 'Failed to trigger pull request workflow',
            details: error.message
        });
    }
};
