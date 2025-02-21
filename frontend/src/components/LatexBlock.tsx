import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import { useState, useRef, useEffect } from "react";
import { FormatLatexButton } from "./FormatLatexButton";

export const LatexBlock = createReactBlockSpec(
  {
    type: "latex",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      equation: {
        default: "",
        values: ["String"],
      },
      isEditing: {
        default: true,
        values: ["boolean"],
      },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const [isHovered, setIsHovered] = useState(false);
      const [isFormatting, setIsFormatting] = useState(false);
      const textareaRef = useRef<HTMLTextAreaElement>(null);

      // Auto-resize textarea
      const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      };

      // Adjust height on content change
      useEffect(() => {
        adjustHeight();
      }, [block.props.equation]);

      const toggleEditMode = () => {
        editor.updateBlock(block, {
          props: { ...block.props, isEditing: !block.props.isEditing },
        });
      };

      const updateEquation = (newEquation: string) => {
        editor.updateBlock(block, {
          props: { ...block.props, equation: newEquation },
        });
      };

      const formatLatexEquation = async () => {
        if (!block.props.equation) return;

        setIsFormatting(true);
        try {
          const response = await fetch(
            "http://127.0.0.1:5000/notes/format_latex_with_ai/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ equation: block.props.equation }),
            }
          );

          const data = await response.json();
          if (data.error) {
            console.error("LaTeX formatting error:", data.error);
            // You might want to show an error toast here
            return;
          }

          if (data.formatted) {
            updateEquation(data.formatted);
          }
        } catch (error) {
          console.error("Error formatting LaTeX:", error);
          // You might want to show an error toast here
        } finally {
          setIsFormatting(false);
        }
      };

      return (
        <div
          className='w-full group relative transition-all duration-200 ease-in-out'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Control Bar */}
          <div
            className={`
              absolute right-4 top-2 flex items-center gap-2
              transition-opacity duration-200
              ${
                isHovered || block.props.isEditing ? "opacity-100" : "opacity-0"
              }
            `}
          >
            {block.props.isEditing && block.props.equation && (
              <FormatLatexButton
                onFormat={formatLatexEquation}
                isFormatting={isFormatting}
              />
            )}
            <button
              onClick={toggleEditMode}
              className='px-3 py-1 text-xs rounded-md bg-accent/50 hover:bg-accent text-foreground/80 hover:text-foreground transition-colors'
            >
              {block.props.isEditing ? "Preview" : "Edit"}
            </button>
          </div>

          {/* Main Content */}
          <div
            className={`
              w-full rounded-lg transition-all duration-200
              ${
                block.props.isEditing
                  ? "bg-muted/50 p-4"
                  : "hover:bg-accent/5 p-8 flex justify-center"
              }
            `}
          >
            {block.props.isEditing ? (
              <div className='space-y-4'>
                <textarea
                  ref={textareaRef}
                  value={block.props.equation}
                  onChange={(e) => updateEquation(e.target.value)}
                  className='w-full p-4 border rounded-md font-mono bg-background 
                           resize-none focus:outline-none focus:ring-2 focus:ring-accent
                           overflow-hidden min-h-[80px] transition-all duration-200'
                  placeholder='Enter LaTeX equation... (e.g., \sum_{i=1}^n x_i)'
                  style={{ lineHeight: "1.5" }}
                />
                {block.props.equation && (
                  <div className='p-4 border rounded-md bg-background'>
                    <p className='text-xs text-muted-foreground mb-2'>
                      Preview:
                    </p>
                    <Latex>{block.props.equation}</Latex>
                  </div>
                )}
              </div>
            ) : (
              <div
                className='cursor-pointer max-w-3xl'
                onClick={toggleEditMode}
              >
                <Latex>{block.props.equation || "Click to add equation"}</Latex>
              </div>
            )}
          </div>
        </div>
      );
    },
  }
);
