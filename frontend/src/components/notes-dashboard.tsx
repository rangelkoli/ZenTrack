import { useEffect, useState } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Input } from "./ui/input";

type Note = {
  title: string;
  content: string;
  id: string;
  cover_image: string;
  updated_at: Date;
};

export default function NotesDashboard() {
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/notes/get_notes/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        data = data.sort((a: Note, b: Note) => {
          const dateA = new Date(a.updated_at);
          const dateB = new Date(b.updated_at);
          return dateB.getTime() - dateA.getTime();
        });
        setNotes(data.slice(1));
        setRecentNote(data.slice(0, 1));
      });
  }, []);

  const [notes, setNotes] = useState<Note[]>([]);

  const [recentNote, setRecentNote] = useState<Note[]>([]);

  return (
    <motion.div
      className='min-h-screen bg-background'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className='sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between gap-4'>
            <motion.div
              className='relative flex-1 max-w-md'
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search notes...'
                className='w-full pl-9 bg-muted/50'
              />
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => {
                  console.log("Button clicked");
                  fetch(`${import.meta.env.VITE_BACKEND_URL}/notes/add_note/`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Access-Control-Allow-Origin": "*",
                      Authorization: `Bearer ${localStorage.getItem(
                        "access_token"
                      )}`,
                    },
                    body: JSON.stringify({
                      title: "New note 1",
                      content: JSON.stringify([
                        {
                          id: "64fd0b46-aa42-40f6-afd3-32b7d5b1b420",
                          type: "paragraph",
                          props: {
                            textColor: "default",
                            backgroundColor: "default",
                            textAlignment: "left",
                          },
                          content: [],
                          children: [],
                        },
                      ]),
                    }),
                  }).then((response) => {
                    if (response.status === 200) {
                      window.location.reload();
                    }
                  });
                }}
                className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground'
              >
                <Plus className='h-4 w-4' />
                New Notebook
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <main className='container mx-auto px-4 py-8'>
        <AnimatePresence mode='wait'>
          {recentNote[0] && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='mb-12'
            >
              <AudioPlayer
                title={recentNote[0].title}
                author='Author'
                coverUrl={recentNote[0].cover_image}
                id={recentNote[0].id}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold'>Recently Updated</h2>
            <Button
              variant='ghost'
              className='text-muted-foreground hover:text-foreground'
            >
              View All
            </Button>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className='transition-shadow duration-300 hover:shadow-lg'
              >
                <BookCard {...note} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-12'
          >
            <p className='text-muted-foreground'>
              No notes yet. Create your first note!
            </p>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
