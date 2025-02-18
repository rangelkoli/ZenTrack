import { useBlockNoteEditor, useComponentsContext } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { useState } from "react";
import BASE_URL from "@/constants/baseurl";

export function FormatWithAIButton() {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;
  const [isFormatting, setIsFormatting] = useState(false);
  const [progressText, setProgressText] = useState("");

  const typewriterEffect = async (
    originalBlocks: any[],
    newText: string,
    blockIndex: number,
    charIndex: number
  ) => {
    if (blockIndex >= originalBlocks.length) return;

    const blocks = [...originalBlocks];
    const currentBlock = { ...blocks[blockIndex] };
    const contentItem = { ...currentBlock.content[0] };

    // Update the text one character at a time
    contentItem.text = newText.slice(0, charIndex + 1);
    currentBlock.content = [contentItem];
    blocks[blockIndex] = currentBlock;

    // Replace blocks with current state
    editor.replaceBlocks(originalBlocks, blocks);

    // Continue typing if there are more characters
    if (charIndex < newText.length - 1) {
      setTimeout(() => {
        typewriterEffect(originalBlocks, newText, blockIndex, charIndex + 1);
      }, 50); // Adjust typing speed here
    } else {
      // Move to next block if available
      if (blockIndex < originalBlocks.length - 1) {
        const nextBlockText = blocks[blockIndex + 1].content[0].text;
        setTimeout(() => {
          typewriterEffect(originalBlocks, nextBlockText, blockIndex + 1, 0);
        }, 100);
      }
    }
  };

  const formatWithAI = async () => {
    const selection = editor.getSelection();
    if (!selection?.blocks.length) return;

    setIsFormatting(true);
    setProgressText("Starting formatting...");

    try {
      const response = await fetch(`${BASE_URL}/notes/format_with_ai/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocks: selection.blocks,
        }),
      });

      if (!response.ok) throw new Error("Failed to start formatting");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let receivedValidResponse = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");
        console.log("Received chunk:", chunk); // Debug print
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(5));
              console.log("Received data:", data); // Debug print

              if (data.error) {
                console.error("Server error:", data.error);
                setProgressText(`Error: ${data.error}`);
                continue;
              }

              if (
                data.formatted_blocks &&
                Array.isArray(data.formatted_blocks)
              ) {
                console.log("Applying blocks:", data.formatted_blocks); // Debug print
                setProgressText("Applying formatting...");
                editor.replaceBlocks(selection.blocks, data.formatted_blocks);
                receivedValidResponse = true;
                break;
              }
            } catch (e) {
              console.error("Error parsing chunk:", e, "\nRaw line:", line);
            }
          }
        }

        if (receivedValidResponse) break;
      }
    } catch (error) {
      console.error("Error formatting with AI:", error);
      setProgressText("Error occurred");
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={isFormatting ? progressText : "Format with AI"}
      onClick={formatWithAI}
      isSelected={isFormatting}
    >
      {isFormatting ? progressText : "AI"}
    </Components.FormattingToolbar.Button>
  );
}
