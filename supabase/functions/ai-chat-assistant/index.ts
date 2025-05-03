
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId, userRole } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    // Enhanced system message with more context and capabilities
    const systemMessage = {
      role: "system", 
      content: `You are an AI assistant for MechTrackPulse, a real-time work progress tracking system for mechanical companies. 
      The current user is a ${userRole || 'user'} with ID ${userId || 'unknown'}. 
      
      Features of the system include:
      - Task management (creation, assignment, tracking)
      - Real-time progress updates with time tracking
      - Operator performance analytics and efficiency tracking
      - Client management and project status reporting
      - Scheduling and calendar management
      - AI-powered insights and recommendations
      
      Respond in these ways:
      1. Be helpful, concise, and professional 
      2. If asked about specific task details, provide general guidance on how to use the relevant feature
      3. For technical issues, suggest troubleshooting steps
      4. For performance questions, describe what metrics are available
      
      You can suggest optimizations such as:
      - Task assignment strategies based on operator skills and availability
      - Workflow improvements based on historical performance
      - Resource allocation suggestions
      - Preventative maintenance scheduling
      
      Give practical, actionable advice when possible.`
    };

    // Add system message at the beginning
    const fullMessages = [systemMessage, ...messages];

    console.log("Sending request to OpenAI:", JSON.stringify({ messages: fullMessages }));

    // Send request to OpenAI with improved model and settings
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using the latest recommended model
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 800, // Increased for more detailed responses
        top_p: 0.9,
        frequency_penalty: 0.2, // Slight penalty to reduce repetitive responses
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenAI response:", data);

    return new Response(JSON.stringify({
      response: data.choices[0].message.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error in AI chat assistant function:", error);
    return new Response(JSON.stringify({
      error: error.message || "An unexpected error occurred"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
