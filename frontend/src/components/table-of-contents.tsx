import { Card } from "@/components/ui/card";
import { PartialBlock } from "@blocknote/core";
import extractTableOfContents from "../lib/toc";

interface Toc {
  title: titleProps[];
  sections: Toc[];
}

interface titleProps {
  type: string;
  text: string;
  styles: string;
}

export function TableOfContents({ content }: { content: PartialBlock[] }) {
  const toc = extractTableOfContents(content);
  console.log("Toc", toc);
  return (
    <Card className='fixed right-4 top-20 w-64 overflow-y-auto max-h-[calc(100vh-10rem)] z-50 bg-background/60 backdrop-blur-sm border border-border/50'>
      <div className='p-4'>
        <h3 className='font-medium text-sm text-muted-foreground mb-4'>
          Table of Contents
        </h3>
        <nav className='space-y-1'>
          {toc &&
            toc.length > 0 &&
            toc.map((heading: Toc) => (
              <div key={heading.title[0].text} className='ml-2'>
                <h4 className='text-sm font-semibold'>
                  {heading.title[0].text}
                </h4>
                <ul className='space-y-1'>
                  {heading.sections &&
                    heading.sections.length > 0 &&
                    heading.sections.map((section: Toc) => (
                      <li key={section.title[0].text} className='ml-2'>
                        <a href='#'>- {section.title[0].text}</a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
        </nav>
      </div>
    </Card>
  );
}
