# AI Chat Plugin

The AI Chat plugin adds an interactive AI assistant to your Zudoku documentation site. Users can ask
questions about your documentation using a floating button or keyboard shortcut.

## Features

- 🤖 **AI-Powered Chat**: Floating chat button visible on all pages
- ⌨️ **Keyboard Shortcut**: Quick access with `Cmd+I` (Mac) or `Ctrl+I` (Windows/Linux)
- 🎨 **Beautiful UI**: Slide-in drawer with modern design
- 💬 **Chat Interface**: Message history, typing indicators, and smooth animations
- 🔌 **Extensible**: Easy to integrate with your own AI backend

## Installation

The AI Chat plugin is built into Zudoku. Simply import and configure it in your `zudoku.config.tsx`:

```tsx
import { aiChatPlugin } from "zudoku/plugins/ai-chat";
import type { ZudokuConfig } from "zudoku";

const config: ZudokuConfig = {
  plugins: [
    aiChatPlugin({
      welcomeMessage: "Hi! I'm your AI assistant. Ask me anything about the documentation.",
      onSendMessage: async (message) => {
        // Your custom AI integration here
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        const data = await response.json();
        return data.response;
      },
    }),
  ],
};

export default config;
```

## Configuration Options

### `welcomeMessage` (optional)

Customize the initial greeting message shown when the chat opens.

```tsx
aiChatPlugin({
  welcomeMessage: "👋 Welcome! How can I help you today?",
});
```

### `onSendMessage` (optional)

Provide a custom function to handle AI message processing. This function receives the user's message
and should return the AI's response.

```tsx
aiChatPlugin({
  onSendMessage: async (message: string) => {
    // Example: OpenAI integration
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful documentation assistant." },
          { role: "user", content: message },
        ],
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  },
});
```

## User Experience

### Floating Button

A floating button appears in the bottom-right corner of every page with:

- Sparkle icon indicating AI functionality
- Text "Ask a question"
- Keyboard shortcut hint (`Cmd+I` or `Ctrl+I`)

### Chat Drawer

When activated, a drawer slides in from the right side with:

- **Header**: Shows the assistant name and close button
- **Disclaimer**: Informs users that responses may contain mistakes
- **Messages**: Chat history with user and assistant messages
- **Input**: Text area for typing questions
  - Press `Enter` to send
  - Press `Shift+Enter` for new line
- **Loading State**: Animated dots while waiting for response

## Keyboard Shortcuts

- `Cmd+I` (Mac) or `Ctrl+I` (Windows/Linux): Open the chat drawer
- `Escape`: Close the chat drawer (when focused)
- `Enter`: Send message
- `Shift+Enter`: New line in message

## Styling

The AI Chat component uses Zudoku's design system and automatically adapts to your theme. All
colors, spacing, and typography follow your site's configuration.

## Examples

### Basic Setup

```tsx
import { aiChatPlugin } from "zudoku/plugins/ai-chat";

const config: ZudokuConfig = {
  plugins: [aiChatPlugin()],
};
```

### With Custom Backend

```tsx
import { aiChatPlugin } from "zudoku/plugins/ai-chat";

const config: ZudokuConfig = {
  plugins: [
    aiChatPlugin({
      onSendMessage: async (message) => {
        const response = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ question: message }),
        });
        return response.json().then((data) => data.answer);
      },
    }),
  ],
};
```

### With OpenAI

```tsx
import { aiChatPlugin } from "zudoku/plugins/ai-chat";

const config: ZudokuConfig = {
  plugins: [
    aiChatPlugin({
      welcomeMessage: "Hello! I'm powered by GPT-4. How can I assist you?",
      onSendMessage: async (message) => {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant for our documentation. Provide clear, concise answers based on the context.",
              },
              { role: "user", content: message },
            ],
            max_tokens: 500,
          }),
        });

        const data = await response.json();
        return data.choices[0].message.content;
      },
    }),
  ],
};
```

## Best Practices

1. **Set Context**: Provide your AI with context about your documentation in the system message
2. **Rate Limiting**: Implement rate limiting on your backend to prevent abuse
3. **Error Handling**: Add error handling in your `onSendMessage` function
4. **Clear Instructions**: Use the welcome message to set user expectations
5. **Privacy**: Be transparent about data usage and privacy in your disclaimer

## Troubleshooting

### Chat button not appearing

Make sure you've added the plugin to your config:

```tsx
plugins: [aiChatPlugin()];
```

### Keyboard shortcut not working

Check if another application or browser extension is using `Cmd+I` or `Ctrl+I`.

### Messages not sending

Verify your `onSendMessage` function:

- Returns a Promise
- Returns a string
- Handles errors appropriately

## Contributing

This feature is open source! If you'd like to improve the AI Chat plugin, contributions are welcome
at [github.com/zuplo/zudoku](https://github.com/zuplo/zudoku).
