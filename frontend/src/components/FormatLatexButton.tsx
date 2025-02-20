import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface FormatLatexButtonProps {
  onFormat: () => Promise<void>;
  isFormatting?: boolean;
}

export function FormatLatexButton({
  onFormat,
  isFormatting,
}: FormatLatexButtonProps) {
  return (
    <Button
      onClick={onFormat}
      disabled={isFormatting}
      variant='ghost'
      size='sm'
      className='h-8 px-2 hover:bg-accent'
    >
      <Wand2
        size={16}
        className={`mr-2 ${isFormatting ? "animate-spin" : ""}`}
      />
      {isFormatting ? "Formatting..." : "Format with AI"}
    </Button>
  );
}
