import { ListMusic } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// TODO: Implement API Route or Server Component/Server Action for retrieving Tones

export default async function Dashboard() {
  const user = await currentUser();

  const activityLog = [
    {
      title: 'Tone Created: "Plexi Crunch"',
      description: 'A new high-gain sound was added to your library.',
      time: '2 hours ago',
    },
    {
      title: 'Tone Created: "Plexi Crunch"',
      description: 'A new high-gain sound was added to your library.',
      time: '2 hours ago',
    },
    {
      title: 'Tone Created: "Plexi Crunch"',
      description: 'A new high-gain sound was added to your library.',
      time: '2 hours ago',
    },
    {
      title: 'Tone Created: "Plexi Crunch"',
      description: 'A new high-gain sound was added to your library.',
      time: '2 hours ago',
    },
    {
      title: 'Tone Created: "Plexi Crunch"',
      description: 'A new high-gain sound was added to your library.',
      time: '2 hours ago',
    },
  ];

  return (
    <section className="h-full border border-red-500 p-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">Welcome back, {user?.fullName}!</h1>
          <p>Here's a quick overview of your tone profile.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[
            { label: 'Total Tones', value: 42 },
            { label: 'Favourites Saved', value: 18 },
            { label: 'Tones Shared', value: 9 },
          ].map(({ label, value }) => (
            <div key={label} className="border-border rounded-2xl border p-4">
              <p className="text-muted-foreground text-sm">{label}</p>
              <span className="text-primary text-2xl font-semibold">{value}</span>
            </div>
          ))}
        </div>
        <div className="border-border flex flex-col gap-2 rounded-2xl border p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLog.map(({ title, description, time }, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-accent-foreground rounded-lg p-2">
                        <ListMusic className="text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <h3>{title}</h3>
                        <p className="text-muted-foreground text-sm">{description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <p className="text-sm">{time}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
