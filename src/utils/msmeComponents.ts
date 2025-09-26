// MSME Component Library for Production Tracking
export interface MSMEComponent {
  id: string;
  name: string;
  category: 'shaft' | 'gear' | 'bracket' | 'bushing' | 'coupling';
  description: string;
  estimatedTime: number; // in hours
  skillRequirement: 'basic' | 'intermediate' | 'advanced';
}

export interface ComponentStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  instructions: string[];
  safetyNotes: string[];
  estimatedMinutes: number;
  riskLevel: 'low' | 'medium' | 'high';
  requiredTools: string[];
}

// Simplified component data to avoid compilation issues
export const msmeComponents: MSMEComponent[] = [
  {
    id: 'shaft_001',
    name: 'Main Drive Shaft',
    category: 'shaft',
    description: 'Primary rotating shaft for power transmission',
    estimatedTime: 4,
    skillRequirement: 'intermediate',
  },
  {
    id: 'gear_001',
    name: 'Helical Gear Assembly', 
    category: 'gear',
    description: 'Precision helical gear for power transmission',
    estimatedTime: 6,
    skillRequirement: 'advanced',
  },
  {
    id: 'bracket_001',
    name: 'Motor Mounting Bracket',
    category: 'bracket', 
    description: 'Steel mounting bracket for electric motor',
    estimatedTime: 2,
    skillRequirement: 'basic',
  }
];

// Simplified step data
export const getStepsForComponent = (componentId: string): ComponentStep[] => {
  const baseSteps: ComponentStep[] = [
    {
      id: `${componentId}_step_1`,
      stepNumber: 1,
      title: 'Pre-inspection and Setup',
      description: 'Initial inspection and preparation',
      instructions: [
        'Clear work area and ensure proper lighting',
        'Gather required tools and safety equipment', 
        'Inspect component for damage or wear'
      ],
      safetyNotes: ['Wear safety glasses', 'Ensure proper ventilation'],
      estimatedMinutes: 30,
      riskLevel: 'low',
      requiredTools: ['Calipers', 'Torque wrench', 'Safety equipment']
    },
    {
      id: `${componentId}_step_2`, 
      stepNumber: 2,
      title: 'Main Assembly Work',
      description: 'Primary assembly operations',
      instructions: [
        'Follow component-specific procedures',
        'Apply proper torque specifications',
        'Check alignment and clearances'
      ],
      safetyNotes: ['Use proper lifting techniques', 'Secure all tooling'],
      estimatedMinutes: 60,
      riskLevel: 'medium',
      requiredTools: ['Hydraulic press', 'Measuring tools', 'Lubricants']
    },
    {
      id: `${componentId}_step_3`,
      stepNumber: 3, 
      title: 'Final Testing and Documentation',
      description: 'Complete testing and quality verification',
      instructions: [
        'Perform operational tests',
        'Verify all specifications',
        'Document completion and measurements'
      ],
      safetyNotes: ['Lock out power during testing', 'Follow test procedures'],
      estimatedMinutes: 45,
      riskLevel: 'low',
      requiredTools: ['Test equipment', 'Documentation forms']
    }
  ];
  
  return baseSteps;
};

export const getComponentById = (id: string): MSMEComponent | undefined => {
  return msmeComponents.find(component => component.id === id);
};