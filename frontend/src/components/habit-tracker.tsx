import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { habits } from '@/lib/mockData'

export function HabitTracker() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {habits.map(habit => (
            <div key={habit.id} className="flex flex-col sm:flex-row sm:items-center">
              <span className="w-full sm:w-24 font-medium mb-1 sm:mb-0">{habit.name}</span>
              <div className="flex-1 flex justify-between">
                {habit.days.map((completed, index) => (
                  <div
                    key={index}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                      completed ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

