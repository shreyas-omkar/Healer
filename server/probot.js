import { Probot } from "probot";
import fs from "fs";
import dotenv from "dotenv";
import { analyze } from "./controllers/analyzeController.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env file if it exists
try {
    dotenv.config();
} catch (error) {
    console.log('No .env file found, using environment variables from Render');
}

// Get private key from file
const privateKeyPath = path.join(__dirname, 'privateKey.pem');
if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`Private key file not found at: ${privateKeyPath}`);
}

const privateKey = fs.readFileSync(privateKeyPath, "utf8").trim();
console.log('Private key loaded from file');

// Validate required environment variables
const requiredEnvVars = ['APP_ID', 'WEBHOOK_SECRET', 'OPENAI_API_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

export const probot = new Probot({
    appId: Number(process.env.APP_ID),
    privateKey,
    secret: process.env.WEBHOOK_SECRET,
});

// Handle push events
probot.on('push', async (context) => {
    try {
        const repo = context.payload.repository.full_name;
        const lang = context.payload.repository.language?.toLowerCase();
        const branch = context.payload.ref.split('/').pop();

        console.log('Processing push event:', { repo, lang, branch });

        // Call analyze with the repository information
        await analyze({
            body: {
                repo,
                lang: detectLanguage(lang),
                branch
            }
        });

    } catch (error) {
        console.error('Error processing push event:', error);
    }
});

// Handle installation events
probot.on('installation.created', async (context) => {
    try {
        const login = context.payload.installation.account.login;
        console.log(`App installed by ${login}`);

        // Send welcome message as a new issue
        await context.octokit.issues.create({
            owner: login,
            repo: context.payload.repositories[0].name,
            title: '🎉 Welcome to Scriptocol!',
            body: `Thanks for installing Scriptocol! 

Here's what you can expect:
- Automatic code analysis on every push
- Security vulnerability detection
- Code quality improvements
- Best practice recommendations
- Automated PR creation for fixes

The app will now monitor your pushes and create PRs with fixes when issues are found.

For more information, check out our [documentation](https://github.com/shreyas-omkar/Healer).

Happy coding! 🚀`
        });
    } catch (error) {
        console.error('Error handling installation:', error);
    }
});

// Helper function to detect language
function detectLanguage(repoLang) {
    if (!repoLang) return null;
    
    if (repoLang.includes('javascript') || repoLang.includes('typescript')) {
        return 'js';
    } else if (repoLang.includes('python')) {
        return 'python';
    } else if (repoLang.includes('go')) {
        return 'go';
    }
    return null;
}
