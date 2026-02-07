import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ExternalLink, Brain } from 'lucide-react';
import { ProjectEntry, AnalyticsEntry, UserProfile } from '../backend';
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
      const views = analytic ? Number(analytic.views) : 0;
      const clicks = analytic ? Number(analytic.clicks) : 0;

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

      // AI Factor 2: Personalized user preference matching with activity history
      if (userProfile && userProfile.preferences.length > 0) {
        const categoryMatch = userProfile.preferences.some(pref => 
          entry.category.toLowerCase().includes(pref.toLowerCase()) ||
          pref.toLowerCase().includes(entry.category.toLowerCase()) ||
          entry.name.toLowerCase().includes(pref.toLowerCase()) ||
          entry.description.toLowerCase().includes(pref.toLowerCase())
        );
        if (categoryMatch) {
          score += 40;
          reasons.push('Matches your interests');
        }
      }

      // AI Factor 3: Emerging DApp detection (new with growth potential)
      if (!analytic || (views === 0 && clicks === 0)) {
        score += 45;
        reasons.push('New arrival');
      } else if (views > 0 && views < 50) {
        score += 30;
        reasons.push('Emerging');
      }

      // AI Factor 4: Hidden gem identification (low engagement but quality indicators)
      if (views > 0 && clicks > 0 && clicks / views < 0.1 && views < avgViews) {
        score += 35;
        reasons.push('Hidden gem');
      }

      // AI Factor 5: Trending analysis (recent growth patterns)
      if (views > avgViews * 0.3 && clicks > 0) {
        score += 25;
        reasons.push('Gaining traction');
      }

      // AI Factor 6: Category diversity (promote variety)
      const userViewedCategories = new Set<string>();
      analytics.forEach(a => {
        const project = projectEntries.find(p => p.id === a.projectId);
        if (project && Number(a.views) > 0) {
          userViewedCategories.add(project.category);
        }
      });
      
      if (!userViewedCategories.has(entry.category)) {
        score += 20;
        reasons.push('Explore new category');
      }

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

  const handleLaunch = async (projectId: string, url: string) => {
    try {
      await trackClick.mutateAsync(projectId);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
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
          Personalized DApp suggestions based on your preferences and activity history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map(({ entry, reason }) => {
            // Track view when recommendation is shown
            if (onTrackView) {
              onTrackView(entry.id);
            }

            return (
              <Card key={entry.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={entry.logo.getDirectURL()}
                      alt={entry.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{entry.name}</CardTitle>
                      <Badge variant="outline" className="capitalize text-xs mt-1">
                        {entry.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>{reason}</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => handleLaunch(entry.id, entry.url)}
                    disabled={trackClick.isPending}
                  >
                    Explore
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
