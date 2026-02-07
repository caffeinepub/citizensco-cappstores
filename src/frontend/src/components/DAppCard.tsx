import { ProjectEntry } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Star } from 'lucide-react';
import { useTrackProjectClick } from '../hooks/useQueries';
import { useEffect } from 'react';

interface DAppCardProps {
  entry: ProjectEntry;
  onView?: (projectId: string) => void;
}

export default function DAppCard({ entry, onView }: DAppCardProps) {
  const trackClick = useTrackProjectClick();

  useEffect(() => {
    // Track view when card is rendered
    if (onView) {
      onView(entry.id);
    }
  }, [entry.id, onView]);

  const handleLaunch = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Track click
    try {
      await trackClick.mutateAsync(entry.id);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
    
    // Open in new tab
    window.open(entry.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="mb-4 relative">
          <img
            src={entry.logo.getDirectURL()}
            alt={entry.name}
            className="h-24 w-24 rounded-lg object-cover mx-auto group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{entry.name}</CardTitle>
          <Badge variant="outline" className="capitalize shrink-0">
            {entry.category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-3 min-h-[3.75rem]">
          {entry.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span>Rating coming soon</span>
        </div>
        <Button 
          onClick={handleLaunch}
          disabled={trackClick.isPending}
          className="w-full gap-2"
        >
          {trackClick.isPending ? 'Launching...' : 'Launch DApp'}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
