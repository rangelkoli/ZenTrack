import { useEffect, useState } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Folder,
  FolderPlus,
  ChevronRight,
  X,
  MoreVertical,
  Trash2,
  Pencil,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Note = {
  title: string;
  content: string;
  id: string;
  cover_image: string;
  updated_at: Date;
  folder_id?: string | null;
};

type Folder = {
  id: string;
  name: string;
  color?: string;
};

export default function NotesDashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [recentNote, setRecentNote] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Note management state
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [moveToFolderDialogOpen, setMoveToFolderDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Folder management state
  const [selectedFolderForAction, setSelectedFolderForAction] =
    useState<Folder | null>(null);
  const [editFolderDialogOpen, setEditFolderDialogOpen] = useState(false);
  const [editedFolderName, setEditedFolderName] = useState("");
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);

  // Fetch notes and folders
  const fetchData = () => {
    setIsLoading(true);

    // Fetch notes
    fetch(`${import.meta.env.VITE_BACKEND_URL}/notes/get_notes/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        data = data.sort((a: Note, b: Note) => {
          const dateA = new Date(a.updated_at);
          const dateB = new Date(b.updated_at);
          return dateB.getTime() - dateA.getTime();
        });
        setNotes(data.slice(1));
        setRecentNote(data.slice(0, 1));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching notes:", err);
        setIsLoading(false);
      });

    // Fetch folders
    fetch(`${import.meta.env.VITE_BACKEND_URL}/notes/folders/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Folders:", data);
        setFolders(data || []);
      })
      .catch((err) => {
        console.error("Error fetching folders:", err);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create a new note
  const createNewNote = (folderId: string | null = null) => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/notes/add_note/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        title: "New note",
        content: JSON.stringify([
          {
            id: "64fd0b46-aa42-40f6-afd3-32b7d5b1b420",
            type: "paragraph",
            props: {
              textColor: "default",
              backgroundColor: "default",
              textAlignment: "left",
            },
            content: [],
            children: [],
          },
        ]),
        folder_id: folderId,
      }),
    }).then((response) => {
      if (response.status === 200) {
        toast.success("New note created");
        fetchData();
      } else {
        toast.error("Failed to create note");
      }
    });
  };

  // Create a new folder
  const createNewFolder = () => {
    if (!newFolderName.trim()) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/notes/folders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        name: newFolderName,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setFolders([...folders, data]);
        setNewFolderName("");
        setNewFolderDialogOpen(false);
        toast.success("Folder created");
      })
      .catch((err) => {
        toast.error("Failed to create folder");
        console.error(err);
      });
  };

  // Edit folder name
  const updateFolderName = () => {
    if (!selectedFolderForAction || !editedFolderName.trim()) return;

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/notes/folders/${
        selectedFolderForAction.id
      }`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          name: editedFolderName,
        }),
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to update folder");
      })
      .then((updatedFolder) => {
        // Update folders list
        setFolders(
          folders.map((folder) =>
            folder.id === selectedFolderForAction.id ? updatedFolder : folder
          )
        );
        toast.success("Folder renamed successfully");
        setEditFolderDialogOpen(false);
        setSelectedFolderForAction(null);
      })
      .catch((err) => {
        toast.error("Failed to rename folder");
        console.error(err);
      });
  };

  // Delete folder
  const deleteFolder = () => {
    if (!selectedFolderForAction) return;

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/notes/folders/${
        selectedFolderForAction.id
      }`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          // If we're currently viewing the folder that's being deleted, reset to all notes
          if (selectedFolder === selectedFolderForAction.id) {
            setSelectedFolder(null);
          }

          // Remove folder from list
          setFolders(
            folders.filter((folder) => folder.id !== selectedFolderForAction.id)
          );
          toast.success("Folder deleted successfully");

          // Refresh notes to update folder assignments
          fetchData();
        } else {
          throw new Error("Failed to delete folder");
        }
      })
      .catch((err) => {
        toast.error("Failed to delete folder");
        console.error(err);
      })
      .finally(() => {
        setDeleteFolderDialogOpen(false);
        setSelectedFolderForAction(null);
      });
  };

  // Move note to folder
  const moveNoteToFolder = (folderId: string | null) => {
    if (!selectedNote) return;

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/notes/notes/${selectedNote.id}/move`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          folder_id: folderId,
        }),
      }
    )
      .then((response) => {
        if (response.ok) {
          toast.success(
            `Note moved to ${
              folderId
                ? folders.find((f) => f.id === folderId)?.name
                : "uncategorized"
            }`
          );
          fetchData(); // Refresh notes
          setMoveToFolderDialogOpen(false);
          setSelectedNote(null);
        } else {
          toast.error("Failed to move note");
        }
      })
      .catch((err) => {
        toast.error("Error moving note");
        console.error(err);
      });
  };

  // Delete note
  const deleteNote = () => {
    if (!selectedNote) return;

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/notes/delete_note/${
        selectedNote.id
      }`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          toast.success("Note deleted");
          fetchData(); // Refresh notes
          setDeleteDialogOpen(false);
          setSelectedNote(null);
        } else {
          toast.error("Failed to delete note");
        }
      })
      .catch((err) => {
        toast.error("Error deleting note");
        console.error(err);
      });
  };

  // Filter notes based on search query and selected folder
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder
      ? true
      : selectedFolder === "uncategorized"
      ? !note.folder_id
      : note.folder_id === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  // Get folder name by ID
  const getFolderName = (folderId: string | null | undefined) => {
    if (!folderId) return "Uncategorized";
    const folder = folders.find((f) => f.id === folderId);
    return folder ? folder.name : "Uncategorized";
  };

  // Note actions menu
  const NoteActions = ({ note }: { note: Note }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='h-8 w-8 p-0'
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <MoreVertical className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setSelectedNote(note);
            setMoveToFolderDialogOpen(true);
          }}
        >
          <Folder className='mr-2 h-4 w-4' />
          Move to folder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setSelectedNote(note);
            setDeleteDialogOpen(true);
          }}
          className='text-destructive focus:text-destructive'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Folder actions menu component
  const FolderActions = ({ folder }: { folder: Folder }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Folder actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setSelectedFolderForAction(folder);
            setEditedFolderName(folder.name);
            setEditFolderDialogOpen(true);
          }}
        >
          <Pencil className='mr-2 h-4 w-4' />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setSelectedFolderForAction(folder);
            setDeleteFolderDialogOpen(true);
          }}
          className='text-destructive focus:text-destructive'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <motion.div
      className='min-h-screen bg-background dark:bg-background/95'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className='sticky top-0 z-10 bg-background/80 dark:bg-background/90 backdrop-blur-sm border-b dark:border-border/40'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between gap-4 flex-wrap'>
            <motion.div
              className='relative flex-1 max-w-md'
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search notes...'
                className='w-full pl-9 bg-muted/50 dark:bg-muted/20'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </motion.div>

            <motion.div
              className='flex gap-2'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Select
                value={view}
                onValueChange={(value) => setView(value as "grid" | "list")}
              >
                <SelectTrigger className='w-[100px]'>
                  <SelectValue placeholder='View' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='grid'>Grid</SelectItem>
                  <SelectItem value='list'>List</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setNewFolderDialogOpen(true)}
                variant='outline'
                className='flex items-center gap-2'
              >
                <FolderPlus className='h-4 w-4' />
                New Folder
              </Button>

              <Button
                onClick={() => createNewNote(selectedFolder)}
                className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground'
              >
                <Plus className='h-4 w-4' />
                New Note
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <main className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-12 gap-6'>
          {/* Folders Sidebar */}
          <motion.div
            className='col-span-12 md:col-span-3 space-y-4'
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className='sticky top-24'>
              <h3 className='font-medium mb-4 dark:text-primary-foreground'>
                Folders
              </h3>
              <div className='space-y-1'>
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left ${
                    selectedFolder === null
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                      : "hover:bg-muted dark:hover:bg-muted/20"
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <Folder className='h-4 w-4' />
                    <span>All Notes</span>
                  </div>
                  <span className='text-xs text-muted-foreground dark:text-muted-foreground/60'>
                    {notes.length}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFolder("uncategorized")}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left ${
                    selectedFolder === "uncategorized"
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                      : "hover:bg-muted dark:hover:bg-muted/20"
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <Folder className='h-4 w-4' />
                    <span>Uncategorized</span>
                  </div>
                  <span className='text-xs text-muted-foreground dark:text-muted-foreground/60'>
                    {notes.filter((note) => !note.folder_id).length}
                  </span>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-left group ${
                      selectedFolder === folder.id
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                        : "hover:bg-muted dark:hover:bg-muted/20"
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <Folder
                        className='h-4 w-4'
                        style={{ color: folder.color || "currentColor" }}
                      />
                      <span>{folder.name}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <span className='text-xs text-muted-foreground dark:text-muted-foreground/60'>
                        {
                          notes.filter((note) => note.folder_id === folder.id)
                            .length
                        }
                      </span>
                      <FolderActions folder={folder} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Notes Content */}
          <motion.div
            className='col-span-12 md:col-span-9'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode='wait'>
              {recentNote[0] && !searchQuery && !selectedFolder && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className='mb-12'
                >
                  <h2 className='text-2xl font-semibold mb-6'>
                    Continue Editing
                  </h2>
                  <div className='relative group'>
                    <AudioPlayer
                      title={recentNote[0].title}
                      author={getFolderName(recentNote[0].folder_id)}
                      coverUrl={recentNote[0].cover_image}
                      id={recentNote[0].id}
                    />
                    <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <NoteActions note={recentNote[0]} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-semibold dark:text-primary-foreground'>
                  {selectedFolder
                    ? selectedFolder === "uncategorized"
                      ? "Uncategorized Notes"
                      : `${getFolderName(selectedFolder)} Notes`
                    : searchQuery
                    ? "Search Results"
                    : "All Notes"}
                </h2>

                {selectedFolder && (
                  <Button
                    onClick={() =>
                      createNewNote(
                        selectedFolder !== "uncategorized"
                          ? selectedFolder
                          : null
                      )
                    }
                    size='sm'
                    className='flex items-center gap-2'
                  >
                    <Plus className='h-3 w-3' />
                    Add to Folder
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className='flex justify-center py-12'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary/70'></div>
                </div>
              ) : filteredNotes.length > 0 ? (
                view === "grid" ? (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                        className='transition-shadow duration-300 hover:shadow-lg relative group'
                      >
                        <BookCard
                          {...note}
                          folder={getFolderName(note.folder_id)}
                        />
                        <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10'>
                          <NoteActions note={note} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {filteredNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div
                          className='flex items-center p-3 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/10 cursor-pointer relative group'
                          onClick={() =>
                            (window.location.href = `/notes/${note.id}`)
                          }
                        >
                          <div className='h-10 w-10 rounded-md overflow-hidden mr-4'>
                            {note.cover_image ? (
                              <img
                                src={note.cover_image}
                                alt={note.title}
                                className='h-full w-full object-cover'
                              />
                            ) : (
                              <div className='h-full w-full bg-muted dark:bg-muted/50 flex items-center justify-center'>
                                <span className='text-xs text-muted-foreground dark:text-muted-foreground/70'>
                                  Note
                                </span>
                              </div>
                            )}
                          </div>
                          <div className='flex-grow'>
                            <h3 className='font-medium dark:text-primary-foreground/90'>
                              {note.title}
                            </h3>
                            <p className='text-sm text-muted-foreground dark:text-muted-foreground/70'>
                              {getFolderName(note.folder_id)} ·{" "}
                              {new Date(note.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className='opacity-0 group-hover:opacity-100 transition-opacity mr-2'>
                            <NoteActions note={note} />
                          </div>
                          <ChevronRight className='h-4 w-4 text-muted-foreground dark:text-muted-foreground/70' />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='text-center py-12'
                >
                  <p className='text-muted-foreground dark:text-muted-foreground/70'>
                    {searchQuery
                      ? "No notes found matching your search."
                      : selectedFolder
                      ? "No notes in this folder yet."
                      : "No notes yet. Create your first note!"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Folder Name</Label>
              <Input
                id='name'
                placeholder='Enter folder name...'
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setNewFolderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={createNewFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Folder Dialog */}
      <Dialog
        open={moveToFolderDialogOpen}
        onOpenChange={setMoveToFolderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
            <DialogDescription>
              Select a folder to move "{selectedNote?.title}" to.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2 py-4 max-h-[50vh] overflow-auto'>
            <button
              onClick={() => moveNoteToFolder(null)}
              className='w-full flex items-center p-2 rounded-md hover:bg-muted/80 text-left'
            >
              <Folder className='h-5 w-5 mr-2' />
              <span>Uncategorized</span>
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => moveNoteToFolder(folder.id)}
                className='w-full flex items-center p-2 rounded-md hover:bg-muted/80 text-left'
              >
                <Folder
                  className='h-5 w-5 mr-2'
                  style={{ color: folder.color || "currentColor" }}
                />
                <span>{folder.name}</span>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setMoveToFolderDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedNote?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive hover:bg-destructive/90'
              onClick={deleteNote}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Folder Dialog */}
      <Dialog
        open={editFolderDialogOpen}
        onOpenChange={setEditFolderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='folder-name'>Folder Name</Label>
              <Input
                id='folder-name'
                placeholder='Enter folder name'
                value={editedFolderName}
                onChange={(e) => setEditedFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setEditFolderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateFolderName}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation */}
      <AlertDialog
        open={deleteFolderDialogOpen}
        onOpenChange={setDeleteFolderDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the folder "
              {selectedFolderForAction?.name}"? Notes in this folder will be
              moved to Uncategorized. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive hover:bg-destructive/90'
              onClick={deleteFolder}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
