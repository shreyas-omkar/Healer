import axios from 'axios';

export const pushPR = async (req, res) => {
    try {
        const { fixedCode, repoOwner, repoName, branchName, commitMessage } = req.body;

        // Ensure necessary data is provided
        if (!fixedCode || !repoOwner || !repoName || !branchName || !commitMessage) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Step 1: Push fixed code to a new branch (GitHub action will create PR)
        const commitResponse = await pushCodeToNewBranch(repoOwner, repoName, branchName, fixedCode, commitMessage);

        // Step 2: Trigger GitHub Action for Pull Request (Assuming your GitHub action is set up)
        const prResponse = await triggerGitHubActionForPR(repoOwner, repoName, branchName);

        return res.status(200).json({ message: 'PR triggered successfully', prDetails: prResponse.data });
    } catch (error) {
        console.error('Error pushing PR:', error);
        return res.status(500).json({ error: 'Failed to push PR', details: error.message || error });
    }
};

// Function to push code to a new branch in GitHub
const pushCodeToNewBranch = async (repoOwner, repoName, branchName, fixedCode, commitMessage) => {
    try {
        // Step 1: Create a new commit on the new branch
        const commitResponse = await axios.post(
            `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`,
            {
                ref: `refs/heads/${branchName}`,
                sha: fixedCode,
            },
            {
                headers: {
                    Authorization: `token YOUR_GITHUB_TOKEN`, // Replace with your GitHub token
                },
            }
        );
        return commitResponse;
    } catch (error) {
        console.error('Error pushing code to GitHub:', error);
        throw error;
    }
};

// Function to trigger a GitHub Action that creates the PR
const triggerGitHubActionForPR = async (repoOwner, repoName, branchName) => {
    try {
        const actionResponse = await axios.post(
            `https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/pull_request.yml/dispatches`,
            {
                ref: branchName, // Specify the branch name here
            },
            {
                headers: {
                    Authorization: `token YOUR_GITHUB_TOKEN`, // Replace with your GitHub token
                },
            }
        );
        return actionResponse;
    } catch (error) {
        console.error('Error triggering GitHub Action for PR:', error);
        throw error;
    }
};
