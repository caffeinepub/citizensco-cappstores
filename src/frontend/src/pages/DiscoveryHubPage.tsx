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
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: analytics = [] } = useGetAllAnalytics();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // AI-powered trending analysis with contextual scoring
  const trendingDApps = useMemo(() => {
    if (projectEntries.length === 0) return [];
    
    return projectEntries
      .map(entry => {
        const analytic = analytics.find(a => a.projectId === entry.id);
        const views = analytic ? Number(analytic.views) : Number(entry.views);
        const clicks = analytic ? Number(analytic.clicks) : Number(entry.clicks);
        
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
    if (projectEntries.length === 0) return [];
    
    const avgViews = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + Number(a.views), 0) / analytics.length 
      : 0;

    return projectEntries
      .map(entry => {
        const analytic = analytics.find(a => a.projectId === entry.id);
        const views = analytic ? Number(analytic.views) : Number(entry.views);
        const clicks = analytic ? Number(analytic.clicks) : Number(entry.clicks);
        
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
        
        return { entry, views, clicks, growthPotential };
      })
      .filter(item => item.growthPotential > 40)
      .sort((a, b) => b.growthPotential - a.growthPotential)
      .slice(0, 3);
  }, [projectEntries, analytics]);

  // Leaderboard with comprehensive engagement metrics
  const leaderboard = useMemo(() => {
    if (projectEntries.length === 0) return [];
    
    return projectEntries
      .map(entry => {
        const analytic = analytics.find(a => a.projectId === entry.id);
        const views = analytic ? Number(analytic.views) : Number(entry.views);
        const clicks = analytic ? Number(analytic.clicks) : Number(entry.clicks);
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
          <Compass className="h-10 w-10 text-primary" />
          Discovery Hub
        </h1>
        <p className="text-muted-foreground">AI-powered insights into trending and emerging DApps</p>
      </div>

      {isLoading || adminLoading ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading discovery insights...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Trending DApps */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Trending DApps</CardTitle>
              </div>
              <CardDescription>Most engaging DApps based on AI-powered contextual analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {trendingDApps.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No trending data available yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingDApps.map(({ entry, views, clicks, engagementScore }) => (
                    <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Star className="h-6 w-6 text-primary" />
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
                        <p className="text-sm text-muted-foreground line-clamp-2">{entry.description}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Views</span>
                          <span className="font-medium">{views}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Clicks</span>
                          <span className="font-medium">{clicks}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-bold text-primary">{engagementScore.toFixed(1)}</span>
                        </div>
                        <Button
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => console.log('Explore DApp:', entry.name)}
                        >
                          Explore
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emerging DApps */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <CardTitle>Emerging DApps</CardTitle>
              </div>
              <CardDescription>Hidden gems with high growth potential detected by AI</CardDescription>
            </CardHeader>
            <CardContent>
              {emergingDApps.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No emerging DApps detected yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {emergingDApps.map(({ entry, growthPotential }) => (
                    <Card key={entry.id} className="hover:shadow-lg transition-shadow border-orange-500/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Flame className="h-6 w-6 text-orange-500" />
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
                        <p className="text-sm text-muted-foreground line-clamp-2">{entry.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-orange-500" />
                          <span className="text-muted-foreground">Growth Potential:</span>
                          <span className="font-bold text-orange-500">{growthPotential}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => console.log('Discover DApp:', entry.name)}
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

          {/* Engagement Leaderboard */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <CardTitle>Engagement Leaderboard</CardTitle>
              </div>
              <CardDescription>Top DApps ranked by total engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No engagement data available yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>DApp</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map(({ entry, views, clicks, totalEngagement }, index) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-bold">
                          {index === 0 && <span className="text-yellow-500">🥇</span>}
                          {index === 1 && <span className="text-gray-400">🥈</span>}
                          {index === 2 && <span className="text-orange-600">🥉</span>}
                          {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                        </TableCell>
                        <TableCell className="font-medium">{entry.name}</TableCell>
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
      )}
    </div>
  );
}
