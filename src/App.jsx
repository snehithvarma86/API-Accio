import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, History } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("api-accio-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (newItem) => {
    const updated = [newItem, ...history];
    setHistory(updated);
    localStorage.setItem("api-accio-history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("api-accio-history");
  };

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
    else {
      if (data.error) {
        alert(data.error);
        return;
      }
      setResult(data);
      saveToHistory({
        id: data.id,
        prompt,
        data: data.data,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHistoryCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[linear-gradient(159deg,rgba(0,71,171,1)_0%,rgba(28,169,201,1)_100%)] p-4">
      <Card className="w-full max-w-4xl border-cyan-400/30 bg-slate-950/80 text-sky-50 shadow-xl shadow-slate-950/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-linear-to-r from-sky-100 via-cyan-100 to-teal-100">
            API - ACCIO 🪄
          </CardTitle>
          <CardDescription className="text-2xl font-semibold text-center text-sky-50/90">
            Generate an API endpoint with mock data in seconds.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Textarea
            placeholder="Generate a list of 5 users with name ,number and age"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="border-cyan-400/40 bg-slate-950/70 text-sky-50 placeholder:text-cyan-100/60 focus-visible:ring-cyan-300/80"
          />
          <Button
            className="w-full cursor-pointer bg-linear-to-r from-sky-500 via-cyan-500 to-teal-500 text-black hover:from-sky-400 hover:via-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/30"
            disabled={loading}
            onClick={handleGenerate}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>

          {result && (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="h-px bg-cyan-200/40 w-full" />

              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-100/90">
                  Your Live Endpoint
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={endpointUrl}
                    className="flex h-10 w-full rounded-md border border-cyan-400/40 bg-slate-950/80 px-3 py-2 text-sm text-sky-50 placeholder:text-cyan-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0 cursor-pointer bg-cyan-500 text-slate-950 hover:bg-cyan-400 border-none shadow-md shadow-cyan-500/40"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 " />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border border-cyan-400/40 bg-slate-950/80 p-4 overflow-auto max-h-[400px] shadow-inner shadow-slate-950/70">
                <pre className="text-sm text-cyan-50 font-mono">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <div className="w-full max-w-4xl mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-cyan-100 flex items-center gap-2">
              <History className="h-5 w-5" /> Recent Endpoints
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-slate-400 hover:text-red-400 hover:bg-red-900/20 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Clear History
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {history.map((item, i) => (
              <Card
                key={i}
                className="border-cyan-400/20 bg-slate-950/60 backdrop-blur-sm"
              >
                <CardHeader className="pb-2">
                  <CardTitle
                    className="text-sm font-medium text-cyan-200 truncate"
                    title={item.prompt}
                  >
                    {item.prompt}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString()} •{" "}
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`${projectUrl}/functions/v1/get-mock?id=${item.id}`}
                      className="flex h-9 w-full rounded-md border border-cyan-400/30 bg-slate-950/80 px-3 py-2 text-xs text-sky-50 placeholder:text-cyan-100/60 focus:outline-none"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleHistoryCopy(
                          item.id,
                          `${projectUrl}/functions/v1/get-mock?id=${item.id}`
                        )
                      }
                      className="shrink-0 h-9 w-9 cursor-pointer bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/30"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
