"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Bot, MessageCircle, Image as ImageIcon, FileText, Send, X, Loader2, Lock, Download, Copy, Check } from "lucide-react";

export function NovaFloatingPanel({ accessToken, subscriptionTier, articles }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageResult, setImageResult] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [articleIndex, setArticleIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [novaLoading, setNovaLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  const fabRef = useRef(null);
  const panelRef = useRef(null);
  const chatBottomRef = useRef(null);

  const canImage = subscriptionTier !== "Free";
  const canVideo = subscriptionTier === "Premium";

  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || novaLoading) return;

    setNovaLoading(true);
    try {
      const response = await fetch("/api/nova", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: chatInput }],
          articles: articles.slice(0, 12),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, { role: "user", content: chatInput }, { role: "assistant", content: data.response }]);
        setChatInput("");
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setNovaLoading(false);
    }
  }, [chatInput, messages, accessToken, articles, novaLoading]);

  const runImage = useCallback(async () => {
    if (!imagePrompt.trim() || imageLoading) return;

    setImageLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Generate a news image: ${imagePrompt}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setImageResult(data.image);
      }
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setImageLoading(false);
    }
  }, [imagePrompt, imageLoading]);

  const runVideo = useCallback(async () => {
    if (videoLoading) return;

    setVideoLoading(true);
    try {
      const response = await fetch("/api/video-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article: articles[articleIndex],
          language: "en",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setVideoData(data);
      }
    } catch (error) {
      console.error("Video script error:", error);
    } finally {
      setVideoLoading(false);
    }
  }, [articleIndex, articles, videoLoading]);

  const copyScript = useCallback(() => {
    if (videoData?.script) {
      navigator.clipboard.writeText(videoData.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [videoData]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && fabRef.current && !fabRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Floating NOVA Button */}
      <button
        ref={fabRef}
        onClick={() => setOpen(true)}
        className="nova-button fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#C8102E] text-white shadow-lg hover:shadow-xl transition-all"
        aria-label="Open NOVA AI Assistant"
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* Side Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            className="relative ml-auto h-full w-full max-w-md bg-[#1A1A1A] border-l border-[#2A2A2A] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
              <h2 className="text-lg font-semibold text-white">NOVA AI Assistant</h2>
              <button
                onClick={() => setOpen(false)}
                className="nav-link p-2 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2A2A2A]">
              {[
                { id: "chat", label: "Chat", icon: MessageCircle },
                { id: "image", label: "Generate", icon: ImageIcon },
                { id: "video", label: "Script", icon: FileText }
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                    ${tab === tabItem.id
                      ? "text-[#C8102E] border-b-2 border-[#C8102E]"
                      : "text-[#A0A0A0] hover:text-white border-b-2 border-transparent"
                    }
                  `}
                >
                  <tabItem.icon className="h-4 w-4" />
                  {tabItem.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {tab === "chat" && (
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="space-y-4 mb-4 h-64 overflow-y-auto">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`
                          flex gap-3
                          ${msg.role === "user" ? "justify-end" : "justify-start"}
                        `}
                      >
                        <div
                          className={`
                            max-w-xs rounded-lg px-3 py-2 text-sm
                            ${msg.role === "user"
                              ? "bg-[#C8102E] text-white"
                              : "bg-[#2A2A2A] text-[#A0A0A0]"
                            }
                          `}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask NOVA anything..."
                      className="input-newsroom flex-1"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          sendChat();
                        }
                      }}
                    />
                    <button
                      onClick={sendChat}
                      disabled={novaLoading || !chatInput.trim()}
                      className="btn-primary px-4 py-2"
                    >
                      {novaLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {tab === "image" && (
                <div className="space-y-4">
                  {!canImage && (
                    <div className="rounded-lg bg-[#C8102E]/10 border border-[#C8102E]/20 p-4 text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-[#C8102E]" />
                      <p className="text-[#C8102E] font-medium">Premium Feature</p>
                      <p className="text-[#A0A0A0] text-sm">Upgrade to Premium to access AI image generation</p>
                    </div>
                  )}

                  {canImage && (
                    <>
                      <input
                        type="text"
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Describe an image to generate..."
                        className="input-newsroom mb-4"
                      />
                      <button
                        onClick={runImage}
                        disabled={imageLoading || !imagePrompt.trim()}
                        className="btn-primary w-full"
                      >
                        {imageLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Generate Image
                          </>
                        )}
                      </button>

                      {imageResult && (
                        <div className="mt-4">
                          <Image
                            src={imageResult}
                            alt="Generated image"
                            className="w-full rounded-lg border border-[#2A2A2A]"
                            width={400}
                            height={300}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {tab === "video" && (
                <div className="space-y-4">
                  {!canVideo && (
                    <div className="rounded-lg bg-[#C8102E]/10 border border-[#C8102E]/20 p-4 text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-[#C8102E]" />
                      <p className="text-[#C8102E] font-medium">Premium Feature</p>
                      <p className="text-[#A0A0A0] text-sm">Upgrade to Premium to access video script generation</p>
                    </div>
                  )}

                  {canVideo && (
                    <>
                      <select
                        value={articleIndex}
                        onChange={(e) => setArticleIndex(Number(e.target.value))}
                        className="input-newsroom mb-4"
                      >
                        {articles.slice(0, 12).map((article, index) => (
                          <option key={index} value={index}>
                            {article.title.slice(0, 50)}...
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={runVideo}
                        disabled={videoLoading}
                        className="btn-primary w-full"
                      >
                        {videoLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate 60s Script
                          </>
                        )}
                      </button>

                      {videoData && (
                        <div className="mt-4 p-4 bg-[#2A2A2A] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white">Generated Script</h3>
                            <button
                              onClick={copyScript}
                              className="nav-link p-1 rounded"
                            >
                              {copied ? (
                                <Check className="h-4 w-4 text-[#00C853]" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <pre className="text-sm text-[#A0A0A0] whitespace-pre-wrap">
                            {videoData.script}
                          </pre>
                          <div className="mt-4">
                            <h4 className="font-semibold text-white mb-2">Visuals & Beat Guide</h4>
                            <div className="text-sm text-[#A0A0A0] space-y-2">
                              {videoData.visuals.map((visual, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="text-[#C8102E] font-medium">Beat {index + 1}:</span>
                                  <span className="flex-1">{visual}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
