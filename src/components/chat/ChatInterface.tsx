
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    profileImage?: string;
    role: string;
  };
  timestamp: Date;
}

interface ChatInterfaceProps {
  recipient: {
    id: string;
    name: string;
    profileImage?: string;
    role: string;
    status?: "online" | "offline" | "away" | "busy";
  };
  messages: Message[];
}

const ChatInterface = ({ recipient, messages: initialMessages }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  
  const handleSendMessage = () => {
    if (!message.trim() || !user) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      timestamp: new Date(),
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-[600px] max-h-[80vh]">
      <CardHeader className="border-b py-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={recipient.profileImage} />
            <AvatarFallback className="bg-primary">
              {getInitials(recipient.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{recipient.name}</CardTitle>
            <p className="text-sm text-muted-foreground capitalize">{recipient.role}</p>
          </div>
          {recipient.status && (
            <div className="ml-auto flex items-center">
              <div 
                className={`h-2.5 w-2.5 rounded-full mr-2 ${
                  recipient.status === "online" ? "bg-success animate-pulse" : 
                  recipient.status === "away" ? "bg-warning" : 
                  recipient.status === "busy" ? "bg-info" : "bg-error"
                }`} 
              />
              <span className="text-sm capitalize">{recipient.status}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isCurrentUser = user?.id === msg.sender.id;
            
            return (
              <div 
                key={msg.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={msg.sender.profileImage} />
                      <AvatarFallback className="bg-primary text-xs">
                        {getInitials(msg.sender.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div 
                      className={`rounded-lg p-3 ${
                        isCurrentUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <CardFooter className="border-t p-4">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
