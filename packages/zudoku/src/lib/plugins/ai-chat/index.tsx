import type { ZudokuPlugin } from "../../core/plugins.js";

export type AIChatConfig = {
  /**
   * Optional custom function to handle sending messages to the AI
   * If not provided, a default placeholder will be used
   */
  onSendMessage?: (message: string) => Promise<string>;

  /**
   * Optional custom welcome message
   */
  welcomeMessage?: string;
};

/**
 * AI Chat Plugin for Zudoku
 *
 * This plugin adds an AI chat assistant to your documentation site.
 * Users can click the floating button or press Cmd+I (Ctrl+I on Windows/Linux)
 * to open the chat sidebar and ask questions about the documentation.
 *
 * @example
 * ```tsx
 * import { aiChatPlugin } from "zudoku/plugins/ai-chat";
 *
 * const config: ZudokuConfig = {
 *   plugins: [
 *     aiChatPlugin({
 *       onSendMessage: async (message) => {
 *         // Your custom AI integration here
 *         const response = await fetch('/api/ai', {
 *           method: 'POST',
 *           body: JSON.stringify({ message })
 *         });
 *         return response.json();
 *       }
 *     })
 *   ]
 * };
 * ```
 */
export const aiChatPlugin = (_config?: AIChatConfig): ZudokuPlugin => {
  return {
    renderAIChat: () => {
      // The actual chat UI is rendered by the AIChat component
      // This plugin just enables the feature
      return null;
    },
  };
};
