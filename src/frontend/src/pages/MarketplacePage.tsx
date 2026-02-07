import { useState, useMemo, useCallback } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProjectEntries, useIsCallerAdmin, useTrackProjectView, useGetAllAnalytics, useGetCallerUserProfile } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, ExternalLink, TrendingUp, Star, BarChart3, ArrowUpDown } from 'lucide-react';
import DAppCard from '../components/DAppCard';
import AddDAppModal from '../components/AddDAppModal';
import AdminPanel from '../components/AdminPanel';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import RecommendationsPanel from '../components/RecommendationsPanel';
import ProfileSetupModal from '../components/ProfileSetupModal';

type SortOption = 'name-asc' | 'name-desc' | 'category-asc' | 'newest';

export default function MarketplacePage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: projectEntries = [], isLoading } = useGetProjectEntries();
  const { data: analytics = [] } = useGetAllAnalytics(!!isAdmin);
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const trackView = useTrackProjectView();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [trackedViews, setTrackedViews] = useState<Set<string>>(new Set());

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(projectEntries.map(entry => entry.category));
    return ['all', ...Array.from(cats)];
  }, [projectEntries]);

  // Track view for a project (only once per session)
  const handleTrackView = useCallback((projectId: string) => {
    if (!trackedViews.has(projectId)) {
      trackView.mutate(projectId);
      setTrackedViews(prev => new Set(prev).add(projectId));
    }
  }, [trackedViews, trackView]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projectEntries.filter(entry => {
      const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           entry.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort projects
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'category-asc':
          return a.category.localeCompare(b.category);
        case 'newest':
          // Assuming newer entries have higher IDs (simple heuristic)
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });

    return sorted;
  }, [projectEntries, searchQuery, selectedCategory, sortBy]);

  // Check if admin panel should be shown
  useMemo(() => {
    if (window.location.hash === '#admin' && isAdmin) {
      setShowAdmin(true);
    }
  }, [isAdmin]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <HeroSection />
        <FeaturesSection />
        <div className="container py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to CitizensCo CAppStores</CardTitle>
              <CardDescription>
                Please log in to explore the decentralized DApp marketplace and discover amazing Web3 applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Access thousands of DApps, track analytics, and participate in the Web3 ecosystem.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-chart-1" />
                  <span>Real-time Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-chart-2" />
                  <span>User Ratings</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-chart-3" />
                  <span>Performance Tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showAdmin && isAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <HeroSection />
      
      <div className="container py-12">
        {/* Recommendations Panel */}
        <RecommendationsPanel 
          projectEntries={projectEntries}
          analytics={analytics}
          userProfile={userProfile}
          onTrackView={handleTrackView}
        />

        {/* Search, Filter, and Sort Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search DApps by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="category-asc">Category</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
              {isAdmin && (
                <Button onClick={() => setAddModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add DApp
                </Button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredAndSortedProjects.length} of {projectEntries.length} DApps
          </div>
        </div>

        {/* DApps Grid */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-24 w-24 bg-muted rounded-lg mb-4 mx-auto" />
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedProjects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <img
                    src="/assets/generated/empty-state.dim_300x200.png"
                    alt="No DApps found"
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory !== 'all'
                      ? 'No DApps match your search criteria'
                      : 'No DApps available yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProjects.map(entry => (
                  <DAppCard key={entry.id} entry={entry} onView={handleTrackView} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="flex-row items-center gap-4">
                      <div className="h-16 w-16 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedProjects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <img
                    src="/assets/generated/empty-state.dim_300x200.png"
                    alt="No DApps found"
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory !== 'all'
                      ? 'No DApps match your search criteria'
                      : 'No DApps available yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedProjects.map(entry => {
                  // Track view for list items too
                  if (!trackedViews.has(entry.id)) {
                    handleTrackView(entry.id);
                  }
                  
                  return (
                    <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="flex-row items-center gap-4">
                        <img
                          src={entry.logo.getDirectURL()}
                          alt={entry.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{entry.name}</CardTitle>
                            <Badge variant="outline" className="capitalize">
                              {entry.category}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {entry.description}
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={async () => {
                            try {
                              await trackView.mutateAsync(entry.id);
                            } catch (error) {
                              console.error('Failed to track click:', error);
                            }
                            window.open(entry.url, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          Launch
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {addModalOpen && <AddDAppModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />}
      {showProfileSetup && <ProfileSetupModal />}
    </div>
  );
}
