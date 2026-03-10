"use client";
import React, { useState, useEffect } from "react";
import {
  Send,
  Sparkles,
  MapPin,
  Crown,
  Zap,
  Save,
  History,
  Clock,
  Globe,
  Phone,
  Star,
  Clock3,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Moon,
  Sun, // ✅ NEW: added PlusCircle, Moon, Sun icons
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState("party");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [placeDetails, setPlaceDetails] = useState({});
  const [expandedHours, setExpandedHours] = useState({});
  const [isDark, setIsDark] = useState(false); // ✅ NEW: dark mode state

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setIsDark(prefersDark);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/get-itineraries");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const fetchPlaceDetails = async (address) => {
    if (placeDetails[address]) return;
    try {
      const res = await fetch(
        `/api/place-details?query=${encodeURIComponent(address)}`,
      );
      const data = await res.json();
      setPlaceDetails((prev) => ({ ...prev, [address]: data }));
    } catch (err) {
      console.error("Failed to fetch place details:", err);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setPlaceDetails({});
    setExpandedHours({});
    setShowHistory(false);
  };

  const loadHistory = (item) => {
    setMessages([
      { id: Date.now() + "-u", role: "user", content: item.user_query },
      { id: Date.now() + "-a", role: "assistant", content: item.ai_response },
    ]);
    setPersona(item.persona);
    setShowHistory(false);
  };

  const saveItinerary = async (aiContent) => {
    const lastUserMessage =
      messages.findLast((m) => m.role === "user")?.content || "Event Plan";
    try {
      const response = await fetch("/api/save-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          user_query: lastUserMessage,
          ai_response: aiContent,
        }),
      });
      if (response.ok) {
        alert("✨ Saved to your SQL database!");
        fetchHistory();
      } else {
        alert("❌ Failed to save.");
      }
    } catch (err) {
      alert("Connection error while saving.");
    }
  };

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
        body: JSON.stringify({ messages: currentMessages, persona }),
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

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      "★".repeat(full) +
      (half ? "½" : "") +
      "☆".repeat(5 - full - (half ? 1 : 0))
    );
  };

  const renderContent = (content) => {
    // Guard against non-string content
    if (!content || typeof content !== "string") return null;

    const mapRegex = /\[MAP:\s*(.*?)\]/g;
    const parts = content.split(mapRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const address = part.trim();
        const details = placeDetails[address];
        const isHoursExpanded = expandedHours[address];

        if (!details) fetchPlaceDetails(address);

        return (
          <div
            key={index}
            className="my-4 rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg"
          >
            <div className="bg-muted p-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <MapPin className="h-3 w-3 text-primary" />
              {details?.name || address}
            </div>

            <iframe
              width="100%"
              height="220"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}`}
            />

            {details ? (
              <div className="bg-card border-t divide-y divide-border text-sm">
                <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {details.rating && (
                      <>
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-amber-500">
                          {details.rating}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {renderStars(details.rating)}
                        </span>
                        {details.user_ratings_total && (
                          <span className="text-muted-foreground text-xs">
                            ({details.user_ratings_total.toLocaleString()}{" "}
                            reviews)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {details.opening_hours?.open_now !== undefined && (
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        details.opening_hours.open_now
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {details.opening_hours.open_now
                        ? "✅ Open Now"
                        : "❌ Closed Now"}
                    </span>
                  )}
                </div>

                {details.price_level !== undefined && (
                  <div className="px-4 py-3 flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground font-medium">
                      Price Level:
                    </span>
                    <span className="text-green-600 font-bold text-base">
                      {"$".repeat(details.price_level)}
                      <span className="opacity-25">
                        {"$".repeat(4 - details.price_level)}
                      </span>
                    </span>
                  </div>
                )}

                {details.formatted_phone_number && (
                  <div className="px-4 py-3 flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={`tel:${details.formatted_phone_number}`}
                      className="text-primary hover:underline text-sm"
                    >
                      {details.formatted_phone_number}
                    </a>
                  </div>
                )}

                {details.website && (
                  <div className="px-4 py-3 flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={details.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm truncate"
                    >
                      {new URL(details.website).hostname.replace("www.", "")}
                    </a>
                    <a
                      href={details.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto shrink-0"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                      >
                        <Globe className="h-3 w-3" /> Visit Site
                      </Button>
                    </a>
                  </div>
                )}

                {details.formatted_address && (
                  <div className="px-4 py-3 flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      {details.formatted_address}
                    </span>
                  </div>
                )}

                {details.opening_hours?.weekday_text?.length > 0 && (
                  <div className="px-4 py-3">
                    <button
                      onClick={() =>
                        setExpandedHours((prev) => ({
                          ...prev,
                          [address]: !prev[address],
                        }))
                      }
                      className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground w-full transition-colors"
                    >
                      <Clock3 className="h-4 w-4" />
                      Opening Hours
                      {isHoursExpanded ? (
                        <ChevronUp className="h-3 w-3 ml-auto" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-auto" />
                      )}
                    </button>
                    {isHoursExpanded && (
                      <div className="mt-3 space-y-1.5 pl-6">
                        {details.opening_hours.weekday_text.map((day, i) => {
                          const colonIndex = day.indexOf(": ");
                          const dayName = day.substring(0, colonIndex);
                          const hours = day.substring(colonIndex + 2);
                          const todayIndex = (new Date().getDay() + 6) % 7;
                          const isToday = i === todayIndex;
                          return (
                            <div
                              key={i}
                              className={`flex justify-between text-xs gap-4 ${
                                isToday
                                  ? "font-bold text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <span className="shrink-0">{dayName}</span>
                              <span className="text-right">{hours}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-4 bg-card border-t space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/5" />
              </div>
            )}
          </div>
        );
      }

      return (
        <div
          key={index}
          className="prose prose-sm dark:prose-invert max-w-none"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>
          {index === parts.length - 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveItinerary(content)}
              className="mt-4 text-[10px] h-7 gap-1 text-muted-foreground hover:text-primary"
            >
              <Save className="h-3 w-3" /> Save Itinerary
            </Button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 flex bg-background overflow-hidden">
      {/* HISTORY SIDEBAR */}
      <div
        className={`${showHistory ? "w-80" : "w-0"} transition-all duration-300 border-r bg-muted/10 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b flex items-center justify-between bg-card">
          <h2 className="font-bold flex items-center gap-2">
            <Clock className="h-4 w-4" /> Saved Plans
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(false)}
          >
            hide
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => loadHistory(item)}
                className="p-3 rounded-lg border bg-card hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                      item.persona === "concierge"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-purple-500/10 text-purple-600"
                    }`}
                  >
                    {item.persona}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium line-clamp-2">
                  {item.user_query}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Click to load →
                </p>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center text-sm text-muted-foreground mt-10">
                No saved plans yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <header className="flex justify-between items-center py-4 border-b mb-4">
          {/* Left: History toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-5 w-5" />
          </Button>

          {/* Center: Title */}
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> AI Event Concierge
          </h1>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={startNewChat}
              title="New Chat"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>

            {/* ✅ NEW: Dark mode toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDark((prev) => !prev)}
              title="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        <div className="flex justify-center gap-3 mb-4">
          <Button
            variant={persona === "concierge" ? "default" : "outline"}
            onClick={() => setPersona("concierge")}
            className="rounded-full flex gap-2"
          >
            <Crown className="h-4 w-4" /> Elite Concierge
          </Button>
          <Button
            variant={persona === "party" ? "default" : "outline"}
            onClick={() => setPersona("party")}
            className="rounded-full flex gap-2"
          >
            <Zap className="h-4 w-4" /> Party Animal
          </Button>
        </div>

        {/* CHAT MESSAGES */}
        <div className="flex-1 min-h-0 overflow-y-auto border rounded-xl p-5 mb-4 bg-muted/30 shadow-inner">
          <div className="flex flex-col gap-5 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-20">
                <p className="text-lg font-medium text-foreground">
                  Where is the party at?
                </p>
                <p>Select your vibe and describe your event to get started.</p>
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
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card border shadow-sm"
                  }`}
                >
                  {m.role === "user" ? m.content : renderContent(m.content)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={sendMessage}
          className="flex gap-3 pt-2 max-w-4xl mx-auto w-full"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your event (e.g. 20 person dinner in Soho)..."
            className="flex-1 h-12 px-4 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-xl"
            disabled={isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
