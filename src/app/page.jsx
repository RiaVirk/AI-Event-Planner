"use client";

import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: input.trim(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8", { fatal: true });

      let assistantContent = "";
      const assistantId = Date.now().toString() + "-assistant";

      // Optimistic UI: show empty bubble immediately
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          assistantContent += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: assistantContent }
                : msg,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      alert("Error: " + (error?.message || "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-background text-foreground">
      <header className="text-center py-6 border-b">
        <h1 className="text-3xl font-bold tracking-tight">
          AI Event Concierge
        </h1>
        <p className="text-muted-foreground mt-1">
          Find events, venues, recommendations — powered by Gemini
        </p>
      </header>

      <ScrollArea className="flex-1 border rounded-xl p-5 my-4 bg-muted/30">
        <div className="flex flex-col gap-5">
          {messages.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Sparkles className="mx-auto h-10 w-10 mb-4 text-primary opacity-70" />
              <p>
                Try asking: "Events in London this weekend" or "Best rooftop
                bars in NYC"
              </p>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border shadow-sm text-card-foreground"
                }`}
              >
                {m.role === "user" ? (
                  m.content
                ) : (
                  /* The magic happens here with the "prose" class */
                  <article
                    className="prose prose-sm dark:prose-invert max-w-none 
                            prose-headings:font-bold prose-p:leading-relaxed 
                            prose-li:my-1"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content || "..."}
                    </ReactMarkdown>
                  </article>
                )}
              </div>
            </div>
          ))}

          {isLoading && messages.length > 0 && (
            <div className="text-xs animate-pulse text-muted-foreground pl-3">
              AI is thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="flex gap-3 pb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about events, venues, recommendations..."
          className="flex-1 h-12 px-4 rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="h-12 w-12"
          disabled={isLoading}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
