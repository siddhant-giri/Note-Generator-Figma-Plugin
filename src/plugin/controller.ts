figma.showUI(__html__, { width: 400, height: 550 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-sticky-note') {
    const { headline, description, tags, priority } = msg;

    // Show loading notification
    figma.notify('Creating your note...', { timeout: 1500 });

    // Load fonts
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });

    // Create a frame for the note
    const frame = figma.createFrame();
    frame.layoutMode = 'VERTICAL';
    frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'FIXED';
    frame.paddingTop = 24;
    frame.paddingBottom = 24;
    frame.paddingLeft = 24;
    frame.paddingRight = 24;
    frame.itemSpacing = 16;
    frame.cornerRadius = 16;
    frame.name = `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Note`;
    frame.resize(400, frame.height); // Set fixed width

    // Set the background color based on priority
    const priorityColor = {
      low: { r: 0.2, g: 0.8, b: 0.2 },
      medium: { r: 1, g: 0.8, b: 0.2 },
      high: { r: 1, g: 0.2, b: 0.2 }
    };
    
    // Add a subtle gradient overlay
    const gradientOpacity = 0.1;
    frame.fills = [
      { type: 'SOLID', color: priorityColor[priority] },
      { 
        type: 'GRADIENT_LINEAR', 
        gradientTransform: [
          [1, 0, 0],
          [0, 1, 0]
        ],
        gradientStops: [
          { position: 0, color: { r: 1, g: 1, b: 1, a: gradientOpacity } },
          { position: 1, color: { r: 0, g: 0, b: 0, a: gradientOpacity } }
        ]
      }
    ];
    
    // Add a subtle shadow
    frame.effects = [
      {
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: 4 },
        radius: 12,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL'
      }
    ];

    // Create priority indicator
    const priorityIndicator = figma.createFrame();
    priorityIndicator.layoutMode = 'HORIZONTAL';
    priorityIndicator.primaryAxisSizingMode = 'AUTO';
    priorityIndicator.counterAxisSizingMode = 'AUTO';
    priorityIndicator.paddingLeft = 12;
    priorityIndicator.paddingRight = 12;
    priorityIndicator.paddingTop = 6;
    priorityIndicator.paddingBottom = 6;
    priorityIndicator.itemSpacing = 8;
    priorityIndicator.cornerRadius = 12;
    priorityIndicator.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.1 }];

    const priorityText = figma.createText();
    priorityText.characters = `${priority.toUpperCase()} PRIORITY`;
    priorityText.fontSize = 12;
    priorityText.fontName = { family: "Inter", style: "Bold" };
    priorityText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

    priorityIndicator.appendChild(priorityText);
    frame.appendChild(priorityIndicator);

    // Create headline
    const headlineNode = figma.createText();
    headlineNode.characters = headline;
    headlineNode.fontSize = 28;
    headlineNode.fontName = { family: "Inter", style: "Bold" };
    headlineNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    headlineNode.textAutoResize = 'WIDTH_AND_HEIGHT';

    // Create description
    const descriptionNode = figma.createText();
    descriptionNode.characters = description;
    descriptionNode.fontSize = 16;
    descriptionNode.fontName = { family: "Inter", style: "Regular" };
    descriptionNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.9 }];
    descriptionNode.textAutoResize = 'WIDTH_AND_HEIGHT';

    // Add headline and description to the frame
    frame.appendChild(headlineNode);
    frame.appendChild(descriptionNode);

    // Create a divider and tags section only if tags exist
    if (tags && tags.length > 0) {
      const divider = figma.createLine();
      divider.strokeWeight = 1;
      divider.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.2 }];
      divider.resize(352, 0); // 400px - 24px padding on each side
      frame.appendChild(divider);

      // Create a container for tags
      const tagsContainer = figma.createFrame();
      tagsContainer.layoutMode = 'HORIZONTAL';
      tagsContainer.primaryAxisSizingMode = 'AUTO';
      tagsContainer.counterAxisSizingMode = 'AUTO';
      tagsContainer.itemSpacing = 8;
      tagsContainer.fills = [];

      // Limit tags to 3
      const limitedTags = tags.slice(0, 3);

      // Create tag nodes
      limitedTags.forEach(tag => {
        const tagFrame = figma.createFrame();
        tagFrame.layoutMode = 'HORIZONTAL';
        tagFrame.primaryAxisSizingMode = 'AUTO';
        tagFrame.counterAxisSizingMode = 'AUTO';
        tagFrame.paddingLeft = 12;
        tagFrame.paddingRight = 12;
        tagFrame.paddingTop = 6;
        tagFrame.paddingBottom = 6;
        tagFrame.cornerRadius = 16;
        tagFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.15 }];

        const tagNode = figma.createText();
        tagNode.characters = tag;
        tagNode.fontSize = 14;
        tagNode.fontName = { family: "Inter", style: "Medium" };
        tagNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

        tagFrame.appendChild(tagNode);
        tagsContainer.appendChild(tagFrame);
      });

      // Add tags container to the frame
      frame.appendChild(tagsContainer);
    }

    // Position the frame in the viewport
    frame.x = figma.viewport.center.x - 200; // Center horizontally
    frame.y = figma.viewport.center.y - frame.height / 2; // Center vertically

    // Add the frame to the current page
    figma.currentPage.appendChild(frame);

    // Notify the UI that the note was created
    figma.ui.postMessage({
      type: 'create-sticky-note',
      message: `Created a sticky note with headline: ${headline}`,
    });
    
    // Show a success notification
    figma.notify('Note created successfully!', { timeout: 2000 });
  }

  // Don't close the plugin after creating a note
  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};