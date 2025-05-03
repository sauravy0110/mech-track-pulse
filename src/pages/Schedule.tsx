
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  user_id: string | null;
  task_id: string | null;
  user?: {
    name: string;
  } | null;
}

interface ScheduleUser {
  name: string;
}

const Schedule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        
        // First, fetch schedule entries
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('schedule')
          .select('*')
          .order('start_time', { ascending: true });
        
        if (scheduleError) throw scheduleError;
        
        // Then, for each schedule entry with a user_id, fetch the user's name
        if (scheduleData) {
          const eventsWithUserNames: ScheduleEvent[] = await Promise.all(
            scheduleData.map(async (event) => {
              if (event.user_id) {
                const { data: userData, error: userError } = await supabase
                  .from('profiles')
                  .select('name')
                  .eq('id', event.user_id)
                  .single();
                
                return {
                  ...event,
                  user: userError ? null : userData as ScheduleUser
                };
              }
              
              return {
                ...event,
                user: null
              };
            })
          );
          
          setScheduleEvents(eventsWithUserNames);
        }
      } catch (error: any) {
        console.error('Error fetching schedule:', error);
        toast({
          title: "Error fetching schedule",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedule();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('schedule-changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'schedule' },
        (payload) => {
          fetchSchedule();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  // Group events by date
  const groupedEvents = scheduleEvents.reduce((groups: Record<string, ScheduleEvent[]>, event) => {
    const date = new Date(event.start_time).toDateString();
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(event);
    return groups;
  }, {});

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all scheduled events
        </p>
      </div>
      
      <div className="flex justify-end mb-6">
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Add New Event
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-[250px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex items-start space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(groupedEvents).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, events]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle>{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start border-l-4 border-primary pl-4 pb-4">
                      <div className="mr-4 flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </span>
                          {event.user && (
                            <span className="flex items-center">
                              <Users className="mr-1 h-3 w-3" />
                              {event.user.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No scheduled events</h3>
            <p className="text-muted-foreground text-center mt-2">
              There are no events scheduled. Create a new event to get started.
            </p>
            <Button className="mt-4">
              <Calendar className="mr-2 h-4 w-4" />
              Add New Event
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Schedule;
