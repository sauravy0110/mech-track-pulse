// MSME Component Library for Production Tracking
export interface MSMEComponent {
  id: string;
  name: string;
  category: 'shaft' | 'gear' | 'bracket' | 'bushing' | 'coupling';
  description: string;
  standardSteps: ComponentStep[];
  commonErrors: string[];
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
  commonErrors: string[];
  preventiveTips: string[];
  requiredTools: string[];
  qualityChecks: string[];
}

export const msmeComponents: MSMEComponent[] = [
  {
    id: 'shaft_001',
    name: 'Main Drive Shaft',
    category: 'shaft',
    description: 'Primary rotating shaft for power transmission in mechanical systems',
    estimatedTime: 4,
    skillRequirement: 'intermediate',
    commonErrors: ['Misalignment', 'Improper torque specs', 'Bearing damage'],
    standardSteps: [
      {
        id: 'shaft_001_step_1',
        stepNumber: 1,
        title: 'Pre-inspection and Setup',
        description: 'Initial inspection and preparation of work area',
        instructions: [
          'Clear work area and ensure proper lighting',
          'Gather all required tools and safety equipment',
          'Inspect shaft for visible damage or wear',
          'Check reference drawings and specifications'
        ],
        safetyNotes: ['Wear safety glasses', 'Ensure proper lifting equipment available'],
        estimatedMinutes: 30,
        riskLevel: 'low',
        commonErrors: ['Skipping visual inspection', 'Missing safety equipment'],
        preventiveTips: ['Always use checklist', 'Double-check tool availability'],
        requiredTools: ['Calipers', 'Torque wrench', 'Alignment tools'],
        qualityChecks: ['Visual inspection complete', 'All tools present']
      },
      {
        id: 'shaft_001_step_2',
        stepNumber: 2,
        title: 'Bearing Installation',
        description: 'Install bearings with proper alignment and torque',
        instructions: [
          'Heat bearings to proper temperature (80-100°C)',
          'Apply appropriate lubricant to bearing seats',
          'Install bearings using hydraulic press',
          'Check alignment using dial indicators'
        ],
        safetyNotes: ['Use heat-resistant gloves', 'Ensure press safety guards in place'],
        estimatedMinutes: 45,
        riskLevel: 'high',
        commonErrors: ['Overheating bearings', 'Improper alignment', 'Cross-threading'],
        preventiveTips: ['Monitor temperature closely', 'Use proper press tooling', 'Check alignment twice'],
        requiredTools: ['Hydraulic press', 'Bearing heater', 'Dial indicator'],
        qualityChecks: ['Bearing temperature verified', 'Alignment within 0.05mm']
      },
      {
        id: 'shaft_001_step_3',
        stepNumber: 3,
        title: 'Final Assembly and Testing',
        description: 'Complete assembly and perform operational tests',
        instructions: [
          'Install shaft in housing with proper clearances',
          'Apply specified torque to all fasteners',
          'Perform rotation test and check for binding',
          'Verify all measurements against specifications'
        ],
        safetyNotes: ['Lock out power during testing', 'Ensure proper guarding'],
        estimatedMinutes: 60,
        riskLevel: 'medium',
        commonErrors: ['Incorrect torque values', 'Missing lubrication', 'Improper clearances'],
        preventiveTips: ['Use calibrated torque wrench', 'Follow lubrication chart', 'Document all measurements'],
        requiredTools: ['Torque wrench', 'Feeler gauges', 'Lubricants'],
        qualityChecks: ['Torque values verified', 'Smooth rotation confirmed', 'Clearances checked']
      }
    ]
  },
  {
    id: 'gear_001',
    name: 'Helical Gear Assembly',
    category: 'gear',
    description: 'Precision helical gear for power transmission applications',
    estimatedTime: 6,
    skillRequirement: 'advanced',
    commonErrors: ['Tooth damage', 'Backlash issues', 'Improper mesh'],
    standardSteps: [
      {
        id: 'gear_001_step_1',
        stepNumber: 1,
        title: 'Gear Inspection and Preparation',
        description: 'Thorough inspection of gear teeth and mounting surfaces',
        instructions: [
          'Inspect all gear teeth for chips, cracks, or wear',
          'Check mounting surfaces for flatness and finish',
          'Verify gear specifications against drawings',
          'Clean all surfaces with appropriate solvents'
        ],
        safetyNotes: ['Use proper ventilation with solvents', 'Handle gears carefully to prevent damage'],
        estimatedMinutes: 45,
        riskLevel: 'low',
        commonErrors: ['Missing damaged teeth', 'Improper cleaning', 'Wrong gear selected'],
        preventiveTips: ['Use magnifying glass for inspection', 'Follow cleaning procedures', 'Double-check part numbers'],
        requiredTools: ['Magnifying glass', 'Surface plate', 'Cleaning solvents'],
        qualityChecks: ['All teeth inspected', 'Surfaces clean and ready']
      },
      {
        id: 'gear_001_step_2',
        stepNumber: 2,
        title: 'Gear Mesh Setup',
        description: 'Set proper gear mesh and backlash',
        instructions: [
          'Position gears with proper center distance',
          'Check backlash using feeler gauges',
          'Adjust shim thickness as required',
          'Verify contact pattern using marking compound'
        ],
        safetyNotes: ['Secure gears during adjustment', 'Use proper lifting equipment'],
        estimatedMinutes: 90,
        riskLevel: 'high',
        commonErrors: ['Incorrect backlash', 'Poor contact pattern', 'Misalignment'],
        preventiveTips: ['Use precision measuring tools', 'Check pattern at multiple positions', 'Document all adjustments'],
        requiredTools: ['Feeler gauges', 'Shims', 'Marking compound', 'Calipers'],
        qualityChecks: ['Backlash within specification', 'Contact pattern verified']
      }
    ]
  },
  {
    id: 'bracket_001',
    name: 'Motor Mounting Bracket',
    category: 'bracket',
    description: 'Steel mounting bracket for electric motor installation',
    estimatedTime: 2,
    skillRequirement: 'basic',
    commonErrors: ['Improper hole alignment', 'Inadequate surface prep'],
    standardSteps: [
      {
        id: 'bracket_001_step_1',
        stepNumber: 1,
        title: 'Bracket Fabrication',
        description: 'Cut, drill, and prepare mounting bracket',
        instructions: [
          'Cut bracket material to specified dimensions',
          'Drill mounting holes to drawing specifications',
          'Deburr all edges and holes',
          'Apply primer and paint as required'
        ],
        safetyNotes: ['Wear safety glasses when cutting/drilling', 'Use proper ventilation for painting'],
        estimatedMinutes: 90,
        riskLevel: 'medium',
        commonErrors: ['Incorrect hole spacing', 'Poor surface finish', 'Missing deburring'],
        preventiveTips: ['Use drill press for accuracy', 'Check dimensions twice', 'Follow paint procedures'],
        requiredTools: ['Drill press', 'Measuring tools', 'Deburring tools'],
        qualityChecks: ['Dimensions verified', 'Surface finish acceptable']
      }
    ]
  },
  {
    id: 'bushing_001',
    name: 'Bronze Sleeve Bushing',
    category: 'bushing',
    description: 'Bronze bearing bushing for rotating shaft applications',
    estimatedTime: 3,
    skillRequirement: 'intermediate',
    commonErrors: ['Improper fit', 'Surface damage during installation'],
    standardSteps: [
      {
        id: 'bushing_001_step_1',
        stepNumber: 1,
        title: 'Bushing Installation',
        description: 'Install bronze bushing with proper fit and finish',
        instructions: [
          'Verify bushing and housing dimensions',
          'Apply appropriate lubricant to surfaces',
          'Press bushing into housing using proper tooling',
          'Ream to final size if required'
        ],
        safetyNotes: ['Use proper press tooling', 'Secure workpiece adequately'],
        estimatedMinutes: 60,
        riskLevel: 'high',
        commonErrors: ['Bushing damage during press fit', 'Incorrect clearances', 'Poor lubrication'],
        preventiveTips: ['Use gradual pressing force', 'Check fit frequently', 'Apply lubricant evenly'],
        requiredTools: ['Hydraulic press', 'Reamer set', 'Measuring tools'],
        qualityChecks: ['Fit verified', 'Surface finish acceptable']
      }
    ]
  },
  {
    id: 'coupling_001',
    name: 'Flexible Coupling',
    category: 'coupling',
    description: 'Flexible coupling for shaft-to-shaft connection',
    estimatedTime: 2.5,
    skillRequirement: 'intermediate',
    commonErrors: ['Misalignment', 'Improper torque application'],
    standardSteps: [
      {
        id: 'coupling_001_step_1',
        stepNumber: 1,
        title: 'Coupling Installation',
        description: 'Install and align flexible coupling',
        instructions: [
          'Check shaft dimensions and coupling bore',
          'Install coupling halves on respective shafts',
          'Check alignment using laser alignment tool',
          'Torque fasteners to specification'
        ],
        safetyNotes: ['Lock out power systems', 'Use proper alignment procedures'],
        estimatedMinutes: 75,
        riskLevel: 'high',
        commonErrors: ['Poor alignment', 'Incorrect torque values', 'Missing keyways'],
        preventiveTips: ['Use laser alignment tools', 'Follow torque sequence', 'Double-check keyway engagement'],
        requiredTools: ['Laser alignment tool', 'Torque wrench', 'Feeler gauges'],
        qualityChecks: ['Alignment within tolerance', 'Torque values verified']
      }
    ]
  }
];

export const getComponentByCategory = (category: MSMEComponent['category']): MSMEComponent[] => {
  return msmeComponents.filter(component => component.category === category);
};

export const getComponentById = (id: string): MSMEComponent | undefined => {
  return msmeComponents.find(component => component.id === id);
};

export const getStepById = (componentId: string, stepId: string): ComponentStep | undefined => {
  const component = getComponentById(componentId);
  return component?.standardSteps.find(step => step.id === stepId);
};