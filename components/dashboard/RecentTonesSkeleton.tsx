import { CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';

const RecentTonesSkeleton = () => {
  return (
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tone</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
};

export default RecentTonesSkeleton;
