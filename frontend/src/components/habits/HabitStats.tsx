import { useHabits, Habit } from "@/contexts/HabitContext";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface HabitStatsProps {
  habit: Habit;
}

export const HabitStats = ({ habit }: HabitStatsProps) => {
  const { getHabitStats } = useHabits();
  const stats = getHabitStats(habit.id);

  return (
    <Card className='p-4'>
      <h3 className='font-medium mb-4'>Statistics</h3>

      <div className='space-y-4'>
        <div>
          <div className='flex justify-between mb-1 text-sm'>
            <span>Current streak</span>
            <span className='font-medium'>{stats.streak} days</span>
          </div>
          <Progress value={Math.min(stats.streak * 10, 100)} className='h-2' />
        </div>

        <div>
          <div className='flex justify-between mb-1 text-sm'>
            <span>Completion rate</span>
            <span className='font-medium'>
              {Math.round(stats.completionRate)}%
            </span>
          </div>
          <Progress value={stats.completionRate} className='h-2' />
        </div>

        <div>
          <div className='flex justify-between mb-1 text-sm'>
            <span>This week</span>
            <span className='font-medium'>{stats.thisWeek} days</span>
          </div>
          <Progress value={(stats.thisWeek / 7) * 100} className='h-2' />
        </div>

        <div>
          <div className='flex justify-between mb-1 text-sm'>
            <span>This month</span>
            <span className='font-medium'>{stats.thisMonth} days</span>
          </div>
          <Progress value={(stats.thisMonth / 30) * 100} className='h-2' />
        </div>
      </div>
    </Card>
  );
};
