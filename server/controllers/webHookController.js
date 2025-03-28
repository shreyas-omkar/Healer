import axios from "axios";

export const webHook = async (req, res) => {
    try {
        // Log the full payload to understand its structure
        console.log('Received Webhook payload:');

        // Extract data from the payload
        const repo = req.body.repository.name;
        const prNumber = req.body.head_commit.id;
        const owner = req.body.repository.owner.name;

        console.log(repo, prNumber)
        if (!repo || !prNumber) {
            console.error('Missing required fields:', { repo, prNumber });
            return res.status(400).json({ error: 'Missing required fields: code, language, repo, or prNumber' });
        }

        // Step 2: Trigger GitHub Actions or further processing
        const workflowResponse = await triggerGitHubWorkflow(repo, prNumber, owner);

        if (workflowResponse.status === 201) {
            console.log('Workflow triggered successfully');
            return res.status(200).json({ message: 'GitHub Actions workflow triggered successfully!' });
        } else {
            console.error('Failed to trigger workflow:', workflowResponse);
            return res.status(500).json({ error: 'Failed to trigger GitHub Actions workflow.' });
        }
    } catch (error) {
        // Log the actual error message
        console.error('Error processing webhook:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message || error });
    }
};

// GitHub API call to trigger the workflow
const triggerGitHubWorkflow = async (repo, prNumber, owner) => {
    try {
        const response = await axios.post(
            `https://api.github.com/repos/${owner}/${repo}/actions/workflows/scriptocol.yml/dispatches`,  // Correct URL without 'POST' keyword
            {
                ref: 'main',  // This should be the branch you want to trigger the workflow on (typically main or any other active branch)
                inputs: {
                    prNumber: prNumber,
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // Use your GitHub token stored in environment variables
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error triggering GitHub Actions workflow:', error);
        throw error;
    }
};
