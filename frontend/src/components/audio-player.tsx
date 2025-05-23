import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router";

interface AudioPlayerProps {
  title: string;
  author: string;
  coverUrl: string;
  id: string;
}

export function AudioPlayer({ title, author, coverUrl, id }: AudioPlayerProps) {
  return (
    <Card className='overflow-hidden'>
      <Link to={`/notes/${id}`} className='block'>
        <CardContent className='relative p-0'>
          <div className='relative h-[300px] w-full'>
            <img
              src={coverUrl}
              alt={title}
              className='object-fill'
              sizes='100%'
            />
          </div>
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white'>
            <h2 className='text-2xl font-bold'>{title}</h2>
            <p className='text-sm opacity-90'>{author}</p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
