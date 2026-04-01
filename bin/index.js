#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../src/config.js';
import { askAI } from '../src/ai.js';

const program = new Command();

program
  .name('ask')
  .description('AI Terminal Assistant CLI')
  .version('1.0.0');

program
  .command('config')
  .description('Configure the AI CLI (e.g. set API key)')
  .option('-k, --key <key>', 'Set your OpenAI API Key')
  .action((options) => {
    if (options.key) {
      saveConfig({ apiKey: options.key });
      console.log(chalk.green('✅ API Key saved successfully!'));
    } else {
      const config = loadConfig();
      if (config.apiKey) {
        console.log(chalk.blue('API Key is currently set.'));
      } else {
        console.log(chalk.yellow('No API Key found. Use `ask config --key <YOUR_KEY>` to set it.'));
      }
    }
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

    await askAI(prompt, config.apiKey);
  });

program.parse(process.argv);
