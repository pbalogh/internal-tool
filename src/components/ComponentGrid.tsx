import React from "react";
import { useDrop, useDrag } from "react-dnd";
import { DraggableComponent } from "../types/ComponentTypes";

interface ComponentGridProps {
  onComponentSelect: (component: DraggableComponent) => void;
  components: DraggableComponent[];
  setComponents: React.Dispatch<React.SetStateAction<DraggableComponent[]>>;
  selectedComponentId?: string;
}

// Component that can be both dragged and dropped onto
const DraggableDroppableComponent: React.FC<{
  component: DraggableComponent;
  onComponentSelect: (component: DraggableComponent) => void;
  onDrop: (childId: string, parentId: string) => void;
  onMove: (id: string, parentId?: string) => void;
  renderChildren: (parentId: string) => React.ReactNode;
  isSelected: boolean;
}> = ({
  component,
  onComponentSelect,
  onDrop,
  onMove,
  renderChildren,
  isSelected,
}) => {
  // Make component droppable
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item: DraggableComponent, monitor) => {
      // Prevent drop handling if already handled by a child
      if (monitor.didDrop()) {
        return;
      }

      // Prevent dropping onto itself
      if (item.id === component.id) {
        return;
      }

      // Handle the drop - add the dropped component as a child
      onDrop(item.id, component.id);
      return { parentId: component.id };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }));

  // Make component draggable
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: () => {
      // When starting to drag, remove from current parent
      onMove(component.id);
      return component;
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Combine drag and drop refs
  const dragDropRef = (el: HTMLDivElement | null) => {
    drag(el);
    if (component.children !== undefined) {
      drop(el); // Only make it droppable if it can have children
    }
  };

  const Component = component.component;

  // Determine if this component can have children
  const canHaveChildren = component.children !== undefined;

  return (
    <div
      ref={dragDropRef}
      onClick={(e) => {
        console.log("onClick and e is", e);
        e.stopPropagation();
        onComponentSelect(component);
      }}
      style={{
        margin: "10px",
        minHeight: canHaveChildren ? "32px" : "10px",
        cursor: "move",
        border: isSelected ? "2px solid #0073bb" : "1px solid #d5dbdb",
        padding: "5px",
        borderRadius: "4px",
        backgroundColor: isOver
          ? "rgba(0, 115, 187, 0.1)"
          : isSelected
          ? "rgba(0, 115, 187, 0.05)"
          : "transparent",
        opacity: isDragging ? 0.5 : 1,
        position: "relative",
        boxShadow: isSelected ? "0 0 5px rgba(0, 115, 187, 0.5)" : "none",
      }}
    >
      {canHaveChildren && (
        <div
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            backgroundColor: "#0073bb",
            color: "white",
            borderRadius: "50%",
            width: "16px",
            height: "16px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📦
        </div>
      )}

      {Component && (
        <Component
          {...component.props}
          children={
            canHaveChildren
              ? renderChildren(component.id)
              : component.props.children
          }
        />
      )}
    </div>
  );
};

const ComponentGrid: React.FC<ComponentGridProps> = ({
  onComponentSelect,
  components,
  setComponents,
  selectedComponentId,
}) => {
  const [, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item: DraggableComponent, monitor) => {
      console.log("Inside drop and item is", item);
      // Only handle the drop if it wasn't already handled by a child component
      if (monitor.didDrop()) {
        return;
      }

      // Prevent dropping onto itself

      // Add the component to the grid (top level)
      if (!components.some((c) => c.id === item.id)) {
        console.log(
          "Inside drop and adding item to top level where existing components are",
          components
        );
        setComponents((prev) => {
          console.log("Inside setComponents, prev are", prev);
          console.log("Inside setComponents, item is", item);
          return [...prev, item];
        });
      } else {
        // If it's an existing component, move it to the top level
        handleMoveComponent(item.id);
      }
    },
  }));

  // Handle dropping a component onto another component
  const handleNestedDrop = (childId: string, parentId: string) => {
    console.log(
      "handleNestedDrop and childId is",
      childId,
      "and parentId is",
      parentId
    );
    // Prevent dropping a component onto itself
    if (childId === parentId) {
      return;
    }

    // Prevent dropping a component onto one of its descendants (would create circular reference)
    const isDescendant = (
      parentComp: DraggableComponent,
      childId: string
    ): boolean => {
      if (!parentComp.children) return false;

      return parentComp.children.some(
        (child) => child.id === childId || isDescendant(child, childId)
      );
    };

    setComponents((prevComponents) => {
      // Find the child component (might be nested)
      const childComponent = findComponentById(prevComponents, childId);

      // If child doesn't exist yet (new drag from palette), create it
      if (!childComponent) {
        return prevComponents;
      }

      // Find the parent component
      const parentComponent = findComponentById(prevComponents, parentId);

      // Prevent dropping onto a descendant of the dragged component
      if (parentComponent && isDescendant(childComponent, parentId)) {
        return prevComponents;
      }

      // Remove the child from its current location
      const componentsWithoutChild = removeComponentById(
        prevComponents,
        childId
      );

      // Update the parent to include this child
      return updateComponentChildren(componentsWithoutChild, parentId, {
        ...childComponent,
        parentId,
      });
    });
  };

  // Handle moving a component (removing from its parent)
  const handleMoveComponent = (id: string, newParentId?: string) => {
    console.log(
      "handleMoveComponent and id is",
      id,
      "and newParentId is",
      newParentId
    );
    setComponents((prevComponents) => {
      console.log(
        "handleMoveComponent and inside setComponents and prevComponents are",
        prevComponents
      );
      // Find the component
      const component = findComponentById(prevComponents, id);

      if (!component) return prevComponents;

      // Remove it from its current location
      const componentsWithoutChild = removeComponentById(prevComponents, id);

      if (newParentId) {
        // Add to new parent if specified
        return updateComponentChildren(componentsWithoutChild, newParentId, {
          ...component,
          parentId: newParentId,
        });
      } else {
        // Otherwise add to root level
        return [
          ...componentsWithoutChild,
          { ...component, parentId: undefined },
        ];
      }
    });
  };

  // Helper function to update component children
  const updateComponentChildren = (
    components: DraggableComponent[],
    parentId: string,
    childComponent: DraggableComponent
  ): DraggableComponent[] => {
    return components.map((comp) => {
      if (comp.id === parentId) {
        return {
          ...comp,
          children: [...(comp.children || []), childComponent],
        };
      }
      if (comp.children && comp.children.length > 0) {
        return {
          ...comp,
          children: updateComponentChildren(
            comp.children,
            parentId,
            childComponent
          ),
        };
      }
      return comp;
    });
  };

  // Helper function to remove a component by ID recursively
  const removeComponentById = (
    components: DraggableComponent[],
    id: string
  ): DraggableComponent[] => {
    console.log("removeComponentById and id is", id);
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

  // Recursively render children components
  const renderChildren = (parentId: string): React.ReactNode => {
    // Find the parent component
    const parent = findComponentById(components, parentId);

    if (!parent || !parent.children) {
      return null;
    }

    // For SpaceBetween, we need to render children differently
    if (parent.type === "SpaceBetween") {
      return parent.children.map((child) => {
        const ChildComponent = child.component;
        return ChildComponent ? (
          <DraggableDroppableComponent
            key={child.id}
            component={child}
            onComponentSelect={onComponentSelect}
            onDrop={handleNestedDrop}
            onMove={handleMoveComponent}
            renderChildren={renderChildren}
            isSelected={child.id === selectedComponentId}
          />
        ) : null;
      });
    }

    // Default rendering for other container types
    return parent.children.map((child) => {
      const ChildComponent = child.component;
      return ChildComponent ? (
        <DraggableDroppableComponent
          key={child.id}
          component={child}
          onComponentSelect={onComponentSelect}
          onDrop={handleNestedDrop}
          onMove={handleMoveComponent}
          renderChildren={renderChildren}
          isSelected={child.id === selectedComponentId}
        />
      ) : null;
    });
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

  // Only render top-level components (those without parents)
  const topLevelComponents = components.filter((comp) => !comp.parentId);

  // Handle click on the grid background to deselect
  const handleGridClick = (e: React.MouseEvent) => {
    console.log("handleGridClick and e is", e);
    // Only if clicking directly on the grid background, not on a component
    if (e.currentTarget === e.target) {
      onComponentSelect({} as DraggableComponent); // Deselect by passing empty component
    }
  };

  return (
    <div
      ref={drop}
      onClick={handleGridClick}
      style={{
        minHeight: "400px",
        border: "2px dashed lightgray",
        padding: "20px",
        position: "relative",
      }}
    >
      {topLevelComponents.map((comp) => (
        <DraggableDroppableComponent
          key={comp.id}
          component={comp}
          onComponentSelect={onComponentSelect}
          onDrop={handleNestedDrop}
          onMove={handleMoveComponent}
          renderChildren={renderChildren}
          isSelected={comp.id === selectedComponentId}
        />
      ))}
    </div>
  );
};

export default ComponentGrid;
