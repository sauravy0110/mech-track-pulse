
// Mock data for frontend development

// Define strong typing for user status
export type UserStatus = "online" | "offline" | "away" | "busy";
export type TaskStatus = "pending" | "in-progress" | "completed" | "delayed";
export type TaskPriority = "high" | "medium" | "low";

// User types with unique ID prefixes
export const mockUsers = {
  operators: [
    { 
      id: "O123456789", 
      name: "John Smith", 
      email: "john@mechtrack.com", 
      role: "operator",
      status: "online" as UserStatus,
      performanceScore: 85,
      skillScore: 78,
      currentTask: "Engine maintenance for Client #C102",
      progress: 75,
      profileImage: undefined,
    },
    { 
      id: "O234567890", 
      name: "Sarah Lee", 
      email: "sarah@mechtrack.com", 
      role: "operator",
      status: "offline" as UserStatus,
      performanceScore: 92,
      skillScore: 85,
      currentTask: null,
      profileImage: undefined,
    },
    { 
      id: "O345678901", 
      name: "Michael Chen", 
      email: "michael@mechtrack.com", 
      role: "operator",
      status: "away" as UserStatus,
      performanceScore: 79,
      skillScore: 90,
      currentTask: "Hydraulic system repair for Client #C105",
      progress: 45,
      profileImage: undefined,
    },
    { 
      id: "O456789012", 
      name: "Lisa Rodriguez", 
      email: "lisa@mechtrack.com", 
      role: "operator",
      status: "online" as UserStatus,
      performanceScore: 88,
      skillScore: 82,
      currentTask: "Transmission diagnostics for Client #C110",
      progress: 30,
      profileImage: undefined,
    },
  ],
  
  supervisors: [
    { id: "S123456789", name: "David Johnson", email: "david@mechtrack.com", role: "supervisor" },
    { id: "S234567890", name: "Emily Wong", email: "emily@mechtrack.com", role: "supervisor" },
  ],
  
  clients: [
    { id: "C123456789", name: "Acme Manufacturing", email: "contact@acme.com", role: "client" },
    { id: "C234567890", name: "Globex Industries", email: "info@globex.com", role: "client" },
    { id: "C345678901", name: "Stark Enterprises", email: "orders@stark.com", role: "client" },
  ],
  
  owners: [
    { id: "O923456789", name: "Robert Miller", email: "robert@mechtrack.com", role: "owner" },
  ],
};

// Tasks
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours: number;
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  } | null;
  clientId?: string;
  completedHours?: number;
}

export const mockTasks = [
  {
    id: "T001",
    title: "Engine overhaul for industrial generator",
    description: "Complete engine overhaul for 500kW industrial diesel generator. Replace worn components and perform full diagnostics.",
    assignedTo: { id: "O123456789", name: "John Smith", role: "operator" },
    status: "in-progress" as TaskStatus,
    dueDate: "2025-05-05",
    priority: "high" as TaskPriority,
    clientId: "C123456789",
    estimatedHours: 16,
    completedHours: 12,
  },
  {
    id: "T002",
    title: "Hydraulic system maintenance",
    description: "Inspect and service hydraulic pumps, valves, and actuators. Replace hydraulic fluid and filters.",
    assignedTo: { id: "O345678901", name: "Michael Chen", role: "operator" },
    status: "in-progress" as TaskStatus,
    dueDate: "2025-05-07",
    priority: "medium" as TaskPriority,
    clientId: "C234567890",
    estimatedHours: 8,
    completedHours: 3,
  },
  {
    id: "T003",
    title: "CNC machine calibration",
    description: "Perform precision calibration on CNC milling machine. Adjust parameters and run test cycles.",
    assignedTo: { id: "O234567890", name: "Sarah Lee", role: "operator" },
    status: "pending" as TaskStatus,
    dueDate: "2025-05-10",
    priority: "medium" as TaskPriority,
    clientId: "C345678901",
    estimatedHours: 6,
    completedHours: 0,
  },
  {
    id: "T004",
    title: "Compressor repair and testing",
    description: "Diagnose and repair industrial air compressor. Replace seals and test under load.",
    status: "pending" as TaskStatus,
    dueDate: "2025-05-12",
    priority: "low" as TaskPriority,
    clientId: "C123456789",
    estimatedHours: 5,
    completedHours: 0,
  },
  {
    id: "T005",
    title: "Emergency generator servicing",
    description: "Urgent maintenance required for backup generator system at main facility.",
    assignedTo: { id: "O456789012", name: "Lisa Rodriguez", role: "operator" },
    status: "delayed" as TaskStatus,
    dueDate: "2025-05-01",
    priority: "high" as TaskPriority,
    clientId: "C345678901",
    estimatedHours: 4,
    completedHours: 1,
  },
];

// Chat messages
export const mockMessages = [
  {
    id: "1",
    content: "How's the progress on the hydraulic system repair?",
    sender: { id: "S123456789", name: "David Johnson", role: "supervisor" },
    timestamp: new Date(Date.now() - 36000000), // 10 hours ago
  },
  {
    id: "2",
    content: "I've replaced the faulty valve and am now testing the pressure system.",
    sender: { id: "O345678901", name: "Michael Chen", role: "operator" },
    timestamp: new Date(Date.now() - 35700000), // 9 hours 55 minutes ago
  },
  {
    id: "3",
    content: "Great. Any issues with parts or equipment?",
    sender: { id: "S123456789", name: "David Johnson", role: "supervisor" },
    timestamp: new Date(Date.now() - 35400000), // 9 hours 50 minutes ago
  },
  {
    id: "4",
    content: "We need to order more hydraulic fluid filters. Current stock is low.",
    sender: { id: "O345678901", name: "Michael Chen", role: "operator" },
    timestamp: new Date(Date.now() - 35100000), // 9 hours 45 minutes ago
  },
  {
    id: "5",
    content: "I'll put in the order right away. When do you expect to finish?",
    sender: { id: "S123456789", name: "David Johnson", role: "supervisor" },
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
  },
  {
    id: "6",
    content: "Should be done by end of day if no other issues come up.",
    sender: { id: "O345678901", name: "Michael Chen", role: "operator" },
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
  },
];

// Attendance records
export const mockAttendance = [
  {
    id: "A001",
    userId: "O123456789",
    userName: "John Smith",
    checkIn: new Date(Date.now() - 28800000), // 8 hours ago
    checkOut: null,
    status: "checked-in",
  },
  {
    id: "A002",
    userId: "O345678901",
    userName: "Michael Chen",
    checkIn: new Date(Date.now() - 21600000), // 6 hours ago
    checkOut: null,
    status: "checked-in",
  },
  {
    id: "A003",
    userId: "O456789012",
    userName: "Lisa Rodriguez",
    checkIn: new Date(Date.now() - 14400000), // 4 hours ago
    checkOut: null,
    status: "checked-in",
  },
  {
    id: "A004",
    userId: "O234567890",
    userName: "Sarah Lee",
    checkIn: new Date(Date.now() - 28800000), // 8 hours ago
    checkOut: new Date(Date.now() - 3600000), // 1 hour ago
    status: "checked-out",
  },
];

// Client orders/projects
export const mockProjects = [
  {
    id: "P001",
    clientId: "C123456789",
    clientName: "Acme Manufacturing",
    title: "Production Line Machinery Maintenance",
    description: "Quarterly maintenance of all production line machinery",
    status: "in-progress",
    startDate: "2025-04-20",
    endDate: "2025-05-10",
    progress: 65,
    tasks: ["T001", "T004"],
  },
  {
    id: "P002",
    clientId: "C234567890",
    clientName: "Globex Industries",
    title: "Hydraulic Press System Upgrade",
    description: "Upgrade hydraulic systems on 3 press machines",
    status: "in-progress",
    startDate: "2025-04-25",
    endDate: "2025-05-15",
    progress: 40,
    tasks: ["T002"],
  },
  {
    id: "P003",
    clientId: "C345678901",
    clientName: "Stark Enterprises",
    title: "CNC Machinery Installation",
    description: "Install and calibrate new CNC machinery",
    status: "pending",
    startDate: "2025-05-08",
    endDate: "2025-05-20",
    progress: 0,
    tasks: ["T003", "T005"],
  },
];

// Performance metrics
export const mockPerformanceMetrics = {
  operators: [
    {
      userId: "O123456789",
      userName: "John Smith",
      metrics: {
        tasksCompleted: 124,
        onTimeCompletion: 92,
        averageTaskTime: 5.2, // hours
        clientFeedback: 4.8, // out of 5
        offAppTime: 12, // minutes per day average
      }
    },
    {
      userId: "O234567890",
      userName: "Sarah Lee",
      metrics: {
        tasksCompleted: 98,
        onTimeCompletion: 95,
        averageTaskTime: 4.8,
        clientFeedback: 4.9,
        offAppTime: 8,
      }
    },
    {
      userId: "O345678901",
      userName: "Michael Chen",
      metrics: {
        tasksCompleted: 112,
        onTimeCompletion: 85,
        averageTaskTime: 6.1,
        clientFeedback: 4.5,
        offAppTime: 15,
      }
    },
    {
      userId: "O456789012",
      userName: "Lisa Rodriguez",
      metrics: {
        tasksCompleted: 87,
        onTimeCompletion: 90,
        averageTaskTime: 5.5,
        clientFeedback: 4.7,
        offAppTime: 10,
      }
    },
  ],
  
  overall: {
    taskCompletionRate: 88, // percentage
    clientSatisfaction: 4.7, // out of 5
    averageProjectDelay: 1.2, // days
    resourceUtilization: 82, // percentage
  }
};
