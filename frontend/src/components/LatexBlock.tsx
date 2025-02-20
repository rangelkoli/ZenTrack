import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import { useState } from "react";

export const LatexBlock = createReactBlockSpec(
  {
    type: "latex",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      equation: {
        default: "",
        values: ["string"],
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
                  value={block.props.equation}
                  onChange={(e) => updateEquation(e.target.value)}
                  className='w-full p-4 border rounded-md min-h-[120px] font-mono bg-background resize-none focus:outline-none focus:ring-2 focus:ring-accent'
                  placeholder='Enter LaTeX equation... (e.g., \sum_{i=1}^n x_i)'
                />
                {block.props.equation && (
                  <div className='p-4 border rounded-md bg-background'>
                    <p className='text-xs text-muted-foreground mb-2'>
                      Preview:
                    </p>
                    <Latex strict>{block.props.equation}</Latex>
                  </div>
                )}
              </div>
            ) : (
              <div
                className='cursor-pointer max-w-3xl'
                onClick={toggleEditMode}
              >
                <Latex strict>
                  {block.props.equation || "Click to add equation"}
                </Latex>
              </div>
            )}
          </div>
        </div>
      );
    },
  }
);
