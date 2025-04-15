
import { useState } from "react";
import { PartCard } from "@/components/parts/part-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
      return data;
    },
  });

  const filteredParts = parts.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
