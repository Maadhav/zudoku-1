import { ArrowUpIcon, SendIcon, SparklesIcon, XIcon } from "lucide-react";
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

const FloatingInputBar = ({
  inputValue,
  onInputChange,
  onSend,
  isVisible,
  className,
}: {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isVisible: boolean;
  className?: string;
}) => {
  const os = detectOS();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0",
        "flex flex-col items-center w-full",
        "overflow-hidden pointer-events-none",
        "transition-all duration-300 ease-in-out",
        isVisible
          ? "pb-4 sm:pb-6 pt-1 translate-y-0"
          : "pb-0 pt-0 translate-y-full",
        className,
      )}
      style={{ zIndex: 30 }}
    >
      <div
        className={cn(
          "z-10 w-full sm:w-80 pointer-events-auto",
          "focus-within:w-full sm:focus-within:w-[26rem]",
          "sm:px-4",
          // Subtle hover scale with smooth transition
          "transition-all duration-300 ease-in-out",
          "sm:hover:scale-[1.01] focus-within:hover:scale-100",
        )}
      >
        <div
          className={cn(
            "pl-5 pr-3",
            "rounded-lg border border-input bg-background shadow-sm",
            "flex items-center justify-between",
            "focus-within:ring-1 focus-within:ring-ring",
            "transition-all duration-200",
          )}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask a question..."
            aria-label="Ask a question..."
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "py-3 flex-1 bg-transparent",
              "text-sm placeholder:text-muted-foreground",
              "outline-none",
            )}
          />
          <span className="text-[11px] font-medium select-none text-muted-foreground px-2 opacity-100">
            {os === "macOS" ? "⌘" : "Ctrl"}I
          </span>
          <button
            type="button"
            onClick={onSend}
            disabled={!inputValue.trim()}
            className={cn(
              "flex justify-center items-center p-1 size-7",
              "rounded-full transition-colors",
              inputValue.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-primary/30 text-primary-foreground/50 cursor-not-allowed",
            )}
            aria-label="Send message"
          >
            <ArrowUpIcon size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-md",
        isUser ? "bg-muted/50" : "bg-transparent",
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {isUser ? (
          <span className="font-semibold">U</span>
        ) : (
          <SparklesIcon size={14} />
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
  initialMessage,
  onMessageSent,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  onMessageSent?: () => void;
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: handleSendMessage is stable
  useEffect(() => {
    // If there's an initial message when opening, send it
    if (isOpen && initialMessage && initialMessage.trim()) {
      handleSendMessage(initialMessage);
    }
  }, [isOpen, initialMessage]);

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    onMessageSent?.();

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

  return (
    <>
      {/* Embedded Drawer - overlays page content, sits below navbar, no backdrop */}
      <div
        className={cn(
          "fixed top-[var(--header-height,64px)] right-0 bottom-0",
          "w-full sm:w-[420px] md:w-[480px]",
          "bg-popover text-popover-foreground border-l border-border shadow-lg",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "pointer-events-auto",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{ zIndex: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <SparklesIcon size={18} className="text-primary" />
            <h2 className="text-base font-semibold">Assistant</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            aria-label="Close chat"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="text-xs text-muted-foreground px-4 py-2 bg-muted/50 border-b border-border">
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
        <div className="p-4 border-t border-border">
          <div className="flex gap-2 items-start">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className={cn(
                  "w-full px-3 py-2.5 pr-10",
                  "rounded-md border border-input bg-background",
                  "text-sm resize-none placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "h-10 max-h-32",
                )}
                rows={1}
                disabled={isLoading}
              />
              {!inputValue && (
                <div className="absolute bottom-2.5 right-2 text-xs text-muted-foreground pointer-events-none">
                  ⏎
                </div>
              )}
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              variant="default"
              size="icon"
              className="flex-shrink-0 h-10 w-10"
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
  const [floatingInputValue, setFloatingInputValue] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | undefined>();
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setPendingMessage(undefined);
  }, []);

  const handleFloatingInputSend = useCallback(() => {
    if (floatingInputValue.trim()) {
      setPendingMessage(floatingInputValue);
      setFloatingInputValue("");
      setIsOpen(true);
    }
  }, [floatingInputValue]);

  const handleMessageSent = useCallback(() => {
    setPendingMessage(undefined);
  }, []);

  // Handle Cmd+I / Ctrl+I keyboard shortcut
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "i" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        // Toggle the sidebar open/closed
        setIsOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Hide floating bar when footer is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsFooterVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.1 },
    );

    // Find footer element - adjust selector based on your footer structure
    const footer = document.querySelector("footer");
    if (footer) {
      observer.observe(footer);
    }

    return () => {
      if (footer) {
        observer.unobserve(footer);
      }
    };
  }, []);

  const aiChatPlugin = ctx.plugins.find(isAIChatPlugin);

  if (!aiChatPlugin) {
    return null;
  }

  return (
    <>
      <ClientOnly>
        <FloatingInputBar
          inputValue={floatingInputValue}
          onInputChange={setFloatingInputValue}
          onSend={handleFloatingInputSend}
          isVisible={!isOpen && !isFooterVisible}
          className={className}
        />
      </ClientOnly>
      <Suspense fallback={null}>
        {aiChatPlugin.renderAIChat?.({
          isOpen,
          onClose,
        }) ?? (
          <ChatDrawer
            isOpen={isOpen}
            onClose={onClose}
            initialMessage={pendingMessage}
            onMessageSent={handleMessageSent}
          />
        )}
      </Suspense>
    </>
  );
};
