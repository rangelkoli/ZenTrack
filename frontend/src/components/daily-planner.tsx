import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Event {
  id: string;
  time: string;
  description: string;
}

export function DailyPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState({ time: '', description: '' })

  const addEvent = () => {
    if (newEvent.time && newEvent.description) {
      setEvents([...events, { ...newEvent, id: Date.now().toString() }])
      setNewEvent({ time: '', description: '' })
    }
  }

  const removeEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id))
  }

  const prevDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))
  }

  const nextDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <Button variant="outline" size="icon" onClick={prevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <Button variant="outline" size="icon" onClick={nextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Event</Label>
              <Input
                id="description"
                type="text"
                placeholder="Event description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={addEvent} className="w-full">Add Event</Button>
          <div className="space-y-2">
            {events
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(event => (
                <div key={event.id} className="flex justify-between items-center bg-muted p-2 rounded-md">
                  <span className="font-medium">{event.time}</span>
                  <span className="flex-grow ml-4">{event.description}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeEvent(event.id)}>Remove</Button>
                </div>
              ))
            }
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

