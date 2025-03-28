import { OpenAI } from 'openai';
import axios from 'axios';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const analyze = async (req, res) => {
    try {
        const { repo, lang } = req.body;
        
        if (!repo || !lang) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: { repo, lang }
            });
        }

        console.log('Starting analysis for:', { repo, lang });

        // Get repository files
        const files = await getRepoFiles(repo);
        console.log('Found files:', files.map(f => f.path));
        
        // Analyze code using OpenAI
        const analysis = await analyzeWithAI(files, lang);
        console.log('Analysis completed:', analysis);
        
        // Generate fixes
        const fixes = await generateFixes(analysis, files, lang);
        console.log('Fixes generated:', fixes.length);
        
        return res.status(200).json({
            message: 'Analysis completed',
            analysis,
            fixes
        });
    } catch (error) {
        console.error('Error in analyze:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

async function getRepoFiles(repo) {
    try {
        // Ensure repo is in the format owner/repo
        if (!repo.includes('/')) {
            throw new Error('Repository must be in the format owner/repo');
        }

        console.log('Fetching contents for repository:', repo);
        const response = await axios.get(`https://api.github.com/repos/${repo}/contents`, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        console.log('Found files:', response.data.map(file => file.name));
        
        const files = [];
        for (const item of response.data) {
            if (item.type === 'file') {
                try {
                    const content = await axios.get(item.download_url);
                    files.push({
                        name: item.name,
                        path: item.path,
                        content: content.data
                    });
                } catch (error) {
                    console.error(`Error fetching content for ${item.path}:`, error.message);
                }
            } else if (item.type === 'dir') {
                // Recursively get contents of directories
                const dirFiles = await getDirectoryContents(repo, item.path);
                files.push(...dirFiles);
            }
        }
        
        return files;
    } catch (error) {
        console.error('Error getting repo files:', error);
        throw error;
    }
}

async function getDirectoryContents(repo, path) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${repo}/contents/${path}`, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const files = [];
        for (const item of response.data) {
            if (item.type === 'file') {
                try {
                    const content = await axios.get(item.download_url);
                    files.push({
                        name: item.name,
                        path: item.path,
                        content: content.data
                    });
                } catch (error) {
                    console.error(`Error fetching content for ${item.path}:`, error.message);
                }
            } else if (item.type === 'dir') {
                // Recursively get contents of subdirectories
                const dirFiles = await getDirectoryContents(repo, item.path);
                files.push(...dirFiles);
            }
        }
        return files;
    } catch (error) {
        console.error(`Error getting contents for directory ${path}:`, error);
        return [];
    }
}

async function analyzeWithAI(files, lang) {
    try {
        const fileContents = files.map(file => `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``).join('\n\n');
        
        const prompt = `Analyze the following ${lang} codebase for potential issues and improvements:

${fileContents}

Please identify:
1. Code quality issues
2. Potential bugs
3. Performance improvements
4. Security concerns
5. Best practice violations

Format your response as JSON with the following structure:
{
    "issues": [
        {
            "type": "bug|quality|performance|security|bestPractice",
            "file": "path/to/file",
            "line": "line number or range",
            "description": "detailed description",
            "suggestion": "suggested fix"
        }
    ]
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: "You are a code analysis expert. Provide detailed, actionable feedback." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Error analyzing with AI:', error);
        throw error;
    }
}

async function generateFixes(analysis, files, lang) {
    try {
        const fixes = [];
        
        for (const issue of analysis.issues) {
            const file = files.find(f => f.path === issue.file);
            if (!file) continue;
            
            const prompt = `Fix the following issue in this ${lang} code:

Issue: ${issue.description}
Suggestion: ${issue.suggestion}

File: ${file.path}
\`\`\`
${file.content}
\`\`\`

Provide only the fixed code without explanations.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [
                    { role: "system", content: "You are a code fixing expert. Provide only the fixed code without explanations." },
                    { role: "user", content: prompt }
                ]
            });

            fixes.push({
                file: issue.file,
                originalContent: file.content,
                fixedContent: completion.choices[0].message.content.trim(),
                issue: issue
            });
        }
        
        return fixes;
    } catch (error) {
        console.error('Error generating fixes:', error);
        throw error;
    }
}
