import { Card, CardHeader, CardDescription, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const StatsSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <CardDescription className="text-sm">
              <Skeleton className="h-4 w-24" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsSkeleton;
