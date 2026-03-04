import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { useEffect } from "react";
import type { ProjectEntry } from "../backend";
import { useTrackProjectClick } from "../hooks/useQueries";

interface DAppCardProps {
  entry: ProjectEntry;
  onView: (projectId: string) => void;
}

export default function DAppCard({ entry, onView }: DAppCardProps) {
  const trackClick = useTrackProjectClick();

  useEffect(() => {
    onView(entry.id);
  }, [entry.id, onView]);

  const handleLaunch = async () => {
    try {
      await trackClick.mutateAsync(entry.id);
    } catch (error) {
      console.error("Failed to track click:", error);
    }
    // Backend ProjectEntry doesn't have url field yet
    // For now, just show a message
    console.log("Launch DApp:", entry.name);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">{entry.name}</CardTitle>
          <Badge variant="outline" className="capitalize">
            DApp
          </Badge>
        </div>
        <CardDescription className="line-clamp-3">
          {entry.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>{Number(entry.views)} views</span>
          <span>{Number(entry.clicks)} clicks</span>
        </div>
        <Button
          className="w-full gap-2"
          onClick={handleLaunch}
          disabled={trackClick.isPending}
        >
          Launch
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
