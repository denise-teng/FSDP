import BroadcastList from '../components/BroadcastList';
import RecentMessages from '../components/RecentMessages';
import ScheduledBroadcasts from '../components/ScheduledBroadcasts';

export default function BroadcastPage() {
  return (
    <div className="p-6 space-y-10">
      <BroadcastList />
      <RecentMessages />
      <ScheduledBroadcasts />
    </div>
  );
}
