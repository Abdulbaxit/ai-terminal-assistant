import fs from 'fs';
import path from 'path';
import os from 'os';

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
