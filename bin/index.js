#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadConfig, saveConfig, loadHistory, saveHistory, clearHistory } from '../src/config.js';
import { askAI, extractCodeBlock } from '../src/ai.js';

const program = new Command();

async function handleAIResponse(response) {
  const code = extractCodeBlock(response);
  if (!code) return;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  console.log(chalk.gray(`\n💡 Detected command: ${chalk.white(code)}`));
  
  const answer = await question(chalk.green('👉 Copy to clipboard? (y/n) ') + chalk.gray('[y]: '));
  if (answer.toLowerCase() === 'y' || answer === '') {
    // Cross-platform copy (mostly Mac focused here with pbcopy)
    const copyCmd = process.platform === 'darwin' ? 'pbcopy' : 'clip'; // 'clip' for windows
    const proc = exec(copyCmd);
    proc.stdin.write(code);
    proc.stdin.end();
    console.log(chalk.green('✅ Copied to clipboard!'));
  }

  const runChoice = await question(chalk.red('🚀 Run this command? (y/n) ') + chalk.gray('[n]: '));
  if (runChoice.toLowerCase() === 'y') {
    console.log(chalk.yellow(`\nExecuting: ${code}\n`));
    exec(code, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        return;
      }
      if (stderr) console.error(chalk.red(stderr));
      if (stdout) console.log(stdout);
    });
  }

  rl.close();
}

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
        saveHistory({ type: 'chat', prompt: input, response: response.trim() });
      }
      
      rl.prompt();
    }).on('close', () => {
      console.log(chalk.cyan('\n--- Session Ended ---\n'));
      process.exit(0);
    });
  });

program
  .command('history')
  .description('View or manage your past AI interactions')
  .option('-c, --clear', 'Clear the history')
  .action((options) => {
    if (options.clear) {
      clearHistory();
      console.log(chalk.green('✅ History cleared!'));
      return;
    }

    const history = loadHistory();
    if (history.length === 0) {
      console.log(chalk.yellow('No history found.'));
      return;
    }

    console.log(chalk.blue('\n--- History ---'));
    history.forEach((entry, i) => {
      const typeLabel = entry.type === 'chat' ? chalk.magenta('[Chat]') : chalk.cyan('[Command]');
      const date = new Date(entry.timestamp).toLocaleString();
      console.log(`${chalk.gray(i + 1 + '.')} ${typeLabel} ${chalk.white(entry.prompt)} ${chalk.gray(`(${date})`)}`);
      
      // Optionally print a short snippet of the answer
      const snippet = entry.response.split('\n')[0].substring(0, 60) + '...';
      console.log(`   ${chalk.green('↳')} ${chalk.gray(snippet)}`);
    });
    console.log(chalk.blue('---------------\n'));
  });

program
  .command('commit')
  .description('Generate an AI-powered commit message for your staged changes')
  .action(async () => {
    const config = loadConfig();
    if (!config.apiKey) {
      console.error(chalk.red('❌ OpenAI API Key is missing.'));
      console.log(chalk.yellow('Please set it using: ask config --key <YOUR_KEY>'));
      process.exit(1);
    }

    // Check if git is available and if we're in a repo
    exec('git rev-parse --is-inside-work-tree', async (err, stdout) => {
      if (err || stdout.trim() !== 'true') {
        console.error(chalk.red('❌ Not a git repository or git is not installed.'));
        return;
      }

      // Get staged changes
      exec('git diff --cached', async (err, diff) => {
        if (err) {
          console.error(chalk.red('❌ Failed to get git diff.'));
          return;
        }

        if (!diff) {
          console.log(chalk.yellow('⚠️ No staged changes found. Use "git add" to stage changes first.'));
          return;
        }

        const prompt = `Generate a concise, high-quality commit message following the Conventional Commits specification based on the following diff:\n\n${diff}\n\nReturn ONLY the commit message itself, no other text or markdown formatting.`;
        
        const response = await askAI(prompt, config.apiKey, config.model);
        if (response) {
          const message = response.trim().replace(/^["']|["']$/g, '');
          
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });

          const question = (query) => new Promise((resolve) => rl.question(query, resolve));

          console.log(chalk.blue('\n--- Suggested Commit Message ---'));
          console.log(chalk.white(message));
          console.log(chalk.blue('--------------------------------\n'));

          const answer = await question(chalk.green('🚀 Use this message and commit? (y/n) ') + chalk.gray('[y]: '));
          
          if (answer.toLowerCase() === 'y' || answer === '') {
            exec(`git commit -m "${message.replace(/"/g, '\\"')}"`, (err, stdout, stderr) => {
              if (err) {
                console.error(chalk.red(`❌ Failed to commit: ${err.message}`));
                return;
              }
              console.log(chalk.green('✅ Changes committed successfully!'));
              if (stdout) console.log(stdout);
            });
          }
          
          rl.close();
        }
      });
    });
  });

program
  .argument('[prompt...]', 'The question you want to ask the AI')
  .option('-f, --file <path>', 'Include a file as context for the AI')
  .action(async (promptArr, options) => {
    if (!promptArr || promptArr.length === 0) {
      program.help();
      return;
    }
    
    let prompt = promptArr.join(' ');
    
    // Feature: File Context
    if (options.file) {
      const filePath = path.resolve(process.cwd(), options.file);
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          console.log(chalk.gray(`📎 Attached context from: ${options.file}`));
          prompt += `\n\n--- Context from ${options.file} ---\n${fileContent}\n--- End Context ---\n`;
        } catch (e) {
          console.error(chalk.red(`❌ Failed to read file ${options.file}: ${e.message}`));
          process.exit(1);
        }
      } else {
        console.error(chalk.red(`❌ File not found: ${options.file}`));
        process.exit(1);
      }
    }

    const config = loadConfig();
    
    if (!config.apiKey) {
      console.error(chalk.red('❌ OpenAI API Key is missing.'));
      console.log(chalk.yellow('Please set it using: ask config --key <YOUR_KEY>'));
      process.exit(1);
    }

    const resp = await askAI(prompt, config.apiKey, config.model);
    if (resp) {
      saveHistory({ type: 'command', prompt: promptArr.join(' '), response: resp.trim() });
      await handleAIResponse(resp);
    }
  });

program.parse(process.argv);
