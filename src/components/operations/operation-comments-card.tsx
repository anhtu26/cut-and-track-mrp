
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OperationCommentsCardProps {
  comments: string;
}

export function OperationCommentsCard({ comments }: OperationCommentsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap">{comments}</div>
      </CardContent>
    </Card>
  );
}
