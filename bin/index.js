#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { loadConfig, saveConfig } from '../src/config.js';
import { askAI } from '../src/ai.js';

const program = new Command();

program
  .name('ask')
  .description('AI Terminal Assistant CLI')
  .version('1.0.0');

program
  .command('config')
  .description('Configure the AI CLI (e.g. set API key, model)')
  .option('-k, --key <key>', 'Set your OpenAI API Key')
  .option('-m, --model <model>', 'Set your preferred OpenAI model (e.g. gpt-4, gpt-3.5-turbo)')
  .action((options) => {
    if (options.key) {
      saveConfig({ apiKey: options.key });
      console.log(chalk.green('✅ API Key saved successfully!'));
    }
    
    if (options.model) {
      saveConfig({ model: options.model });
      console.log(chalk.green(`✅ Default model set to: ${options.model}`));
    }

    if (!options.key && !options.model) {
      const config = loadConfig();
      console.log(chalk.blue('\n--- Current Configuration ---'));
      console.log(chalk.white(`API Key: ${config.apiKey ? '********' + config.apiKey.slice(-4) : 'Not Set'}`));
      console.log(chalk.white(`Model:   ${config.model}`));
      console.log(chalk.blue('-----------------------------\n'));
    }
  });

program
  .command('chat')
  .description('Start an interactive chat session with the AI')
  .action(async () => {
    const config = loadConfig();
    if (!config.apiKey) {
      console.error(chalk.red('❌ OpenAI API Key is missing.'));
      console.log(chalk.yellow('Please set it using: ask config --key <YOUR_KEY>'));
      process.exit(1);
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.yellow('You: ')
    });

    console.log(chalk.cyan('\n--- Interactive Session Started (Type "exit" or "quit" to stop) ---'));
    
    const messages = [
      {
        role: 'system',
        content: 'You are a highly capable terminal developer assistant. Provide concise, accurate terminal commands and briefly explain them if necessary. Format terminal commands cleanly.'
      }
    ];

    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        rl.close();
        return;
      }

      if (!input) {
        rl.prompt();
        return;
      }

      messages.push({ role: 'user', content: input });
      
      const response = await askAI(messages, config.apiKey, config.model);
      if (response) {
        messages.push({ role: 'assistant', content: response });
      }
      
      rl.prompt();
    }).on('close', () => {
      console.log(chalk.cyan('\n--- Session Ended ---\n'));
      process.exit(0);
    });
  });

program
  .argument('[prompt...]', 'The question you want to ask the AI')
  .action(async (promptArr) => {
    if (!promptArr || promptArr.length === 0) {
      program.help();
      return;
    }
    
    const prompt = promptArr.join(' ');
    const config = loadConfig();
    
    if (!config.apiKey) {
      console.error(chalk.red('❌ OpenAI API Key is missing.'));
      console.log(chalk.yellow('Please set it using: ask config --key <YOUR_KEY>'));
      process.exit(1);
    }

    await askAI(prompt, config.apiKey, config.model);
  });

program.parse(process.argv);
