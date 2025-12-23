import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import StatsSkeleton from '@/components/dashboard/StatsSkeleton';
import RecentTonesSkeleton from '@/components/dashboard/RecentTonesSkeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Recent Tones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </CardHeader>
        <RecentTonesSkeleton />
      </Card>
    </div>
  );
}
