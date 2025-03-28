import {
  BlockNoteSchema,
  combineByGroup,
  filterSuggestionItems,
  locales,
  PartialBlock,
  BlockNoteEditor,
  defaultBlockSpecs,
  insertOrUpdateBlock,
  withPageBreak,
} from "@blocknote/core";
import { BlockNoteView, Theme } from "@blocknote/mantine";
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
  getPageBreakReactSlashMenuItems,
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
import { useToast } from "@/hooks/use-toast";
import "./editorstyles.css";
import { FormatWithAIButton } from "./FormatButton";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useAutosave } from "@/hooks/use-autosave";
import { LatexBlock } from "./blocks/LatexBlock";
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import { Image, PDFViewer, View } from "@react-pdf/renderer";
import { Text } from "@react-pdf/renderer";
import { YoutubeVideoBlock } from "./blocks/YoutubeBlock";

export default function NotesEditor() {
  const [initialContent, setInitialContent] = useState<
    PartialBlock[] | undefined | "loading"
  >("loading");
  const { toast } = useToast();

  // Gets the note ID from the URL.
  const { uuid } = useParams<{ uuid: string }>();

  const setNewTitle = useNotesContent((state: any) => state.setTitle);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  // Gets the current theme from the theme provider.
  const { theme } = useTheme();
  const lightTheme = {
    colors: {
      editor: {
        text: "#1a1a1a",
        background: "#ffffff",
      },
      menu: {
        text: "#1a1a1a",
        background: "#f5f5f5",
      },
      tooltip: {
        text: "#ffffff",
        background: "#1a1a1a",
      },
      hovered: {
        text: "#ffffff",
        background: "#3a86ff",
      },
      selected: {
        text: "#ffffff",
        background: "#2563eb",
      },
      disabled: {
        text: "#888888",
        background: "#f0f0f0",
      },
      shadow: "rgba(0, 0, 0, 0.1)",
      border: "#e2e8f0",
      sideMenu: "#f1f5f9",
    },
    borderRadius: 4,
    fontFamily: "Helvetica Neue, sans-serif",
  } satisfies Theme;

  const darkTheme = {
    colors: {
      editor: {
        text: "#f3f4f6",
        background: "var(--background)",
      },
      menu: {
        text: "#f3f4f6",
        background: "#27272a",
      },
      tooltip: {
        text: "#ffffff",
        background: "#3f3f46",
      },
      hovered: {
        text: "#ffffff",
        background: "#3b82f6",
      },
      selected: {
        text: "#ffffff",
        background: "#2563eb",
      },
      disabled: {
        text: "#9ca3af",
        background: "#3f3f46",
      },
      shadow: "rgba(0, 0, 0, 0.3)",
      border: "#4b5563",
      sideMenu: "#27272a",
    },
    borderRadius: 4,
    fontFamily: "Helvetica Neue, sans-serif",
  } satisfies Theme;
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Add ref to track if content has changed
  const hasChanges = useRef(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function uploadFile(file: File) {
    const body = new FormData();
    body.append("file", file);

    const ret = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/notes/upload_file/`,
      {
        method: "POST",
        body: body,
      }
    );
    console.log(ret);
    const data = await ret.json();
    return data.url;
  }

  // Define the schema with multi-column and latex block support
  const schema = withPageBreak(
    withMultiColumn(
      BlockNoteSchema.create({
        blockSpecs: {
          ...defaultBlockSpecs,
          latex: LatexBlock,
          youtubevideo: YoutubeVideoBlock,
        },
      })
    )
  );

  // Modify editor creation to include content tracking
  const editor = useMemo(() => {
    if (initialContent === "loading") return undefined;

    const editorInstance = BlockNoteEditor.create({
      initialContent,
      schema: schema,

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
    if (!editor || !uuid || !hasChanges.current) return;

    try {
      setIsSaving(true);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/notes/update_note/${uuid}`,
        {
          title,
          content: JSON.stringify(editor.document),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      hasChanges.current = false;
      setLastSaved(new Date());

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
    } finally {
      setIsSaving(false);
    }
  }, [editor, uuid, title]);
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
  const insertLatexBlock = (editor: typeof schema.BlockNoteEditor) => ({
    title: "Latex",
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: "latex",
      });
    },
    icon: <span>LaTeX</span>,
    group: "Math",
  });

  const insertYoutubeBlock = (editor: typeof schema.BlockNoteEditor) => ({
    title: "Youtube",
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: "youtubevideo",
      });
    },
    icon: <span>Youtube</span>,
    group: "Media",
  });

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

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/notes/get_note/${uuid}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => {
        console.log("res", res.data[0].note);
        setTitle(res.data[0].title);
        setInitialContent(JSON.parse(res.data[0].note));
        console.log("coverUrl", res.data[0].cover_image);
        setNewTitle(res.data[0].title);
        setLastSaved(new Date(res.data[0].updated_at));
      });
    return undefined;
  }

  // Add function to load attachments

  useEffect(() => {
    loadFromStorage().then((content) => {
      setInitialContent(content);
    });
  }, [uuid]);

  // Gets the default slash menu items merged with the multi-column ones.
  const getSlashMenuItems = useMemo(() => {
    if (editor === undefined) {
      return async () => [];
    }
    return async (query: string) =>
      filterSuggestionItems(
        [
          ...combineByGroup(
            getDefaultReactSlashMenuItems(editor),
            getMultiColumnSlashMenuItems(editor),
            getPageBreakReactSlashMenuItems(editor)
          ),
          insertLatexBlock(editor),
          insertYoutubeBlock(editor),
        ],
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
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/notes/update_title/${uuid}`,
        {
          title: title,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      toast({
        title: "Success",
        description: "Title updated successfully",
        style: { backgroundColor: "#4BB543", color: "#F3F4F6" },
        duration: 3000,
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

  const formatLastSaved = (date: Date | null) => {
    if (!date) return "Never saved";

    const now = new Date();
    console.log("now", now);
    console.log("date", date);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // difference in seconds
    console.log("diff", diff);
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  const [pdfvisible, setPdfVisible] = useState(false);

  if (editor === undefined) {
    return "Loading content...";
  }

  return (
    <div className=''>
      {/* Title and Attachments sticky header */}
      <div className='sticky top-16 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50'>
        {/* Title section */}
        <div className='max-w-4xl mx-auto py-2 flex items-center'>
          <div className='flex flex-col w-full md:flex-row md:items-center md:justify-between'>
            <div className='flex-1 sm:mr-4 mx-auto'>
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
            <div className='flex items-center gap-2 text-sm text-muted-foreground sm:gap-4'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground sm:gap-4 mx-auto'>
                <Clock size={14} />
                {isSaving ? (
                  <span className='text-primary animate-pulse'>Saving...</span>
                ) : (
                  <span>Last saved: {formatLastSaved(lastSaved)}</span>
                )}
              </div>
              {/* Export button */}
              <Button
                variant='ghost'
                size='sm'
                className='flex items-center gap-1 text-muted-foreground hover:text-foreground'
                onClick={async () => {
                  const exporter = new PDFExporter(schema, {
                    blockMapping: {
                      ...pdfDefaultSchemaMappings.blockMapping,
                      latex: (block) => {
                        return <Text>{block.props.equation}</Text>;
                      },
                      youtubevideo: (block) => (
                        <Image
                          src={block.props.videoThumbnail}
                          source={{ uri: block.props.videoThumbnail }}
                        />
                      ),
                      column: (block) => {
                        return (
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              justifyContent: "space-between",
                              width: block.props.width,
                            }}
                          >
                            {block.props.width}
                          </View>
                        );
                      },
                      columnList: () => {
                        return (
                          <View
                            style={{
                              width: "50%",
                              flexDirection: "row",
                              flexWrap: "wrap",
                              justifyContent: "space-between",
                            }}
                          >
                            Hi
                          </View>
                        );
                      },
                    },
                    inlineContentMapping:
                      pdfDefaultSchemaMappings.inlineContentMapping,
                    styleMapping: pdfDefaultSchemaMappings.styleMapping,
                  });

                  const pdfDoc = await exporter.toReactPDFDocument(
                    editor.document
                  );
                  setPdfDoc(pdfDoc);
                  setPdfVisible(true);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M14 2v6h6' />
                  <path d='M4 14v6h16v-7' />
                  <path d='M4 9V4a2 2 0 0 1 2-2h8l6 6v2' />
                </svg>
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Updated Attachments section with improved grid */}
      </div>

      {/* Main content */}
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 z-50 bg-background/95 backdrop-blur-sm w-screen h-screen flex flex-col ${
          pdfvisible ? "block" : "hidden"
        }`}
      >
        <div className='p-4 flex justify-end'>
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-accent'
            onClick={() => setPdfVisible(false)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <line x1='18' y1='6' x2='6' y2='18'></line>
              <line x1='6' y1='6' x2='18' y2='18'></line>
            </svg>
          </Button>
        </div>
        {pdfDoc && (
          <PDFViewer style={{ width: "100%", height: "calc(100% - 60px)" }}>
            {pdfDoc}
          </PDFViewer>
        )}
      </div>
      <div className='mt-4'>
        {/* Move cover image outside sticky header */}

        {/* Rest of the editor */}
        <div className='w-full mx-auto px-0 md:px-20 lg:px-40'>
          <BlockNoteView
            editor={editor}
            // theme={theme}
            className='min-h-screen'
            slashMenu={false}
            data-theming-css-variables-editor
            theme={theme === "light" ? lightTheme : darkTheme}
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
        </div>
      </div>
    </div>
  );
}
