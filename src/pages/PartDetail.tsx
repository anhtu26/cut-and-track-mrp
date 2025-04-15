
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartDetailTabs } from "@/components/parts/part-detail-tabs";
import { getMockPartHistory, mockParts } from "@/data/mock-data";
import { ArrowLeft, FileEdit, FileText } from "lucide-react";
import { useParams, Link } from "react-router-dom";

export default function PartDetail() {
  const { partId } = useParams();
  
  // Find the part based on ID param
  const part = mockParts.find(p => p.id === partId);
  
  // Get mock history data for this part
  const history = getMockPartHistory(partId || "");
  
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <Button variant="outline" asChild size="sm">
          <Link to="/parts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Parts
          </Link>
        </Button>
        <Button asChild>
          <Link to={`/parts/${part.id}/edit`}>
            <FileEdit className="mr-2 h-4 w-4" />
            Edit Part
          </Link>
        </Button>
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
            <div className="flex items-center">
              <Button variant="outline" size="sm" asChild>
                <a href="#" className="inline-flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PartDetailTabs 
        description={part.description}
        setupInstructions={part.setupInstructions || "No setup instructions available."}
        machiningMethods={part.machiningMethods || "No machining methods documented."}
        materials={part.materials}
        documents={part.documents}
        history={history}
      />
    </div>
  );
}
