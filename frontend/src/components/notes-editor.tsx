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
// Remove these CSS imports
// import "@blocknote/core/fonts/inter.css";
// import "@blocknote/mantine/style.css";
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
import { TableOfContents } from "./table-of-contents";
import { useToast } from "@/hooks/use-toast";
import "./editorstyles.css";
import { FormatWithAIButton } from "./FormatButton";
import { Button } from "@/components/ui/button";
import { PlusCircle, Paperclip, Clock, FileText, Trash2 } from "lucide-react";
import { useAutosave } from "@/hooks/use-autosave";
import { LatexBlock } from "./LatexBlock";
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import { PDFViewer } from "@react-pdf/renderer";
import { Text } from "@react-pdf/renderer";

interface Attachment {
  id: string;
  filename: string;
  url: string;
  file_type?: string;
  size: number;
  created_at: string;
}

export default function NotesEditor() {
  const [initialContent, setInitialContent] = useState<
    PartialBlock[] | undefined | "loading"
  >("loading");
  const { toast } = useToast();

  // Gets the note ID from the URL.
  const { uuid } = useParams<{ uuid: string }>();
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

  // Add ref to track if content has changed
  const hasChanges = useRef(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        setCoverUrl(res.data[0].cover_image);
        console.log("coverUrl", res.data[0].cover_image);
        setNewTitle(res.data[0].title);
        setLastSaved(new Date(res.data[0].updated_at));
      });
    return undefined;
  }

  // Add function to load attachments
  const loadAttachments = async () => {
    if (!uuid) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/notes/${uuid}/attachments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (Array.isArray(response.data)) {
        setAttachments(response.data);
      }
    } catch (error) {
      console.error("Error loading attachments:", error);
      toast({
        title: "Error",
        description: "Failed to load attachments",
        style: { backgroundColor: "#ff4444", color: "#F3F4F6" },
      });
    }
  };

  // Add formatFileSize utility function
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Add function to handle attachment deletion
  const handleDelete = async (attachmentId: string) => {
    try {
      await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/notes/${uuid}/attachments/${attachmentId}`
      );
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      toast({
        title: "Success",
        description: "Attachment deleted",
        style: { backgroundColor: "#4BB543", color: "#F3F4F6" },
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        style: { backgroundColor: "#ff4444", color: "#F3F4F6" },
      });
    }
  };

  useEffect(() => {
    loadFromStorage().then((content) => {
      setInitialContent(content);
    });
    loadAttachments();
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
      formData.append("file", file);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/notes/${uuid}/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Files uploaded successfully:", response.data);

      toast({
        title: "Success",
        description: "Files uploaded successfully",
        style: { backgroundColor: "#4BB543", color: "#F3F4F6" },
        duration: 3000,
      });

      await loadAttachments(); // Refresh attachments after successful upload
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

  const [pdfContent, setPdfContent] = useState<any>(null);
  const [pdfvisible, setPdfVisible] = useState(false);

  if (editor === undefined) {
    return "Loading content...";
  }

  return (
    <div className='relative'>
      {/* Title and Attachments sticky header */}
      <div className='sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b'>
        {/* Title section */}
        <div className='max-w-4xl mx-auto px-4 py-2 flex items-center'>
          <div className='flex flex-col w-full md:flex-row md:items-center md:justify-between'>
            <div className='flex-1 sm:mr-4'>
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
              <div className='flex items-center gap-2 text-sm text-muted-foreground sm:gap-4'>
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
                  const exporter = new PDFExporter(editor.schema, {
                    // Add custom schema mappings for LaTeX block
                    ...pdfDefaultSchemaMappings,
                    block: {
                      latex: {
                        render: (props: any) => {
                          // Return a simple representation of the LaTeX equation
                          return (
                            <Text
                              style={{
                                fontFamily: "KaTeX_Main",
                                fontSize: 12,
                                color: "black",
                              }}
                            >
                              {props.content}
                            </Text>
                          );
                        },
                      },
                    },
                  });

                  const pdfDoc = await exporter.toReactPDFDocument(
                    editor.document
                  );
                  setPdfContent(pdfDoc);
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
        <div className='border-t border-border/50 bg-background/50'>
          <div className='max-w-4xl mx-auto px-4'>
            <div
              className={`
                transition-all duration-500 ease-in-out transform-gpu
                ${isScrolled ? "h-12 py-2" : "py-4"}
              `}
            >
              {/* Header section */}
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Paperclip
                    size={14}
                    className='transition-all duration-300'
                  />
                  <span className='font-medium'>
                    {attachments.length}{" "}
                    {attachments.length === 1 ? "Attachment" : "Attachments"}
                  </span>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 hover:bg-accent'
                  onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                >
                  <PlusCircle size={16} className='mr-2' />
                  Add Files
                </Button>
              </div>

              {/* Improved grid container */}
              <div
                className={`
                  transition-all duration-500 ease-in-out
                  ${
                    isScrolled
                      ? "flex items-center space-x-4 overflow-x-auto hide-scrollbar"
                      : "grid grid-flow-col auto-cols-[280px] gap-4 pb-4 overflow-x-auto scrollbar-thin"
                  }
                `}
              >
                {attachments.length > 0 ? (
                  attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={`
                        group relative flex-shrink-0
                        transition-all duration-300 ease-in-out
                        ${
                          isScrolled
                            ? "inline-flex items-center bg-accent/5 rounded-md px-3 py-1.5 hover:bg-accent/10"
                            : "flex flex-col p-4 border rounded-lg hover:shadow-md hover:border-accent"
                        }
                      `}
                      style={{
                        width: isScrolled ? "auto" : "280px",
                        minWidth: isScrolled ? "200px" : "280px",
                      }}
                    >
                      <div className='flex items-center gap-3 w-full'>
                        <FileText
                          size={isScrolled ? 16 : 20}
                          className={`
                            flex-shrink-0 transition-all duration-300
                            ${getFileIconColor(attachment.file_type)}
                          `}
                        />
                        <div className='flex-1 min-w-0'>
                          <a
                            href={attachment.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='block truncate text-sm font-medium hover:underline'
                            title={attachment.filename}
                          >
                            {attachment.filename}
                          </a>
                          {!isScrolled && (
                            <div className='mt-2 space-y-1'>
                              <p className='text-xs text-muted-foreground'>
                                {formatFileSize(attachment.size)}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {new Date(
                                  attachment.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(attachment.id)}
                          className={`
                            text-muted-foreground hover:text-destructive
                            transition-opacity duration-200
                            ${
                              isScrolled
                                ? "opacity-0 group-hover:opacity-100 ml-2"
                                : "opacity-0 group-hover:opacity-100"
                            }
                          `}
                        >
                          <Trash2 size={isScrolled ? 14 : 16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className={`
                    flex items-center justify-center text-muted-foreground
                    ${
                      isScrolled
                        ? "w-full h-8"
                        : "w-[280px] h-[120px] border-2 border-dashed rounded-lg"
                    }
                  `}
                  >
                    <span className='text-sm'>No attachments yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
        {pdfContent && (
          <PDFViewer style={{ width: "100%", height: "calc(100% - 60px)" }}>
            {pdfContent}
          </PDFViewer>
        )}
      </div>
      <div className='mt-4'>
        {/* Move cover image outside sticky header */}
        {coverUrl && (
          <div className='mx-auto max-w-4xl px-4 mb-8'>
            <img
              src={coverUrl}
              alt='Cover'
              className='w-full h-80 object-cover rounded-lg'
            />
          </div>
        )}

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

// Add this helper function at the top of the file
function getFileIconColor(fileType?: string): string {
  if (!fileType) return "text-muted-foreground";

  const type = fileType.split("/")[0];
  switch (type) {
    case "image":
      return "text-green-500";
    case "video":
      return "text-blue-500";
    case "audio":
      return "text-purple-500";
    case "application":
      return "text-orange-500";
    default:
      return "text-muted-foreground";
  }
}
