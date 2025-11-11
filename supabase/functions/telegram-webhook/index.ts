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
    const systemPrompt = `You are a compassionate and professional AI psychologist. Your role is to:
- Listen actively and empathetically to users' concerns
- Provide supportive and non-judgmental responses
- Help users explore their thoughts and feelings
- Offer coping strategies and mental health guidance
- Maintain professional boundaries
- Encourage seeking professional help when needed

Always prioritize the user's emotional well-being and safety. If you detect signs of crisis or self-harm, encourage immediate professional help.`;

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