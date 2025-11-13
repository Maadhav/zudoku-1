import { SendIcon, SparklesIcon, XIcon } from "lucide-react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { isAIChatPlugin } from "../core/plugins.js";
import { Button } from "../ui/Button.js";
import { ScrollArea } from "../ui/ScrollArea.js";
import { cn } from "../util/cn.js";
import { detectOS } from "../util/detectOS.js";
import { ClientOnly } from "./ClientOnly.js";
import { useZudoku } from "./context/ZudokuContext.js";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const FloatingButton = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => {
  const os = detectOS();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-2",
        "px-4 py-3 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-200",
        "hover:scale-105",
        "border border-primary/20",
        className,
      )}
      aria-label="Open AI Chat"
    >
      <SparklesIcon size={18} className="animate-pulse" />
      <span className="text-sm font-medium">Ask a question</span>
      <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary-foreground/20">
        {os === "macOS" ? "⌘" : "Ctrl"}+I
      </kbd>
    </button>
  );
};

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "bg-muted/50" : "bg-background",
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? (
          <span className="text-sm font-semibold">U</span>
        ) : (
          <SparklesIcon size={16} />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-xs text-muted-foreground font-medium">
          {isUser ? "You" : "Assistant"}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
};

const ChatDrawer = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI assistant. Ask me anything about the documentation.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when drawer opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response for now
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "This is a placeholder response. The actual AI integration would go here. Your question was: " +
          userMessage.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Close chat"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-[500px] z-50",
          "bg-background border-l shadow-2xl",
          "flex flex-col",
          "animate-in slide-in-from-right duration-300",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <SparklesIcon size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">Assistant</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="text-xs text-muted-foreground px-4 py-2 bg-muted/20 border-b">
          Responses are generated using AI and may contain mistakes.
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 rounded-lg bg-background">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <SparklesIcon size={16} className="animate-pulse" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">
                    Assistant
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-muted/10">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className={cn(
                  "w-full px-3 py-2 pr-10",
                  "rounded-lg border bg-background",
                  "text-sm resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "max-h-32 min-h-[40px]",
                )}
                rows={1}
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {!inputValue && "⏎"}
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="flex-shrink-0"
            >
              <SendIcon size={16} />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift + Enter for new line
          </div>
        </div>
      </div>
    </>
  );
};

export const AIChat = ({ className }: { className?: string }) => {
  const ctx = useZudoku();
  const [isOpen, setIsOpen] = useState(false);

  const onClose = useCallback(() => setIsOpen(false), []);
  const onOpen = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "i" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const aiChatPlugin = ctx.plugins.find(isAIChatPlugin);

  if (!aiChatPlugin) {
    return null;
  }

  return (
    <>
      <ClientOnly>
        <FloatingButton onClick={onOpen} className={className} />
      </ClientOnly>
      <Suspense fallback={null}>
        {aiChatPlugin.renderAIChat?.({
          isOpen,
          onClose,
        }) ?? <ChatDrawer isOpen={isOpen} onClose={onClose} />}
      </Suspense>
    </>
  );
};
