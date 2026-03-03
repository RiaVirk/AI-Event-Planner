"use client";
import React, { useState } from "react";
import { Send, Sparkles, MapPin } from "lucide-react";
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
      id: Date.now() + "-u",
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = Date.now() + "-a";

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: assistantContent }
              : msg,
          ),
        );
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to extract and render Map
  const renderContent = (content) => {
    const mapRegex = /\[MAP:\s*(.*?)\]/g;
    const parts = content.split(mapRegex);

    return parts.map((part, index) => {
      // If the part matches an address (every second item in split is the capture group)
      if (index % 2 === 1) {
        const address = encodeURIComponent(part);
        return (
          <div
            key={index}
            className="my-4 rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg"
          >
            <div className="bg-muted p-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <MapPin className="h-3 w-3 text-primary" /> Venue Location
            </div>
            <iframe
              width="100%"
              height="250"
              style={{ border: 0 }}
              loading="lazy"
              // RIGHT: This is the official Embed API endpoint
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${address}`}
            ></iframe>
          </div>
        );
      }
      // Regular text/markdown
      // Regular text/markdown
      return (
        <div
          key={index}
          className="prose prose-sm dark:prose-invert max-w-none"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-background">
      <header className="text-center py-6 border-b">
        <h1 className="text-3xl font-bold tracking-tight">
          AI Event Concierge
        </h1>
        <p className="text-muted-foreground mt-1">Now with Live Map Previews</p>
      </header>

      <ScrollArea className="flex-1 border rounded-xl p-5 my-4 bg-muted/30">
        <div className="flex flex-col gap-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border shadow-sm"}`}
              >
                {m.role === "user" ? m.content : renderContent(m.content)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="flex gap-3 pb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Let's plan something unforgettable – what's the occasion? 🎈"
          className="flex-1 h-12 px-4 rounded-md border bg-background"
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
