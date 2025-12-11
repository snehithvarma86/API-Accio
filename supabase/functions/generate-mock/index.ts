import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SYSTEM_PROMPT = `
You are a mock data generator. 
Output ONLY valid JSON data based on the user's prompt. 
Do not output markdown code blocks. 
Do not output explanations. 
Just the raw JSON array or object.
`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  try {
    const { prompt } = await req.json()

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]
      })
    })

    const aiData = await openAiResponse.json()
    const generatedText = aiData.choices[0].message.content


    if (!generatedText || generatedText.trim() === "" || generatedText==="[]\n" || generatedText==="[]") {
      return new Response(JSON.stringify({ error: "Could not create data. Please provide a clearer prompt." }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }
    
    const jsonResult = JSON.parse(generatedText)


    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseClient
      .from('mocks')
      .insert({ prompt: prompt, data: jsonResult })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
