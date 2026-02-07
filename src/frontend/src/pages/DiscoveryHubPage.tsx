import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProjectEntries, useGetAllAnalytics, useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Compass, TrendingUp, Flame, Star, ExternalLink, Award, Brain, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DiscoveryHubPage() {
  const { identity } = useInternetIdentity();
  const { data: projectEntries = [], isLoading } = useGetProjectEntries();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: analytics = [] } = useGetAllAnalytics(!!isAdmin);
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // AI-powered trending analysis with contextual scoring
  const trendingDApps = useMemo(() => {
    return projectEntries
      .map(entry => {
        const analytic = analytics.find(a => a.projectId === entry.id);
        const views = analytic ? Number(analytic.views) : 0;
        const clicks = analytic ? Number(analytic.clicks) : 0;
        
        // AI-driven engagement score with multiple factors
        let engagementScore = 0;
        if (views > 0) {
          const ctr = (clicks / views) * 100;
          engagementScore = ctr * 0.6 + (views * 0.3) + (clicks * 0.1);
        }
        
        return { entry, views, clicks, engagementScore };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5);
  }, [projectEntries, analytics]);

  // Enhanced emerging DApps with AI-powered growth potential detection
  const emergingDApps = useMemo(() => {
    const avgViews = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + Number(a.views), 0) / analytics.length 
      : 0;

    return projectEntries
      .map(entry => {
        const analytic = analytics.find(a => a.projectId === entry.id);
        const views = analytic ? Number(analytic.views) : 0;
        const clicks = analytic ? Number(analytic.clicks) : 0;
        
        // AI growth potential score
        let growthPotential = 0;
        if (views < avgViews * 0.5 && views > 0) {
          growthPotential += 50;
        }
        if (clicks > 0 && views > 0) {
          const ctr = (clicks / views) * 100;
          if (ctr > 10) growthPotential += 30;
        }
        if (views === 0 && clicks === 0) {
          growthPotential += 40; // New DApps
        }
        
        // Contextual relevance to user preferences
        if (userProfile && userProfile.preferences.length > 0) {
          const isRelevant = userProfile.preferences.some(pref => 
            entry.category.toLowerCase().includes(pref.toLowerCase())
          );
          if (isRelevant) growthPotential += 20;
        }
        
        return { entry, views, clicks, growthPotential };
      })
      .filter(item => item.growthPotential > 40)
      .sort((a, b) => b.growthPotential - a.growthPotential)
      .slice(0, 3);
  }, [projectEntries, analytics, userProfile]);

  // Leaderboard with comprehensive engagement metrics
  const leaderboard = useMemo(() => {
    return projectEntries
      .map(entry => {
        const analytic = analytics.find(a => a.projectId === entry.id);
        const views = analytic ? Number(analytic.views) : 0;
        const clicks = analytic ? Number(analytic.clicks) : 0;
        const totalEngagement = views + clicks * 2; // Weight clicks higher
        return { entry, views, clicks, totalEngagement };
      })
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 10);
  }, [projectEntries, analytics]);

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Discovery Hub Access Required</CardTitle>
            <CardDescription>Please log in to explore AI-powered trending and emerging DApps</CardDescription>
          </CardHeader>
          <CardContent>
            <Compass className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Discover the hottest DApps with AI-powered insights, track trends, and find hidden gems in the ecosystem.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Brain className="h-10 w-10 text-primary" />
          AI-Powered Discovery Hub
        </h1>
        <p className="text-muted-foreground">
          Explore trending DApps with contextual AI analysis and discover hidden gems with growth potential
        </p>
      </div>

      {/* Discovery Hub Image */}
      <div className="mb-8">
        <img 
          src="/assets/generated/discovery-hub.dim_600x400.png" 
          alt="Discovery Hub" 
          className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
        />
      </div>

      {/* AI Insights Banner */}
      <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Trending Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our AI analyzes engagement patterns, user behavior, and contextual relevance to surface the most promising DApps. 
            Recommendations are personalized based on your activity history and preferences.
          </p>
        </CardContent>
      </Card>

      {/* Trending DApps */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Trending DApps
            </CardTitle>
            <CardDescription>Most engaging DApps with AI-driven contextual scoring</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading trending DApps...</div>
            ) : trendingDApps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No trending data available yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingDApps.map(({ entry, views, clicks, engagementScore }, index) => (
                  <Card key={entry.id} className="hover:shadow-lg transition-shadow border-primary/10">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={entry.logo.getDirectURL()}
                          alt={entry.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                            <TrendingUp className="h-4 w-4 text-chart-1" />
                          </div>
                          <CardTitle className="text-base mt-1">{entry.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">AI Score:</span>
                        <span className="font-bold text-primary">{engagementScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Views:</span>
                        <span>{views}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Clicks:</span>
                        <span>{clicks}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full gap-2 mt-2"
                        onClick={() => window.open(entry.url, '_blank')}
                      >
                        Launch
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emerging DApps Spotlight with AI Growth Potential */}
      <div className="mb-8">
        <Card className="bg-gradient-to-br from-accent/10 to-chart-2/10 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Emerging DApps with Growth Potential
            </CardTitle>
            <CardDescription>AI-detected projects with high growth potential and contextual relevance</CardDescription>
          </CardHeader>
          <CardContent>
            {emergingDApps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No emerging DApps detected yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {emergingDApps.map(({ entry, views, clicks, growthPotential }) => (
                  <Card key={entry.id} className="hover:shadow-lg transition-shadow border-accent/20">
                    <CardHeader>
                      <img
                        src={entry.logo.getDirectURL()}
                        alt={entry.name}
                        className="h-16 w-16 rounded-lg object-cover mx-auto mb-2"
                      />
                      <CardTitle className="text-center text-base">{entry.name}</CardTitle>
                      <Badge variant="outline" className="capitalize mx-auto">
                        {entry.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Growth Score:</span>
                        <span className="font-bold text-accent">{growthPotential}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Views:</span>
                        <span>{views}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Clicks:</span>
                        <span>{clicks}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full gap-2 mt-2"
                        onClick={() => window.open(entry.url, '_blank')}
                      >
                        Discover
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-chart-3" />
            Engagement Leaderboard
          </CardTitle>
          <CardDescription>Top DApps ranked by comprehensive engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No leaderboard data available yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>DApp</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Engagement Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map(({ entry, views, clicks, totalEngagement }, index) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-bold">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </TableCell>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {entry.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{views}</TableCell>
                    <TableCell className="text-right">{clicks}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{totalEngagement}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
