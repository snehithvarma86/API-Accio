import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // 1. Enable CORS (So you can fetch this from any website)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle browser pre-flight checks
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Get the "id" from the URL (e.g., ...?id=123)
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) throw new Error('No ID provided')

    // 3. Setup Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 4. Fetch the data from the database
    const { data, error } = await supabase
      .from('mocks')
      .select('data')
      .eq('id', id)
      .single()

    if (error) throw error

    // 5. Return ONLY the JSON data (Clean response)
    return new Response(JSON.stringify(data.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})