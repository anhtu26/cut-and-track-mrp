
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive, Clock, File, Pencil, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Part } from "@/types/part";

interface PartCardProps {
  part: Part;
}

export function PartCard({ part }: PartCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1 text-left mr-2">
            {part.name}
          </CardTitle>
          <div className="flex flex-col gap-1">
            <Badge variant={part.active ? "default" : "outline"}>
              {part.active ? "Active" : "Inactive"}
            </Badge>
            {part.archived && (
              <Badge variant="destructive">Archived</Badge>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <Tag className="h-3.5 w-3.5" />
          <span>{part.partNumber}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <Clock className="h-3.5 w-3.5" />
          <span>Last updated: {new Date(part.updatedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <File className="h-3.5 w-3.5" />
          <span>{part.revisionNumber ? `Rev ${part.revisionNumber}` : 'No revision'}</span>
        </div>
        {part.archived && part.archiveReason && (
          <div className="text-sm text-destructive flex items-center gap-1 mb-4">
            <Archive className="h-3.5 w-3.5" />
            <span className="line-clamp-1">Archived: {part.archiveReason}</span>
          </div>
        )}
        <p className="text-sm line-clamp-3 text-left">{part.description}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/parts/${part.id}`}>View Details</Link>
        </Button>
        {!part.archived && (
          <Button asChild variant="outline" size="icon">
            <Link to={`/parts/${part.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
