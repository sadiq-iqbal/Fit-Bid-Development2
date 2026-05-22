import { useState } from "react";
import { useGetEngagementMessages, getGetEngagementMessagesQueryKey, useSendMessage } from "@workspace/api-client-react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@workspace/replit-auth-web";

export default function MessagesTab({ engagementId }: { engagementId: number }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const sendMessage = useSendMessage();
  
  const { data: messagesResponse, isLoading, refetch } = useGetEngagementMessages(engagementId, { limit: 50 }, {
    query: { enabled: !!engagementId, queryKey: getGetEngagementMessagesQueryKey(engagementId, { limit: 50 }) }
  });

  const handleSend = () => {
    if (!content.trim()) return;
    
    sendMessage.mutate({
      engagementId,
      data: { content }
    }, {
      onSuccess: () => {
        setContent("");
        refetch();
      }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const messages = messagesResponse?.messages || [];

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.slice().reverse().map((msg, i) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <div className="text-xs opacity-70 mb-1">{msg.senderName}</div>
                  <div className="text-sm">{msg.content}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="p-4 border-t flex gap-2">
        <Input 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={sendMessage.isPending || !content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}