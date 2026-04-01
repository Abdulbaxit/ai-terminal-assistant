# 🤖 AI Terminal Assistant

![Node.js](https://img.shields.io/badge/Node.js-3C873A?style=for-the-badge&logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-000000?style=for-the-badge&logo=openai)
![Commander.js](https://img.shields.io/badge/Commander.js-E34F26?style=for-the-badge)

A lightning-fast, highly concise AI tool that lives directly inside your terminal. Stop switching to your browser to search for commands—just ask your terminal!

Built to return clear, developer-focused terminal commands and explanations using the OpenAI `gpt-3.5-turbo` model.

---

## ✨ Features
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

3. **Configure your OpenAI API Key:**
   ```bash
   node ./bin/index.js config --key sk-YOUR_KEY_HERE
   ```

4. **Create a global alias:**
   To use the `ask` command globally, add it to your terminal profile (`~/.bashrc` or `~/.zshrc`):
   ```bash
   alias ask="node /path/to/ai-terminal-assistant/bin/index.js"
   ```
   *Run `source ~/.zshrc` after saving!*

## 💡 Usage

Whenever you are stuck or need a terminal command, just type `ask` followed by your question:

```bash
ask "How do I cleanly undo my last git commit without losing my files?"
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
*Built with ❤️ by [Abdul Basit](https://github.com/Abdulbaxit)*
