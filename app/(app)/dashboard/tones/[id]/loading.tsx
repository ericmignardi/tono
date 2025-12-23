import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>

      {/* Description Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Gear Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-1 h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Amp Settings Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-4 w-56" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-9 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Notes Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="mt-1 h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
