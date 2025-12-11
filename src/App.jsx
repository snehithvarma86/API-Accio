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
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4">
      <Card className="w-full max-w-4xl border-zinc-800 bg-zinc-900/50 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            API - ACCIO 🪄
          </CardTitle>
          <CardDescription className="text-2xl font-bold text-center">
            Generate an API endpoint with mock data in seconds.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Textarea
            placeholder="Generate a list of 5 users with name ,number and age"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            className="w-full cursor-pointer"
            disabled={loading}
            onClick={handleGenerate}
          >
            Generate
          </Button>

          {result && (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="h-px bg-zinc-800 w-full" />

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Your Live Endpoint
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={endpointUrl}
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0 bg-zinc-950 cursor-pointer"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4 overflow-auto max-h-[400px]">
                <pre className="text-sm text-zinc-300 font-mono">
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
