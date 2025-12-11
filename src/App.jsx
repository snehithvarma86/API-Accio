import { useState } from "react";
import { supabase } from "./lib/supabase";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Zap, Copy, Check, Terminal, Loader2, Sparkles } from "lucide-react";

function App() {
  const [prompt, setPrompt] = useState(
    "generate 3 realistic user profiles with avatar_url and recent_login"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const endpointUrl = result
    ? `${projectUrl}/functions/v1/get-mock?id=${result.id}`
    : "";

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(null);

    const { data, error } = await supabase.functions.invoke("generate-mock", {
      body: { prompt },
    });

    setLoading(false);
    if (error) alert("Error: " + error.message);
    else setResult(data);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Glow blob behind the card */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-purple-300 backdrop-blur-md mb-6 shadow-xl">
          <Sparkles size={12} />
          <span>AI-Powered API Generator</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
          Mock
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            GPT
          </span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
          Stop writing dummy JSON by hand. <br /> Describe it, generate it, host
          it.
        </p>
      </header>

      {/* Main Glass Card */}
      <div className="w-full max-w-2xl relative z-10 group">
        {/* The Card Itself */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl ring-1 ring-white/5">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-40 bg-transparent text-lg text-white placeholder:text-zinc-600 p-6 focus:outline-none resize-none font-medium leading-relaxed"
              placeholder="Describe your dream API response..."
            />

            {/* Action Bar inside the text area */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <span className="text-xs text-zinc-600 hidden sm:inline">
                ⌘ + Enter to generate
              </span>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  loading
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-white text-black hover:bg-purple-50 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Zap size={16} className="fill-black" />
                )}
                {loading ? "Processing..." : "Generate API"}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* The Link Bar */}
            <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-1 flex items-center shadow-lg">
              <div className="px-4 py-2 bg-black/50 rounded-lg border border-white/5 mr-3">
                <span className="text-xs font-bold text-green-400">GET</span>
              </div>
              <input
                readOnly
                value={endpointUrl}
                className="bg-transparent flex-1 text-sm font-mono text-zinc-300 focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-colors ${
                  copied
                    ? "bg-green-500/20 text-green-400"
                    : "hover:bg-white/10 text-zinc-400"
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            {/* Code Block */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d0d0d]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <span className="text-xs font-mono text-zinc-500">
                  JSON Preview
                </span>
              </div>
              <SyntaxHighlighter
                language="json"
                style={atomOneDark}
                customStyle={{
                  padding: "24px",
                  margin: 0,
                  background: "transparent",
                  fontSize: "13px",
                }}
              >
                {JSON.stringify(result.data, null, 2)}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
