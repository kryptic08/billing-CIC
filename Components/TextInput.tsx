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
  BotMessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  BarChart,
  LineChart,
  PieChart,
  ChartSpec,
  PieChartData,
  LineChartData,
  BarChartData,
  DynamicChartRenderer,
  ChartSpecification,
} from "./ui/charts";
import { BillingSummary } from "../lib/types";
import { TextShimmer } from "./TextShimmer";
import "../styles/chat.css";
import Image from "next/image";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  chart?: React.ReactNode;
}

interface TextInputProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextInput: React.FC<TextInputProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Understanding Query");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [showCreateSuggestions, setShowCreateSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Loading text phases for better UX
  const chatLoadingPhases = [
    "Understanding Query",
    "Asking Kirby",
    "Looking at the database",
    "Analyzing Data",
  ];

  const chartLoadingPhases = [
    "Understanding Query",
    "Asking Kirby",
    "Looking at the database",
    "Creating Chart",
  ];

  // Cycle through loading text phases
  useEffect(() => {
    if (!isLoading) return;

    // Determine which phases to use based on the current message
    const lastMessage = chatHistory[chatHistory.length - 1]?.content || "";
    const isChartRequest =
      lastMessage.toLowerCase().startsWith("create") ||
      lastMessage.toLowerCase().includes("chart") ||
      lastMessage.toLowerCase().includes("graph") ||
      lastMessage.toLowerCase().includes("visualize");

    const phases = isChartRequest ? chartLoadingPhases : chatLoadingPhases;

    let currentIndex = 0;
    setLoadingText(phases[0]); // Start with first phase

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setLoadingText(phases[currentIndex]);
    }, 1500); // Change text every 1.5 seconds

    return () => clearInterval(interval);
  }, [isLoading, chatHistory]);

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

  // Detect create command and show suggestions
  useEffect(() => {
    const hasCreateCommand =
      message.toLowerCase().startsWith("create") ||
      message.toLowerCase().includes("create chart") ||
      message.toLowerCase().includes("create graph");
    setShowCreateSuggestions(hasCreateCommand && message.trim().length > 5);
  }, [message]);

  // Chart type suggestions
  const chartSuggestions = [
    {
      type: "pie chart",
      label: "Pie Chart",
      icon: "🥧",
      description: "Distribution & Breakdown",
    },
    {
      type: "bar chart",
      label: "Bar Chart",
      icon: "📊",
      description: "Comparison & Rankings",
    },
    {
      type: "line chart",
      label: "Line Chart",
      icon: "📈",
      description: "Trends & Time Series",
    },
  ];

  // Handle chart suggestion click
  const handleChartSuggestion = (chartType: string) => {
    const createText = message.toLowerCase().includes("create")
      ? message
      : "create";
    const newMessage = `${createText} ${chartType} `;
    setMessage(newMessage);
    setShowCreateSuggestions(false);
    // Focus back to textarea for additional input
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Position cursor at the end
        textareaRef.current.setSelectionRange(
          newMessage.length,
          newMessage.length
        );
      }
    }, 100);
  };

  // Render message with highlighted "create" command
  const renderMessageWithHighlight = (text: string) => {
    // Only highlight if "create" is standalone or at start with space after
    const createPattern = /^create\s|^create$|\screate\s|\screate$/gi;
    const hasCreate = createPattern.test(text);

    if (!hasCreate) return text;

    const createRegex = /\b(create)\b/gi;
    const parts = text.split(createRegex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === "create") {
        return (
          <span
            key={index}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-md font-semibold shadow-sm"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const clearChat = () => {
    setChatHistory([]);
    // Return to pre-chat mode so suggestions render again
    setIsChatMode(false);
    setIsFullscreen(false);
  };

  const toggleFullscreen = React.useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

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
  }, [isOpen, isFullscreen, onClose, toggleFullscreen]);

  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Fetch real billing data for charts
  const fetchBillingData = async () => {
    try {
      console.log("Fetching real billing data for charts...");
      const response = await fetch("/api/billing/data");
      if (!response.ok) {
        throw new Error(`Failed to fetch billing data: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error("Invalid billing data response");
      }
      return result;
    } catch (error) {
      console.error("Error fetching billing data:", error);
      return null;
    }
  };

  // Generate chart using AI specifications
  const generateChartFromAISpec = async (
    chartSpec: ChartSpecification,
    billingResult: { data: Record<string, unknown>[]; summary: BillingSummary }
  ) => {
    try {
      const { data: billingData } = billingResult;
      console.log(
        `Creating AI-specified chart with ${billingData?.length || 0} records`
      );

      const handleChartClick = (data: any, index: number) => {
        console.log("AI chart element clicked:", data, "at index:", index);
      };

      // Use the new DynamicChartRenderer for all chart generation
      const chartComponent = (
        <DynamicChartRenderer
          specification={chartSpec}
          rawData={billingData}
          onChartClick={handleChartClick}
        />
      );

      return {
        component: chartComponent,
        insights: chartSpec.insights || `Chart showing ${chartSpec.title}`,
      };
    } catch (error) {
      console.error("Error generating AI-specified chart:", error);
      throw error;
    }
  };

  // Helper function to get color from scheme
  const getColorFromScheme = (scheme?: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "#3B82F6",
      green: "#10B981",
      red: "#EF4444",
      purple: "#8B5CF6",
      orange: "#F59E0B",
      professional: "#1E40AF",
      colorful: "#3B82F6",
      pastel: "#93C5FD",
    };
    return colorMap[scheme || "blue"] || "#3B82F6";
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

    // Detect if this is likely a chart request to set appropriate loading phases
    const isChartRequest =
      msg.toLowerCase().startsWith("create") ||
      msg.toLowerCase().includes("chart") ||
      msg.toLowerCase().includes("graph") ||
      msg.toLowerCase().includes("visualize");

    // Set initial loading text based on request type
    setLoadingText(
      isChartRequest ? "Understanding Query" : "Understanding Query"
    );
    setIsLoading(true);

    try {
      console.log("Sending message to unified AI API:", msg);

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: msg,
          chatHistory: chatHistory
            .filter((msg) => msg.content && msg.content.trim())
            .map((msg) => ({
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
      console.log("AI API Response received:", data);

      if (!data.success || !data.response) {
        throw new Error("Invalid response from AI API");
      }

      // Check if response contains chart specification
      if (data.type === "chart" && data.chartSpec) {
        console.log("Chart response detected, generating chart component");

        try {
          // Get billing data for chart rendering
          const billingResult = await fetchBillingData();
          if (!billingResult) {
            throw new Error("Failed to fetch billing data for chart");
          }

          // Generate chart component using the AI specification
          const chartResult = await generateChartFromAISpec(
            data.chartSpec,
            billingResult
          );

          const chartMessage: ChatMessage = {
            role: "assistant",
            content: data.response,
            chart: chartResult.component,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, chartMessage]);
        } catch (chartError) {
          console.error("Chart rendering failed:", chartError);
          // Fallback to text-only response
          const textMessage: ChatMessage = {
            role: "assistant",
            content: data.response + " (Chart visualization failed to load)",
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, textMessage]);
        }
      } else if (data.type === "error") {
        // Handle chart validation error responses
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: `❌ **Chart Error**: ${data.error}\n\n💡 **Suggestions**:\n${
            data.suggestions?.map((s: string) => `• ${s}`).join("\n") ||
            "Please try a different query."
          }\n\n**Available chart types:**\n• Revenue by procedure: "create pie chart of revenue by procedure"\n• Patient count by gender: "create bar chart of patients by gender"\n• Monthly trends: "create line chart of revenue over time"\n• Payment status breakdown: "create pie chart of payment status"`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorMessage]);
      } else {
        // Regular text response
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error with AI service:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "I'm having trouble connecting to the AI service right now. Please try again, or you can use these commands:\n\n• **Type 'create pie chart'** - for service distribution charts\n• **Type 'create line chart'** - for revenue trend charts\n• **Type 'create bar chart'** - for comparison charts\n\nOr ask questions about your billing data and I'll try to help!",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const exitChatMode = () => {
    setIsChatMode(false);
    setIsFullscreen(false);
    setChatHistory([]);
    onClose();
  };

  // Select 3 pre-made prompts that showcase both chat and chart capabilities
  const suggestionQuestions = [
    "Create a pie chart of revenue by procedure",
    "What's our total revenue and patient count?",
    "Create a line chart of monthly revenue trends",
  ];

  const handleSuggestionClick = (question: string) => {
    handleSubmit(question);
  };

  // Custom markdown components for better styling
  const markdownComponents: {
    [key: string]: React.FC<React.PropsWithChildren<unknown>>;
  } = {
    h1: ({ children }) => (
      <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold mb-2 text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-md font-medium mb-1 text-white">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mb-2 text-gray-300 leading-relaxed">{children}</p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
    code: ({ children, ...props }: any) => {
      const className = props.className;
      const isInline = !className;
      return isInline ? (
        <code className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-blue-300">
          {children}
        </code>
      ) : (
        <code className={className}>{children}</code>
      );
    },
    pre: ({ children }) => (
      <pre className="bg-gray-800 p-3 rounded-lg overflow-x-auto mb-2">
        {children}
      </pre>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-2 text-gray-300">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-2 text-gray-300">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    blockquote: ({ children }) => (
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
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-400">
                        Ask your question:
                      </label>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          💡 Tip: Type "create" for instant charts
                        </span>
                      </div>
                    </div>

                    {/* Visual overlay for highlighted text - DISABLED to prevent overlap */}
                    {false && message && (
                      <div className="absolute inset-0 px-6 py-4 pointer-events-none z-10 text-base leading-relaxed min-h-[200px] rounded-xl overflow-hidden">
                        <div
                          className="text-transparent whitespace-pre-wrap break-words"
                          style={{
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {renderMessageWithHighlight(message)}
                        </div>
                      </div>
                    )}

                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your healthcare analytics question here... (Type 'create' for charts, Shift+Enter for new line)"
                      className="w-full resize-none rounded-xl px-6 py-4 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-base leading-relaxed min-h-[200px] pr-20 ring-1 ring-white/10 break-words relative z-0"
                      rows={8} // Taller by default
                    />

                    {/* Chart type suggestions when "create" is detected */}
                    {showCreateSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl shadow-lg border border-gray-600 p-4 z-20"
                      >
                        <h4 className="text-sm font-medium text-gray-300 mb-3">
                          Choose Chart Type:
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {chartSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.type}
                              onClick={() =>
                                handleChartSuggestion(suggestion.type)
                              }
                              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 text-left group"
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xl">
                                  {suggestion.icon}
                                </span>
                                <span className="text-sm font-medium text-white group-hover:text-blue-300">
                                  {suggestion.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                {suggestion.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

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
                        } items-start space-x-3`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex flex-col items-center space-y-1">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-b from-blue-500 via-blue-600 to-yellow-500 rounded-full flex items-center justify-center">
                              <BotMessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-400">
                              ZeuSbot
                            </span>
                          </div>
                        )}
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

                            {/* Render chart if present */}
                            {msg.chart && (
                              <div className="mt-4 bg-gray-900/50 p-4 rounded-lg">
                                {msg.chart}
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
                        className="flex justify-start items-start space-x-3"
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              AI
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-400">
                            Kirby
                          </span>
                        </div>
                        <div className="bg-gray-800 rounded-2xl shadow-md p-4">
                          <div className="flex items-center space-x-3">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            <TextShimmer
                              className="text-sm font-medium"
                              duration={1.5}
                              spread={1}
                            >
                              {loadingText}
                            </TextShimmer>
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
                    {/* Visual overlay for highlighted text in chat mode - DISABLED to prevent overlap */}
                    {false && message && (
                      <div className="absolute inset-0 px-4 py-3 pointer-events-none z-10 min-h-[60px] rounded-lg overflow-hidden">
                        <div
                          className="text-transparent whitespace-pre-wrap break-words"
                          style={{
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {renderMessageWithHighlight(message)}
                        </div>
                      </div>
                    )}

                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Continue the conversation... (Type 'create' for charts, Shift+Enter for new line)"
                      className="w-full resize-none rounded-lg px-4 py-3 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 min-h-[60px] pr-12 ring-1 ring-white/10 break-words relative z-0"
                      rows={2}
                    />

                    {/* Chart type suggestions when "create" is detected in chat mode */}
                    {showCreateSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-xl shadow-lg border border-gray-600 p-3 z-20"
                      >
                        <h4 className="text-xs font-medium text-gray-300 mb-2">
                          Quick Chart:
                        </h4>
                        <div className="flex space-x-2">
                          {chartSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.type}
                              onClick={() =>
                                handleChartSuggestion(suggestion.type)
                              }
                              className="flex-1 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 text-center group"
                            >
                              <div className="text-lg mb-1">
                                {suggestion.icon}
                              </div>
                              <div className="text-xs font-medium text-white group-hover:text-blue-300">
                                {suggestion.type.toUpperCase()}
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

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
