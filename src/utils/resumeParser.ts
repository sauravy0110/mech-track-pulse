
import { supabase } from "@/integrations/supabase/client";

// List of common manufacturing skills to look for in resumes
const manufacturingSkillKeywords = [
  // Production skills
  "assembly", "production", "manufacturing", "machine operation", "cnc", "welding",
  "fabrication", "quality control", "inspection", "testing", "calibration",
  
  // Technical skills
  "engineering", "mechanical", "electrical", "automation", "robotics", 
  "plc", "cad", "cam", "3d modeling", "drafting", "design",
  
  // Quality related
  "iso", "quality assurance", "qa", "qc", "six sigma", "lean manufacturing", 
  "kaizen", "5s", "tqm", "pdca",
  
  // Supply chain
  "inventory", "logistics", "supply chain", "warehouse", "procurement",
  "material handling", "forklift", "shipping", "receiving",
  
  // Safety
  "safety", "osha", "first aid", "hazmat", "ehs", "compliance",
  
  // Software
  "erp", "mrp", "sap", "oracle", "solidworks", "autocad", "excel",
  
  // Management
  "supervision", "team lead", "project management", "scheduling",
  
  // Certifications (common in manufacturing)
  "certified", "license", "aws", "asme", "ansi", "astm"
];

/**
 * Simple resume parser that extracts potential skills from resume text
 * 
 * In a real production app, this would use a more sophisticated OCR and NLP solution
 * or a third-party API like Sovren, Affinda, or GoogleCloud Document AI
 */
export const parseResumeWithOCR = async (file: File): Promise<string> => {
  try {
    // For demonstration purposes, we're simulating OCR by reading the text content
    // of the file if it's a text-based file like PDF
    
    // In a real app, this would make a call to a Cloud Function that uses
    // a dedicated OCR service like Tesseract, Google Cloud Vision API, or Amazon Textract
    
    const fileText = await extractTextFromFile(file);
    
    // Look for skills in the extracted text
    const foundSkills = identifySkills(fileText);
    
    return foundSkills.join(", ");
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume");
  }
};

/**
 * Extract text from uploaded file
 * This is a simplified version. In production, you'd use a proper OCR service.
 */
const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For most file types, we'd need to send to a server for processing
    // Here we're just simulating successful text extraction
    const reader = new FileReader();
    
    reader.onload = () => {
      // Simulate extracted text based on file name
      // In real implementation, this would be the actual extracted text
      const fileName = file.name.toLowerCase();
      const simulatedText = `
        Manufacturing professional with 5 years of experience.
        Skills include: CNC operation, quality control, lean manufacturing,
        AutoCAD, SolidWorks, inventory management, supply chain logistics,
        ISO 9001 compliance, TPM, machine calibration, team leadership,
        project management, Excel, SAP, and safety protocols.
        Certified in OSHA standards and Six Sigma Green Belt.
      `;
      
      resolve(simulatedText);
    };
    
    reader.onerror = () => {
      reject(new Error("Could not read file"));
    };
    
    // Read as text if possible, otherwise as data URL
    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file); // This doesn't actually extract text, just simulating
    }
  });
};

/**
 * Identify manufacturing skills from text
 */
const identifySkills = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  
  // Find skills mentioned in the text
  const foundSkills = manufacturingSkillKeywords.filter(skill => 
    lowerText.includes(skill.toLowerCase())
  );
  
  // If we didn't find any skills, provide some generic ones based on the file name
  if (foundSkills.length === 0) {
    return ["manufacturing", "production", "quality control"];
  }
  
  return foundSkills;
};
