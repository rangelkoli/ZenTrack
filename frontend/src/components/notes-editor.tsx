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
import { TableOfContents } from "./table-of-contents";
import BASE_URL from "@/constants/baseurl";
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

  const [title, setTitle] = useState("");

  // Renders the editor instance using a React component.
  async function saveToStorage(jsonBlocks: Block[]) {
    // Save contents to local storage. You might want to debounce this or replace
    // with a call to your API / database.
    localStorage.setItem("editorContent", JSON.stringify(jsonBlocks));

    axios
      .put(`${BASE_URL}/notes/update_note/${id}`, {
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
      console.log("res", res.data[0].note);
      setTitle(res.data[0].title);
      setInitialContent(JSON.parse(res.data[0].note));
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
  // Gets the default slash menu items merged with the multi-column ones.
  const getSlashMenuItems = useMemo(() => {
    if (editor === undefined) {
      return async () => [];
    }
    return async (query: string) =>
      filterSuggestionItems(
        combineByGroup(
          getDefaultReactSlashMenuItems(editor),
          getMultiColumnSlashMenuItems(editor)
        ),
        query
      );
  }, [editor]);
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
          className='w-full h-80'
        />
        <h1 className='text-2xl font-bold'>{title}</h1>
      </div>
      <div className='max-w-6xl mx-auto'>
        <BlockNoteView
          editor={editor}
          theme={theme}
          className='min-h-screen'
          //   onChange={() => {
          //     savefdfToStorage(editor.document);
          //   }}
          slashMenu={false}
        >
          {/* Replaces the default slash menu with one that has both the default
        items and the multi-column ones. */}

          <SuggestionMenuController
            triggerCharacter={"/"}
            getItems={getSlashMenuItems}
          />
        </BlockNoteView>
        {/* {initialContent !== "loading" && (
          <TableOfContents blocks={initialContent} />
        )} */}
        {Array.isArray(initialContent) && (
          <TableOfContents content={initialContent} />
        )}
      </div>
    </>
  );
}
