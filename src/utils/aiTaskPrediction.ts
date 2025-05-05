
import { Task, mockUsers } from "./mockData";

interface Operator {
  id: string;
  name: string;
  status?: string;
  skills?: string | null;
  department?: string | null;
  currentTask?: string | null;
  skillScore?: number;
  performanceScore?: number;
}

// Simple scoring model to recommend operators for tasks
export const recommendOperatorForTask = async (task: Task) => {
  try {
    // In a real implementation, this would use a more sophisticated AI model
    // Here we'll use the task's required_skills to match against operators' skills
    
    // Fetch real operators from the database
    const { data: operators, error } = await fetch("/api/operators").then(res => res.json());
    
    if (error) {
      console.error("Error fetching operators:", error);
      // Fallback to mock data if API fails
      return recommendOperatorsWithMockData(task);
    }
    
    const scores: {operatorId: string, name: string, score: number}[] = [];
    
    // Use task.required_skills if it exists (as any because the Task interface might not have it yet)
    const requiredSkills = (task as any).required_skills ? 
      (task as any).required_skills.toLowerCase().split(",").map((s: string) => s.trim()) : 
      [];
      
    operators.forEach((operator: Operator) => {
      let score = 0;
      
      // Factor 1: Skill match (most important)
      if (operator.skills && requiredSkills.length > 0) {
        const operatorSkills = operator.skills.toLowerCase().split(",").map(s => s.trim());
        const matchingSkills = requiredSkills.filter(skill => 
          operatorSkills.some(opSkill => opSkill.includes(skill) || skill.includes(opSkill))
        );
        
        // High score for matching skills
        score += (matchingSkills.length / requiredSkills.length) * 50;
      }
      
      // Factor 2: Skill score (higher is better)
      if (operator.skillScore) {
        score += operator.skillScore * 0.5;
      }
      
      // Factor 3: Performance score (higher is better)
      if (operator.performanceScore) {
        score += operator.performanceScore * 0.3;
      }
      
      // Factor 4: Availability (not currently assigned to a task is better)
      if (!operator.currentTask) {
        score += 15; // Bonus for availability
      } else {
        score -= 10; // Penalty for being occupied
      }
      
      // Factor 5: Task priority compatibility
      const taskPriorityScore = task.priority === "high" ? 3 : (task.priority === "medium" ? 2 : 1);
      const operatorComplexityFit = Math.abs(((operator.skillScore || 0) / 20) - taskPriorityScore);
      score -= operatorComplexityFit * 5; // Penalty for mismatched complexity
      
      // Factor 6: Status (online is better)
      if (operator.status === "online") {
        score += 10;
      } else if (operator.status === "away") {
        score -= 5;
      }
      
      scores.push({
        operatorId: operator.id,
        name: operator.name,
        score: Math.round(score)
      });
    });
    
    // Sort by highest score first
    return scores.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error("Error in AI assignment:", error);
    // Fallback to mock data
    return recommendOperatorsWithMockData(task);
  }
};

// Fallback function using mock data
const recommendOperatorsWithMockData = (task: Task) => {
  // Use the existing mock implementation
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
    "Lisa Rodriguez specializes in CNC calibration with 30% higher efficiency.",
    "Operators with welding certifications complete manufacturing tasks 20% faster.",
    "Quality control specialists perform better on inspection tasks than general operators.",
    "Maintenance tasks are completed more efficiently by teams with mixed skill sets.",
    "Operators with 5+ years of experience have 40% fewer quality issues."
  ];
  
  // Return a random insight
  return insights[Math.floor(Math.random() * insights.length)];
};
