# 🤖 AI Terminal Assistant

![Node.js](https://img.shields.io/badge/Node.js-3C873A?style=for-the-badge&logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-000000?style=for-the-badge&logo=openai)
![Commander.js](https://img.shields.io/badge/Commander.js-E34F26?style=for-the-badge)

A lightning-fast, highly concise AI tool that lives directly inside your terminal. Stop switching to your browser to search for commands—just ask your terminal.

Built to return clear, developer-focused terminal commands and explanations using OpenAI's latest models.

---

## ✨ Features

- **Streaming Responses:** Get real-time answers directly in your terminal, no more waiting for the full response.
- **Model Selection:** Switch between different OpenAI models like `gpt-4-turbo` or `gpt-3.5-turbo`.
- **Global Command:** Ask questions from absolutely any directory.
- **Developer-Focused Prompting:** The AI acts as a senior engineer, skipping the conversational bloat and just giving you the exact command or answer you need.
- **Secure Configuration:** Safely stores your API key locally in the `~/.ask-ai-config.json` hidden file.
- **Beautiful UI:** Uses `chalk` and `ora` for terminal coloring and loading states.

## 🚀 Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Abdulbaxit/ai-terminal-assistant.git
   cd ai-terminal-assistant
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure your OpenAI API Key & Model:**

   ```bash
   # Set API Key
   ask config --key sk-YOUR_KEY_HERE

   # Set Preferred Model (Optional, defaults to gpt-3.5-turbo)
   ask config --model gpt-4-turbo

   # View current config
   ask config
   ```

4. **Create a global alias:**
   To use the `ask` command globally, add it to your terminal profile (`~/.bashrc` or `~/.zshrc`):
   ```bash
   alias ask="node /path/to/ai-terminal-assistant/bin/index.js"
   ```
   _Run `source ~/.zshrc` after saving!_

## 💡 Usage

Whenever you are stuck or need a terminal command, just type `ask` followed by your question:

```bash
ask "How do I cleanly undo my last git commit without losing my files?"
```

For a continuous session or debugging complex tasks, use **Interactive Mode**:

```bash
ask chat
```

```bash
ask "Find all processes running on port 3000 and kill them"
```

## 🛠️ Built With

- **Node.js**
- **OpenAI API**
- **Commander.js** (CLI Router)
- **Chalk & Ora** (Terminal styling)

---

Built by [Abdul Basit](https://github.com/Abdulbaxit)
