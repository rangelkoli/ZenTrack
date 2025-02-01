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
} from "@blocknote/react";
import {
  getMultiColumnSlashMenuItems,
  multiColumnDropCursor,
  locales as multiColumnLocales,
  withMultiColumn,
  multiColumnSchema,
} from "@blocknote/xl-multi-column";
import { useMemo } from "react";
// import { useTheme } from "@/components/theme-provider";
import { useParams } from "react-router";
import useNotesContent from "@/stores/notesContent";
import { useEffect, useState } from "react";
import axios from "axios";
import { TableOfContents } from "./table-of-contents";
import BASE_URL from "@/constants/baseurl";
import AttachmentsEditor from "./attachments-editor";
import { useToast } from "@/hooks/use-toast";

export default function NotesEditor() {
  const [initialContent, setInitialContent] = useState<
    PartialBlock[] | undefined | "loading"
  >("loading");
  const { toast } = useToast();

  // Gets the note ID from the URL.
  const { id } = useParams<{ id: string }>();
  const [coverUrl, setCoverUrl] = useState("");

  // const notes = useNotesContent((state: any) => state.notes);
  const setNewTitle = useNotesContent((state: any) => state.setTitle);

  // Gets the current theme from the theme provider.
  // const { theme } = useTheme();

  const [title, setTitle] = useState("");
  async function uploadFile(file: File) {
    const body = new FormData();
    body.append("file", file);

    const ret = await fetch("http://127.0.0.1:5000/notes/upload_file/", {
      method: "POST",
      body: body,
    });
    console.log(ret);
    const data = await ret.json();
    return data.url;
  }
  // Renders the editor instance using a React component.
  async function saveToStorage() {
    // Save contents to local storage. You might want to debounce this or replace
    // with a call to your API / database.

    // setIsSaving(true);
    localStorage.setItem("editorContent", JSON.stringify(editor?.document));
    console.log(title);
    try {
      axios
        .put(`${BASE_URL}/notes/update_note/${id}`, {
          title: title,
          content: JSON.stringify(editor?.document),
        })
        .then((res) => {
          console.log(res);
          toast({
            title: "Note saved",
            description: "Your note has been saved successfully",
            style: {
              backgroundColor: "#4BB543",
              color: "#F3F4F6",
            },
            duration: 3000,
          });
        });

      // setIsSaving(false);
    } catch (err) {
      console.log(err);
    }
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
      animations: true,
      uploadFile,
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
          saveToStorage();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  // const [isSaving, setIsSaving] = useState(false);

  // useEffect(() => {
  //   const autosaveInterval = setInterval(() => {
  //     if (editor && !isSaving) {
  //       saveToStorage(editor.document);
  //     }
  //   }, 5000);

  //   return () => {
  //     clearInterval(autosaveInterval);
  //   };
  // }, [editor, isSaving]);

  // Uploads a file to tmpfiles.org and returns the URL to the uploaded file.

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
          // theme={theme}
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
