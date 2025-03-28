import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import { useState, useRef, useEffect } from "react";

export const YoutubeVideoBlock = createReactBlockSpec(
  {
    type: "youtubevideo",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      videoUrl: {
        default: "",
      },
      videoThumbnail: {
        default: "",
      },
      isEditing: {
        default: true,
        values: ["boolean"],
      },
    },
    content: "none",
  },
  {
    toExternalHTML: ({ block }) => {
      // Extract video ID from URL
      const videoId = extractYoutubeVideoId(block.props.videoUrl);
      if (videoId) {
        return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
      return "";
    },
    parse: (el) => ({
      videoUrl: el.getAttribute("data-video-url") || "",
      videoThumbnail: el.getAttribute("data-video-thumbnail") || "",
    }),
    render: ({ block, editor }) => {
      const [isHovered, setIsHovered] = useState(false);
      const inputRef = useRef<HTMLInputElement>(null);

      const toggleEditMode = () => {
        editor.updateBlock(block, {
          props: { ...block.props, isEditing: !block.props.isEditing },
        });
      };

      const updateVideoUrl = (newUrl: string) => {
        const videoId = extractYoutubeVideoId(newUrl);
        const thumbnailUrl = videoId
          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          : "";

        editor.updateBlock(block, {
          props: {
            ...block.props,
            videoUrl: newUrl,
            videoThumbnail: thumbnailUrl,
          },
        });
      };

      // Extract YouTube video ID from URL
      const videoId = extractYoutubeVideoId(block.props.videoUrl);

      // Update thumbnail if video ID exists but thumbnail is empty
      useEffect(() => {
        if (videoId && !block.props.videoThumbnail) {
          editor.updateBlock(block, {
            props: {
              ...block.props,
              videoThumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            },
          });
        }
      }, [videoId, block.props.videoThumbnail, editor, block]);

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
                                                          isHovered ||
                                                          block.props.isEditing
                                                            ? "opacity-100"
                                                            : "opacity-0"
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
                    : "hover:bg-accent/5 p-4"
                }
            `}
          >
            {block.props.isEditing ? (
              <div className='space-y-4'>
                <input
                  ref={inputRef}
                  value={block.props.videoUrl}
                  onChange={(e) => updateVideoUrl(e.target.value)}
                  className='w-full p-4 border rounded-md bg-background 
                                                                                                         focus:outline-none focus:ring-2 focus:ring-accent
                                                                                                         transition-all duration-200'
                  placeholder='Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)'
                />
                {videoId && (
                  <div className='p-4 border rounded-md bg-background'>
                    <p className='text-xs text-muted-foreground mb-2'>
                      Preview:
                    </p>
                    <div className='aspect-video'>
                      <iframe
                        width='100%'
                        height='100%'
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title='YouTube video player'
                        frameBorder='0'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div onClick={toggleEditMode} className='cursor-pointer w-full'>
                {videoId ? (
                  <div className='aspect-video'>
                    <iframe
                      width='100%'
                      height='100%'
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title='YouTube video player'
                      frameBorder='0'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className='flex justify-center items-center h-24 bg-muted/30 rounded-md'>
                    Click to add YouTube video
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    },
  }
);

// Helper function to extract YouTube video ID from various URL formats
function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}
