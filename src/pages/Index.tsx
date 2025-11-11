import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Database, MessageCircle, Settings } from "lucide-react";

const Index = () => {
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-webhook`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Bot className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Psychologist Bot</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            AI-powered psychological counseling bot running on Cerebras AI
          </p>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Active & Running
          </Badge>
        </div>

        {/* Setup Instructions */}
        <Card className="mb-8 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Setup Instructions
            </CardTitle>
            <CardDescription>Follow these steps to connect your Telegram bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Copy your webhook URL:</p>
                  <code className="block mt-2 p-3 bg-muted rounded-md text-sm break-all">
                    {webhookUrl}
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Open your terminal/command prompt and run:</p>
                  <code className="block mt-2 p-3 bg-muted rounded-md text-sm break-all">
                    curl -X POST https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/setWebhook -d
                    "url={webhookUrl}"
                  </code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Replace &lt;YOUR_BOT_TOKEN&gt; with your actual Telegram bot token
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Start chatting!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Open your bot on Telegram and send a message. The bot will respond using Cerebras
                    AI.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <MessageCircle className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">AI Psychologist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Compassionate AI counselor powered by Cerebras using Llama 3.1 model for natural
                conversations
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <Database className="w-8 h-8 text-secondary mb-2" />
              <CardTitle className="text-lg">Memory Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Database tables prepared for conversation history and user profiles (coming soon)
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <Bot className="w-8 h-8 text-success mb-2" />
              <CardTitle className="text-lg">Scalable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Built on serverless architecture, ready to handle multiple concurrent conversations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="mt-8 border-border/50">
          <CardHeader>
            <CardTitle>Technical Architecture</CardTitle>
            <CardDescription>How your bot works</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Frontend:</strong> React + TypeScript + Tailwind CSS (this dashboard)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Backend:</strong> Edge Functions (Deno/TypeScript) running on Lovable Cloud
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Database:</strong> PostgreSQL with tables for users & conversations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>AI Model:</strong> Cerebras Llama 3.1-8B with custom psychologist prompt
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Integration:</strong> Telegram Bot API webhook
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">✓</span>
                <span>Database tables created for user profiles and conversations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">✓</span>
                <span>Bot webhook handler deployed and ready</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-bold">○</span>
                <span className="text-muted-foreground">
                  Add conversation memory (enable context-aware responses)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-bold">○</span>
                <span className="text-muted-foreground">
                  Implement tool calling (schedule appointments, mood tracking, etc.)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-bold">○</span>
                <span className="text-muted-foreground">
                  Add admin dashboard to view conversations and analytics
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;