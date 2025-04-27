figma.showUI(__html__, { width: 400, height: 600 });

// Define priority colors
const priorityColors = {
  high: { r: 1, g: 0.3, b: 0.3 },         // Red
  medium: { r: 1, g: 0.65, b: 0.2 },      // Orange
  low: { r: 0.2, g: 0.8, b: 0.4 }         // Green
};

// Define type icons
const typeIcons = {
  feedback: "💬",
  bug: "🐞",
  idea: "💡",
  task: "✅",
  question: "❓"
};

// Listen for selection changes
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  if (selection.length === 1) {
    const selectedNode = selection[0];
    let elementType = selectedNode.type.toLowerCase();
    
    // Make the type more user-friendly
    if (elementType === 'instance') elementType = 'component';
    if (elementType === 'rectangle' || elementType === 'ellipse' || 
        elementType === 'polygon' || elementType === 'star' || 
        elementType === 'vector') elementType = 'shape';
    
    figma.ui.postMessage({
      type: 'selection-updated',
      selectedElement: selectedNode.id,
      elementType: elementType
    });
  } else {
    figma.ui.postMessage({
      type: 'selection-updated',
      selectedElement: null,
      elementType: null
    });
  }
});

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-selection') {
    const selection = figma.currentPage.selection;
    if (selection.length === 1) {
      const selectedNode = selection[0];
      let elementType = selectedNode.type.toLowerCase();
      
      // Make the type more user-friendly
      if (elementType === 'instance') elementType = 'component';
      if (elementType === 'rectangle' || elementType === 'ellipse' || 
          elementType === 'polygon' || elementType === 'star' || 
          elementType === 'vector') elementType = 'shape';
      
      figma.ui.postMessage({
        type: 'selection-updated',
        selectedElement: selectedNode.id,
        elementType: elementType
      });
    } else {
      figma.ui.postMessage({
        type: 'selection-updated',
        selectedElement: null,
        elementType: null
      });
    }
  }
  
  else if (msg.type === 'create-note') {
    try {
      // Show loading notification
      figma.notify('Creating your note...', { timeout: 1500 });

      // Load fonts
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

      // Extract data from message
      const { title, description, noteType, priority, tags, linkedElement } = msg;
      
      // Get current date
      const dateCreated = new Date().toLocaleDateString();
      
      // Create a frame for the note
      const frame = figma.createFrame();
      frame.name = `Note: ${title}`;
      frame.layoutMode = 'VERTICAL';
      frame.primaryAxisSizingMode = 'AUTO';
      frame.counterAxisSizingMode = 'FIXED';
      frame.paddingTop = 16;
      frame.paddingBottom = 16;
      frame.paddingLeft = 16;
      frame.paddingRight = 16;
      frame.itemSpacing = 12;
      frame.cornerRadius = 12;
      frame.resize(320, frame.height); // Set fixed width
      
      // Set the background color based on priority
      const noteColor = priorityColors[priority];
      
      // Add a subtle gradient overlay
      const gradientOpacity = 0.1;
      frame.fills = [
        { type: 'SOLID', color: noteColor },
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

      // Create header section
      const headerSection = figma.createFrame();
      headerSection.layoutMode = 'HORIZONTAL';
      headerSection.primaryAxisSizingMode = 'FIXED';
      headerSection.counterAxisSizingMode = 'AUTO';
      headerSection.primaryAxisAlignItems = 'SPACE_BETWEEN';
      headerSection.fills = [];
      headerSection.resize(288, headerSection.height);
      
      // Create type indicator
      const typeIndicator = figma.createFrame();
      typeIndicator.layoutMode = 'HORIZONTAL';
      typeIndicator.primaryAxisSizingMode = 'AUTO';
      typeIndicator.counterAxisSizingMode = 'AUTO';
      typeIndicator.paddingLeft = 8;
      typeIndicator.paddingRight = 8;
      typeIndicator.paddingTop = 4;
      typeIndicator.paddingBottom = 4;
      typeIndicator.itemSpacing = 6;
      typeIndicator.cornerRadius = 4;
      typeIndicator.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.1 }];

      const typeText = figma.createText();
      typeText.characters = `${typeIcons[noteType]} ${noteType.toUpperCase()}`;
      typeText.fontSize = 10;
      typeText.fontName = { family: "Inter", style: "Bold" };
      typeText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

      typeIndicator.appendChild(typeText);
      
      // Create priority indicator
      const priorityIndicator = figma.createFrame();
      priorityIndicator.layoutMode = 'HORIZONTAL';
      priorityIndicator.primaryAxisSizingMode = 'AUTO';
      priorityIndicator.counterAxisSizingMode = 'AUTO';
      priorityIndicator.paddingLeft = 8;
      priorityIndicator.paddingRight = 8;
      priorityIndicator.paddingTop = 4;
      priorityIndicator.paddingBottom = 4;
      priorityIndicator.itemSpacing = 6;
      priorityIndicator.cornerRadius = 4;
      priorityIndicator.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.2 }];

      const priorityText = figma.createText();
      priorityText.characters = `${priority.toUpperCase()} PRIORITY`;
      priorityText.fontSize = 10;
      priorityText.fontName = { family: "Inter", style: "Bold" };
      priorityText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

      priorityIndicator.appendChild(priorityText);
      
      // Add indicators to header
      headerSection.appendChild(typeIndicator);
      headerSection.appendChild(priorityIndicator);
      frame.appendChild(headerSection);

      // Create title
      const titleNode = figma.createText();
      titleNode.characters = title;
      titleNode.fontSize = 18;
      titleNode.fontName = { family: "Inter", style: "Bold" };
      titleNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      titleNode.textAutoResize = 'WIDTH_AND_HEIGHT';
      frame.appendChild(titleNode);

      // Create description
      const descriptionNode = figma.createText();
      descriptionNode.characters = description;
      descriptionNode.fontSize = 14;
      descriptionNode.fontName = { family: "Inter", style: "Regular" };
      descriptionNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.9 }];
      descriptionNode.textAutoResize = 'WIDTH_AND_HEIGHT';
      frame.appendChild(descriptionNode);

      // Create a divider
      const divider = figma.createLine();
      divider.strokeWeight = 1;
      divider.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.2 }];
      divider.resize(288, 0); // 320px - 16px padding on each side
      frame.appendChild(divider);

      // Create metadata section
      const metadataSection = figma.createFrame();
      metadataSection.layoutMode = 'VERTICAL';
      metadataSection.primaryAxisSizingMode = 'AUTO';
      metadataSection.counterAxisSizingMode = 'FIXED';
      metadataSection.itemSpacing = 8;
      metadataSection.fills = [];
      metadataSection.resize(288, metadataSection.height);
      
      // Create date row
      const dateRow = figma.createFrame();
      dateRow.layoutMode = 'HORIZONTAL';
      dateRow.primaryAxisSizingMode = 'FIXED';
      dateRow.counterAxisSizingMode = 'AUTO';
      dateRow.fills = [];
      dateRow.resize(288, dateRow.height);
      dateRow.primaryAxisAlignItems = 'SPACE_BETWEEN';
      
      const dateLabel = figma.createText();
      dateLabel.characters = "Created:";
      dateLabel.fontSize = 12;
      dateLabel.fontName = { family: "Inter", style: "Semi Bold" };
      dateLabel.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.7 }];
      
      const dateValue = figma.createText();
      dateValue.characters = dateCreated;
      dateValue.fontSize = 12;
      dateValue.fontName = { family: "Inter", style: "Medium" };
      dateValue.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      
      dateRow.appendChild(dateLabel);
      dateRow.appendChild(dateValue);
      metadataSection.appendChild(dateRow);
      
      // Add metadata section to frame
      frame.appendChild(metadataSection);
      
      // Create tags section if tags exist
      if (tags && tags.length > 0) {
        const tagsContainer = figma.createFrame();
        tagsContainer.layoutMode = 'HORIZONTAL';
        tagsContainer.primaryAxisSizingMode = 'AUTO';
        tagsContainer.counterAxisSizingMode = 'AUTO';
        tagsContainer.itemSpacing = 8;
        tagsContainer.fills = [];
        
        // Create tag nodes
        const tagFrames: FrameNode[] = [];
        tags.forEach(tag => {
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
          tagNode.fontSize = 12;
          tagNode.fontName = { family: "Inter", style: "Medium" };
          tagNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

          tagFrame.appendChild(tagNode);
          tagFrames.push(tagFrame);
        });

        // Add all tag frames to the container
        tagFrames.forEach(tagFrame => {
          tagsContainer.appendChild(tagFrame);
        });

        // Add tags container to the frame
        frame.appendChild(tagsContainer);
      }

      // Position the frame in the viewport
      frame.x = figma.viewport.center.x - 160; // Center horizontally
      frame.y = figma.viewport.center.y - frame.height / 2; // Center vertically

      // Link the note to the selected element if provided
      if (linkedElement) {
        try {
          const element = figma.getNodeById(linkedElement);
          if (element && element.type !== 'DOCUMENT' && element.type !== 'PAGE') {
            // Create a connector line between the note and the element
            const connector = figma.createConnector();
            connector.strokeWeight = 1;
            connector.connectorStart = {
              endpointNodeId: frame.id,
              magnet: 'AUTO'
            };
            connector.connectorEnd = {
              endpointNodeId: element.id,
              magnet: 'AUTO'
            };
            connector.strokes = [{ type: 'SOLID', color: noteColor }];
          }
        } catch (error) {
          console.error("Error linking to element:", error);
        }
      }

      // Add the frame to the current page
      figma.currentPage.appendChild(frame);

      // Notify the UI that the note was created
      figma.ui.postMessage({
        type: 'create-note-success',
        message: `Created note: ${title}`,
      });
      
      // Show a success notification
      figma.notify('Note created successfully!', { timeout: 2000 });
    } catch (error) {
      console.error("Error creating note:", error);
      figma.ui.postMessage({
        type: 'error',
        message: 'Failed to create note. Please try again.'
      });
    }
  }

  // Don't close the plugin after creating a note
  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};