import axios from "axios";

export const webHook = async (req, res) => {
    try {
        console.log('Received webhook payload:', JSON.stringify(req.body, null, 2));

        // Extract data from the payload for push events
        const repo = req.body.repository?.name;
        const commitId = req.body.head_commit?.id;
        const owner = req.body.repository?.owner?.login;
        const branch = req.body.ref?.split('/').pop();

        console.log('Extracted values:', { repo, commitId, owner, branch });

        // Ensure all required fields are present
        if (!repo || !commitId || !owner || !branch) {
            console.error('Missing required fields:', { repo, commitId, owner, branch });
            return res.status(400).json({ 
                error: 'Missing required fields', 
                details: { repo, commitId, owner, branch } 
            });
        }

        // Instead of triggering workflow, directly analyze the code
        const analyzeResponse = await analyzeCode(repo, commitId, owner, branch);
        return res.status(200).json(analyzeResponse);
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.response?.data || error.message || error 
        });
    }
};

// Function to analyze code directly
const analyzeCode = async (repo, commitId, owner, branch) => {
    try {
        // Get the repository content using GitHub API
        const repoContent = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                },
                params: {
                    ref: commitId
                }
            }
        );

        // Detect language based on files
        const hasPackageJson = repoContent.data.some(file => file.name === 'package.json');
        const hasRequirementsTxt = repoContent.data.some(file => file.name === 'requirements.txt');
        const hasGoMod = repoContent.data.some(file => file.name === 'go.mod');

        let lang;
        if (hasPackageJson) lang = 'js';
        else if (hasRequirementsTxt) lang = 'python';
        else if (hasGoMod) lang = 'go';
        else throw new Error('Unsupported language');

        // Create a PR with fixes if needed
        const prResponse = await createPullRequest(owner, repo, branch, commitId, lang);
        
        return {
            message: 'Analysis completed',
            language: lang,
            pullRequest: prResponse.data
        };
    } catch (error) {
        console.error('Error analyzing code:', error);
        throw error;
    }
};

// Function to create a pull request with fixes
const createPullRequest = async (owner, repo, branch, commitId, lang) => {
    try {
        // Create a new branch for fixes
        const fixBranch = `fix/${commitId.substring(0, 7)}`;
        
        // Get the latest commit SHA from the base branch
        const baseRef = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );

        // Create a new branch
        await axios.post(
            `https://api.github.com/repos/${owner}/${repo}/git/refs`,
            {
                ref: `refs/heads/${fixBranch}`,
                sha: baseRef.data.object.sha
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );

        // Create pull request
        return await axios.post(
            `https://api.github.com/repos/${owner}/${repo}/pulls`,
            {
                title: `[Scriptocol] Automated fixes for ${commitId.substring(0, 7)}`,
                body: `Automated fixes generated by Scriptocol for commit ${commitId}`,
                head: fixBranch,
                base: branch
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
    } catch (error) {
        console.error('Error creating pull request:', error);
        throw error;
    }
};
