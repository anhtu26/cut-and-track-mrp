
import { useState } from "react";
import { PartCard } from "@/components/parts/part-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockParts } from "@/data/mock-data";
import { PlusCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Parts() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredParts = mockParts.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.description.toLowerCase().includes(searchTerm.toLowerCase())
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search parts by name, number or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredParts.length > 0 ? (
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
