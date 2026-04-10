import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';

export async function askAI(promptOrMessages, apiKey, model = 'gpt-3.5-turbo') {
  const isInteractive = Array.isArray(promptOrMessages);
  const spinner = !isInteractive ? ora('Thinking...').start() : null;

  try {
    const openai = new OpenAI({ apiKey });
    
    const messages = isInteractive ? promptOrMessages : [
      {
        role: 'system',
        content: 'You are a highly capable terminal developer assistant. Provide concise, accurate terminal commands and briefly explain them if necessary. Format terminal commands cleanly.'
      },
      {
        role: 'user',
        content: promptOrMessages
      }
    ];

    const stream = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.3,
      stream: true,
    });

    if (spinner) spinner.stop();
    if (!isInteractive) console.log('\n' + chalk.cyan('🤖 AI:') + '\n');
    else process.stdout.write(chalk.cyan('\n🤖 AI: '));

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        process.stdout.write(content);
        fullResponse += content;
      }
    }
    console.log('\n');
    return fullResponse;

  } catch (error) {
    if (spinner) spinner.stop();
    console.error(chalk.red('\n❌ Error: ' + error.message));
    return null;
  }
}

export function extractCodeBlock(text) {
  // Regex to find code blocks like ```bash ... ``` or just ``` ... ```
  const regex = /```(?:\w+)?\n([\s\S]*?)```/;
  const match = text.match(regex);
  if (match) return match[1].trim();
  
  // If no code block, return the whole text if it looks like a one-liner command
  if (text.length < 100 && !text.includes('\n')) return text.trim();
  
  return null;
}
