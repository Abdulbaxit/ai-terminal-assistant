import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';

export async function askAI(prompt, apiKey, model = 'gpt-3.5-turbo') {
  const spinner = ora('Thinking...').start();

  try {
    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: model,
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
      stream: true,
    });

    spinner.stop();
    console.log('\n' + chalk.cyan('🤖 AI:') + '\n');

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        process.stdout.write(content);
        fullResponse += content;
      }
    }
    console.log('\n');

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('\n❌ Error: ' + error.message));
  }
}
