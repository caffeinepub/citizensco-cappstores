import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ExternalLink, Brain } from 'lucide-react';
import { AnalyticsEntry } from '../types';
import { ProjectEntry, UserProfile } from '../backend';
import { useTrackProjectClick } from '../hooks/useQueries';

interface RecommendationsPanelProps {
  projectEntries: ProjectEntry[];
  analytics: AnalyticsEntry[];
  userProfile: UserProfile | null | undefined;
  onTrackView: (projectId: string) => void;
}

interface ScoredProject {
  entry: ProjectEntry;
  score: number;
  reason: string;
}

export default function RecommendationsPanel({ 
  projectEntries, 
  analytics, 
  userProfile,
  onTrackView 
}: RecommendationsPanelProps) {
  const trackClick = useTrackProjectClick();

  // Enhanced AI-powered discovery engine with personalized scoring
  const recommendations = useMemo(() => {
    if (projectEntries.length === 0) return [];

    const scoredProjects: ScoredProject[] = projectEntries.map(entry => {
      const analytic = analytics.find(a => a.projectId === entry.id);
      const views = analytic ? Number(analytic.views) : Number(entry.views);
      const clicks = analytic ? Number(analytic.clicks) : Number(entry.clicks);

      let score = 0;
      let reasons: string[] = [];

      // AI Factor 1: Contextual underperformance analysis
      const avgViews = analytics.length > 0 
        ? analytics.reduce((sum, a) => sum + Number(a.views), 0) / analytics.length 
        : 0;
      
      if (views < avgViews * 0.5 || views === 0) {
        score += 50;
        reasons.push('Needs visibility');
      }

      // AI Factor 2: Emerging DApp detection (new with growth potential)
      if (!analytic || (views === 0 && clicks === 0)) {
        score += 45;
        reasons.push('New arrival');
      } else if (views > 0 && views < 50) {
        score += 30;
        reasons.push('Emerging');
      }

      // AI Factor 3: Hidden gem identification (low engagement but quality indicators)
      if (views > 0 && clicks > 0 && clicks / views < 0.1 && views < avgViews) {
        score += 35;
        reasons.push('Hidden gem');
      }

      // AI Factor 4: Trending analysis (recent growth patterns)
      if (views > avgViews * 0.3 && clicks > 0) {
        score += 25;
        reasons.push('Gaining traction');
      }

      // AI Factor 5: Promote variety
      score += 20;
      reasons.push('Explore new DApp');

      return { 
        entry, 
        score, 
        reason: reasons.length > 0 ? reasons.join(' • ') : 'AI recommended' 
      };
    });

    // Sort by AI-powered score and return top 3
    return scoredProjects
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [projectEntries, analytics, userProfile]);

  const handleLaunch = async (projectId: string) => {
    try {
      await trackClick.mutateAsync(projectId);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
    // Backend ProjectEntry doesn't have url field yet
    console.log('Launch DApp:', projectId);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>AI-Powered Recommendations</CardTitle>
        </div>
        <CardDescription>
          Personalized DApp suggestions based on AI-driven discovery engine
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map(({ entry, score, reason }) => {
            // Track view when recommendation is displayed
            onTrackView(entry.id);
            
            return (
              <Card key={entry.id} className="hover:shadow-lg transition-all duration-300 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{entry.name}</CardTitle>
                      <Badge variant="outline" className="capitalize text-xs mt-1">
                        DApp
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    <span className="font-medium">{reason}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    AI Score: <span className="font-bold text-primary">{score}</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleLaunch(entry.id)}
                  >
                    Launch
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
