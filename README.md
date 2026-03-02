# AI-Powered Event Concierge

A modern conversational web application that helps users plan events using natural language.  
Powered by **Next.js**, **Vercel AI SDK** + **Groq API** — extremely fast LLM inference for real-time venue suggestions, plan refinement and event organization.

https://github.com/your-username/event-concierge

<p align="center">
  <img src="./public/screenshots/hero-chat.png" alt="Chat interface" width="800"/>
  <br/><br/>
  <em>Describe your event → get smart venue suggestions in seconds</em>
</p>

## ✨ Features

- Natural language event description  
  _“Casual 35-person birthday drinks in Austin, rooftop or patio, max $2800, next month”_
- Extremely fast streaming responses thanks to **Groq API** (often <1s Time-to-First-Token)
- Smart follow-up questions when details are missing
- Venue suggestions with:
  - Name & approximate location
  - Capacity range
  - Estimated price band
  - 1–2 reasons why it matches the request
- Conversational iteration (“cheaper options”, “indoor only”, “add finger food”)
- Responsive design — great experience on mobile & desktop
- Clean, modern UI built with Tailwind CSS + shadcn/ui

## ⚡ Why Groq?

Groq delivers some of the **fastest LLM inference** available in 2026 — especially for open-weight models:

- Llama 3.1 70B / 405B
- Mixtral 8x22B
- Gemma 2 27B
- Very low latency → makes streaming chat feel truly real-time

## 🛠 Tech Stack

| Layer        | Technology                            | Purpose                             |
| ------------ | ------------------------------------- | ----------------------------------- |
| Framework    | Next.js 16 (Pages Router)             | Full-stack React framework          |
| Styling      | Tailwind CSS + shadcn/ui              | Modern, customizable components     |
| AI SDK       | Vercel AI SDK v4/v5 (`@ai-sdk/react`) | Streaming UI + tool calling support |
| LLM Provider | **Groq API**                          | Ultra-fast inference                |
| Icons        | lucide-react + react-icons            | Clean & consistent icon set         |
| Deployment   | Vercel (recommended)                  | One-click deploy + edge functions   |

## 📸 Screenshots

<p align="center">
  <img src="./public/screenshots/chat-streaming.png" alt="Streaming response" width="48%"/>
  <img src="./public/screenshots/mobile-view.png" alt="Mobile responsive" width="48%"/>
</p>

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20
- [Groq API key](https://console.groq.com/keys) (free tier available with generous rate limits)

### Installation

```bash

git clone https://github.com/your-username/event-concierge.git
cd event-concierge


npm install


cp .env.example GROQ_API_KEY=gsk_**********************************

```
