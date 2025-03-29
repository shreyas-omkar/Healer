import { OpenAI } from 'openai';
import axios from 'axios';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

// Debug environment variables
console.log('Environment check in analyzeController:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length);
console.log('PAT_TOKEN exists:', !!process.env.PAT_TOKEN);
console.log('PAT_TOKEN length:', process.env.PAT_TOKEN?.length);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Initialize OpenAI client only if API key exists
let openai;
if (process.env.OPENAI_API_KEY) {
    try {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    } catch (error) {
        console.error('Error initializing OpenAI:', error.message);
    }
}

export const analyze = async (req, res) => {
    try {
        const { repo, commitId, owner, branch, repoLanguage } = req.body;
        console.log('Analyze request received:', { repo, commitId, owner, branch, repoLanguage });

        if (!repo || !owner) {
            console.error('Missing required parameters:', { repo, owner });
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Get repository files
        console.log('Fetching repository files...');
        const files = await getRepoFiles(owner, repo, branch);
        console.log(`Fetched ${files.length} files from repository`);

        if (!files || files.length === 0) {
            console.error('No files found in repository');
            return res.status(404).json({ error: 'No files found in repository' });
        }

        // Analyze with AI
        console.log('Starting AI analysis...');
        const analysis = await analyzeWithAI(files, repoLanguage || 'javascript');
        console.log('AI analysis completed:', analysis);

        if (!analysis.issues || analysis.issues.length === 0) {
            console.log('No issues found in the analysis');
            return res.json({ issues: [] });
        }

        // Create PR with fixes
        console.log('Creating PR with fixes...');
        const pr = await createPRWithFixes(owner, repo, branch, analysis.issues);
        console.log('PR created:', pr);

        return res.json({
            issues: analysis.issues,
            pr: pr
        });
    } catch (error) {
        console.error('Error in analyze:', error);
        return res.status(500).json({ error: error.message });
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
                Authorization: `Bearer ${process.env.PAT_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        console.log('Found root files:', response.data.map(file => file.name));
        
        const files = [];
        for (const item of response.data) {
            if (item.type === 'file') {
                try {
                    console.log(`Fetching content for file: ${item.path}`);
                    const content = await axios.get(item.download_url);
                    const fileContent = content.data;
                    console.log(`File ${item.path} content length: ${fileContent.length}`);
                    
                    files.push({
                        name: item.name,
                        path: item.path,
                        content: fileContent
                    });
                    console.log(`Successfully fetched content for: ${item.path}`);
                } catch (error) {
                    console.error(`Error fetching content for ${item.path}:`, error.message);
                }
            } else if (item.type === 'dir') {
                console.log(`Processing directory: ${item.path}`);
                // Recursively get contents of directories
                const dirFiles = await getDirectoryContents(repo, item.path);
                files.push(...dirFiles);
            }
        }
        
        console.log(`Total files processed: ${files.length}`);
        console.log('Files to analyze:', files.map(f => f.path));
        return files;
    } catch (error) {
        console.error('Error getting repo files:', error);
        throw error;
    }
}

async function getDirectoryContents(repo, path) {
    try {
        console.log(`Fetching contents for directory: ${path}`);
        const response = await axios.get(`https://api.github.com/repos/${repo}/contents/${path}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAT_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const files = [];
        for (const item of response.data) {
            if (item.type === 'file') {
                try {
                    console.log(`Fetching content for file: ${item.path}`);
                    const content = await axios.get(item.download_url);
                    const fileContent = content.data;
                    console.log(`File ${item.path} content length: ${fileContent.length}`);
                    
                    files.push({
                        name: item.name,
                        path: item.path,
                        content: fileContent
                    });
                    console.log(`Successfully fetched content for: ${item.path}`);
                } catch (error) {
                    console.error(`Error fetching content for ${item.path}:`, error.message);
                }
            } else if (item.type === 'dir') {
                console.log(`Processing subdirectory: ${item.path}`);
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
        // Filter out non-code files
        const codeFiles = files.filter(file => {
            const ext = file.path.split('.').pop().toLowerCase();
            return ['js', 'jsx', 'ts', 'tsx', 'py', 'go'].includes(ext);
        });

        console.log('Analyzing code files:', codeFiles.map(f => f.path));
        
        // Process files in chunks to avoid token limits
        const chunkSize = 3; // Process 3 files at a time
        const chunks = [];
        for (let i = 0; i < codeFiles.length; i += chunkSize) {
            chunks.push(codeFiles.slice(i, i + chunkSize));
        }

        console.log(`Processing ${chunks.length} chunks of files`);
        let allIssues = [];
        
        for (const chunk of chunks) {
            const fileContents = chunk.map(file => `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``).join('\n\n');
            
            const prompt = `Analyze the following ${lang} codebase and identify ALL issues and improvements:

${fileContents}

Please identify issues in the following categories:
1. Code quality issues
2. Potential bugs
3. Performance improvements
4. Security concerns
5. Best practice violations
6. Error handling issues
7. Code duplication
8. Missing documentation
9. Inconsistent coding style
10. Potential memory leaks
11. API design issues
12. Testing gaps
13. Accessibility issues
14. Maintainability concerns
15. Scalability issues

For each issue found, provide:
1. A clear description of the problem
2. Why it's problematic
3. The potential impact
4. A specific suggestion for improvement
5. Example of how to fix it

Format your response as JSON with the following structure:
{
    "issues": [
        {
            "type": "bug|quality|performance|security|bestPractice|errorHandling|duplication|documentation|style|memory|api|testing|accessibility|maintainability|scalability",
            "severity": "low|medium|high|critical",
            "description": "Detailed description of the issue",
            "impact": "Potential impact of the issue",
            "file": "path/to/file",
            "line": "line number or range",
            "suggestion": "Detailed suggestion for improvement",
            "example": "Example of how to fix the issue"
        }
    ]
}`;

            console.log('Sending prompt to OpenAI for files:', chunk.map(f => f.path));
            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [
                    {
                        role: "system",
                        content: "You are a thorough code analysis expert. Your goal is to identify ALL potential issues and improvements in the code. Be comprehensive and don't miss anything. Look for both obvious and subtle issues. Always return a JSON response with an 'issues' array, even if empty."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 8000
            });

            const response = completion.choices[0].message.content;
            console.log('OpenAI response for chunk:', response);
            
            try {
                const analysis = JSON.parse(response);
                if (analysis.issues && analysis.issues.length > 0) {
                    console.log(`Found ${analysis.issues.length} issues in chunk`);
                    allIssues = [...allIssues, ...analysis.issues];
                    
                    // Log issues found in this chunk
                    analysis.issues.forEach((issue, index) => {
                        console.log(`\nIssue ${allIssues.length - analysis.issues.length + index + 1}:`);
                        console.log(`Type: ${issue.type}`);
                        console.log(`Severity: ${issue.severity}`);
                        console.log(`File: ${issue.file}`);
                        console.log(`Line: ${issue.line}`);
                        console.log(`Description: ${issue.description}`);
                        console.log(`Impact: ${issue.impact}`);
                        console.log(`Suggestion: ${issue.suggestion}`);
                        console.log(`Example: ${issue.example}`);
                    });
                } else {
                    console.log('No issues found in this chunk');
                }
            } catch (error) {
                console.error('Error parsing OpenAI response:', error);
                console.error('Raw response:', response);
            }
        }

        console.log(`Total issues found across all chunks: ${allIssues.length}`);
        return { issues: allIssues };
    } catch (error) {
        console.error('Error in analyzeWithAI:', error);
        return { issues: [] };
    }
}

async function generateFixes(analysis, files, lang) {
    try {
        console.log('Starting generateFixes with analysis:', JSON.stringify(analysis, null, 2));
        
        if (!analysis.issues || analysis.issues.length === 0) {
            console.log('No issues found in analysis');
            return [];
        }

        console.log(`Found ${analysis.issues.length} issues to fix`);
        const fixes = [];
        
        // Sort issues by priority and severity
        const sortedIssues = [...analysis.issues].sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
        
        for (const issue of sortedIssues) {
            try {
                console.log(`Processing issue in file: ${issue.file}`);
                const file = files.find(f => f.path === issue.file);
                if (!file) {
                    console.log(`File not found: ${issue.file}`);
                    continue;
                }

                const prompt = `Fix the following issue in the ${lang} code:

File: ${file.path}
Issue Type: ${issue.type}
Severity: ${issue.severity}
Priority: ${issue.priority}
Description: ${issue.description}
Impact: ${issue.impact}
Suggestion: ${issue.suggestion}

Current code:
\`\`\`
${file.content}
\`\`\`

Please provide the fixed code that addresses this issue. The fix should:
1. Address the root cause of the issue
2. Follow best practices
3. Include proper error handling
4. Be well-documented
5. Be maintainable

Return only the fixed code without any explanations.`;

                console.log('Sending fix prompt to OpenAI...');
                const completion = await openai.chat.completions.create({
                    model: "gpt-4-turbo-preview",
                    messages: [
                        {
                            role: "system",
                            content: "You are a code fixing expert. Provide only the fixed code without any explanations. Make sure to fix all issues identified and follow best practices."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                });

                const fixedContent = completion.choices[0].message.content.trim();
                console.log(`Generated fix for ${issue.file}`);
                
                fixes.push({
                    file: issue.file,
                    fixedContent,
                    issue
                });
            } catch (error) {
                console.error(`Error generating fix for issue in ${issue.file}:`, error);
            }
        }

        console.log(`Generated ${fixes.length} fixes`);
        return fixes;
    } catch (error) {
        console.error('Error in generateFixes:', error);
        return [];
    }
}

async function getRepoFiles(owner, repo, branch) {
    try {
        console.log(`Fetching repository contents for ${owner}/${repo} on branch ${branch}`);
        
        // First, get the default branch if not specified
        if (!branch) {
            const repoData = await octokit.rest.repos.get({
                owner,
                repo
            });
            branch = repoData.data.default_branch;
            console.log(`Using default branch: ${branch}`);
        }

        // Get the tree recursively
        const { data: ref } = await octokit.rest.git.getRef({
            owner,
            repo,
            ref: `heads/${branch}`
        });

        console.log(`Got ref: ${ref.object.sha}`);

        const { data: tree } = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: ref.object.sha,
            recursive: '1'
        });

        console.log(`Got tree with ${tree.tree.length} items`);

        // Filter for files only (not directories)
        const files = tree.tree.filter(item => item.type === 'blob');
        console.log(`Found ${files.length} files`);

        // Get contents for each file
        const fileContents = await Promise.all(
            files.map(async (file) => {
                try {
                    console.log(`Fetching content for: ${file.path}`);
                    const { data } = await octokit.rest.repos.getContent({
                        owner,
                        repo,
                        path: file.path,
                        ref: branch
                    });

                    // Handle both string and object responses
                    let content;
                    if (typeof data === 'string') {
                        content = data;
                    } else if (data.content) {
                        content = Buffer.from(data.content, 'base64').toString('utf-8');
                    } else {
                        console.log(`No content found for ${file.path}`);
                        return null;
                    }

                    console.log(`Got content for ${file.path}, length: ${content.length}`);
                    return {
                        path: file.path,
                        content: content
                    };
                } catch (error) {
                    console.error(`Error fetching content for ${file.path}:`, error.message);
                    return null;
                }
            })
        );

        // Filter out any null results and log the final count
        const validFiles = fileContents.filter(file => file !== null);
        console.log(`Successfully fetched ${validFiles.length} files with content`);
        console.log('Files:', validFiles.map(f => f.path));

        return validFiles;
    } catch (error) {
        console.error('Error in getRepoFiles:', error);
        throw error;
    }
}
