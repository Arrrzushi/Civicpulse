import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AuthClient } from '@dfinity/auth-client';
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertComplaintSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { submitComplaint as submitComplaintToBlockchain } from "@/lib/icp"; // Renamed for clarity
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Loader2, AlertCircle, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Import Leaflet as ES module
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const legalCategories = [
  { value: "workplace", label: "Workplace Harassment" },
  { value: "property", label: "Property Dispute" },
  { value: "consumer", label: "Consumer Rights" },
  { value: "discrimination", label: "Discrimination" },
  { value: "other", label: "Other Legal Matter" }
];

const communityCategories = [
  { value: "infrastructure", label: "Infrastructure Issues" },
  { value: "sanitation", label: "Sanitation Problems" },
  { value: "safety", label: "Safety Concerns" },
  { value: "noise", label: "Noise Complaints" },
  { value: "other", label: "Other Community Issues" }
];

const privacyOptions = [
  { value: "private", label: "Private (Only visible to you)" },
  { value: "public", label: "Public (Visible to community)" },
  { value: "legal", label: "Legal Filing (Stored on blockchain)" }
];

export default function Submit() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [complaintType, setComplaintType] = useState<"community" | "legal">("community");
  const [aiSuggestions, setAiSuggestions] = useState<{
    urgency?: string;
    privacy?: string;
    analysis?: string;
  } | null>(null);

  const form = useForm({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      title: "",
      description: "",
      type: complaintType,
      category: "",
      location: "",
      latitude: "",
      longitude: "",
      evidenceHash: "",
      privacy: "public",
      urgency: "medium",
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && !map) {
      const container = document.getElementById('map');

      if (container) {
        const newMap = L.map(container).setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(newMap);

        newMap.on('click', (e) => {
          const { lat, lng } = e.latlng;
          setSelectedLocation({ lat, lng });
          form.setValue('latitude', lat.toString());
          form.setValue('longitude', lng.toString());
        });

        setMap(newMap);

        // Cleanup
        return () => {
          newMap.remove();
        };
      }
    }
  }, []);

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const authClient = await AuthClient.create();
      if (!authClient.isAuthenticated()) {
        throw new Error("Please connect with Internet Identity first");
      }
      
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal().toString();
      
      const formData = {
        ...data,
        evidenceHash: evidenceUrl || "placeholder",
        type: complaintType,
        walletAddress: principal
      };

      try {

        // Submit to our backend first
        const response = await apiRequest("POST", "/api/complaints", formData);

        // Submit to blockchain
        if (complaintType === 'legal') {
          await submitComplaintToBlockchain({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            location: formData.location,
            latitude: formData.latitude || "",
            longitude: formData.longitude || "",
            evidenceHash: formData.evidenceHash,
            privacy: formData.privacy,
            urgency: formData.urgency,
            aiAnalysis: aiSuggestions?.analysis,
            walletAddress: window.ethereum?.selectedAddress //Added walletAddress
          });

          toast({
            title: "ICP Transaction",
            description: "Complaint has been stored on the Internet Computer",
          });
        }

        return response;
      } catch (error) {
        if (error.message.includes("Internet Identity")) {
          throw new Error("Please ensure you're connected with Internet Identity and try again");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${complaintType === 'legal' ? 'Legal complaint' : 'Community issue'} submitted successfully! You earned 10 Civic Tokens.`,
      });
      navigate("/feed");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Submit a Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="community" onValueChange={(value) => setComplaintType(value as "community" | "legal")}>
              <TabsList className="mb-4">
                <TabsTrigger value="community">Community Issue</TabsTrigger>
                <TabsTrigger value="legal">Legal Complaint</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(async (data) => {
  try {
    await submitMutation.mutateAsync(data);
    toast({
      title: "Success",
      description: "Complaint submitted successfully",
    });
  } catch (error) {
    console.error('Submit error:', error);
    toast({
      title: "Error",
      description: "Failed to submit complaint. Please try again.",
      variant: "destructive"
    });
  }
})} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief title of your complaint..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(complaintType === 'legal' ? legalCategories : communityCategories).map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={`Detailed description of your ${complaintType === 'legal' ? 'legal complaint' : 'community issue'}...`}
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {aiSuggestions && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="mt-2 space-y-2">
                          <p><strong>AI Analysis:</strong> {aiSuggestions.analysis}</p>
                          <p><strong>Suggested Privacy:</strong> {aiSuggestions.privacy}</p>
                          <p><strong>Suggested Urgency:</strong> {aiSuggestions.urgency}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <FormLabel>Location</FormLabel>
                    <div id="map" className="w-full h-[300px] rounded-lg mb-4"></div>
                    {selectedLocation && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>Location selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</span>
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="privacy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Privacy Setting</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid gap-4 md:grid-cols-3"
                          >
                            {privacyOptions.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={option.value} />
                                <FormLabel htmlFor={option.value}>{option.label}</FormLabel>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel>Evidence Documents</FormLabel>
                    <div className="flex items-center justify-center w-full">
                      <label className="w-full cursor-pointer">
                        <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                          {evidenceUrl ? (
                            <div className="w-full h-full p-4">
                              <p className="text-sm text-green-600 text-center">
                                ✓ Evidence document uploaded
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">
                                Click or drag evidence documents to upload
                              </p>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit {complaintType === 'legal' ? 'Legal Complaint' : 'Community Issue'}
                  </Button>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}