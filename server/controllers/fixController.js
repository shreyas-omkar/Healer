import { OpenAI } from 'openai'; // Use your OpenAI SDK or library
import axios from 'axios';

export const fixCode = async (language, code, suggestions) => {
    try {
        // Construct a prompt for OpenAI that will fix the entire code based on suggestions
        const prompt = `
      You are a skilled ${language} developer. Your task is to fix the following code based on the issues described below:
      
      Code:
      \`\`\`
      ${code}
      \`\`\`

      Issues and Suggestions:
      ${suggestions.map(s => `- ${s}`).join("\n")}

      Please apply the fixes and return the full corrected code.
    `;

        const openAI = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
        });

        // Send the prompt to OpenAI
        const response = await openAI.chat.completions.create({
            model: "gpt-4", // You can use any GPT model like GPT-3.5 or GPT-4
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that helps improve code."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
        });

        const fixedCode = response.choices[0].message.content.trim();

        // Send fixed code to the /testwithai endpoint for further analysis
        const res = await axios.post('http://localhost:3000/api/testwithai', {
            language: language,
            code: fixedCode
        });

        // Check if there are any suggestions in the response
        const newSuggestions = res.data.suggestions || [];

        // If suggestions are found, call fixCode again until no more suggestions are present
        if (newSuggestions.length > 0) {
            console.log("Suggestions found, fixing code...");
            return await fixCode(res.data.language, res.data.code, newSuggestions); // Recursive call to fixCode
        } else {
            console.log("No more suggestions. Code is fixed! Running final analysis...");
            return fixedCode; // Final fixed code with no suggestions
        }
    }
    catch (error) {
        console.error("Error fixing the code:", error);
        throw error;
    }
};
