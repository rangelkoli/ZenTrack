import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BASE_URL from "@/constants/baseurl";
import { useToast } from "@/hooks/use-toast";
import { Trash2, FileText, Upload } from "lucide-react";

interface Attachment {
  id: string;
  filename: string;
  url: string;
  file_type: string;
  size: number;
  created_at: string;
}

export function AttachmentsList() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { id: noteId } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const loadAttachments = async () => {
    if (!noteId) return;
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}/notes/${noteId}/attachments`
      );
      console.log("Loaded attachments:", response.data); // Debug log

      if (Array.isArray(response.data)) {
        setAttachments(response.data);
      } else {
        console.error("Invalid attachments data:", response.data);
      }
    } catch (error) {
      console.error("Error loading attachments:", error);
      toast({
        title: "Error",
        description: "Failed to load attachments",
        style: { backgroundColor: "#ff4444", color: "#F3F4F6" },
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [noteId]);

  const handleFiles = async (files: FileList) => {
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          `${BASE_URL}/notes/${noteId}/attachments`,
          formData
        );
        setAttachments((prev) => [...prev, response.data.attachment]);
        toast({
          title: "Success",
          description: `${file.name} uploaded successfully`,
          style: { backgroundColor: "#4BB543", color: "#F3F4F6" },
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          style: { backgroundColor: "#ff4444", color: "#F3F4F6" },
        });
      }
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      await axios.delete(
        `${BASE_URL}/notes/${noteId}/attachments/${attachmentId}`
      );
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      toast({
        title: "Success",
        description: "Attachment deleted successfully",
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      className={`p-4 border rounded-lg transition-all ${
        dragActive ? "border-primary" : "border-border"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold'>Attachments</h2>
        <label className='cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2'>
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload Files"}
          <input
            type='file'
            className='hidden'
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      <div className='relative'>
        <div className='overflow-x-auto flex space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
          {isLoading ? (
            <div className='flex items-center justify-center min-w-[200px] h-32 bg-muted rounded-lg'>
              <p className='text-muted-foreground'>Loading attachments...</p>
            </div>
          ) : attachments.length > 0 ? (
            attachments.map((attachment) => (
              <div
                key={attachment.id}
                className='flex-shrink-0 w-64 p-4 border rounded-lg hover:bg-muted transition-colors group'
              >
                <div className='flex flex-col gap-2'>
                  <div className='flex items-start justify-between'>
                    <FileText
                      size={24}
                      className='text-muted-foreground flex-shrink-0'
                    />
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className='text-destructive opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className='space-y-1'>
                    <a
                      href={attachment.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 hover:underline font-medium line-clamp-1'
                      title={attachment.filename}
                    >
                      {attachment.filename}
                    </a>
                    <p className='text-sm text-muted-foreground'>
                      {formatFileSize(attachment.size)}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(attachment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='flex items-center justify-center w-full h-32 bg-muted rounded-lg'>
              <p className='text-muted-foreground'>
                Drop files here or click upload to add attachments
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
