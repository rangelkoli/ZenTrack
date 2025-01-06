import { Card, CardContent } from "@/components/ui/card";

interface BookCardProps {
  title: string;
  cover_image: string;
  duration?: string;
  progress?: number;
  id: string;
}

export function BookCard({ title, cover_image, id }: BookCardProps) {
  return (
    <Card
      className='group relative overflow-hidden border-0 bg-transparent shrink-0'
      onClick={() => (window.location.href = `/notes/${id}`)}
    >
      <CardContent className='p-0'>
        <div className='relative h-64 w-80'>
          {cover_image ? (
            <img
              src={cover_image}
              alt={title}
              className='rounded-lg object-fill'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          ) : (
            <img
              src='https://placehold.co/800x750'
              alt='Placeholder'
              className='rounded-lg object-fill'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg' />
          <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
            <h3 className='text-sm font-semibold line-clamp-2'>{title}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
