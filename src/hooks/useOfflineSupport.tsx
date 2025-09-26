import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface OfflineTask {
  id: string;
  action: 'create' | 'update' | 'complete';
  data: any;
  timestamp: number;
}

interface OfflineSupport {
  isOnline: boolean;
  pendingTasks: OfflineTask[];
  queueTask: (task: OfflineTask) => void;
  syncPendingTasks: () => Promise<void>;
  clearPendingTasks: () => void;
}

export const useOfflineSupport = (): OfflineSupport => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingTasks, setPendingTasks] = useState<OfflineTask[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load pending tasks from localStorage on init
    const savedTasks = localStorage.getItem('offline-pending-tasks');
    if (savedTasks) {
      try {
        setPendingTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error loading offline tasks:', error);
      }
    }

    // Set up online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Connection restored. Syncing pending changes...",
      });
      // Auto-sync when coming back online
      setTimeout(() => {
        syncPendingTasks();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "You're now offline. Changes will be saved and synced when reconnected.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Save pending tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('offline-pending-tasks', JSON.stringify(pendingTasks));
  }, [pendingTasks]);

  const queueTask = (task: OfflineTask) => {
    setPendingTasks(prev => [...prev, task]);
    
    if (!isOnline) {
      toast({
        title: "Task Queued",
        description: "Task saved offline. Will sync when connection is restored.",
      });
    }
  };

  const syncPendingTasks = async () => {
    if (pendingTasks.length === 0) return;

    try {
      toast({
        title: "Syncing Data",
        description: `Syncing ${pendingTasks.length} pending tasks...`,
      });

      // Simulate API calls to sync pending tasks
      // In a real implementation, this would send each task to the server
      for (const task of pendingTasks) {
        console.log('Syncing task:', task);
        // await apiCall(task);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Clear pending tasks after successful sync
      setPendingTasks([]);
      localStorage.removeItem('offline-pending-tasks');

      toast({
        title: "Sync Complete",
        description: "All offline changes have been synchronized.",
      });

    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Some changes couldn't be synced. Will retry later.",
        variant: "destructive",
      });
    }
  };

  const clearPendingTasks = () => {
    setPendingTasks([]);
    localStorage.removeItem('offline-pending-tasks');
  };

  return {
    isOnline,
    pendingTasks,
    queueTask,
    syncPendingTasks,
    clearPendingTasks
  };
};