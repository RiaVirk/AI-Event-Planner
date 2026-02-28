"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react"; // ← correct import
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const [input, setInput] = useState(""); // ← you control it now

  const { messages, sendMessage, isLoading, status } = useChat({
    api: "/api/chat", // your API route
    // optional: experimental_throttle: 100, // if streaming feels choppy later
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return; // safe now — input is always string

    sendMessage({ text: input }); // ← send plain text message
    setInput(""); // clear input
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold tracking-tight">
          AI Event Concierge
        </h1>
        <p className="text-muted-foreground mt-2">
          Tell me about your event — I'll help you plan it!
        </p>
      </header>

      <ScrollArea className="flex-1 border rounded-xl p-5 mb-4 bg-background/60 backdrop-blur-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-6 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-5 py-3.5">Thinking…</div>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: 25th birthday for 35 people in Chicago, max $3000, casual rooftop vibe…"
          className="flex-1 h-12 text-base"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()} // ← now safe
          className="h-12 px-6"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
