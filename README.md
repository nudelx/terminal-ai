# Terminal AI Agent (TAI)

A modular, maintainable terminal-based AI assistant using OpenRouter API with text-to-speech capabilities.

## 🚀 Features

- **Multiple AI Models**: Support for various OpenRouter models including Grok, Gemma, Mistral, and DeepSeek
- **Configurable Text-to-Speech**: Automatic audio playback of AI responses with toggle option
- **Conversation History**: Persistent conversation history with auto-save
- **Model Switching**: Easy model switching during conversation
- **Modular Architecture**: Clean, maintainable code structure using functional programming
- **Error Handling**: Comprehensive error handling and validation
- **Configuration Management**: Persistent user preferences with functional approach

## 📁 Project Structure

```
src/
├── config/
│   ├── constants.js    # Application constants and messages
│   └── models.js       # AI model configurations
├── services/
│   ├── aiService.js    # AI API communication
│   ├── audioService.js # Text-to-speech functionality
│   ├── fileService.js  # File operations and data management
│   ├── uiService.js    # User interface and display logic
│   └── appService.js   # Main application orchestration
└── index.js           # Application entry point
```

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd tai
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

4. Run the application:

You can now run the application using the `tai` executable in the `bin` directory.

## 🎯 Usage

### Interactive Mode

To start the application in interactive mode, run:

```bash
./bin/tai
```

### One-shot Mode

To get a single response for a prompt, run:

```bash
./bin/tai "your question here"
```

## 🔧 Configuration

### Environment Variables

- `OPENROUTER_API_KEY`: Your OpenRouter API key (required)

### Model Selection

The application supports multiple AI models:

- **Grok 4 Fast** (default): Fast and efficient
- **Gemma 3N**: Google's lightweight model
- **Mistral 7B**: Mistral AI's 7B parameter model
- **DeepSeek R1**: DeepSeek's reasoning model

### Commands

- `exit`: Quit the application
- `model`: Switch to a different AI model
- `speak`: Toggle text-to-speech on/off

## 🏗️ Architecture

### Service Modules

#### AI Service (`aiService.js`)

- Handles OpenRouter API communication
- Manages model selection and configuration
- Provides error handling for API failures

#### Audio Service (`audioService.js`)

- Converts AI responses to speech
- Handles audio file cleanup
- Manages text preprocessing for TTS

#### File Service (`fileService.js`)

- Manages configuration persistence
- Handles conversation history
- Provides safe file operations

#### UI Service (`uiService.js`)

- Handles user input and validation
- Manages display logic
- Provides interactive prompts

#### App Service (`appService.js`)

- Main application orchestration
- Manages application lifecycle
- Coordinates between services

### Key Improvements

1. **Modular Design**: Separated concerns into focused modules
2. **Error Handling**: Comprehensive error handling throughout
3. **Input Validation**: Proper validation of user inputs
4. **Resource Management**: Proper cleanup of temporary files
5. **Documentation**: Extensive JSDoc comments
6. **Type Safety**: Better parameter validation
7. **Maintainability**: Clean, readable code structure

## 🚨 Error Handling

The application includes robust error handling for:

- **API Failures**: Network issues, rate limits, authentication
- **File Operations**: Missing files, permission issues
- **Audio Processing**: TTS failures, playback issues
- **User Input**: Invalid commands, empty inputs
- **Process Management**: Graceful shutdown handling

## 🔄 Data Persistence

- **Configuration**: Stored in `config.json`
- **History**: Stored in `history.json`
- **Auto-save**: History automatically saved every 5 seconds

## 🎯 Demonstration

### Basic Conversation

```
You: Hello, how are you?
AI: Hello! I'm doing well, thank you for asking. How can I help you today?
```

### Model Switching

```
You: model
# Interactive model selection appears
You: exit
Goodbye! 👋
```

## 🧪 Development

### Running in Development Mode

```bash
npm run dev
```

### Code Structure Guidelines

1. **Single Responsibility**: Each module has one clear purpose
2. **Error First**: Always handle errors appropriately
3. **Documentation**: JSDoc comments for all public functions
4. **Validation**: Validate all inputs and parameters
5. **Cleanup**: Always clean up resources

## 📝 License

ISC License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**: Ensure `OPENROUTER_API_KEY` is set in `.env`
2. **Audio Issues**: Check audio system permissions
3. **Model Selection**: Verify model availability on OpenRouter
4. **File Permissions**: Ensure write permissions for config/history files

### Debug Mode

Set `DEBUG=true` in your environment for verbose logging.
