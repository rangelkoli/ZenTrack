import { useEffect, useState } from "react";
// import { NotesCard } from "./NotesCard";
// import { Button } from "./ui/button";
import { AudioPlayer } from "@/components/audio-player";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";

type Note = {
  title: string;
  content: string;
  id: string;
  coverUrl: string;
};
// const NotesDashboard = () => {
//
//   return (
//     <div>
//       {notes.map((note) => {
//         return (
//           <NotesCard
//             title={note.title}
//             description={note.content}
//             imageLink='https://placehold.co/600x400'
//             id={note.id}
//             key={note.id}
//           />
//         );
//       })}
//       <NotesCard
//         title='Notes'
//         description='Take notes here'
//         imageLink='https://placehold.co/600x400'
//         id='123'
//       />
//       <Button
//         onClick={() => {
//           console.log("Button clicked");
//           fetch("http://127.0.0.1:5000/notes/add_note/", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               title: "New note",
//               content: JSON.stringify([
//                 {
//                   type: "paragraph",
//                   children: [{ text: "" }],
//                 },
//               ]),
//             }),
//           }).then((response) => {
//             console.log(response);
//           });
//         }}
//       >
//         Click me
//       </Button>
//     </div>
//   );
// };

// export default NotesDashboard;

const recentlyPlayed = [
  {
    title: "The Wicked Deep",
    author: "Shea Ernshaw",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "Tess of The Road",
    author: "Rachel Hartman",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "Quintessence",
    author: "Jess Redman",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "Sherlock Holmes",
    author: "Arthur Conan",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
];

const popularBooks = [
  {
    title: "The Hobbit",
    author: "J.R.R Tolkien",
    duration: "2h 52min",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "Life of Pi",
    author: "Yann Martel",
    duration: "2h 25min",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "The Wicked Deep",
    author: "Shea Ernshaw",
    duration: "2h 15min",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "1984",
    author: "George Orwell",
    duration: "2h 30min",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    duration: "3h 15min",
    coverUrl: "/placeholder.svg?height=400&width=300",
  },
];

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
        setNotes(data);
      });
  }, []);

  const [notes, setNotes] = useState<Note[]>([]);

  return (
    <div className='flex flex-col h-screen bg-muted '>
      {/* <header className='border-b px-6 py-4'>
        <div className='relative'>
          <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input placeholder='Search books here' className='w-full pl-8' />
        </div>
      </header> */}
      <main className='flex-1 overflow-auto'>
        <div className='p-6'>
          <AudioPlayer
            title='The Witches of Willow Cove'
            author='Josh Roberts'
            coverUrl='/placeholder.svg?height=400&width=300'
          />
        </div>

        <div className='px-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Recently Played</h2>
            <Button variant='link'>See All</Button>
          </div>
        </div>

        <div className='mt-4 flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide'>
          {notes.map((book) => (
            <BookCard key={book.title} {...book} />
          ))}
        </div>
        <Button
          onClick={() => {
            console.log("Button clicked");
            fetch("http://127.0.0.1:5000/notes/add_note/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: "New note",
                content: JSON.stringify([
                  {
                    type: "paragraph",
                    children: [{ text: "" }],
                  },
                ]),
              }),
            }).then((response) => {
              console.log(response);
            });
          }}
        >
          Click me
        </Button>

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
    </div>
  );
}
