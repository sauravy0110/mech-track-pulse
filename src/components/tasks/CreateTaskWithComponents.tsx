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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Cog, 
  Square, 
  Circle, 
  Link,
  Clock,
  Calendar,
  Flag,
  User
} from 'lucide-react';
import { msmeComponents, MSMEComponent, getComponentByCategory } from '@/utils/msmeComponents';
import { mockUsers } from '@/utils/mockData';

interface CreateTaskWithComponentsProps {
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

const CreateTaskWithComponents: React.FC<CreateTaskWithComponentsProps> = ({
  isOpen,
  onClose,
  onTaskCreate
}) => {
  const [selectedComponent, setSelectedComponent] = useState<MSMEComponent | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedOperator, setAssignedOperator] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const operators = mockUsers.operators;

  const handleComponentSelect = (component: MSMEComponent) => {
    setSelectedComponent(component);
    setTaskTitle(`${component.name} - ${component.category.charAt(0).toUpperCase() + component.category.slice(1)} Work`);
    setTaskDescription(component.description);
  };

  const handleCreateTask = () => {
    if (!selectedComponent || !taskTitle || !dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const assignedTo = assignedOperator ? operators.find(op => op.id === assignedOperator) : null;

    const taskData = {
      id: `T${Date.now()}`,
      title: taskTitle,
      description: taskDescription,
      component: selectedComponent,
      priority,
      dueDate,
      assignedTo: assignedTo ? { id: assignedTo.id, name: assignedTo.name, role: assignedTo.role } : null,
      additionalInstructions,
      status: 'pending',
      estimatedHours: selectedComponent.estimatedTime,
      completedHours: 0,
      steps: selectedComponent.standardSteps
    };

    onTaskCreate(taskData);
    
    // Reset form
    setSelectedComponent(null);
    setTaskTitle('');
    setTaskDescription('');
    setPriority('medium');
    setDueDate('');
    setAssignedOperator('');
    setAdditionalInstructions('');
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task with MSME Components</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Component Selection */}
          {!selectedComponent ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Component Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(
                  msmeComponents.reduce((acc, component) => {
                    if (!acc[component.category]) acc[component.category] = [];
                    acc[component.category].push(component);
                    return acc;
                  }, {} as Record<string, MSMEComponent[]>)
                ).map(([category, components]) => {
                  const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
                  return (
                    <div key={category}>
                      <h4 className="font-medium mb-2 flex items-center gap-2 capitalize">
                        <IconComponent className="w-4 h-4" />
                        {category}s
                      </h4>
                      {components.map(component => (
                        <Card 
                          key={component.id}
                          className="cursor-pointer hover:shadow-md transition-shadow mb-2"
                          onClick={() => handleComponentSelect(component)}
                        >
                          <CardContent className="p-4">
                            <h5 className="font-medium">{component.name}</h5>
                            <p className="text-sm text-muted-foreground mb-2">{component.description}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                <Clock className="w-3 h-3 mr-1" />
                                {component.estimatedTime}h
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={
                                  component.skillRequirement === 'advanced' ? 'border-red-500 text-red-500' :
                                  component.skillRequirement === 'intermediate' ? 'border-orange-500 text-orange-500' :
                                  'border-green-500 text-green-500'
                                }
                              >
                                {component.skillRequirement}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Task Configuration */
            <div className="space-y-6">
              {/* Selected Component Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900">Selected Component</h3>
                      <p className="text-blue-800">{selectedComponent.name}</p>
                      <p className="text-sm text-blue-600 mt-1">{selectedComponent.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="border-blue-300">
                          {selectedComponent.standardSteps.length} steps
                        </Badge>
                        <Badge variant="outline" className="border-blue-300">
                          {selectedComponent.estimatedTime}h estimated
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedComponent(null)}
                      className="border-blue-300"
                    >
                      Change Component
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Task Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="taskTitle">Task Title *</Label>
                    <Input
                      id="taskTitle"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={priority} onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4 text-red-500" />
                            High Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4 text-orange-500" />
                            Medium Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4 text-green-500" />
                            Low Priority
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assignedOperator">Assign to Operator</Label>
                    <Select value={assignedOperator} onValueChange={setAssignedOperator}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map(operator => (
                          <SelectItem key={operator.id} value={operator.id}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {operator.name} (Skill: {operator.skillScore})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="taskDescription">Task Description</Label>
                    <Textarea
                      id="taskDescription"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Describe the task requirements"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="additionalInstructions">Additional Instructions</Label>
                <Textarea
                  id="additionalInstructions"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="Any special instructions or modifications to standard procedures"
                  rows={3}
                />
              </div>

              {/* Step Preview */}
              <div>
                <h4 className="font-semibold mb-3">Standard Steps Preview ({selectedComponent.standardSteps.length} steps)</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedComponent.standardSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <span className="font-medium text-sm">Step {step.stepNumber}:</span>
                      <span className="text-sm">{step.title}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          step.riskLevel === 'high' ? 'border-red-500 text-red-500' :
                          step.riskLevel === 'medium' ? 'border-orange-500 text-orange-500' :
                          'border-green-500 text-green-500'
                        }
                      >
                        {step.riskLevel}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {step.estimatedMinutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateTask} className="flex-1">
                  Create Task with {selectedComponent.standardSteps.length} Steps
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

export default CreateTaskWithComponents;