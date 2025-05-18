
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { apiClient } from '@/lib/api/client';;
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface ArchivePartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  partId: string;
  partName: string;
}

export function ArchivePartDialog({ isOpen, onClose, partId, partName }: ArchivePartDialogProps) {
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleArchive = async () => {
    try {
      const { error } = await supabase
        .from("parts")
        .update({
          archived: true,
          archived_at: new Date().toISOString(),
          archive_reason: reason,
        })
        .eq("id", partId);

      if (error) throw error;

      toast({
        title: "Part archived",
        description: `${partName} has been archived successfully.`,
      });
      
      navigate("/parts");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive part. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Part</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to archive {partName}? This will make the part inactive and preserve its current state.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Enter reason for archiving (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive}>Archive Part</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
