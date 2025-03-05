import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export default function BlockNotePreview() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: "Welcome to this demo!",
      },
      {
        type: "paragraph",
        content: "Open up a menu or toolbar to see more of the red theme",
      },
      {
        type: "paragraph",
        content:
          "Toggle light/dark mode in the page footer and see the theme change too",
      },
      {
        type: "paragraph",
      },
    ],
  });

  // Renders the editor instance using a React component.
  // Adds `data-theming-css-variables-demo` to restrict styles to only this demo.
  return (
    <BlockNoteView
      editor={editor}
      className='h-full w-full'
      style={{
        height: "100%",
        width: "100%",
      }}
      theme={"light"}
    />
  );
}
