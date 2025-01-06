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
import AttachmentsEditor from "./attachments-editor";
export default function NotesEditor() {
  const [initialContent, setInitialContent] = useState<
    PartialBlock[] | undefined | "loading"
  >("loading");

  // Gets the note ID from the URL.
  const { id } = useParams<{ id: string }>();
  const [coverUrl, setCoverUrl] = useState("");

  const notes = useNotesContent((state: any) => state.notes);
  const setNewTitle = useNotesContent((state: any) => state.setTitle);

  // Gets the current theme from the theme provider.
  const { theme } = useTheme();

  const [title, setTitle] = useState("");

  // Renders the editor instance using a React component.
  async function saveToStorage(jsonBlocks: Block[]) {
    // Save contents to local storage. You might want to debounce this or replace
    // with a call to your API / database.
    localStorage.setItem("editorContent", JSON.stringify(jsonBlocks));
    console.log(title);
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
      setCoverUrl(res.data[0].cover_image);
      console.log("coverUrl", res.data[0].cover_image);
      setNewTitle(res.data[0].title);
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
        event.preventDefault();
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
        {coverUrl ? (
          <img
            src={coverUrl}
            alt='Deploy'
            className='w-full h-80 max-w-4xl mx-auto object-cover rounded-lg'
          />
        ) : (
          <AttachmentsEditor />
        )}
        {/* <div className='w-full mx-autosm: px-2 lg:px-20'>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Title'
            contentEditable={true}
            className='text-2xl font-bold outline-none w-full'
          />
        </div> */}
      </div>
      <div className='w-full mx-auto px-2 lg:px-20'>
        <BlockNoteView
          editor={editor}
          theme={theme}
          className='min-h-screen'
          slashMenu={false}
          data-theming-css-variables-editor
        >
          <SuggestionMenuController
            triggerCharacter={"/"}
            getItems={getSlashMenuItems}
          />
        </BlockNoteView>

        {Array.isArray(initialContent) && (
          <TableOfContents content={initialContent} />
        )}
      </div>
    </>
  );
}
