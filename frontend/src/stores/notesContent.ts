import { create } from 'zustand'

type NotesContent = {
    notes: any[],
    setNotes: (notes: any) => void,
    title: string,
    setTitle: (title: string) => void
}

const useNotesContent = create<NotesContent>((set) => ({
    notes: [
        {
            type: "paragraph",
            content: "asd",
          },
          {
            type: "columnList",
            children: [
              {
                type: "column",
                props: {
                  width: 0.8,
                },
                children: [
                  {
                    type: "paragraph",
                    content: "This paragraph is in a column!",
                  },
                ],
              },
    
              {
                type: "column",
                props: {
                  width: 0.8,
                },
                children: [
                  {
                    type: "paragraph",
                    content: "You can have multiple blocks in a column too",
                  },
                  {
                    type: "bulletListItem",
                    content: "Block 1",
                  },
                  {
                    type: "bulletListItem",
                    content: "Block 2",
                  },
                  {
                    type: "bulletListItem",
                    content: "Block 3",
                  },
                ],
              },
            ],
          },
          {
            type: "paragraph",
          },
    ],
    setNotes: (notes: any) => set({ notes }),
    title: '',
    setTitle: (title: string) => set({ title })
}))


export default useNotesContent;


