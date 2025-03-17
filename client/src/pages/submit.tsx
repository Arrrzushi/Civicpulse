import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertComplaintSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";

const categories = [
  { value: "workplace", label: "Workplace Harassment" },
  { value: "property", label: "Property Dispute" },
  { value: "consumer", label: "Consumer Rights" },
  { value: "discrimination", label: "Discrimination" },
  { value: "other", label: "Other Legal Matter" }
];

export default function Submit() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

  // Check for MetaMask
  if (typeof window.ethereum === "undefined") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">MetaMask Required</h2>
              <p className="text-gray-600 mb-4">
                Please install MetaMask to submit legal complaints. MetaMask is required for secure authentication and transaction signing.
              </p>
              <Button
                onClick={() => window.open("https://metamask.io/download/", "_blank")}
                className="bg-primary"
              >
                Install MetaMask
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const form = useForm({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      evidenceHash: "",
      walletAddress: window.ethereum?.selectedAddress || ""
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!window.ethereum?.selectedAddress) {
        throw new Error("Please connect your wallet first");
      }

      return await apiRequest("POST", "/api/complaints", {
        ...data,
        evidenceHash: evidenceUrl || "placeholder",
        walletAddress: window.ethereum.selectedAddress
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Legal complaint submitted successfully! You earned 10 Civic Tokens.",
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>File a Legal Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
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
                          {categories.map((category) => (
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
                          placeholder="Detailed description of your legal complaint..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Where did this occur?" {...field} />
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
                  Submit Legal Complaint
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}