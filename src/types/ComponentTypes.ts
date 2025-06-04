import { ReactNode } from "react";

export interface DraggableComponent {
  id: string;
  type: string;
  component?: React.ComponentType<any>;
  props: Record<string, any>;
  parentId?: string; // Reference to parent component
  // children?: DraggableComponent[]; // Child components for containers
}

export interface ComponentDefinition {
  name: string;
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
  isContainer?: boolean; // Flag to indicate if component can contain children
}
