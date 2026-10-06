"use client";

import React, { useState, useEffect, useRef } from "react";
import { SendHorizonal, PanelLeft, Plus } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Jarvis() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jarvis-chat');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [booting, setBooting] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCommands, setShowCommands] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jarvis-theme') || 'ironman';
    }
    return 'ironman';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.className = '';
      switch (theme) {
        case 'tron':
          root.style.background = 'linear-gradient(to bottom right, #000000, #00faff)';
          break;
        case 'matrix':
          root.style.background = 'linear-gradient(to bottom right, #000000, #00ff00)';
          break;
        case 'system':
          root.style.background = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#000' : '#fff';
          break;
        case 'ironman':
        default:
          root.style.background = 'linear-gradient(to bottom right, #000000, #2c001e, #660000)';
          break;
      }
      localStorage.setItem('jarvis-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      setVoices(allVoices);
    };
    if (typeof window !== "undefined" && speechSynthesis) {
      speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const speakAsJarvis = (text: string) => {
    if (!voiceEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const jarvisVoice =
      voices.find((v) => v.name.includes("Google UK English Male")) ||
      voices.find((v) => v.name.includes("Daniel")) ||
      voices.find((v) => v.name.includes("George")) ||
      voices.find((v) => v.lang === "en-GB");
    utterance.voice = jarvisVoice || voices[0];
    utterance.pitch = 1;
    utterance.rate = 1.15;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
  };

  const startWakeWordListener = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = async (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.trim().toLowerCase();
      setTranscriptText(transcript);

      if (!wakeWordDetected && transcript.includes("jarvis")) {
        setWakeWordDetected(true);
        speakAsJarvis("Yes, Mr. Stark?");
      } else if (wakeWordDetected && lastResult.isFinal && transcript) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: transcript },
          { role: "assistant", content: "💬 Thinking, Mr. Stark..." },
        ]);
        try {
          const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: transcript }),
          });
          const data = await res.json();
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: data.result || "...No response, boss." },
          ]);
          speakAsJarvis(data.result || "");
        } catch {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "⚡️ Critical system error. Please retry, Mr. Stark.",
            },
          ]);
        }
        setWakeWordDetected(false);
        setTranscriptText("");
      }
    };

    recognition.onerror = () => {};
    recognition.onend = () => {
      try {
        recognition.start();
      } catch {}
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {}
  };

  useEffect(() => {
    localStorage.setItem('jarvis-chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (booting) {
      speakAsJarvis("Initializing systems. Running diagnostics. Power levels optimal. All subsystems online. Booting complete.");
    }
    const bootTimeout = setTimeout(() => {
      speechSynthesis.cancel();
      setBooting(false);
      startWakeWordListener();
    }, 6000);
    return () => clearTimeout(bootTimeout);
  }, [booting]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (booting) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-[#2c001e] to-[#660000] text-white animate-fade-in font-mono text-xl z-50">
        <img src="/stark-logo.png" alt="Stark Logo" className="w-24 mb-6 animate-pulse" />
        J.A.R.V.I.S. SYSTEM BOOTING...
        <span className="text-sm mt-2 text-zinc-400 animate-pulse">
          Loading subsystems ▓▓▓░░░
        </span>
      </div>
    );
  }

  return (
    <>
      {/* 🎬 Background Video */}
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 w-full h-full object-contain z-0">
        <source src="/ironman.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="fixed top-0 left-0 w-full h-full bg-black/60 z-[5]" />

      <div className="h-screen w-screen flex overflow-hidden text-white relative z-10">
        <aside className="w-64 bg-black/50 border-r border-red-800 p-4 text-xs font-mono overflow-y-auto">
          <h2 className="text-red-500 mb-3 font-bold text-sm">📿 Chat Memory</h2>
          <ul className="space-y-2 max-h-60 pr-2">
            {messages.map((msg, index) => (
              <li key={index} className="text-zinc-400 truncate">
                <span className="text-yellow-500">{msg.role === 'user' ? 'You' : 'Jarvis'}:</span> {msg.content}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 flex flex-col">
          <header className="flex justify-between items-center bg-black/70 px-6 py-3 border-b border-red-800 text-sm font-mono">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-red-500 hover:text-red-300">
              <PanelLeft size={18} />
            </button>
            <span className="hidden sm:inline">🧠 Memory: ON</span>
            <span>🎧 Wake Word: {wakeWordDetected ? "Active" : "Listening..."}</span>
            <span>🗣 Output: {voiceEnabled ? "ON" : "OFF"}</span>
          </header>

          <section className="flex-1 overflow-y-auto px-6 py-10 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-xl w-fit px-5 py-3 rounded-lg shadow-md transition duration-200 ${
                  msg.role === "user"
                    ? "self-end ml-auto bg-yellow-900 border border-yellow-600"
                    : "self-start mr-auto bg-red-900 border border-red-600"
                }`}
              >
                <p className="text-xs text-zinc-300 mb-1 font-light">
                  {msg.role === "user" ? "You" : "Jarvis"}
                </p>
                <p className="text-sm font-mono text-zinc-100 leading-relaxed">{msg.content}</p>
              </div>
            ))}
            <div ref={bottomRef} />
          </section>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!transcriptText.trim()) return;
              setMessages((prev) => [
                ...prev,
                { role: 'user', content: transcriptText },
                { role: 'assistant', content: '💬 Thinking, Mr. Stark...' },
              ]);
              fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: transcriptText }),
              })
                .then(res => res.json())
                .then(data => {
                  setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { role: 'assistant', content: data.result || '...No response, boss.' },
                  ]);
                  speakAsJarvis(data.result || '');
                });
              setTranscriptText('');
            }}
            className="sticky bottom-0 z-30 flex flex-col sm:flex-row items-center gap-3 px-6 py-4 bg-black/80 backdrop-blur"
          >
            <div className="w-full flex items-center gap-2 relative">
              {/* ➕ Command Menu */}
              <div className="relative">
                <button
                  type="button"
                  className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
                  onClick={() => setShowCommands((prev) => !prev)}
                  title="More Tools"
                >
                  <Plus size={18} />
                </button>
                {showCommands && (
                  <div className="absolute bottom-14 left-0 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg p-2 w-52 z-50 space-y-2 text-sm">
                    <button onClick={() => alert("📝 Summarize")} className="block w-full text-left hover:text-red-400">📝 Summarize Text</button>
                    <button onClick={() => alert(new Date().toLocaleString())} className="block w-full text-left hover:text-yellow-400">🕒 Show Date & Time</button>
                    <button onClick={() => alert("🔍 Web Search")} className="block w-full text-left hover:text-blue-400">🔍 Search the Web</button>
                    <button onClick={() => alert("🧠 Open Apps")} className="block w-full text-left hover:text-green-400">🧠 Open Apps</button>
                    <button onClick={() => setVoiceEnabled((prev) => !prev)} className="block w-full text-left hover:text-pink-400">
                      {voiceEnabled ? "🔊 Disable Voice" : "🔇 Enable Voice"}
                    </button>
                    <button onClick={() => { setMessages([]); localStorage.removeItem("jarvis-chat"); }} className="block w-full text-left text-red-500 hover:text-red-300">♻️ Reset Conversation</button>
                  </div>
                )}
              </div>

              {/* Input */}
              <input
                type="text"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Talk to Jarvis manually..."
                className="flex-1 px-4 py-3 rounded-full bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              {/* Send Button */}
              <button
                type="submit"
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
              >
                <SendHorizonal size={20} />
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
