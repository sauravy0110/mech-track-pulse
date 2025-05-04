
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

// Define schema for operator details
const operatorSchema = z.object({
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
});

type OperatorFormValues = z.infer<typeof operatorSchema>;

interface OperatorDetailsFormProps {
  operatorId?: string;
  onSuccess?: () => void;
  isEdit?: boolean;
}

const OperatorDetailsForm = ({ operatorId, onSuccess, isEdit = false }: OperatorDetailsFormProps) => {
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<OperatorFormValues>({
    resolver: zodResolver(operatorSchema),
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
    },
  });

  useEffect(() => {
    // If editing existing operator, fetch their details
    if (isEdit && operatorId) {
      fetchOperatorDetails(operatorId);
    }
  }, [operatorId, isEdit]);

  const fetchOperatorDetails = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          height: data.height || "",
          weight: data.weight || "",
          emergencyContact: data.emergency_contact || "",
          address: data.address || "",
          qualifications: data.qualifications || "",
          certifications: data.certifications || "",
          notes: data.notes || "",
          status: data.status as any || "offline",
        });

        if (data.profile_image) {
          setImagePreview(data.profile_image);
        }
      }
    } catch (error) {
      console.error("Error fetching operator details:", error);
      toast({
        title: "Error",
        description: "Failed to load operator details",
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

  const onSubmit = async (values: OperatorFormValues) => {
    setLoading(true);
    try {
      let profileImageUrl = null;

      // Create new operator if not editing
      if (!isEdit) {
        // Creating a new user with authentication
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: "tempPassword123", // This should be randomly generated or requested
          options: {
            data: {
              name: values.name,
              role: "operator",
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          const userId = authData.user.id;

          // Upload profile image if selected
          if (profileImage) {
            profileImageUrl = await uploadProfileImage(userId);
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
            })
            .eq("id", userId);

          if (updateError) throw updateError;
        }
      } else if (operatorId) {
        // Update existing operator
        // Upload new profile image if selected
        if (profileImage) {
          profileImageUrl = await uploadProfileImage(operatorId);
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
          })
          .eq("id", operatorId);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success",
        description: isEdit ? "Operator updated successfully" : "New operator added successfully",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving operator:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save operator details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                  .toUpperCase() || "OP"}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
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
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Operator" : "Add Operator"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OperatorDetailsForm;
