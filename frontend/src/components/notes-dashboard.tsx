import { useEffect, useState } from "react";
import { NotesCard } from "./NotesCard";
import { Button } from "./ui/button";

type Note = {
  title: string;
  content: string;
  id: string;
};
const NotesDashboard = () => {
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
    <div>
      {notes.map((note) => {
        return (
          <NotesCard
            title={note.title}
            description={note.content}
            imageLink='https://placehold.co/600x400'
            id={note.id}
            key={note.id}
          />
        );
      })}
      <NotesCard
        title='Notes'
        description='Take notes here'
        imageLink='https://placehold.co/600x400'
        id='123'
      />
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
    </div>
  );
};

export default NotesDashboard;
