import { useState } from "react";
import { supabase } from "./lib/supabase";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[linear-gradient(159deg,rgba(0,71,171,1)_0%,rgba(28,169,201,1)_100%)] p-4">
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
    </div>
  );
}

export default App;
