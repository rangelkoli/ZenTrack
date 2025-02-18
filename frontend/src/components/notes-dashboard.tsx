import { useEffect, useState } from "react";
// import { NotesCard } from "./NotesCard";
// import { Button } from "./ui/button";
import { AudioPlayer } from "@/components/audio-player";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
type Note = {
  title: string;
  content: string;
  id: string;
  cover_image: string;
  updated_at: Date;
};

export default function NotesDashboard() {
  useEffect(() => {
    fetch("http://127.0.0.1:5000/notes/get_notes/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
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
      className='flex flex-col h-screen bg-muted w-screen'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* <header className='border-b px-6 py-4'>
        <div className='relative'>
          <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input placeholder='Search books here' className='w-full pl-8' />
        </div>
      </header> */}
      <Button
        onClick={() => {
          console.log("Button clicked");
          fetch("http://127.0.0.1:5000/notes/add_note/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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
            console.log(response);
          });
        }}
      >
        New Notebook
      </Button>
      <main className='flex-1 overflow-auto'>
        <div className='p-6'>
          {recentNote[0] && (
            <AudioPlayer
              title={recentNote[0].title}
              author='Author'
              coverUrl={recentNote[0].cover_image}
              id={recentNote[0].id}
            />
          )}
        </div>

        <div className='px-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Recently Played</h2>
            <Button variant='link'>See All</Button>
          </div>
        </div>

        <div className='mt-4 flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide'>
          {notes.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>

        {/* <div className='px-6 pt-8'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Most Popular</h2>
            <Button variant='link'>See All</Button>
          </div>
        </div>

        <div className='mt-4 flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide'>
          {popularBooks.map((book) => (
            <BookCard key={book.title} {...book} />
          ))}
        </div> */}
      </main>
    </motion.div>
  );
}
