import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';

export async function askAI(prompt, apiKey) {
  const spinner = ora('Asking AI...').start();

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a highly capable terminal developer assistant. Provide concise, accurate terminal commands and briefly explain them if necessary. Format terminal commands cleanly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    spinner.stop();
    
    const reply = response.choices[0].message.content;
    console.log('\n' + chalk.cyan('🤖 AI:') + '\n');
    console.log(reply + '\n');

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('\n❌ Error: ' + error.message));
  }
}
