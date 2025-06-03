import React, { useState, useEffect } from 'react';
import { DraggableComponent } from '../types/ComponentTypes';
import Container from '@cloudscape-design/components/container';
import Textarea from '@cloudscape-design/components/textarea';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';

interface PreviewModeProps {
  components: DraggableComponent[];
}

// Component to render components in preview mode
const PreviewComponent: React.FC<{
  component: DraggableComponent;
  renderChildren: (parentId: string) => React.ReactNode;
}> = ({ component, renderChildren }) => {
  const Component = component.component;
  
  // Determine if this component can have children
  const canHaveChildren = component.children !== undefined;
  
  if (!Component) return null;
  
  return (
    <Component 
      {...component.props} 
      children={canHaveChildren ? renderChildren(component.id) : component.props.children}
    />
  );
};

// Generate JSX markup for a component
const generateMarkup = (component: DraggableComponent, level = 0): string => {
  if (!component) return '';
  
  const indent = '  '.repeat(level);
  const nextIndent = '  '.repeat(level + 1);
  
  // Start tag
  let markup = `${indent}<${component.type}`;
  
  // Add props
  Object.entries(component.props).forEach(([key, value]) => {
    // Skip children prop as it will be handled separately
    if (key === 'children') return;
    
    // Skip React elements
    if (React.isValidElement(value)) return;
    
    // Handle different value types
    if (typeof value === 'string') {
      markup += `\n${nextIndent}${key}="${value}"`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      markup += `\n${nextIndent}${key}={${value}}`;
    } else if (typeof value === 'object' && value !== null) {
      markup += `\n${nextIndent}${key}={${JSON.stringify(value)}}`;
    }
  });
  
  // Handle children
  const hasStringChildren = typeof component.props.children === 'string';
  const hasComponentChildren = component.children && component.children.length > 0;
  
  if (hasStringChildren || hasComponentChildren) {
    markup += '>\n';
    
    // Add string children
    if (hasStringChildren) {
      markup += `${nextIndent}${component.props.children}\n`;
    }
    
    // Add component children - with null check to satisfy TypeScript
    if (hasComponentChildren && component.children) {
      component.children.forEach(child => {
        markup += generateMarkup(child, level + 1) + '\n';
      });
    }
    
    // Close tag
    markup += `${indent}</${component.type}>`;
  } else {
    // Self-closing tag
    markup += ' />';
  }
  
  return markup;
};

// Generate full markup for all components
const generateFullMarkup = (components: DraggableComponent[]): string => {
  if (!components || components.length === 0) return '';
  
  // Only include top-level components
  const topLevelComponents = components.filter(comp => !comp.parentId);
  
  return topLevelComponents.map(comp => generateMarkup(comp)).join('\n\n');
};

const PreviewMode: React.FC<PreviewModeProps> = ({ components }) => {
  const [markup, setMarkup] = useState<string>('');
  
  // Generate markup whenever components change
  useEffect(() => {
    setMarkup(generateFullMarkup(components));
  }, [components]);
  
  // Recursively render children components
  const renderChildren = (parentId: string): React.ReactNode => {
    // Find the parent component
    const parent = findComponentById(components, parentId);
    
    if (!parent || !parent.children) {
      return null;
    }
    
    // For SpaceBetween, we need to render children differently
    if (parent.type === 'SpaceBetween') {
      return parent.children.map(child => (
        <PreviewComponent
          key={child.id}
          component={child}
          renderChildren={renderChildren}
        />
      ));
    }
    
    // Default rendering for other container types
    return parent.children.map(child => (
      <PreviewComponent
        key={child.id}
        component={child}
        renderChildren={renderChildren}
      />
    ));
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
  const topLevelComponents = components.filter(comp => !comp.parentId);

  return (
    <SpaceBetween size="l">
      <Container>
        <Box padding="m">
          {topLevelComponents.map(comp => (
            <PreviewComponent
              key={comp.id}
              component={comp}
              renderChildren={renderChildren}
            />
          ))}
        </Box>
      </Container>
      
      <Container header={<Header>Cloudscape Markup</Header>}>
        <Textarea
          value={markup}
          rows={20}
          readOnly
          spellcheck={false}
        />
      </Container>
    </SpaceBetween>
  );
};

export default PreviewMode;