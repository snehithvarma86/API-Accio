import { useState } from "react";
import { supabase } from "./lib/supabase";
// Construct the endpoint URL dynamically

function App() {
  const [prompt, setPrompt] = useState("generate random data with name and id");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const endpointUrl = result
    ? `${projectUrl}/functions/v1/get-mock?id=${result.id}`
    : "";

  async function handleGenerate() {
    if (!prompt) {
      alert("prompt is empty please pass the prompt");
      return;
    }
    setLoading(true);
    setResult("");

    const { data, error } = await supabase.functions.invoke("generate-mock", {
      body: { prompt },
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert(error);
    } else {
      console.log(data);

      setResult(data);
    }
  }

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      ></textarea>

      <button onClick={handleGenerate} disabled={loading}>
        click for data
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>🚀 Your Live Endpoint:</h3>
          <p>Copy this URL and use it in your app:</p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              readOnly
              value={endpointUrl}
              style={{
                width: "100%",
                padding: "10px",
                fontFamily: "monospace",
              }}
            />
            <button onClick={() => navigator.clipboard.writeText(endpointUrl)}>
              Copy
            </button>
          </div>

          <h4>Data Preview:</h4>
          <pre style={{ background: "#f4f4f4", padding: "10px" }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
