import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  SortAsc,
  Search,
  Briefcase,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApplicationCard } from '@/components/application';
import { getMyApplications } from '@/api/services/application.service';
import type { ApplicationStatus } from '@/types/application';

const statusTabs: { value: ApplicationStatus | 'all'; label: string; count?: number }[] = [
  { value: 'all', label: 'All Applications' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'REVIEWING', label: 'Reviewing' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offers' },
];

export default function Applications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'match'>('date');

  const { data, isLoading, error } = useQuery({
    queryKey: ['applications', activeTab !== 'all' ? activeTab : undefined],
    queryFn: () =>
      getMyApplications({
        status: activeTab !== 'all' ? activeTab : undefined,
        limit: 50,
      }),
  });

  const applications = data?.data || [];

  // Filter and sort
  const filteredApplications = applications
    .filter((app) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        app.job.title.toLowerCase().includes(query) ||
        app.job.companyName.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      }
      // Sort by match score
      const scoreA = a.matchScore?.overall || 0;
      const scoreB = b.matchScore?.overall || 0;
      return scoreB - scoreA;
    });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all your job applications
          </p>
        </div>
        <Button asChild>
          <Link to="/jobs">Browse Jobs</Link>
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-muted/10 p-4 rounded-xl border border-border/50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by job title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-full sm:w-48 bg-background">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="match">Sort by Match Score</SelectItem>
            </SelectContent>
          </Select>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="flex flex-wrap h-auto bg-transparent p-0 gap-2 mb-6 w-full justify-start overflow-x-auto no-scrollbar pb-1">
          {statusTabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="rounded-full border border-border/50 bg-background px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-muted/50 transition-all"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center py-20 text-center">
                <XCircle className="h-12 w-12 text-destructive/50 mb-4" />
                <h3 className="text-lg font-semibold">Error loading applications</h3>
                <p className="text-muted-foreground mb-4">{(error as any).message || 'Something went wrong'}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
             </div>
          ) : filteredApplications.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence>
              {filteredApplications.map((application) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                    <ApplicationCard
                    key={application.id}
                    application={application}
                    onViewDetails={() => navigate(`/application/${application.id}`)}
                    />
                </motion.div>
              ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground max-w-sm">
                You haven't applied to any jobs with this status yet. 
                Start looking for opportunities!
              </p>
              <Button asChild className="mt-6">
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
