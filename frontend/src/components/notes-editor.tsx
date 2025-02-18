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
import { useMemo } from "react";
import { useTheme } from "@/components/theme-provider";
import { useParams } from "react-router";
import useNotesContent from "@/stores/notesContent";
import { useEffect, useState } from "react";
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
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
      <div className=''>
        <div className='m-10 gap-4 flex flex-col'>
          {/* Add title section before cover image */}
          <div className='w-full mx-auto px-2 lg:px-20'>
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

          {/* Existing cover image code */}
          {coverUrl ? (
            <img
              src={coverUrl}
              alt='Deploy'
              className='w-full h-80 max-w-4xl mx-auto object-cover rounded-lg'
            />
          ) : (
            <AttachmentsEditor />
          )}

          {/* Add AttachmentsList below cover image */}
          <div className='max-w-4xl mx-auto w-full'>
            <AttachmentsList />
          </div>
        </div>

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
