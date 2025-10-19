import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubmitToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubmitToolDialog = ({ open, onOpenChange }: SubmitToolDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    websiteUrl: "",
    repoUrl: "",
    pricing: "",
    category: "",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a tool.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      
      const { error } = await supabase.from("tools").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        website_url: formData.websiteUrl,
        repo_url: formData.repoUrl || null,
        pricing: formData.pricing,
        category_id: null, // Will be mapped by admin
        tags: tagsArray,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your tool has been submitted for review.",
      });

      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        websiteUrl: "",
        repoUrl: "",
        pricing: "",
        category: "",
        tags: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit a Tool</DialogTitle>
          <DialogDescription>
            Share a tool with the community. It will be reviewed before being published.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tool Name *</Label>
            <Input
              id="title"
              placeholder="e.g., Notion"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what the tool does..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL *</Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://example.com"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repoUrl">Repository URL (Optional)</Label>
            <Input
              id="repoUrl"
              type="url"
              placeholder="https://github.com/username/repo"
              value={formData.repoUrl}
              onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricing">Pricing *</Label>
            <Select value={formData.pricing} onValueChange={(value) => setFormData({ ...formData, pricing: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select pricing model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Freemium">Freemium</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Usage-based">Usage-based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated) *</Label>
            <Input
              id="tags"
              placeholder="e.g., Notes, Docs, Collaboration"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">Separate tags with commas</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Tool
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
