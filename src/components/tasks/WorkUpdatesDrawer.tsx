
import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge"; 
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import VoiceRecorder from "@/components/common/VoiceRecorder";

interface WorkUpdatesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

interface WorkUpdate {
  id: string;
  operator_id: string;
  image_url: string;
  comment: string | null;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  supervisor_feedback: string | null;
  operator_name: string | null; 
}

const WorkUpdatesDrawer = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
}: WorkUpdatesDrawerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workUpdates, setWorkUpdates] = useState<WorkUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedUpdate, setSelectedUpdate] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchWorkUpdates();
    }
  }, [isOpen, taskId]);

  // Set up realtime subscription for work updates
  useEffect(() => {
    if (!taskId) return;
    
    const channel = supabase
      .channel('work-updates-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'work_updates',
          filter: `task_id=eq.${taskId}` 
        }, 
        () => {
          console.log('Work update changed, refreshing data...');
          fetchWorkUpdates();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  const fetchWorkUpdates = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      console.log(`Fetching work updates for task ${taskId}...`);
      // First, get all work updates for this task
      const { data: updates, error: updatesError } = await supabase
        .from("work_updates")
        .select(`
          id, 
          operator_id, 
          image_url, 
          comment, 
          submitted_at, 
          status, 
          supervisor_feedback
        `)
        .eq("task_id", taskId)
        .order("submitted_at", { ascending: false });

      if (updatesError) {
        console.error("Error fetching work updates:", updatesError);
        setFetchError("Failed to load updates. Please try again.");
        throw updatesError;
      }
      
      if (!updates || updates.length === 0) {
        console.log("No updates found for this task");
        setWorkUpdates([]);
        return;
      }
      
      console.log(`Found ${updates.length} work updates`);
      
      // For each update, get the operator name from the profiles table
      const updatesWithOperatorNames = await Promise.all(
        updates.map(async (update) => {
          const { data: operatorData, error: operatorError } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", update.operator_id)
            .single();

          if (operatorError) {
            console.error("Error fetching operator name:", operatorError);
            return {
              ...update,
              operator_name: null,
              status: update.status as 'pending' | 'approved' | 'rejected'
            };
          }

          return {
            ...update,
            operator_name: operatorData?.name || null,
            status: update.status as 'pending' | 'approved' | 'rejected'
          };
        })
      );
      
      setWorkUpdates(updatesWithOperatorNames);
    } catch (error) {
      console.error("Error in fetchWorkUpdates:", error);
      setFetchError("Could not load work updates. Please try again.");
      toast({
        title: "Failed to load updates",
        description: "Could not load work updates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = (text: string) => {
    setFeedback((prev) => prev ? `${prev} ${text}` : text);
  };

  const handleUpdateStatus = async (updateId: string, newStatus: 'approved' | 'rejected') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to perform this action.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      console.log(`Updating work update ${updateId} to status ${newStatus}...`);
      
      const { data, error } = await supabase
        .from("work_updates")
        .update({
          status: newStatus,
          supervisor_feedback: feedback || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", updateId)
        .select();
        
      if (error) {
        console.error("Error updating work status:", error);
        throw error;
      }
      
      console.log("Update successful:", data);
      
      toast({
        title: newStatus === 'approved' ? "Update Approved" : "Update Rejected",
        description: "The work update status has been changed successfully.",
      });
      
      // Update local state to avoid refetching
      setWorkUpdates(prev => prev.map(update => 
        update.id === updateId 
          ? { ...update, status: newStatus, supervisor_feedback: feedback || null }
          : update
      ));
      
      setFeedback("");
      setSelectedUpdate(null);
    } catch (error) {
      console.error("Error updating work status:", error);
      toast({
        title: "Update failed",
        description: "Failed to update the work status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from("work_updates").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleRetry = () => {
    fetchWorkUpdates();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-center">
          <DrawerTitle>Work Progress Updates</DrawerTitle>
          <DrawerDescription>{taskTitle}</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-150px)]">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : fetchError ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{fetchError}</p>
              <Button onClick={handleRetry} variant="outline">Retry</Button>
            </div>
          ) : workUpdates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No work updates have been submitted for this task yet.
            </div>
          ) : (
            <div className="space-y-6">
              {workUpdates.map(update => (
                <div key={update.id} className="border rounded-lg overflow-hidden bg-background">
                  <div className="p-3 bg-muted/30 border-b flex justify-between items-center">
                    <div>
                      <span className="font-medium">
                        {update.operator_name || "Unknown Operator"}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(update.submitted_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div>
                      {update.status === 'pending' ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
                      ) : update.status === 'approved' ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-0">
                    <img 
                      src={getImageUrl(update.image_url)} 
                      alt="Work progress" 
                      className="w-full h-auto max-h-80 object-contain"
                      onError={(e) => {
                        console.error("Image failed to load:", update.image_url);
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                        (e.target as HTMLImageElement).alt = "Image unavailable";
                      }}
                    />
                  </div>
                  
                  {update.comment && (
                    <div className="px-4 py-3 border-t">
                      <p className="text-sm">{update.comment}</p>
                    </div>
                  )}
                  
                  {update.supervisor_feedback && (
                    <div className="px-4 py-3 border-t bg-muted/20">
                      <p className="text-xs font-medium mb-1">Supervisor Feedback:</p>
                      <p className="text-sm">{update.supervisor_feedback}</p>
                    </div>
                  )}
                  
                  {update.status === 'pending' && (
                    <div className="p-4 border-t">
                      {selectedUpdate === update.id ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Add feedback (optional)"
                              className="resize-none flex-1"
                              rows={2}
                            />
                            <div className="self-start">
                              <VoiceRecorder onTranscriptionComplete={handleVoiceInput} disabled={submitting} />
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedUpdate(null);
                                setFeedback("");
                              }}
                            >
                              Cancel
                            </Button>
                            <div className="space-x-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={submitting}
                                onClick={() => handleUpdateStatus(update.id, 'rejected')}
                              >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                                Needs Work
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={submitting}
                                onClick={() => handleUpdateStatus(update.id, 'approved')}
                              >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedUpdate(update.id)}
                        >
                          Review Update
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default WorkUpdatesDrawer;
