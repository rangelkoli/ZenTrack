import { Card, CardContent } from "@/components/ui/card";

interface AudioPlayerProps {
  title: string;
  author: string;
  coverUrl: string;
}

export function AudioPlayer({ title, author, coverUrl }: AudioPlayerProps) {
  return (
    <Card className='overflow-hidden'>
      <CardContent className='relative p-0'>
        <div className='relative h-[300px] w-full'>
          <img
            src={coverUrl}
            alt={title}
            className='object-cover'
            sizes='100%'
          />
        </div>
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white'>
          <h2 className='text-2xl font-bold'>{title}</h2>
          <p className='text-sm opacity-90'>{author}</p>
        </div>
      </CardContent>
    </Card>
  );
}
