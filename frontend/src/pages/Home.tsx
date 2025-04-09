import { useEffect, useState } from "react";
import { MotivationalQuote } from "@/components/motivational-quotes";
import { NotesCard } from "@/components/NotesCard"; // Assuming NotesCard can be used or adapt as needed
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom"; // Assuming react-router-dom is used

// Define basic types (adjust based on actual data structure)
type Note = {
  id: string;
  title: string;
  note: string; // Assuming 'note' contains preview content or needs parsing
  cover_image: string;
  updated_at: string;
};

type Habit = {
  id: string;
  name: string;
  // ... other habit properties
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  // ... other task properties
};

function Home() {
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]); // Placeholder
  const [tasks, setTasks] = useState<Task[]>([]); // Placeholder
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isLoadingHabits, setIsLoadingHabits] = useState(true); // Placeholder
  const [isLoadingTasks, setIsLoadingTasks] = useState(true); // Placeholder

  useEffect(() => {
    // Fetch Recent Notes
    const fetchNotes = async () => {
      setIsLoadingNotes(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/notes/get_notes/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }
        let notesData: Note[] = await response.json();
        // Sort by updated_at descending and take top 5
        notesData.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setRecentNotes(notesData.slice(0, 5));
      } catch (error) {
        console.error("Error fetching recent notes:", error);
        // Handle error (e.g., show toast)
      } finally {
        setIsLoadingNotes(false);
      }
    };

    // --- Placeholder Fetching Logic ---
    const fetchHabits = async () => {
      setIsLoadingHabits(true);
      // TODO: Implement habit fetching logic here
      // Example: setHabits(fetchedHabitsData);
      setHabits([
        { id: "h1", name: "Morning Exercise" },
        { id: "h2", name: "Read 10 pages" },
      ]); // Mock data
      setIsLoadingHabits(false);
    };

    const fetchTasks = async () => {
      setIsLoadingTasks(true);
      // TODO: Implement task fetching logic here
      // Example: setTasks(fetchedTasksData.filter(task => !task.completed));
      setTasks([
        { id: "t1", title: "Finish report", completed: false },
        { id: "t2", title: "Schedule meeting", completed: false },
      ]); // Mock data
      setIsLoadingTasks(false);
    };
    // --- End Placeholder ---

    fetchNotes();
    fetchHabits(); // Call placeholder fetch
    fetchTasks(); // Call placeholder fetch
  }, []);

  // Function to generate a simple preview from note content (if needed)
  const getNotePreview = (noteContent: string): string => {
    try {
      const parsedContent = JSON.parse(noteContent);
      // Find the first paragraph block with text content
      const firstText = parsedContent.find(
        (block: any) =>
          block.type === "paragraph" &&
          block.content &&
          block.content.length > 0 &&
          block.content[0].text
      );
      return firstText
        ? firstText.content[0].text.substring(0, 100) + "..."
        : "No preview available";
    } catch (e) {
      // If content is not JSON or parsing fails, return raw start
      return typeof noteContent === "string"
        ? noteContent.substring(0, 100) + "..."
        : "Invalid content";
    }
  };

  return (
    <div className='p-4 md:p-6 space-y-8 max-w-7xl mx-auto'>
      <MotivationalQuote />

      {/* Recent Notes Section */}
      <section>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl md:text-2xl font-semibold'>Recent Notes</h2>
          <Button variant='link' asChild>
            <Link to='/notes'>View All</Link>
          </Button>
        </div>
        {isLoadingNotes ? (
          <p>Loading notes...</p>
        ) : recentNotes.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
            {recentNotes.map((note) => (
              <NotesCard
                key={note.id}
                id={note.id}
                title={note.title}
                description={getNotePreview(note.note)} // Use preview function
                imageLink={note.cover_image || "/placeholder-image.png"} // Provide a fallback image
              />
            ))}
          </div>
        ) : (
          <p>No recent notes found.</p>
        )}
      </section>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'>
        {/* Habits Section (Placeholder) */}
        <section>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl md:text-2xl font-semibold'>Habits</h2>
            <Button variant='link' asChild>
              <Link to='/habits'>View All</Link>
            </Button>
          </div>
          {isLoadingHabits ? (
            <p>Loading habits...</p>
          ) : habits.length > 0 ? (
            <ul className='space-y-2'>
              {habits.map((habit) => (
                <li
                  key={habit.id}
                  className='p-3 bg-muted/50 dark:bg-muted/20 rounded-md'
                >
                  {habit.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No habits tracked yet.</p>
          )}
        </section>

        {/* Tasks Section (Placeholder) */}
        <section>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl md:text-2xl font-semibold'>Tasks Left</h2>
            <Button variant='link' asChild>
              <Link to='/tasks'>View All</Link>
            </Button>
          </div>
          {isLoadingTasks ? (
            <p>Loading tasks...</p>
          ) : tasks.length > 0 ? (
            <ul className='space-y-2'>
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className='p-3 bg-muted/50 dark:bg-muted/20 rounded-md'
                >
                  {task.title}
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending tasks!</p>
          )}
        </section>
      </div>
      {/* Removed the empty divs from the original grid */}
    </div>
  );
}

export default Home;
