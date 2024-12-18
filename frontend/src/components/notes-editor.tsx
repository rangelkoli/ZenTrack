import {
  BlockNoteSchema,
  combineByGroup,
  filterSuggestionItems,
  locales,
  PartialBlock,
  BlockNoteEditor,
  Block,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import {
  getMultiColumnSlashMenuItems,
  multiColumnDropCursor,
  locales as multiColumnLocales,
  withMultiColumn,
} from "@blocknote/xl-multi-column";
import { useMemo } from "react";
import { useTheme } from "@/components/theme-provider";
import { useParams } from "react-router";
import useNotesContent from "@/stores/notesContent";
import { useEffect, useState } from "react";
import axios from "axios";
import { set } from "date-fns";

export default function NotesEditor() {
  const [initialContent, setInitialContent] = useState<
    PartialBlock[] | undefined | "loading"
  >("loading");

  // Gets the note ID from the URL.
  const { id } = useParams<{ id: string }>();

  const notes = useNotesContent((state: any) => state.notes);
  console.log(notes);
  console.log(id);

  // Gets the current theme from the theme provider.
  const { theme } = useTheme();

  // Creates a new editor instance.
  //   const editor = useCreateBlockNote({
  //     // Adds column and column list blocks to the schema.
  //     schema: withMultiColumn(BlockNoteSchema.create()),
  //     // The default drop cursor only shows up above and below blocks - we replace
  //     // it with the multi-column one that also shows up on the sides of blocks.
  //     dropCursor: multiColumnDropCursor,
  //     // Merges the default dictionary with the multi-column dictionary.
  //     dictionary: {
  //       ...locales.en,
  //       multi_column: multiColumnLocales.en,
  //     },
  //     initialContent: notes,
  //   });

  // Gets the default slash menu items merged with the multi-column ones.
  //   const getSlashMenuItems = useMemo(() => {
  //     return async (query: string) =>
  //       filterSuggestionItems(
  //         combineByGroup(
  //           getDefaultReactSlashMenuItems(editor),
  //           getMultiColumnSlashMenuItems(editor)
  //         ),
  //         query
  //       );
  //   }, [editor]);
  const [title, setTitle] = useState("");

  // Renders the editor instance using a React component.
  async function saveToStorage(jsonBlocks: Block[]) {
    // Save contents to local storage. You might want to debounce this or replace
    // with a call to your API / database.
    localStorage.setItem("editorContent", JSON.stringify(jsonBlocks));

    axios
      .put(`http://127.0.0.1:5000/notes/update_note/${id}`, {
        title: title,
        content: JSON.stringify(jsonBlocks),
      })
      .then((res) => {
        console.log(res);
      });
  }

  async function loadFromStorage() {
    // Gets the previously stored editor contents.

    axios.get(`http://127.0.0.1:5000/notes/get_note/${id}`).then((res) => {
      console.log(res);
      setTitle(res.data.title);
      setInitialContent(JSON.parse(res.data.content));
    });
    return undefined;
  }
  useEffect(() => {
    loadFromStorage().then((content) => {
      setInitialContent(content);
    });
  }, []);

  const editor = useMemo(() => {
    if (initialContent === "loading") {
      return undefined;
    }
    return BlockNoteEditor.create({
      initialContent,
      schema: withMultiColumn(BlockNoteSchema.create()),
      dropCursor: multiColumnDropCursor,
      dictionary: {
        ...locales.en,
        multi_column: multiColumnLocales.en,
      },
    });
  }, [initialContent]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault(); // Prevent the default browser save action
        if (editor) {
          saveToStorage(editor.document);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  if (editor === undefined) {
    return "Loading content...";
  }

  return (
    <>
      <div className='m-10 gap-4 flex flex-col'>
        <img
          src='https://placehold.co/600x400'
          alt='Deploy'
          className='w-full h-32'
        />
        <h1 className='text-2xl font-bold'>{title}</h1>
        <p className='text-lg font-normal'>Description</p>
      </div>
      <div className=''>
        <BlockNoteView
          editor={editor}
          theme={theme}
          className='min-h-screen'
          //   onChange={() => {
          //     saveToStorage(editor.document);
          //   }}
        >
          {/* Replaces the default slash menu with one that has both the default
        items and the multi-column ones. */}
          {/* <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={getSlashMenuItems}
        /> */}
        </BlockNoteView>
      </div>
    </>
  );
}
