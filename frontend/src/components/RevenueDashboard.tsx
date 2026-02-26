import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { AnalyticsEntry } from '../types';
import { ProjectEntry } from '../backend';

interface RevenueDashboardProps {
  projectEntries: ProjectEntry[];
  analytics: AnalyticsEntry[];
}

export default function RevenueDashboard({ projectEntries, analytics }: RevenueDashboardProps) {
  // Calculate revenue metrics
  const totalRevenue = projectEntries.length * 1000; // Mock calculation
  const totalPayouts = projectEntries.length * 800; // Mock calculation
  const activeConfigs = 0; // Backend doesn't support revenueShareConfigId yet

  return (
    <div className="space-y-6">
      {/* Revenue Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Distributed to partners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Configs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConfigs}</div>
            <p className="text-xs text-muted-foreground">Revenue share agreements</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown by DApp</CardTitle>
          <CardDescription>Detailed revenue and payout information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DApp</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Payout</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectEntries.map((entry) => {
                const revenue = Math.floor(Math.random() * 5000) + 1000;
                const payout = Math.floor(revenue * 0.8);
                const hasConfig = false; // Backend doesn't support this yet

                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>{Number(entry.views)}</TableCell>
                    <TableCell className="text-right">${revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${payout.toLocaleString()}</TableCell>
                    <TableCell>
                      {hasConfig ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Configured</span>
                        </div>
                      ) : (
                        <Badge variant="secondary">No Config</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
