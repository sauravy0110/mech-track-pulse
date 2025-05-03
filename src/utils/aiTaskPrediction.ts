
import { Task, mockUsers } from "./mockData";

// Simple scoring model to recommend operators for tasks
export const recommendOperatorForTask = (task: Task) => {
  // In a real app, this would use ML/AI model using historical data
  // Here we'll simulate using a simple scoring algorithm
  
  const operators = mockUsers.operators;
  const scores: {operatorId: string, name: string, score: number}[] = [];
  
  operators.forEach(operator => {
    let score = 0;
    
    // Factor 1: Skill score (higher is better)
    if (operator.skillScore) {
      score += operator.skillScore * 0.5;
    }
    
    // Factor 2: Performance score (higher is better)
    if (operator.performanceScore) {
      score += operator.performanceScore * 0.3;
    }
    
    // Factor 3: Availability (not currently assigned to a task is better)
    if (!operator.currentTask) {
      score += 15; // Bonus for availability
    } else {
      score -= 10; // Penalty for being occupied
    }
    
    // Factor 4: Task complexity match (simulation)
    // In a real app, this would compare task requirements with operator skills
    const taskComplexityScore = task.priority === "high" ? 3 : (task.priority === "medium" ? 2 : 1);
    const operatorComplexityFit = Math.abs(((operator.skillScore || 0) / 20) - taskComplexityScore);
    score -= operatorComplexityFit * 5; // Penalty for mismatched complexity
    
    scores.push({
      operatorId: operator.id,
      name: operator.name,
      score: Math.round(score)
    });
  });
  
  // Sort by highest score first
  return scores.sort((a, b) => b.score - a.score);
};

// Generate AI insights about task and operator performance
export const generatePerformanceInsights = () => {
  // This would normally analyze real historical data
  // For demo purposes, we'll return pre-defined insights
  const insights = [
    "Operator John Smith completes high-priority tasks 15% faster than average.",
    "Tasks assigned to Michael Chen are often delayed when they involve hydraulic systems.",
    "Sarah Lee has the highest client satisfaction rating for electrical maintenance tasks.",
    "Routine maintenance tasks are being completed 10% slower in the last month.",
    "Lisa Rodriguez specializes in CNC calibration with 30% higher efficiency."
  ];
  
  // Return a random insight
  return insights[Math.floor(Math.random() * insights.length)];
};
