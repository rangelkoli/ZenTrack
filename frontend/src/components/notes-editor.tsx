import {
  BlockNoteSchema,
  combineByGroup,
  filterSuggestionItems,
  locales,
  PartialBlock,
  BlockNoteEditor,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, Theme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  FormattingToolbarController,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
} from "@blocknote/react";
import {
  getMultiColumnSlashMenuItems,
  multiColumnDropCursor,
  locales as multiColumnLocales,
  withMultiColumn,
} from "@blocknote/xl-multi-column";
import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import { useParams } from "react-router";
import useNotesContent from "@/stores/notesContent";
import axios from "axios";
import { TableOfContents } from "./table-of-contents";
import BASE_URL from "@/constants/baseurl";
import AttachmentsEditor from "./attachments-editor";
import { useToast } from "@/hooks/use-toast";
import "./editorstyles.css";
import { FormatWithAIButton } from "./FormatButton";
import { AttachmentsList } from "./AttachmentsList";
import { Button } from "@/components/ui/button";
import { PlusCircle, Paperclip } from "lucide-react";
import { useAutosave } from "@/hooks/use-autosave";

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
  const { theme } = useTheme();

  const lightRedTheme = {
    colors: {
      editor: {
        text: "#222222",
        background: "#ffffff",
      },
      menu: {
        text: "#ffffff",
        background: "#9b0000",
      },
      tooltip: {
        text: "#ffffff",
        background: "#b00000",
      },
      hovered: {
        text: "#ffffff",
        background: "#b00000",
      },
      selected: {
        text: "#ffffff",
        background: "#c50000",
      },
      disabled: {
        text: "#9b0000",
        background: "#7d0000",
      },
      shadow: "#640000",
      border: "#870000",
      sideMenu: "#bababa",
    },
    borderRadius: 4,
    fontFamily: "Helvetica Neue, sans-serif",
  } satisfies Theme;

  const darkRedTheme = {
    colors: {
      editor: {
        text: "#ffffff",
        background: "var(--color-slate-900)",
      },
      menu: {
        text: "#ffffff",
        background: "#9b0000",
      },
      tooltip: {
        text: "#ffffff",
        background: "#b00000",
      },
      hovered: {
        text: "#ffffff",
        background: "#b00000",
      },
      selected: {
        text: "#ffffff",
        background: "#c50000",
      },
      disabled: {
        text: "#9b0000",
        background: "#7d0000",
      },
      shadow: "#640000",
      border: "#870000",
      sideMenu: "#bababa",
    },
    borderRadius: 4,
    fontFamily: "Helvetica Neue, sans-serif",
  } satisfies Theme;
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);

  // Add state for tracking editor content
  const [editorContent, setEditorContent] = useState<any>(null);

  // Add ref to track if content has changed
  const hasChanges = useRef(false);

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

  // Modify editor creation to include content tracking
  const editor = useMemo(() => {
    if (initialContent === "loading") return undefined;

    const editorInstance = BlockNoteEditor.create({
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

    return editorInstance;
  }, [initialContent]);
  // Renders the editor instance using a React component.
  const handleAutosave = useCallback(async () => {
    if (!editor || !id || !hasChanges.current) return;

    try {
      await axios.put(`${BASE_URL}/notes/update_note/${id}`, {
        title,
        content: JSON.stringify(editor.document),
      });

      hasChanges.current = false; // Reset changes flag after successful save

      toast({
        title: "Changes saved",
        description: "Document autosaved",
        style: { backgroundColor: "#4BB543", color: "#F3F4F6" },
        duration: 1500,
      });
    } catch (error) {
      console.error("Autosave failed:", error);
      toast({
        title: "Autosave failed",
        description: "Changes couldn't be saved automatically",
        style: { backgroundColor: "#ff4444", color: "#F3F4F6" },
      });
    }
  }, [editor, id, title]);
  // Initialize autosave with the changes check
  const { save } = useAutosave({
    onSave: handleAutosave,
    interval: 30000, // 30 seconds
  });
  // Create a handler for content changes
  const handleEditorChange = useCallback(() => {
    hasChanges.current = true;
    save();
  }, [save]);

  // Update saveToStorage to use autosave
  const saveToStorage = async () => {
    try {
      await save();
      toast({
        title: "Saved",
        description: "All changes have been saved",
        style: { backgroundColor: "#4BB543", color: "#F3F4F6" },
        duration: 2000,
      });
    } catch (error) {
      console.error("Manual save failed:", error);
      toast({
        title: "Save failed",
        description: "Changes couldn't be saved",
        style: { backgroundColor: "#ff4444", color: "#F3F4F6" },
      });
    }
  };

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    save(); // Trigger autosave on title change
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    try {
      await axios.put(`${BASE_URL}/notes/update_title/${id}`, {
        title: title,
      });
      setNewTitle(title); // Update the global state
    } catch (err) {
      console.error("Failed to update title:", err);
      toast({
        title: "Error",
        description: "Failed to update title",
        style: { backgroundColor: "#ff4444", color: "#F3F4F6" },
        duration: 3000,
      });
    }
  };

  const renderAttachmentInput = () => (
    <div className='fixed bottom-4 right-4 flex flex-col gap-2'>
      {showAttachmentInput && (
        <div className='bg-background p-4 rounded-lg shadow-lg border mb-2 animate-in slide-in-from-bottom'>
          <input
            type='file'
            multiple
            className='hidden'
            id='file-upload'
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <label
            htmlFor='file-upload'
            className='cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
          >
            <PlusCircle size={16} />
            Choose files to upload
          </label>
        </div>
      )}
      <Button
        variant='outline'
        size='icon'
        className='rounded-full h-12 w-12 shadow-lg'
        onClick={() => setShowAttachmentInput(!showAttachmentInput)}
      >
        <Paperclip size={20} />
      </Button>
    </div>
  );

  const handleFiles = async (files: FileList) => {
    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("files[]", file);
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/notes/${id}/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Success",
        description: "Files uploaded successfully",
        style: { backgroundColor: "#4BB543", color: "#F3F4F6" },
        duration: 3000,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        style: { backgroundColor: "#ff4444", color: "#F3F4F6" },
        duration: 3000,
      });
    } finally {
      setShowAttachmentInput(false);
    }
  };

  if (editor === undefined) {
    return "Loading content...";
  }

  return (
    <div className='relative'>
      {/* Title section - Make it sticky */}
      <div className='sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b'>
        <div className='max-w-4xl mx-auto px-4 py-4'>
          {isEditingTitle ? (
            <input
              type='text'
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              autoFocus
              className='text-3xl font-bold outline-none w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-500'
              placeholder='Untitled'
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className='text-3xl font-bold cursor-pointer hover:opacity-80'
            >
              {title || "Untitled"}
            </h1>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className=''>
        <div className='m-10 gap-4 flex flex-col'>
          {/* Cover image and attachments */}
          {coverUrl ? (
            <img
              src={coverUrl}
              alt='Deploy'
              className='w-full h-80 max-w-4xl mx-auto object-cover rounded-lg'
            />
          ) : (
            <AttachmentsEditor />
          )}

          <div className='max-w-4xl mx-auto w-full'>
            <AttachmentsList />
          </div>
        </div>

        {/* Rest of the editor */}
        <div className='w-full mx-auto px-2 lg:px-20'>
          <BlockNoteView
            editor={editor}
            // theme={theme}
            className='min-h-screen'
            slashMenu={false}
            data-theming-css-variables-editor
            theme={theme === "light" ? lightRedTheme : darkRedTheme}
            data-changing-font
            formattingToolbar={false}
            onChange={handleEditorChange}
          >
            <FormattingToolbarController
              formattingToolbar={() => (
                <FormattingToolbar>
                  <BlockTypeSelect key={"blockTypeSelect"} />

                  {/* Replace BlueButton with FormatWithAIButton */}
                  <FormatWithAIButton key={"aiFormatButton"} />

                  <FileCaptionButton key={"fileCaptionButton"} />
                  <FileReplaceButton key={"replaceFileButton"} />

                  <BasicTextStyleButton
                    basicTextStyle={"bold"}
                    key={"boldStyleButton"}
                  />
                  <BasicTextStyleButton
                    basicTextStyle={"italic"}
                    key={"italicStyleButton"}
                  />
                  <BasicTextStyleButton
                    basicTextStyle={"underline"}
                    key={"underlineStyleButton"}
                  />
                  <BasicTextStyleButton
                    basicTextStyle={"strike"}
                    key={"strikeStyleButton"}
                  />
                  {/* Extra button to toggle code styles */}
                  <BasicTextStyleButton
                    key={"codeStyleButton"}
                    basicTextStyle={"code"}
                  />

                  <TextAlignButton
                    textAlignment={"left"}
                    key={"textAlignLeftButton"}
                  />
                  <TextAlignButton
                    textAlignment={"center"}
                    key={"textAlignCenterButton"}
                  />
                  <TextAlignButton
                    textAlignment={"right"}
                    key={"textAlignRightButton"}
                  />

                  <ColorStyleButton key={"colorStyleButton"} />

                  <NestBlockButton key={"nestBlockButton"} />
                  <UnnestBlockButton key={"unnestBlockButton"} />

                  <CreateLinkButton key={"createLinkButton"} />
                </FormattingToolbar>
              )}
            />
            <SuggestionMenuController
              triggerCharacter={"/"}
              getItems={getSlashMenuItems}
            />
          </BlockNoteView>

          {Array.isArray(initialContent) && (
            <TableOfContents content={initialContent} />
          )}
        </div>
      </div>
      {renderAttachmentInput()}
    </div>
  );
}
