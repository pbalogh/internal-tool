import React, { useState, useEffect, useCallback, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableComponentList, {
  componentMap,
} from "./components/DraggableComponentList";
import ComponentGrid from "./components/ComponentGrid";
import PropConfigSidebar from "./components/PropConfigSidebar";
import PreviewMode from "./components/PreviewMode";
import { DraggableComponent } from "./types/ComponentTypes";
import Container from "@cloudscape-design/components/container";
import Grid from "@cloudscape-design/components/grid";
import AppLayout from "@cloudscape-design/components/app-layout";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Toggle from "@cloudscape-design/components/toggle";
import ThemeToggle from "./components/ThemeToggle";
import cloneDeep from "lodash.clonedeep";

// Maximum number of history states to keep
const MAX_HISTORY = 50;

// Simplified component representation for URL hash
interface SimpleComponent {
  t: string; // type
  i: string; // id
  p: Record<string, any>; // simplified props
  c?: SimpleComponent[]; // children
}

// Add this to your App.tsx or a utility file
const prepareComponentsForSerialization = (
  components: DraggableComponent[]
): DraggableComponent[] => {
  console.log("prepareComponentsForSerialization");

  return components.map((comp) => {
    const newComp = cloneDeep(comp);

    // Handle Table columnDefinitions
    if (comp.type === "Table" && comp.props.columnDefinitions) {
      newComp.props = cloneDeep(comp.props);
      newComp.props.columnDefinitions = comp.props.columnDefinitions.map(
        (col: { cell: { toString: () => any } }) => ({
          ...col,
          cell: typeof col.cell === "function" ? col.cell.toString() : col.cell,
        })
      );
    }

    if (comp.type === "Cards" && comp.props.cardDefinition.sections) {
      console.log(
        "prepareComponentsForSerialization and comp.props.cardDefinition.sections is",
        comp.props.cardDefinition.sections
      );
      newComp.props = cloneDeep(comp.props);
      newComp.props.cardDefinition.sections =
        comp.props.cardDefinition.sections.map(
          (section: { content: { toString: () => any } }) => ({
            ...section,
            content:
              typeof section.content === "function"
                ? section.content.toString()
                : section.content,
          })
        );
    }

    // Handle children recursively
    if (comp.children && comp.children.length > 0) {
      newComp.children = prepareComponentsForSerialization(comp.children);
    }

    return newComp;
  });
};

// Add this to your App.tsx or a utility file
const restoreFunctionsInComponents = (
  components: DraggableComponent[]
): DraggableComponent[] => {
  return components.map((comp) => {
    const newComp = { ...comp };

    // Handle Table columnDefinitions
    if (comp.type === "Table" && comp.props.columnDefinitions) {
      newComp.props = cloneDeep(comp.props);
      newComp.props.columnDefinitions = comp.props.columnDefinitions.map(
        (col: any) => {
          const newCol = { ...col };
          if (typeof col.cell === "string" && col.cell.includes("=>")) {
            try {
              // Convert string representation back to function
              // eslint-disable-next-line no-new-func
              console.log("col.cell is", col.cell);
              newCol.cell = new Function("return " + col.cell)();
            } catch (e) {
              console.error("Error parsing function:", e);
              // Fallback to a simple function if parsing fails
              newCol.cell = (item: any) => item[col.id] || "";
            }
          }
          return newCol;
        }
      );
    }

    // Handle Card cardDefinition sections
    if (comp.type === "Cards" && comp.props.cardDefinition.sections) {
      console.log(
        "restoreFunctionsInComponents and comp.props.cardDefinition.sections is",
        comp.props.cardDefinition.sections
      );
      newComp.props = cloneDeep(comp.props);
      newComp.props.cardDefinition.sections =
        comp.props.cardDefinition.sections.map((section: any) => {
          const newCol = { ...section };
          if (
            typeof section.content === "string" &&
            section.content.includes("=>")
          ) {
            try {
              // Convert string representation back to function
              // eslint-disable-next-line no-new-func
              console.log("section.content is", section.content);
              newCol.content = new Function("return " + section.content)();
            } catch (e) {
              console.error("Error parsing function:", e);
              // Fallback to a simple function if parsing fails
              newCol.content = (item: any) => item[section.id] || "";
            }
          }
          return newCol;
        });
    }

    // Handle children recursively
    if (comp.children && comp.children.length > 0) {
      newComp.children = restoreFunctionsInComponents(comp.children);
    }

    return newComp;
  });
};

// Convert full component structure to simplified version for hash
const simplifyComponent = (component: DraggableComponent): SimpleComponent => {
  console.log("simplifyComponent", component);
  // Extract only essential props to keep hash size manageable
  const essentialProps: Record<string, any> = {};

  // Include only primitive props and simple objects
  Object.entries(component.props).forEach(([key, value]) => {
    // Handle children prop specially
    if (key === "children") {
      // If children is a string, keep it
      if (typeof value === "string") {
        essentialProps[key] = value;
      }
      // If it's an array of strings, keep it
      else if (
        Array.isArray(value) &&
        value.every((item) => typeof item === "string")
      ) {
        essentialProps[key] = value;
      }
      // Otherwise skip it (React elements)
    }
    // Skip functions and React elements for other props
    else if (typeof value !== "function" && !React.isValidElement(value)) {
      essentialProps[key] = value;
    }
  });
  if (component.type === "Table") {
    essentialProps["columnDefinitions"] = component.props["columnDefinitions"];
    essentialProps["items"] = component.props["items"];
  }

  if (component.type === "Cards") {
    essentialProps["cardDefinition"] = component.props["cardDefinition"];
  }

  // Handle special props that need default values
  if (component.type === "Input" && !("value" in essentialProps)) {
    essentialProps.value = "";
  }

  if (component.type === "Textarea" && !("value" in essentialProps)) {
    essentialProps.value = "";
  }

  if (component.type === "Select" && !("selectedOption" in essentialProps)) {
    essentialProps.selectedOption = { label: "", value: "" };
  }

  // Ensure components that typically need children have them
  if (!("children" in essentialProps)) {
    if (
      [
        "Alert",
        "Badge",
        "Box",
        "Button",
        "Container",
        "ExpandableSection",
        "Header",
        "Link",
        "StatusIndicator",
        "TextContent",
      ].includes(component.type)
    ) {
      // Use the type name as default content if no children
      essentialProps.children = component.type + " content";
    }
  }

  // Create simplified component
  const simple: SimpleComponent = {
    t: component.type,
    i: component.id,
    p: essentialProps,
  };

  // Add children if present
  if (component.children && component.children.length > 0) {
    simple.c = component.children.map(simplifyComponent);
  }

  return simple;
};

// Convert simplified component back to full structure
const expandComponent = (simple: SimpleComponent): DraggableComponent => {
  // Get the component reference from available components
  const componentRef = getComponentByType(simple.t);

  // Create component with basic properties
  const component: DraggableComponent = {
    id: simple.i,
    type: simple.t,
    component: componentRef, // Restore the component reference
    props: simple.p || {},
  };

  // For a table, convert the columnDefinitions' "cell" properties back into functions
  if (component.type === "Table" && component.props.columnDefinitions) {
    component.props.columnDefinitions = component.props.columnDefinitions.map(
      (col: any) => {
        const newCol = { ...col };
        if (typeof col.cell === "string" && col.cell.includes("=>")) {
          // Convert string representation back to function
          // eslint-disable-next-line no-new-func
          newCol.cell = new Function("return " + col.cell)();
        }
        return newCol;
      }
    );
  }

  if (component.type === "Cards" && component.props.cardDefinition.sections) {
    console.log(
      "In expandComponent, component.props.cardDefinition.sections is",
      component.props.cardDefinition.sections
    );

    component.props.cardDefinition.sections =
      component.props.cardDefinition.sections.map((section: any) => {
        const newCol = { ...section };
        if (
          typeof section.content === "string" &&
          section.content.includes("=>")
        ) {
          // Convert string representation back to function
          // eslint-disable-next-line no-new-func
          newCol.content = new Function("return " + section.content)();
        }
        return newCol;
      });
  }

  if (component.type === "Cards") {
    console.log("In expandComponent, component.props is", component.props);
  }

  // Add children if present
  if (simple.c && simple.c.length > 0) {
    component.children = simple.c.map((child) => {
      const expandedChild = expandComponent(child);
      expandedChild.parentId = component.id;
      return expandedChild;
    });
  }

  return component;
};

// Helper function to get component reference by type
const getComponentByType = (
  type: string
): React.ComponentType<any> | undefined => {
  // Import all needed Cloudscape components

  return componentMap[type];
};

// Simple compression for strings
const compress = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str));
  } catch (e) {
    console.error("Compression error:", e);
    return "";
  }
};

// Decompress strings
const decompress = (str: string): string => {
  try {
    return decodeURIComponent(atob(str));
  } catch (e) {
    console.error("Decompression error:", e);
    return "";
  }
};

// Convert components to URL hash
const componentsToHash = (components: DraggableComponent[]): string => {
  console.log("componentsToHash");
  try {
    // Convert to simplified structure
    const simplified = components.map(simplifyComponent);

    // Convert to JSON and compress
    const json = JSON.stringify(simplified);
    return compress(json);
  } catch (error) {
    console.error("Error converting components to hash:", error);
    return "";
  }
};

// Convert URL hash to components
const hashToComponents = (hash: string): DraggableComponent[] | null => {
  try {
    if (!hash) return null;

    // Decompress and parse JSON
    const json = decompress(hash);
    if (!json) return null;

    const simplified = JSON.parse(json) as SimpleComponent[];
    console.log("simplified is", simplified);
    // Convert back to full component structure
    return simplified.map(expandComponent);
  } catch (error) {
    console.error("Error converting hash to components:", error);
    return null;
  }
};

// Add this function before your App component
const suppressResizeObserverErrors = () => {
  const originalError = window.console.error;
  window.console.error = (...args) => {
    console.log("Inside window.console.error and args are", args);
    if (args[0]?.includes?.("ResizeObserver loop")) {
      return;
    }
    originalError.apply(window.console, args);
  };
};

const App: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<
    DraggableComponent | undefined
  >();
  const [gridComponents, setGridComponents] = useState<DraggableComponent[]>(
    []
  );
  const [toolsOpen, setToolsOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Flag to prevent adding to history during programmatic changes
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    suppressResizeObserverErrors();
  }, []);

  // Initialize from URL hash if present
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      try {
        const componentsFromHash = hashToComponents(hash);
        if (componentsFromHash && componentsFromHash.length > 0) {
          console.log("Loaded components from hash:", componentsFromHash);
          isUpdatingRef.current = true;
          setGridComponents(componentsFromHash);
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 0);
        }
      } catch (error) {
        console.error("Error loading from hash:", error);
      }
    }
  }, []);

  // Update URL hash when components change
  useEffect(() => {
    if (isUpdatingRef.current || gridComponents.length === 0) return;

    const serializableComponents =
      prepareComponentsForSerialization(gridComponents);

    const hash = componentsToHash(serializableComponents);
    if (hash) {
      window.history.pushState(null, "", `#${hash}`);
    }
    console.log("Made it through serialization");
  }, [gridComponents]);

  // Listen for popstate (browser back/forward) events
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.substring(1);
      try {
        const componentsFromHash = hashToComponents(hash);
        if (componentsFromHash) {
          console.log(
            "Popstate: loaded components from hash:",
            componentsFromHash
          );
          // Restore functions from string representations
          const componentsWithFunctions =
            restoreFunctionsInComponents(componentsFromHash);

          console.log(
            "Popstate: loaded componentsWithFunctions from hash:",
            componentsWithFunctions
          );
          isUpdatingRef.current = true;
          setGridComponents(componentsWithFunctions);

          // If we're going back to an empty state
          if (componentsFromHash.length === 0) {
            setSelectedComponent(undefined);
            setToolsOpen(false);
          }

          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 0);
        }
      } catch (error) {
        console.error("Error handling popstate:", error);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleComponentSelect = (component: DraggableComponent) => {
    if (previewMode) return; // Disable selection in preview mode
    setSelectedComponent(component);
    setToolsOpen(true); // Open the tools panel when a component is selected
  };

  // Recursive function to update props for a component that might be nested
  const updateComponentProps = (
    components: DraggableComponent[],
    id: string,
    newProps: Record<string, any>
  ): DraggableComponent[] => {
    return components.map((comp) => {
      // If this is the component to update
      if (comp.id === id) {
        return { ...comp, props: newProps };
      }

      // If this component has children, check them recursively
      if (comp.children && comp.children.length > 0) {
        return {
          ...comp,
          children: updateComponentProps(comp.children, id, newProps),
        };
      }

      // Otherwise return the component unchanged
      return comp;
    });
  };

  const handleUpdateProps = (id: string, props: Record<string, any>) => {
    // Update the component props recursively
    setGridComponents((prevComponents) => {
      const newComponents = updateComponentProps(prevComponents, id, props);
      return newComponents;
    });

    // Also update the selected component if it's the one being modified
    if (selectedComponent && selectedComponent.id === id) {
      setSelectedComponent({
        ...selectedComponent,
        props,
      });
    }
  };

  // Helper function to find a component by ID recursively
  const findComponentById = (
    comps: DraggableComponent[],
    id: string
  ): DraggableComponent | undefined => {
    for (const comp of comps) {
      if (comp.id === id) {
        return comp;
      }
      if (comp.children && comp.children.length > 0) {
        const found = findComponentById(comp.children, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

  // Helper function to remove a component by ID recursively
  const removeComponentById = (
    components: DraggableComponent[],
    id: string
  ): DraggableComponent[] => {
    // Filter out the component at this level
    const filteredComponents = components.filter((c) => c.id !== id);

    // Process children recursively
    return filteredComponents.map((comp) => {
      if (comp.children && comp.children.length > 0) {
        return {
          ...comp,
          children: removeComponentById(comp.children, id),
        };
      }
      return comp;
    });
  };

  // Delete the selected component
  const handleDeleteComponent = useCallback(() => {
    if (selectedComponent) {
      setGridComponents((prevComponents) =>
        removeComponentById(prevComponents, selectedComponent.id)
      );
      setSelectedComponent(undefined);
      setToolsOpen(false);
    }
  }, [selectedComponent]);

  // Handle keyboard events for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in preview mode
      if (previewMode) return;

      // Skip if focus is on an input element
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement ||
        (document.activeElement &&
          "isContentEditable" in document.activeElement &&
          (document.activeElement as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // Delete key
      if ((e.key === "Delete" || e.key === "Backspace") && selectedComponent) {
        handleDeleteComponent();
      }
    };

    function hideError(e: { message: string }) {
      console.log("Inside hideError and error is", e);
      if (
        e.message ===
        "ResizeObserver loop completed with undelivered notifications."
      ) {
        const resizeObserverErrDiv = document.getElementById(
          "webpack-dev-server-client-overlay-div"
        );
        const resizeObserverErr = document.getElementById(
          "webpack-dev-server-client-overlay"
        );
        if (resizeObserverErr) {
          resizeObserverErr.setAttribute("style", "display: none");
        }
        if (resizeObserverErrDiv) {
          resizeObserverErrDiv.setAttribute("style", "display: none");
        }
      }
    }

    window.addEventListener("error", hideError);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("error", hideError);
    };
  }, [selectedComponent, handleDeleteComponent, previewMode]);

  // Toggle preview mode
  const handleTogglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      // Entering preview mode - deselect component and close tools
      setSelectedComponent(undefined);
      setToolsOpen(false);
    }
  };

  console.log("gridComponents are", gridComponents);

  return (
    <DndProvider backend={HTML5Backend}>
      <AppLayout
        headerSelector="#header"
        content={
          <Container>
            <SpaceBetween size="m">
              <SpaceBetween direction="horizontal" size="xs">
                <Toggle
                  checked={previewMode}
                  onChange={({ detail }) => setPreviewMode(detail.checked)}
                >
                  Preview Mode
                </Toggle>
                <ThemeToggle />
              </SpaceBetween>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <SpaceBetween direction="horizontal" size="xs">
                  {!previewMode && selectedComponent && (
                    <Button
                      onClick={handleDeleteComponent}
                      variant="normal"
                      iconName="remove"
                    >
                      Delete Selected
                    </Button>
                  )}
                </SpaceBetween>
              </div>

              <Grid
                gridDefinition={[
                  {
                    colspan: {
                      default: 12,
                      xxs: 12,
                      xs: 12,
                      s: 9,
                      m: 9,
                      l: 9,
                      xl: 9,
                    },
                  },
                ]}
              >
                {previewMode ? (
                  <PreviewMode
                    components={gridComponents}
                    setComponents={(args) => {
                      console.log("setComponents receiving args", args);
                      setGridComponents(args);
                    }}
                  />
                ) : (
                  <ComponentGrid
                    onComponentSelect={handleComponentSelect}
                    components={gridComponents}
                    setComponents={setGridComponents}
                    selectedComponentId={selectedComponent?.id}
                  />
                )}
              </Grid>
            </SpaceBetween>
          </Container>
        }
        navigation={
          !previewMode && (
            <Container header={<Header>Components</Header>}>
              <DraggableComponentList />
            </Container>
          )
        }
        tools={
          !previewMode && (
            <PropConfigSidebar
              selectedComponent={selectedComponent}
              onUpdateProps={handleUpdateProps}
            />
          )
        }
        toolsOpen={toolsOpen && !previewMode}
        onToolsChange={({ detail }) => setToolsOpen(detail.open)}
        navigationHide={previewMode}
      />
    </DndProvider>
  );
};

export default App;
