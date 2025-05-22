# 🤖 Terminal AI Agent

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
![Node LTS](https://img.shields.io/node/v-lts/:iron)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A powerful terminal-based AI agent that leverages OpenRouter's API to interact with various AI models. This tool provides a simple yet effective way to chat with AI models directly from your terminal.

## ✨ Features

- 🎯 Interactive chat interface with colorful output
- 🔄 Support for multiple AI models through OpenRouter
- 🎨 Beautiful terminal UI with emoji support
- ⚡ Fast and responsive
- 🔒 Secure API key management
- 🛠️ Easy to set up and use

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenRouter API key

## 🚀 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/tai.git
   cd tai
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

4. Add your OpenRouter API key to the `.env` file:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```
   You can get an API key by signing up at [OpenRouter](https://openrouter.ai/)

## 💻 Usage

Start the application:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### Commands

- Type your messages and press Enter to chat with the AI
- Type `exit` to quit the application

## 🛠️ Development

### Project Structure

```
tai/
├── src/
│   └── index.js      # Main application file
├── .env              # Environment variables (not in repo)
├── .env.example      # Example environment variables
├── .gitignore        # Git ignore file
├── package.json      # Project dependencies and scripts
└── README.md         # This file
```

### Available Scripts

- `npm start` - Start the application
- `npm run dev` - Start the application with auto-reload
- `npm test` - Run tests (coming soon)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing the AI API
- All the amazing open-source packages that made this possible

## 📫 Contact

Your Name - [@_nudelx_](https://x.com/_nudelx_)

Project Link: [https://github.com/nudelx/terminal-ai](https://github.com/nudelx/terminal-ai)
