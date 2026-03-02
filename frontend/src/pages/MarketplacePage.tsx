import { useState, useMemo, useCallback } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetProjectEntries,
  useIsCallerAdmin,
  useTrackProjectView,
  useGetAllAnalytics,
  useGetCallerUserProfile,
} from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, TrendingUp, Star, BarChart3, ArrowUpDown } from 'lucide-react';
import DAppCard from '../components/DAppCard';
import AddDAppModal from '../components/AddDAppModal';
import AdminPanel from '../components/AdminPanel';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import RecommendationsPanel from '../components/RecommendationsPanel';
import ProfileSetupModal from '../components/ProfileSetupModal';

type SortOption = 'name-asc' | 'name-desc' | 'newest';

export default function MarketplacePage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: projectEntries = [], isLoading } = useGetProjectEntries();
  const { data: analytics = [] } = useGetAllAnalytics();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const trackView = useTrackProjectView();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [trackedViews, setTrackedViews] = useState<Set<string>>(new Set());

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleTrackView = useCallback(
    (projectId: string) => {
      if (!trackedViews.has(projectId)) {
        trackView.mutate(projectId);
        setTrackedViews((prev) => new Set(prev).add(projectId));
      }
    },
    [trackedViews, trackView]
  );

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = projectEntries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });
  }, [projectEntries, searchQuery, sortBy]);

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
                Please log in to explore the decentralized DApp marketplace and discover amazing
                Web3 applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Access thousands of DApps, track analytics, and participate in the Web3 ecosystem.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>AI-Powered Discovery</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-primary" />
                  <span>Personalized Recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>Real-time Analytics</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} />;
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">DApp Marketplace</h1>
            <p className="text-muted-foreground">Discover and explore decentralized applications</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Button variant="outline" onClick={() => setShowAdmin(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add DApp
                </Button>
              </>
            )}
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <RecommendationsPanel
          projectEntries={projectEntries}
          analytics={analytics}
          userProfile={userProfile}
          onTrackView={handleTrackView}
        />

        {/* Search and Filter Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search DApps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DApp Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading DApps...</p>
        </div>
      ) : filteredAndSortedProjects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No DApps Found</CardTitle>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'No DApps available yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProjects.map((entry) => (
            <DAppCard key={entry.id} entry={entry} onView={handleTrackView} />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddDAppModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      {showProfileSetup && (
        <ProfileSetupModal open={showProfileSetup} onComplete={() => {}} />
      )}
    </div>
  );
}
