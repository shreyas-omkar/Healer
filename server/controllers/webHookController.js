import axios from "axios";

export const webHook = async (req, res) => {
    try {

        // Extract data from the payload for push events
        const repo = req.body.repository?.name;
        const commitId = req.body.head_commit?.id;
        const owner = req.body.repository?.owner?.login;  // GitHub uses 'login' for user/organization name
        const branch = req.body.ref?.split('/').pop();  // Extract the branch name from the ref field

        // Log extracted values
        console.log('Repo:', repo, 'Commit ID:', commitId, 'Owner:', owner, 'Branch:', branch);

        // Ensure all required fields are present
        if (!repo || !commitId || !owner || !branch) {
            console.error('Missing required fields:', { repo, commitId, owner, branch });
            return res.status(400).json({ error: 'Missing required fields: repo, commitId, owner, or branch' });
        }

        // Step 2: Trigger GitHub Actions or further processing
        const workflowResponse = await triggerGitHubWorkflow(repo, commitId, owner, branch);

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
const triggerGitHubWorkflow = async (repo, commitId, owner, branch) => {
    try {
        const response = await axios.post(
            `https://api.github.com/repos/${owner}/${repo}/actions/workflows/scriptocol.yml/dispatches`,  // Correct URL without 'POST' keyword
            {
                ref: branch,  // Use the branch from the push event
                inputs: {
                    commitId: commitId,  // Passing the commit ID as input
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
        console.error('Error triggering GitHub Actions workflow:', error.response?.data || error.message || error);
        throw error;  // Rethrow the error after logging
    }
};
