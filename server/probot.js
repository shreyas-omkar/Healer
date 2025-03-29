import { createNodeMiddleware, createProbot } from "probot";
import { config } from "dotenv";
import fs from 'fs';
import path from 'path';
import { analyze } from "./controllers/analyzeController.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = ['APP_ID', 'WEBHOOK_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Read private key from file
const privateKeyPath = path.join(__dirname, 'privateKey.pem');
let privateKey;
try {
    privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
    console.log('Private key loaded from file');
} catch (error) {
    console.error('Error reading private key:', error);
    throw new Error('Failed to read private key from file');
}

// Create probot app
const probot = createProbot({
    appId: process.env.APP_ID,
    privateKey: privateKey,
    secret: process.env.WEBHOOK_SECRET,
});

// Configure the app
async function app(app) {
    app.log.info("Probot app is loaded!");

    // Handle push events
    app.on("push", async (context) => {
        app.log.info("Push event received");
        
        // Get installation token
        const installationId = context.payload.installation.id;
        const token = await app.auth(installationId);
        
        // Set the token in environment for other controllers
        process.env.GITHUB_TOKEN = token;
        
        // Forward to webhook endpoint
        const response = await fetch('https://scriptocol.onrender.com/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'push'
            },
            body: JSON.stringify(context.payload)
        });
        
        return response.json();
    });

    // Handle installation events
    app.on("installation", async (context) => {
        app.log.info("Installation event received");
        
        // Forward to webhook endpoint
        const response = await fetch('https://scriptocol.onrender.com/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'installation'
            },
            body: JSON.stringify(context.payload)
        });
        
        return response.json();
    });

    // Handle repository events
    app.on("installation_repositories", async (context) => {
        app.log.info("Installation repositories event received");
        
        // Forward to webhook endpoint
        const response = await fetch('https://scriptocol.onrender.com/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'installation_repositories'
            },
            body: JSON.stringify(context.payload)
        });
        
        return response.json();
    });
}

// Export the middleware
export const probotMiddleware = createNodeMiddleware(app, { probot });

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
