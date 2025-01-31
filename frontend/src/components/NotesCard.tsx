import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NotesCard({
  title,
  description,
  imageLink,
  id,
}: {
  title: string;
  description: string;
  imageLink: string;
  id: string;
}) {
  return (
    <Card
      className='w-full'
      onClick={() => {
        window.location.href = `/notes/${id}`;
      }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <img src={imageLink} alt='Deploy' className='w-full h-32' />
        <CardDescription>{description}</CardDescription>
      </CardContent>
      {/* <CardFooter className='flex justify-between'>
        <Button variant='outline'>Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter> */}
    </Card>
  );
}
