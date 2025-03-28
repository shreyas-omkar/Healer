import axios from "axios";
import { analyze } from "./analyzeController.js";

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

        // Call the analyze function directly
        const analyzeResponse = await analyze({
            body: { repo, lang: await detectLanguage(owner, repo, branch) }
        }, res);
        
        return analyzeResponse;
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.response?.data || error.message || error 
        });
    }
};

// Function to detect repository language
async function detectLanguage(owner, repo, branch) {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                },
                params: {
                    ref: branch
                }
            }
        );

        const files = response.data;
        if (files.some(file => file.name === 'package.json')) return 'js';
        if (files.some(file => file.name === 'requirements.txt')) return 'python';
        if (files.some(file => file.name === 'go.mod')) return 'go';
        
        throw new Error('Unsupported language');
    } catch (error) {
        console.error('Error detecting language:', error);
        throw error;
    }
}
