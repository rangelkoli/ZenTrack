
import {

    PartialBlock,

  } from "@blocknote/core";



export default function extractTableOfContents(data: PartialBlock[]) {
    const toc: any[] = [];

    console.log(data);
    data.forEach(item => {
      if (item.type === 'heading') {
        if (item.props?.level === 1) {
          // Main title
          console.log(item.content);
          toc.push({ title: item.content, sections: [] });
          console.log(toc);
        } else if (item.props?.level === 2) {
          // Subtitle
          const last = toc[toc.length - 1];
          if (last) {
            last.sections.push({ title: item.content, sections: [] });
          }
        }
      }
    });
    console.log(toc);
    return toc;
  }
