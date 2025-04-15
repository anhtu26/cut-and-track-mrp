import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartDetailTabs } from "@/components/parts/part-detail-tabs";
import { getMockPartHistory, mockParts } from "@/data/mock-data";
import { ArrowLeft, Archive, FileEdit } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArchivePartDialog } from "@/components/parts/archive-part-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Part } from "@/types/part";

export default function PartDetail() {
  const { partId } = useParams();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const { data: part, isLoading } = useQuery({
    queryKey: ["part", partId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parts")
        .select(`
          *,
          documents:part_documents(*)
        `)
        .eq("id", partId)
        .single();

      if (error) throw error;
      
      // Transform the database response to match our Part interface
      return {
        id: data.id,
        name: data.name,
        partNumber: data.part_number,
        description: data.description || "",
        active: data.active,
        materials: data.materials || [],
        setupInstructions: data.setup_instructions,
        machiningMethods: data.machining_methods,
        revisionNumber: data.revision_number,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        archived: data.archived,
        archivedAt: data.archived_at,
        archiveReason: data.archive_reason,
        documents: data.documents.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          url: doc.url,
          uploadedAt: doc.uploaded_at,
          type: doc.type
        }))
      } as Part;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!part) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Part Not Found</h1>
        <p className="text-muted-foreground mb-6">The part you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link to="/parts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Parts
          </Link>
        </Button>
      </div>
    );
  }

  const history = getMockPartHistory(partId || "");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <Button variant="outline" asChild size="sm">
          <Link to="/parts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Parts
          </Link>
        </Button>
        <div className="flex gap-2">
          {!part.archived && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowArchiveDialog(true)}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive Part
              </Button>
              <Button asChild>
                <Link to={`/parts/${part.id}/edit`}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit Part
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <CardTitle className="text-2xl">{part.name}</CardTitle>
              <p className="text-muted-foreground mt-1">Part Number: {part.partNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={part.active ? "default" : "outline"}>
                {part.active ? "Active" : "Inactive"}
              </Badge>
              {part.archived && (
                <Badge variant="destructive">Archived</Badge>
              )}
              {part.revisionNumber && (
                <Badge variant="outline" className="ml-2">
                  Rev {part.revisionNumber}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm">{new Date(part.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm">{new Date(part.updatedAt).toLocaleDateString()}</p>
            </div>
            {part.archived && part.archivedAt && (
              <div>
                <p className="text-sm font-medium text-destructive">Archived</p>
                <p className="text-sm">{new Date(part.archivedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          {part.archived && part.archiveReason && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Archive Reason:</p>
              <p className="text-sm mt-1">{part.archiveReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <PartDetailTabs 
        description={part.description}
        setupInstructions={part.setupInstructions || "No setup instructions available."}
        machiningMethods={part.machiningMethods || "No machining methods documented."}
        materials={part.materials || []}
        documents={part.documents}
        history={history}
      />

      <ArchivePartDialog
        isOpen={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        partId={part.id}
        partName={part.name}
      />
    </div>
  );
}
