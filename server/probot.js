import { Probot } from "probot";
import fs from "fs";
import dotenv from "dotenv";
import { analyze } from "./controllers/analyzeController.js";

dotenv.config();

// Get private key from environment variable or file
let privateKey;
if (process.env.PRIVATE_KEY) {
    privateKey = process.env.PRIVATE_KEY;
} else if (fs.existsSync("./privateKey.pem")) {
    privateKey = fs.readFileSync("./privateKey.pem", "utf8").trim();
} else {
    throw new Error("No private key found in environment variables or privateKey.pem file");
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
