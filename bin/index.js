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
