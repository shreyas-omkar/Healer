import axios from "axios";
import { analyze } from "./analyzeController.js";

export const webHook = async (req, res) => {
    try {
        console.log('Received webhook payload:', JSON.stringify(req.body, null, 2));

        // Handle installation events
        if (req.body.action === 'created' || req.body.action === 'added') {
            const repositories = req.body.repositories || [];
            for (const repo of repositories) {
                try {
                    const analyzeResponse = await analyze({
                        body: { 
                            repo: repo.full_name,
                            lang: await detectLanguage(repo.owner.login, repo.name, repo.default_branch)
                        }
                    }, res);
                    
                    if (analyzeResponse?.body?.fixes?.length > 0) {
                        console.log(`Found ${analyzeResponse.body.fixes.length} fixes for ${repo.full_name}`);
                    }
                } catch (error) {
                    console.error(`Error analyzing repository ${repo.full_name}:`, error);
                }
            }
            return res.status(200).json({ message: 'Installation event processed' });
        }

        // Extract data from the payload for push events
        const repo = req.body.repository?.name;
        const commitId = req.body.head_commit?.id;
        const owner = req.body.repository?.owner?.login;
        const branch = req.body.ref?.split('/').pop();
        const repoLanguage = req.body.repository?.language?.toLowerCase();

        console.log('Extracted values:', { repo, commitId, owner, branch, repoLanguage });

        // Ensure all required fields are present
        if (!repo || !commitId || !owner || !branch) {
            console.error('Missing required fields:', { repo, commitId, owner, branch });
            return res.status(400).json({ 
                error: 'Missing required fields', 
                details: { repo, commitId, owner, branch } 
            });
        }

        // First try to use the repository's language field
        let lang;
        if (repoLanguage) {
            if (repoLanguage.includes('javascript') || repoLanguage.includes('typescript')) {
                lang = 'js';
            } else if (repoLanguage.includes('python')) {
                lang = 'python';
            } else if (repoLanguage.includes('go')) {
                lang = 'go';
            }
        }

        // If language not detected from repository field, try to detect from files
        if (!lang) {
            lang = await detectLanguage(owner, repo, branch);
        }

        console.log('Detected language:', lang);

        // Call the analyze function directly with the full repository path
        const analyzeResponse = await analyze({
            body: { 
                repo: `${owner}/${repo}`,
                lang 
            }
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
        console.log('Detecting language for:', `${owner}/${repo}`);
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
