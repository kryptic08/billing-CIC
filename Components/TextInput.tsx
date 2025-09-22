"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Maximize2,
  Minimize2,
  Send,
  RotateCcw,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "../styles/chat.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface TextInputProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextInput: React.FC<TextInputProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus and scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isOpen) {
        // F11 or F for fullscreen toggle
        if (e.key === "F11" || (e.key === "f" && e.ctrlKey)) {
          e.preventDefault();
          toggleFullscreen();
        }
        // Escape to close (only if not fullscreen)
        if (e.key === "Escape") {
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, isFullscreen, onClose]);

  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async (submitMessage?: string) => {
    const msg = submitMessage ?? message.trim();
    if (!msg || isLoading) return;

    // Enter chat mode on first message
    if (!isChatMode) {
      setIsChatMode(true);
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      console.log("Sending request to AI API...");
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          chatHistory: chatHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      console.log("AI API Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("AI API Error:", errorData);
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${
            errorData?.details || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("AI API Response received:", data.success);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          data.response ||
          "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling AI API:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          error instanceof Error
            ? `Error: ${error.message}. Please check the console for more details.`
            : "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    // Return to pre-chat mode so suggestions render again
    setIsChatMode(false);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exitChatMode = () => {
    setIsChatMode(false);
    setIsFullscreen(false);
    setChatHistory([]);
    onClose();
  };

  // Select 3 pre-made prompts
  const suggestionQuestions = [
    "How many patients do we have?",
    "What is our total revenue?",
    "Analyze insurance claim patterns",
  ];

  const handleSuggestionClick = (question: string) => {
    handleSubmit(question);
  };

  // Custom markdown components for better styling
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-semibold mb-2 text-white">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-md font-medium mb-1 text-white">{children}</h3>
    ),
    p: ({ children }: any) => (
      <p className="mb-2 text-gray-300 leading-relaxed">{children}</p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-300">{children}</em>
    ),
    code: ({ children, className }: any) => {
      const isInline = !className;
      return isInline ? (
        <code className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-blue-300">
          {children}
        </code>
      ) : (
        <code className={className}>{children}</code>
      );
    },
    pre: ({ children }: any) => (
      <pre className="bg-gray-800 p-3 rounded-lg overflow-x-auto mb-2">
        {children}
      </pre>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-2 text-gray-300">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-2 text-gray-300">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li className="mb-1">{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 mb-2">
        {children}
      </blockquote>
    ),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed z-[9999] inset-0 bg-black/50 flex items-center justify-center`}
          // Only close on overlay click in pre-chat mode for safety
          onClick={!isChatMode ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`bg-gray-950 shadow-2xl flex flex-col overflow-hidden
              ${
                isFullscreen
                  ? "w-full h-full rounded-none max-w-none"
                  : "max-w-4xl w-full max-h-[74vh] h-auto rounded-2xl"
              }
              ${!isFullscreen && !isChatMode ? "border border-white/10" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Render different layouts based on mode */}
            {!isChatMode ? (
              // Simplified initial mode: wide, tall input rectangle
              <>
                {/* Minimal Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 bg-black border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                    <h2 className="text-lg font-bold text-white">
                      did-AI Co-Pilot
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Main Input Area - Taller textarea */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-black">
                  {/* 3 Suggestion Buttons */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-400">
                      Quick Prompts:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {suggestionQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(question)}
                          className="text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 group ring-1 ring-white/10 hover:ring-blue-500"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <Send size={12} className="text-blue-300" />
                            </div>
                            <span className="text-gray-300 group-hover:text-white font-medium">
                              {question}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Taller Textarea Input with Send Inside */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-3">
                      Ask your question:
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your healthcare analytics question here... (Shift+Enter for new line)"
                      className="w-full resize-none rounded-xl px-6 py-4 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-base leading-relaxed min-h-[200px] pr-20 ring-1 ring-white/10 break-words"
                      rows={8} // Taller by default
                    />
                    <button
                      onClick={() => handleSubmit()}
                      disabled={!message.trim() || isLoading}
                      className="absolute bottom-6 right-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-full transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none z-10"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Chat mode with improved UX
              <>
                {/* Enhanced Chat Header */}
                <div className="flex items-center justify-between p-4 bg-black border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                    <h2 className="text-lg font-bold text-white">
                      did-AI Co-Pilot
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {chatHistory.length > 0 && (
                      <button
                        onClick={clearChat}
                        className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all duration-200"
                        title="Clear chat"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all duration-200"
                      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize2 size={16} />
                      ) : (
                        <Maximize2 size={16} />
                      )}
                    </button>
                    <button
                      onClick={exitChatMode}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all duration-200"
                      title="Close chat"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Chat History with smooth scrolling */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-12 bg-black chat-container min-h-0"
                >
                  <div
                    className={isFullscreen ? "max-w-4xl mx-auto w-full" : ""}
                  >
                    {chatHistory.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 120,
                        }}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] p-3 rounded-xl shadow-md ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-800 text-white"
                          }`}
                        >
                          <div className="message-content">
                            {msg.role === "assistant" ? (
                              <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeHighlight]}
                                  components={markdownComponents}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </div>
                            )}
                          </div>
                          <div
                            className={`text-xs mt-2 opacity-70 ${
                              msg.role === "user"
                                ? "text-blue-200"
                                : "text-gray-400"
                            }`}
                          >
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-800 rounded-2xl shadow-md p-4">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            <span className="text-xs text-gray-400">
                              Analyzing...
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-700 p-4 bg-black">
                  <div
                    className={`relative ${
                      isFullscreen ? "max-w-4xl mx-auto w-full" : ""
                    }`}
                  >
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Continue the conversation... (Shift+Enter for new line)"
                      className="w-full resize-none rounded-lg px-4 py-3 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 min-h-[60px] pr-12 ring-1 ring-white/10 break-words"
                      rows={2}
                    />
                    <button
                      onClick={() => handleSubmit()}
                      disabled={!message.trim() || isLoading}
                      className="absolute bottom-4 right-4 text-white hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 z-10"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextInput;
