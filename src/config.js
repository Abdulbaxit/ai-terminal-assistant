import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.ask-ai-config.json');
const HISTORY_FILE = path.join(os.homedir(), '.ask-ai-history.json');

const DEFAULT_CONFIG = {
  model: 'gpt-3.5-turbo'
};

export function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(newConfig) {
  const currentConfig = loadConfig();
  const mergedConfig = { ...currentConfig, ...newConfig };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(mergedConfig, null, 2), 'utf-8');
}

export function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function saveHistory(entry) {
  const history = loadHistory();
  history.push({
    timestamp: new Date().toISOString(),
    ...entry
  });
  // Keep only the last 50 entries to prevent the file from growing indefinitely
  if (history.length > 50) history.shift();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

export function clearHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
  }
}
