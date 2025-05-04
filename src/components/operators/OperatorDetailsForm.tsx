
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generatePassword } from "@/utils/password";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { parseResumeWithOCR } from "@/utils/resumeParser";
import { Checkbox } from "@/components/ui/checkbox";

// Array of manufacturing departments
const manufacturingDepartments = [
  { id: "production", label: "Production / Manufacturing" },
  { id: "quality", label: "Quality Control / Quality Assurance" },
  { id: "maintenance", label: "Maintenance / Engineering" },
  { id: "design", label: "Design / R&D" },
  { id: "supply_chain", label: "Supply Chain / Logistics" },
  { id: "planning", label: "Planning / Scheduling" },
  { id: "hse", label: "Health, Safety, and Environment" },
  { id: "hr", label: "Human Resources" },
  { id: "finance", label: "Finance / Accounts" },
  { id: "sales", label: "Sales & Marketing" },
  { id: "it", label: "IT / Automation / Digital Transformation" },
  { id: "support", label: "Customer Support / After-Sales Service" }
];

// Define an extended profile type with all the fields we need
interface ExtendedProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profile_image?: string | null;
  height?: string | null;
  weight?: string | null;
  emergency_contact?: string | null;
  address?: string | null;
  qualifications?: string | null;
  certifications?: string | null;
  notes?: string | null;
  status?: string | null;
  role: string;
  skills?: string | null;
  department?: string | null;
  created_at: string;
  updated_at: string;
}

// Define schema for staff details
const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Must be a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  height: z.string().optional(),
  weight: z.string().optional(),
  emergencyContact: z.string().optional(),
  address: z.string().optional(),
  qualifications: z.string().optional(),
  certifications: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["online", "offline", "away"]).default("offline"),
  department: z.string().optional(),
  skills: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface OperatorDetailsFormProps {
  operatorId?: string;
  onSuccess?: () => void;
  isEdit?: boolean;
  roleType?: "operator" | "supervisor";
}

const OperatorDetailsForm = ({ 
  operatorId, 
  onSuccess, 
  isEdit = false, 
  roleType = "operator" 
}: OperatorDetailsFormProps) => {
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeProcessing, setResumeProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const { toast } = useToast();
  
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      height: "",
      weight: "",
      emergencyContact: "",
      address: "",
      qualifications: "",
      certifications: "",
      notes: "",
      status: "offline",
      department: "",
      skills: "",
    },
  });

  useEffect(() => {
    // If editing existing staff, fetch their details
    if (isEdit && operatorId) {
      fetchStaffDetails(operatorId);
    }
  }, [operatorId, isEdit]);

  const checkEmailAvailability = async (email: string) => {
    try {
      setEmailError(null);
      
      // Check if this email already exists in the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Email exists, check if it's the same role type
        if (data.role !== roleType) {
          setEmailError(`This email is already registered as a ${data.role}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error checking email availability:", error);
      return false;
    }
  };

  const fetchStaffDetails = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        // Use type assertion to treat the data as our extended profile type
        const profile = data as ExtendedProfile;
        
        form.reset({
          name: profile.name,
          email: profile.email,
          phone: profile.phone || "",
          height: profile.height || "",
          weight: profile.weight || "",
          emergencyContact: profile.emergency_contact || "",
          address: profile.address || "",
          qualifications: profile.qualifications || "",
          certifications: profile.certifications || "",
          notes: profile.notes || "",
          status: (profile.status as any) || "offline",
          department: profile.department || "",
          skills: profile.skills || "",
        });

        if (profile.profile_image) {
          setImagePreview(profile.profile_image);
        }
        
        if (profile.department) {
          setSelectedDepartments(profile.department.split(","));
        }
      }
    } catch (error) {
      console.error("Error fetching staff details:", error);
      toast({
        title: "Error",
        description: "Failed to load staff details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeProcessing(true);
      
      try {
        // Process the resume with OCR
        const extractedSkills = await parseResumeWithOCR(file);
        
        // Update the skills field with extracted content
        if (extractedSkills) {
          form.setValue("skills", extractedSkills);
          toast({
            title: "Skills extracted",
            description: "Skills were successfully extracted from your resume",
          });
        }
      } catch (error) {
        console.error("Error processing resume:", error);
        toast({
          title: "OCR processing error",
          description: "Could not extract skills from the resume. Please enter them manually.",
          variant: "destructive",
        });
      } finally {
        setResumeProcessing(false);
      }
    }
  };

  const uploadProfileImage = async (userId: string): Promise<string | null> => {
    if (!profileImage) return null;
    
    try {
      const fileExt = profileImage.name.split('.').pop();
      const filePath = `${userId}/profile-image.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, profileImage, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      return null;
    }
  };
  
  const uploadResumeFile = async (userId: string): Promise<string | null> => {
    if (!resumeFile) return null;
    
    try {
      const fileExt = resumeFile.name.split('.').pop();
      const filePath = `${userId}/resume.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, resumeFile, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading resume:", error);
      return null;
    }
  };

  const onSubmit = async (values: StaffFormValues) => {
    setLoading(true);
    try {
      let profileImageUrl = null;
      let resumeFileUrl = null;

      // Format selected departments as comma-separated string
      const departmentsString = selectedDepartments.join(",");

      // First, check email availability
      if (!isEdit && !(await checkEmailAvailability(values.email))) {
        setLoading(false);
        return;
      }

      // Create new staff if not editing
      if (!isEdit) {
        // Generate a secure random password
        const generatedPassword = generatePassword();
        
        // Creating a new user with authentication
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: generatedPassword,
          options: {
            data: {
              name: values.name,
              role: roleType,
            },
            emailRedirectTo: window.location.origin,
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          const userId = authData.user.id;

          // Upload profile image if selected
          if (profileImage) {
            profileImageUrl = await uploadProfileImage(userId);
          }
          
          // Upload resume if selected
          if (resumeFile) {
            resumeFileUrl = await uploadResumeFile(userId);
          }

          // Update the profile with additional information
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              name: values.name,
              email: values.email,
              phone: values.phone,
              profile_image: profileImageUrl,
              height: values.height,
              weight: values.weight,
              emergency_contact: values.emergencyContact,
              address: values.address,
              qualifications: values.qualifications,
              certifications: values.certifications,
              notes: values.notes,
              status: values.status,
              department: departmentsString,
              skills: values.skills,
              role: roleType, // Make sure role is correctly set
            })
            .eq("id", userId);

          if (updateError) throw updateError;
          
          toast({
            title: "Staff account created",
            description: `An email has been sent to ${values.email} with verification instructions.`,
          });
        }
      } else if (operatorId) {
        // Update existing staff
        // Upload new profile image if selected
        if (profileImage) {
          profileImageUrl = await uploadProfileImage(operatorId);
        }
        
        // Upload resume if selected
        if (resumeFile) {
          resumeFileUrl = await uploadResumeFile(operatorId);
        }

        // Update profile with new information
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            name: values.name,
            email: values.email,
            phone: values.phone,
            profile_image: profileImageUrl || undefined, // Only update if new image uploaded
            height: values.height,
            weight: values.weight,
            emergency_contact: values.emergencyContact,
            address: values.address,
            qualifications: values.qualifications,
            certifications: values.certifications,
            notes: values.notes,
            status: values.status,
            department: departmentsString,
            skills: values.skills,
          })
          .eq("id", operatorId);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success",
        description: isEdit 
          ? `${roleType.charAt(0).toUpperCase() + roleType.slice(1)} updated successfully` 
          : `New ${roleType} added successfully`,
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving staff:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to save ${roleType} details`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle department selection
  const toggleDepartment = (departmentId: string) => {
    setSelectedDepartments(prev => {
      if (prev.includes(departmentId)) {
        return prev.filter(id => id !== departmentId);
      } else {
        return [...prev, departmentId];
      }
    });
  };

  // Validate email when it changes
  useEffect(() => {
    const email = form.watch("email");
    if (email && email.includes('@') && !isEdit) {
      const debounceTimer = setTimeout(() => {
        checkEmailAvailability(email);
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [form.watch("email"), isEdit]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={imagePreview || ""} />
              <AvatarFallback className="bg-primary text-lg">
                {form.watch("name")
                  .split(" ")
                  .map(part => part.charAt(0))
                  .join("")
                  .toUpperCase() || roleType === "operator" ? "OP" : "SV"}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute bottom-0 right-0"
              onClick={() => document.getElementById("profileImage")?.click()}
            >
              Edit
            </Button>
          </div>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {!isEdit && (
          <Alert variant="info">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A verification email will be sent to the new {roleType} when created
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name*</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    {...field} 
                    readOnly={isEdit}
                    className={emailError ? "border-red-500" : ""}
                  />
                </FormControl>
                {emailError && <FormMessage>{emailError}</FormMessage>}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number*</FormLabel>
                <FormControl>
                  <Input placeholder="123-456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input placeholder="175" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input placeholder="70" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe: 123-456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City, Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Department Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Department</h3>
          <p className="text-sm text-muted-foreground">
            Select the department(s) this {roleType} will be working in
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {manufacturingDepartments.map(department => (
              <div className="flex items-center space-x-2" key={department.id}>
                <Checkbox 
                  id={`department-${department.id}`}
                  checked={selectedDepartments.includes(department.id)}
                  onCheckedChange={() => toggleDepartment(department.id)}
                />
                <label 
                  htmlFor={`department-${department.id}`}
                  className="text-sm cursor-pointer"
                >
                  {department.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Resume Upload</h3>
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center">
              <FileText className="h-10 w-10 text-gray-400 mb-2" />
              <p className="mb-2 text-sm text-gray-500">
                Upload a resume to automatically extract skills
              </p>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('resume-upload')?.click()}
                disabled={resumeProcessing}
              >
                <Upload className="mr-2 h-4 w-4" /> 
                {resumeProcessing ? "Processing..." : "Upload Resume"}
              </Button>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
              />
              {resumeFile && (
                <p className="mt-2 text-sm text-gray-500">
                  File selected: {resumeFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter skills separated by commas (e.g. Welding, CNC Operation, Quality Inspection)" 
                  {...field}
                  className="min-h-[120px]" 
                />
              </FormControl>
              <FormDescription>
                List all relevant skills separated by commas. These will be used for task assignment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="qualifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualifications</FormLabel>
              <FormControl>
                <Textarea placeholder="List of qualifications..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certifications</FormLabel>
              <FormControl>
                <Textarea placeholder="List of certifications..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional information..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => onSuccess?.()}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !!emailError}
          >
            {loading 
              ? "Saving..." 
              : isEdit 
                ? `Update ${roleType.charAt(0).toUpperCase() + roleType.slice(1)}`
                : `Add ${roleType.charAt(0).toUpperCase() + roleType.slice(1)}`
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OperatorDetailsForm;
