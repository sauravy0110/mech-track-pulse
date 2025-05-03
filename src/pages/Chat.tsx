
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "@/components/chat/ChatInterface";
import AIChatAssistant from "@/components/chat/AIChatAssistant";
import { useToast } from "@/components/ui/use-toast";

// Mock data for team chat
const mockRecipient = {
  id: "team-chat",
  name: "Team Chat",
  role: "group",
  status: "online" as const,
};

const mockMessages = [
  {
    id: "1",
    content: "Welcome to the team chat! Ask questions or share updates here.",
    sender: {
      id: "system",
      name: "System",
      role: "system",
    },
    timestamp: new Date(),
  },
];

const Chat = () => {
  const { toast } = useToast();
  const [teamChatMessages, setTeamChatMessages] = useState(mockMessages);
  
  useEffect(() => {
    toast({
      title: "AI Assistant Available",
      description: "Try our new AI assistant to get help with the application!",
    });
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Chat</h1>
      
      <Tabs defaultValue="team" className="h-[calc(100vh-12rem)]">
        <TabsList className="mb-4">
          <TabsTrigger value="team">Team Chat</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>
        
        <TabsContent value="team" className="h-full">
          <ChatInterface 
            recipient={mockRecipient} 
            messages={teamChatMessages} 
          />
        </TabsContent>
        
        <TabsContent value="ai" className="h-full">
          <AIChatAssistant />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Chat;
