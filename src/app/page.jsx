"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error("Failed to connect to AI");

      // Handle the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage.content += chunk;

        // Update the last message in the list with the new chunk
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...assistantMessage };
          return newMessages;
        });
      }
    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold tracking-tight">
          AI Event Concierge
        </h1>
      </header>

      <ScrollArea className="flex-1 border rounded-xl p-5 mb-4 bg-background/60 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-5 py-3 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {isLoading &&
            !messages.find((m) => m.role === "assistant" && m.content) && (
              <div className="text-sm text-muted-foreground animate-pulse">
                Thinking...
              </div>
            )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 h-12 text-base"
          autoComplete="off"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-12 px-6"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}

// import { useChat } from "@ai-sdk/react";
// import { Send } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useState, useEffect } from "react";

// export default function Home() {
//   const [mounted, setMounted] = useState(false);

//   // 1. Call useChat at the top level
//   const { messages, input, handleInputChange, handleSubmit, isLoading } =
//     useChat({
//       api: "/api/chat",
//     });

//   // 2. Only show the full UI once the component is "mounted" on the client
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   return (
//     <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
//       <header className="text-center py-8">
//         <h1 className="text-4xl font-bold tracking-tight">
//           AI Event Concierge
//         </h1>
//       </header>

//       <ScrollArea className="flex-1 border rounded-xl p-5 mb-4 bg-background/60 backdrop-blur-sm shadow-sm">
//         <div className="flex flex-col gap-4">
//           {messages.map((m) => (
//             <div
//               key={m.id}
//               className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`max-w-[82%] rounded-2xl px-5 py-3 ${
//                   m.role === "user"
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-200 text-black"
//                 }`}
//               >
//                 {m.content}
//               </div>
//             </div>
//           ))}
//           {isLoading && (
//             <div className="text-sm text-muted-foreground animate-pulse">
//               Thinking...
//             </div>
//           )}
//         </div>
//       </ScrollArea>

//       <form onSubmit={handleSubmit} className="flex gap-3">
//         <Input
//           // Ensure value is at least an empty string
//           value={input ?? ""}
//           onChange={handleInputChange}
//           placeholder="Type your message..."
//           className="flex-1 h-12 text-base"
//           autoComplete="off"
//           disabled={isLoading}
//         />
//         <Button
//           type="submit"
//           // Safety check: input?.trim() ensures we don't crash if input is undefined
//           disabled={isLoading || !input?.trim()}
//           className="h-12 px-6"
//         >
//           <Send className="h-5 w-5" />
//         </Button>
//       </form>
//     </div>
//   );
// }

// "use client";

// import { useChat } from "@ai-sdk/react";
// import { Send } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";

// export default function Home() {
//   // Pull 'input', 'handleInputChange', and 'handleSubmit' directly from useChat
//   const { messages, input, handleInputChange, handleSubmit, isLoading } =
//     useChat({
//       api: "/api/chat",
//     });

//   return (
//     <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
//       <header className="text-center py-8">
//         <h1 className="text-4xl font-bold tracking-tight">
//           AI Event Concierge
//         </h1>
//       </header>

//       <ScrollArea className="flex-1 border rounded-xl p-5 mb-4 bg-background/60 backdrop-blur-sm shadow-sm">
//         <div className="flex flex-col gap-4">
//           {messages.map((m) => (
//             <div
//               key={m.id}
//               className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`max-w-[82%] rounded-2xl px-5 py-3 ${
//                   m.role === "user"
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-200 text-black"
//                 }`}
//               >
//                 {/* m.content will now populate as the stream comes in */}
//                 {m.content}
//               </div>
//             </div>
//           ))}
//           {isLoading && (
//             <div className="text-sm text-muted-foreground animate-pulse">
//               Thinking...
//             </div>
//           )}
//         </div>
//       </ScrollArea>

//       {/* The form now uses the built-in handleSubmit */}
//       <form onSubmit={handleSubmit} className="flex gap-3">
//         <Input
//           value={input}
//           onChange={handleInputChange} // Built-in handler
//           placeholder="Type your message..."
//           className="flex-1 h-12 text-base"
//           autoComplete="off"
//           disabled={isLoading}
//         />
//         <Button
//           type="submit"
//           disabled={isLoading || !(input || "").trim()}
//           className="h-12 px-6"
//         >
//           <Send className="h-5 w-5" />
//         </Button>
//       </form>
//     </div>
//   );
// }
