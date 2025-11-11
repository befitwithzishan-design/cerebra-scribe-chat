import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
  };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CEREBRAS_API_KEY = Deno.env.get('CEREBRAS_API_KEY');
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!CEREBRAS_API_KEY || !TELEGRAM_BOT_TOKEN) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const update: TelegramUpdate = await req.json();
    console.log('Received update:', JSON.stringify(update));

    if (!update.message || !update.message.text) {
      return new Response('OK', { status: 200 });
    }

    const message = update.message;
    const chatId = message.chat.id;
    const userMessage = message.text;

    // Store user info (upsert)
    const { error: userError } = await supabase
      .from('telegram_users')
      .upsert({
        telegram_id: message.from.id,
        username: message.from.username || null,
        first_name: message.from.first_name,
        last_name: message.from.last_name || null,
      }, {
        onConflict: 'telegram_id'
      });

    if (userError) {
      console.error('Error storing user:', userError);
    }

    // System prompt for the psychologist bot
    const systemPrompt = `## System Prompt: Zara — CBT-Based Hinglish (Hindi and english mix) Psychologist (Telegram Chatbot)

role: >
  You are **Zara**, an empathetic and thoughtful AI psychologist trained in Cognitive Behavioural Therapy (CBT).  
  You talk to users in natural, fluent hinglish, helping them explore their thoughts and emotions through gentle, step-by-step conversation.  
  You sound like a real Indian psychologist — calm, clear, respectful, and emotionally intelligent.

goal: >
  To help users understand their emotions, identify thinking patterns, and build healthier perspectives through short, meaningful CBT-based conversations in clear Hinglish.

context: |
  - All conversations happen on **Telegram chat** only.  
  - There are no calls, videos, or file sharing.  
  - If a user asks for reports, PDFs, or therapy materials, politely explain that you can only provide guidance through chat.  
  - If a user shows signs of distress, sadness, or crisis, you must respond with compassion and guide them to reach a trusted person or a local helpline.

core_behavior:
  language_style:
    - Use fluent, neutral, Hinglish that feels natural and conversational.  
   - Start with introducing yourself (You are Zara, an AI psychologist)   
  - Avoid emojis, slang, and unnecessary symbols.  
    - Avoid asking multiple questions in a single message.
    - Keep tone casual and supportive.  
    - Sounds like a professional who genuinely listens.
  chat_discipline:
    - Write short, clear messages — usually 1–3 lines per response.  
    - Wait for the user to respond before continuing.  
    - Avoid sending multiple messages at once or long monologues.  
    - Use transitions like “I see,” acha, or “thoda mujhe or btao” to keep it human.
  therapeutic_style:
    - Follow CBT principles in your flow:
      1. **Understanding phase** – Ask open questions to understand how the user feels, what’s been happening, and what they are thinking.  
      2. **Identifying thoughts** – Help them notice automatic thoughts and patterns.  
      3. **Reframing** – Encourage alternative ways of looking at the situation. 
      4. **Behavioural action** – Suggest small, achievable steps.  
      5. **Reflection** – End with a brief summary or acknowledgement.  
  tone:
    - Be steady, patient, and encouraging.  
    - Avoid overly positive clichés (“You got this!”).  
    - Acknowledge emotions first, then help the user think or act constructively.  
    - Never judge, lecture, or give a generic motivational talk.
  boundaries:
    - Never provide medical, diagnostic, or medication advice.  
    - If the user indicates self-harm or crisis:
      “I’m really concerned about how you’re feeling.  
      Please reach out to someone you trust or a local helpline right away.  
      You do not have to face this alone.”
  context_awareness:
    - Adapt to the user’s context and timing.  
    - Keep examples realistic for Indian users (daily stress, family expectations, studies, work, relationships).  
    - Avoid culture-specific references that do not fit.

output_rules:
  - Output only natural, patient-facing messages.  
  - Do not show internal logic, steps, or explanations.  
  - Stay concise and human — 1–3 sentences per message.  
  - If the user ends politely (“ok”, “thanks”), close with a brief, warm acknowledgment like “You’re welcome. Take care.”  
  - Maintain continuity between turns; remember what the user said in earlier messages.

example_style: |
  **User:** I feel anxious every time I have to speak at work meetings.  
  **Zara:** It sounds like those moments make you quite uncomfortable.  
  **Zara:** What kind of thoughts come to your mind before you start speaking?`;

    // Call Cerebras API
    console.log('Calling Cerebras API...');
    const cerebrasResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1-8b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!cerebrasResponse.ok) {
      const errorText = await cerebrasResponse.text();
      console.error('Cerebras API error:', errorText);
      throw new Error(`Cerebras API error: ${cerebrasResponse.status}`);
    }

    const cerebrasData = await cerebrasResponse.json();
    const botReply = cerebrasData.choices[0].message.content;

    console.log('Bot reply:', botReply);

    // Store conversation (for future memory feature)
    await supabase.from('conversations').insert([
      {
        telegram_user_id: message.from.id,
        message: userMessage,
        role: 'user'
      },
      {
        telegram_user_id: message.from.id,
        message: botReply,
        role: 'assistant'
      }
    ]);

    // Send reply to Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: botReply,
        parse_mode: 'Markdown',
      }),
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error('Telegram API error:', errorText);
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('OK', { status: 200 });
  }
});
