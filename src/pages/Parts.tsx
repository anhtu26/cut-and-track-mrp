
import { useState } from "react";
import { PartCard } from "@/components/parts/part-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from '@/lib/api/client';;
import { useQuery } from "@tanstack/react-query";
import { Part } from "@/types/part";

export default function Parts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  
  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["parts", includeArchived],
    queryFn: async () => {
      const query = supabase
        .from("parts")
        .select(`
          *,
          documents:part_documents(*)
        `)
        .order('created_at', { ascending: false });

      if (!includeArchived) {
        query.eq('archived', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the database response to match our Part interface
      return data.map((item) => ({
        id: item.id,
        name: item.name,
        partNumber: item.part_number,
        description: item.description || "",
        active: item.active,
        materials: item.materials || [],
        setupInstructions: item.setup_instructions,
        machiningMethods: item.machining_methods,
        revisionNumber: item.revision_number,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        archived: item.archived,
        archivedAt: item.archived_at,
        archiveReason: item.archive_reason,
        documents: item.documents.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          url: doc.url,
          uploadedAt: doc.uploaded_at,
          type: doc.type
        }))
      })) as Part[];
    },
  });

  const filteredParts = parts.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Parts Library</h1>
        <Button asChild>
          <Link to="/parts/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Part
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parts by name, number or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIncludeArchived(!includeArchived)}
          className="whitespace-nowrap"
        >
          {includeArchived ? "Hide Archived" : "Show Archived"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p>Loading parts...</p>
        </div>
      ) : filteredParts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredParts.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-xl font-semibold">No parts found</p>
          <p className="text-muted-foreground">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}
