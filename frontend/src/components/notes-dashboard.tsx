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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

  // Fetch notes and folders
  useEffect(() => {
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
        window.location.reload();
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
      });
  };

  // Filter notes based on search query and selected folder
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || note.folder_id === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  // Get folder name by ID
  const getFolderName = (folderId: string | null | undefined) => {
    if (!folderId) return "Uncategorized";
    const folder = folders.find((f) => f.id === folderId);
    return folder ? folder.name : "Uncategorized";
  };

  return (
    <motion.div
      className='min-h-screen bg-background'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className='sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b'>
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
                className='w-full pl-9 bg-muted/50'
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
              <h3 className='font-medium mb-4'>Folders</h3>
              <div className='space-y-1'>
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left ${
                    selectedFolder === null
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <Folder className='h-4 w-4' />
                    <span>All Notes</span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {notes.length}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFolder("uncategorized")}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left ${
                    selectedFolder === "uncategorized"
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <Folder className='h-4 w-4' />
                    <span>Uncategorized</span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {notes.filter((note) => !note.folder_id).length}
                  </span>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-left ${
                      selectedFolder === folder.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <Folder
                        className='h-4 w-4'
                        style={{ color: folder.color || "currentColor" }}
                      />
                      <span>{folder.name}</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {
                        notes.filter((note) => note.folder_id === folder.id)
                          .length
                      }
                    </span>
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
                  <AudioPlayer
                    title={recentNote[0].title}
                    author={getFolderName(recentNote[0].folder_id)}
                    coverUrl={recentNote[0].cover_image}
                    id={recentNote[0].id}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-semibold'>
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
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
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
                        className='transition-shadow duration-300 hover:shadow-lg'
                      >
                        <BookCard
                          {...note}
                          folder={getFolderName(note.folder_id)}
                        />
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
                          className='flex items-center p-3 rounded-lg hover:bg-muted/50 cursor-pointer'
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
                              <div className='h-full w-full bg-muted flex items-center justify-center'>
                                <span className='text-xs text-muted-foreground'>
                                  Note
                                </span>
                              </div>
                            )}
                          </div>
                          <div className='flex-grow'>
                            <h3 className='font-medium'>{note.title}</h3>
                            <p className='text-sm text-muted-foreground'>
                              {getFolderName(note.folder_id)} ·{" "}
                              {new Date(note.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronRight className='h-4 w-4 text-muted-foreground' />
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
                  <p className='text-muted-foreground'>
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
    </motion.div>
  );
}
