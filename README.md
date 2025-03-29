# Scriptocol - AI-Powered Code Analysis

A GitHub App that automatically analyzes your code, finds issues, and creates PRs with fixes.

## Setup Guide for Users

After installing the app, you need to set up the following environment variables in your repository:

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:

   - `OPENAI_API_KEY`: Your OpenAI API key (get it from [OpenAI](https://platform.openai.com/api-keys))
   - `PAT_TOKEN`: A GitHub Personal Access Token with the following permissions:
     - `repo` (Full control of private repositories)
     - `workflow` (Update GitHub Action workflows)

### Required Permissions

The app needs the following permissions to function:
- Read repository contents
- Create pull requests
- Create branches
- Push code changes
- Read and write workflow files

### What Happens After Setup

1. When you push code to your repository:
   - The app automatically analyzes your code
   - Identifies potential issues and improvements
   - Creates a PR with suggested fixes

2. When you install the app on a repository:
   - It analyzes the entire codebase
   - Creates a PR with any necessary fixes
   - Sets up automated analysis for future pushes

### Troubleshooting

If you encounter any issues:
1. Check if all required secrets are set
2. Ensure the app has the necessary permissions
3. Check the Actions tab for any error logs
4. Contact support if issues persist

## Development Setup

If you want to run the app locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Set up environment variables in `server/.env`
4. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- Automatic code analysis
- Security vulnerability detection
- Code quality improvements
- Best practice recommendations
- Automated PR creation
- Support for multiple languages (JavaScript, Python, Go)

## Features ✨

- 🔒 **Security Analysis**: Detects security vulnerabilities and suggests fixes
- 🎯 **Code Quality**: Identifies code quality issues and best practice violations
- 🚀 **Automated Fixes**: Creates pull requests with suggested improvements
- 🌐 **Multi-language Support**: Works with JavaScript/TypeScript, Python, and Go
- 🤖 **AI-Powered**: Uses advanced AI to understand and fix code issues

## Installation 🛠️

1. Visit [Scriptocol GitHub App](https://github.com/apps/scriptocol)
2. Click "Install"
3. Choose the repositories you want to analyze
4. That's it! Scriptocol will now monitor your pushes and create PRs with fixes

## How It Works 🔄

1. **Push Detection**: When you push code to your repository
2. **Analysis**: Scriptocol analyzes your code for:
   - Security vulnerabilities
   - Code quality issues
   - Best practice violations
   - Performance improvements
3. **Fix Generation**: AI generates appropriate fixes
4. **PR Creation**: Creates a pull request with the fixes if:
   - Critical security issues are found
   - More than 5 quality/best practice issues are found

## Permissions Required 📝

- **Repository Contents**: To create branches and commits
- **Pull Requests**: To create pull requests with fixes
- **Issues**: To create welcome messages and notifications
- **Metadata**: To read repository information
- **Statuses**: To update commit statuses

## Support 💬

- [Report an Issue](https://github.com/shreyas-omkar/Healer/issues)
- [Documentation](https://github.com/shreyas-omkar/Healer/wiki)
- [Contributing Guidelines](https://github.com/shreyas-omkar/Healer/blob/main/CONTRIBUTING.md)

## License 📄

MIT License - see [LICENSE](LICENSE) for details 