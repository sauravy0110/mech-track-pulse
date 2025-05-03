
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Mic, MicOff, Send, User, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VoiceRecorderState {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
}

const AIChatAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your MechTrackPulse assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "How do I create a new task?",
    "How do I track operator progress?",
    "How do I generate reports?",
    "How do I manage clients?",
  ]);
  const [voiceRecorder, setVoiceRecorder] = useState<VoiceRecorderState>({
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],
  });
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      role: "user" as const,
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Format messages for OpenAI
      const formattedMessages = messages
        .concat(userMessage)
        .map(({ role, content }) => ({ role, content }));

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("ai-chat-assistant", {
        body: {
          messages: formattedMessages,
          userId: user?.id,
          userRole: user?.role,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);

      // Generate new suggestions based on context
      generateSuggestions(data.response);
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI assistant. Please try again.",
        variant: "destructive",
      });

      // Add error message from assistant
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (response: string) => {
    // In a real app, this would be more sophisticated, possibly calling another API
    // but for demo purposes we'll just use some basic context matching
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes("task") || lowerResponse.includes("assignment")) {
      setSuggestions([
        "How do I assign priority to tasks?",
        "Can I set recurring tasks?",
        "How do I track task completion time?",
      ]);
    } else if (lowerResponse.includes("report") || lowerResponse.includes("analytics")) {
      setSuggestions([
        "How can I export reports?",
        "What metrics are available for operators?",
        "Can I schedule automated reports?",
      ]);
    } else if (lowerResponse.includes("client") || lowerResponse.includes("customer")) {
      setSuggestions([
        "How do I add a new client?",
        "Can clients see their project status?",
        "How do I manage client permissions?",
      ]);
    } else {
      setSuggestions([
        "Tell me about task management features",
        "How does operator tracking work?",
        "What client information is visible to operators?",
        "How can I improve team efficiency?",
      ]);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        setIsProcessingVoice(true);
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string)?.split(',')[1];
            
            if (base64Audio) {
              toast({
                title: "Processing voice input",
                description: "Converting your voice to text...",
              });
              
              try {
                // In a real app, you would send this to a voice-to-text API
                // For now, we'll simulate a response after a delay
                await new Promise(r => setTimeout(r, 1500));
                
                // Simulated voice recognition result - in production use a real API
                const recognizedText = "How do I create a new task for an operator?";
                
                setInput(recognizedText);
                toast({
                  title: "Voice processed",
                  description: `Recognized: "${recognizedText}"`,
                });
              } catch (err) {
                console.error("Error processing voice:", err);
                toast({
                  title: "Voice processing failed",
                  description: "Could not convert voice to text. Please try again.",
                  variant: "destructive",
                });
              }
            }
            setIsProcessingVoice(false);
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error("Error processing audio:", error);
          setIsProcessingVoice(false);
        }
      };
      
      mediaRecorder.start();
      setVoiceRecorder({
        isRecording: true,
        mediaRecorder,
        audioChunks,
      });
      
      toast({
        title: "Recording started",
        description: "Speak your message and click the microphone again when done.",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow access to your microphone to use voice input.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (voiceRecorder.mediaRecorder && voiceRecorder.isRecording) {
      voiceRecorder.mediaRecorder.stop();
      voiceRecorder.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setVoiceRecorder({
        ...voiceRecorder,
        isRecording: false,
      });
    }
  };

  const toggleVoiceRecording = () => {
    if (voiceRecorder.isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pb-0">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8 mt-1">
                  {message.role === "user" ? (
                    user?.profileImage ? (
                      <AvatarImage src={user.profileImage} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User size={16} />
                      </AvatarFallback>
                    )
                  ) : (
                    <AvatarFallback className="bg-blue-500 text-white">
                      <Bot size={16} />
                    </AvatarFallback>
                  )}
                </Avatar>

                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div 
                    className={`text-xs mt-1 ${
                      message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Quick suggestions */}
          {messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
            <div className="flex flex-wrap gap-2 mt-4">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => sendMessage(suggestion)}
                  disabled={isLoading}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading || isProcessingVoice}
            className="flex-grow"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  disabled={isLoading || isProcessingVoice}
                  onClick={toggleVoiceRecording}
                  className={voiceRecorder.isRecording ? "bg-red-100 text-red-500 border-red-500" : ""}
                >
                  {voiceRecorder.isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {voiceRecorder.isRecording ? "Stop recording" : "Start voice input"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button type="submit" size="icon" disabled={isLoading || !input.trim() || isProcessingVoice}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIChatAssistant;
