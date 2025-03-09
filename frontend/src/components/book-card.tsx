import { Card, CardContent } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { useState } from "react";

interface BookCardProps {
  title: string;
  id: string;
  cover_image?: string;
  updated_at?: Date;
  folder?: string;
}

export function BookCard({
  title,
  id,
  cover_image,
  updated_at,
  folder,
}: BookCardProps) {
  const [imageError, setImageError] = useState(false);

  // Function to handle broken image links
  const handleImageError = () => {
    setImageError(true);
  };

  // Format date
  const formattedDate = updated_at
    ? new Date(updated_at).toLocaleDateString()
    : "";

  return (
    <Card className='overflow-hidden hover:shadow-lg dark:hover:shadow-primary/10 transition-shadow duration-300 cursor-pointer h-full flex flex-col dark:border-border/40'>
      <div
        className='aspect-[3/4] relative'
        onClick={() => {
          window.location.href = `/notes/${id}`;
        }}
      >
        {!imageError && cover_image ? (
          <img
            src={cover_image}
            alt={title}
            className='w-full h-full object-cover'
            onError={handleImageError}
          />
        ) : (
          <div className='w-full h-full bg-gradient-to-br from-muted/60 to-muted dark:from-muted/20 dark:to-muted/60 flex items-center justify-center'>
            <span className='text-2xl font-semibold text-foreground/30 dark:text-foreground/20'>
              {title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <CardContent className='p-4 flex-grow flex flex-col justify-between dark:bg-card'>
        <div>
          <h3 className='font-semibold line-clamp-2 mb-1 dark:text-primary-foreground/90'>
            {title}
          </h3>
          {folder && (
            <div className='flex items-center gap-1 text-xs text-muted-foreground dark:text-muted-foreground/70 mb-1'>
              <Folder className='h-3 w-3' />
              <span>{folder}</span>
            </div>
          )}
        </div>
        {updated_at && (
          <div className='text-xs text-muted-foreground dark:text-muted-foreground/60 mt-2'>
            Updated {formattedDate}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
