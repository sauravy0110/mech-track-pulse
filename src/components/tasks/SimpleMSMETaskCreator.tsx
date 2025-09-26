import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Cog, Square, Circle, Link, Clock } from 'lucide-react';
import { msmeComponents, getStepsForComponent, MSMEComponent } from '@/utils/msmeComponents';
import { mockUsers } from '@/utils/mockData';

interface SimpleMSMETaskCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreate: (taskData: any) => void;
}

const categoryIcons = {
  shaft: Settings,
  gear: Cog, 
  bracket: Square,
  bushing: Circle,
  coupling: Link
};

const SimpleMSMETaskCreator: React.FC<SimpleMSMETaskCreatorProps> = ({
  isOpen,
  onClose,
  onTaskCreate
}) => {
  const [selectedComponent, setSelectedComponent] = useState<MSMEComponent | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedOperator, setAssignedOperator] = useState('');

  const operators = mockUsers.operators;

  const handleComponentSelect = (component: MSMEComponent) => {
    setSelectedComponent(component);
    setTaskTitle(`${component.name} - Production Work`);
  };

  const handleCreateTask = () => {
    if (!selectedComponent || !taskTitle || !dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const assignedTo = assignedOperator ? operators.find(op => op.id === assignedOperator) : null;
    const steps = getStepsForComponent(selectedComponent.id);

    const taskData = {
      id: `T${Date.now()}`,
      title: taskTitle,
      description: selectedComponent.description,
      component: selectedComponent,
      priority,
      dueDate,
      assignedTo: assignedTo ? { id: assignedTo.id, name: assignedTo.name, role: assignedTo.role } : null,
      status: 'pending',
      estimatedHours: selectedComponent.estimatedTime,
      completedHours: 0,
      steps: steps
    };

    onTaskCreate(taskData);
    
    // Reset form
    setSelectedComponent(null);
    setTaskTitle('');
    setPriority('medium');
    setDueDate('');
    setAssignedOperator('');
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create MSME Production Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedComponent ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Component</h3>
              <div className="grid grid-cols-1 gap-3">
                {msmeComponents.map(component => {
                  const IconComponent = categoryIcons[component.category];
                  return (
                    <Card 
                      key={component.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleComponentSelect(component)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-8 h-8 text-primary" />
                          <div className="flex-1">
                            <h4 className="font-medium">{component.name}</h4>
                            <p className="text-sm text-muted-foreground">{component.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {component.estimatedTime}h
                            </Badge>
                            <Badge variant="outline">
                              {component.skillRequirement}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Component */}
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Selected: {selectedComponent.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedComponent.description}</p>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedComponent(null)}>
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Task Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Task Title *</Label>
                  <Input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <Label>Priority *</Label>
                  <Select value={priority} onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Assign to Operator</Label>
                  <Select value={assignedOperator} onValueChange={setAssignedOperator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map(operator => (
                        <SelectItem key={operator.id} value={operator.id}>
                          {operator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateTask} className="flex-1">
                  Create Task
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleMSMETaskCreator;