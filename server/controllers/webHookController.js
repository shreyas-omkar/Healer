import axios from "axios";

export const webHook = async (req, res) => {
    try {
        console.log('Received webhook payload:', JSON.stringify(req.body, null, 2));

        // Extract data from the payload for push events
        const repo = req.body.repository?.name;
        const commitId = req.body.head_commit?.id;
        const owner = req.body.repository?.owner?.login;  // GitHub uses 'login' for user/organization name
        const branch = req.body.ref?.split('/').pop();  // Extract the branch name from the ref field

        // Log extracted values
        console.log('Extracted values:', { repo, commitId, owner, branch });

        // Ensure all required fields are present
        if (!repo || !commitId || !owner || !branch) {
            console.error('Missing required fields:', { repo, commitId, owner, branch });
            return res.status(400).json({ 
                error: 'Missing required fields', 
                details: { repo, commitId, owner, branch } 
            });
        }

        // Step 2: Trigger GitHub Actions or further processing
        const workflowResponse = await triggerGitHubWorkflow(repo, commitId, owner, branch);

        if (workflowResponse.status === 201) {
            console.log('Workflow triggered successfully');
            return res.status(200).json({ 
                message: 'GitHub Actions workflow triggered successfully!',
                details: workflowResponse.data
            });
        } else {
            console.error('Failed to trigger workflow:', workflowResponse);
            return res.status(500).json({ 
                error: 'Failed to trigger GitHub Actions workflow',
                details: workflowResponse.data
            });
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.response?.data || error.message || error 
        });
    }
};

// GitHub API call to trigger the workflow
const triggerGitHubWorkflow = async (repo, commitId, owner, branch) => {
    try {
        console.log('Triggering workflow for:', { repo, commitId, owner, branch });
        
        if (!process.env.GITHUB_TOKEN) {
            throw new Error('GITHUB_TOKEN environment variable is not set');
        }

        const response = await axios.post(
            `https://api.github.com/repos/${owner}/${repo}/actions/workflows/scriptocol.yml/dispatches`,
            {
                ref: branch,
                inputs: {
                    commitId: commitId,
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        console.log('Workflow trigger response:', response.data);
        return response;
    } catch (error) {
        console.error('Error triggering GitHub Actions workflow:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
};
