import { useState } from "react";
import { PartialBlock } from "@blocknote/core";
import extractTableOfContents from "../lib/toc";
import { useTheme } from "./theme-provider";
import { motion } from "framer-motion";

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
  const [showToc, setShowToc] = useState(false); // State to control visibility of table of contents
  const toc = extractTableOfContents(content);
  console.log("Toc", toc);

  const toggleToc = () => {
    setShowToc(!showToc);
  };
  const { theme } = useTheme();
  return (
    <div onMouseLeave={() => setShowToc(false)}>
      <button
        className='fixed right-0 top-20 p-2 bg-gray-200 rounded-full hover:bg-gray-300'
        onMouseEnter={() => setShowToc(true)}
      >
        Hover Me
      </button>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, type: "tween", ease: "easeOut" }}
        className={`fixed right-4 top-20 w-64 overflow-y-auto max-h-[calc(100vh-10rem)] z-50 bg-background/60 backdrop-blur-sm border border-border/50 ${
          showToc ? "" : "hidden"
        }
        ${theme === "dark" ? "text-white" : "text-black"}
        `}
      >
        <button
          onClick={toggleToc}
          className='absolute top-2 right-2 text-sm text-muted-foreground'
        >
          {showToc ? "Hide" : "Show"} Table of Contents
        </button>

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
      </motion.div>
    </div>
  );
}
