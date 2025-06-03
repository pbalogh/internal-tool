import React, { useState, useEffect } from "react";
import { DraggableComponent } from "../types/ComponentTypes";
import Input from "@cloudscape-design/components/input";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Container from "@cloudscape-design/components/container";
import Select from "@cloudscape-design/components/select";
import Textarea from "@cloudscape-design/components/textarea";
import Checkbox from "@cloudscape-design/components/checkbox";
import ExpandableSection from "@cloudscape-design/components/expandable-section";

interface PropConfigSidebarProps {
  selectedComponent?: DraggableComponent;
  onUpdateProps: (id: string, props: Record<string, any>) => void;
}

// Component-specific property definitions
const COMPONENT_PROPS = {
  ColumnLayout: {
    borders: [
      { label: "None", value: "none" },
      { label: "Horizontal", value: "horizontal" },
      { label: "Vertical", value: "vertical" },
      { label: "All", value: "all" }
    ],
    variant: [
      { label: "Default", value: "default" },
      { label: "Text grid", value: "text-grid" }
    ],
    columns: [1, 2, 3, 4]
  },
  SpaceBetween: {
    size: [
      { label: "XXS", value: "xxs" },
      { label: "XS", value: "xs" },
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
      { label: "XL", value: "xl" },
      { label: "XXL", value: "xxl" }
    ],
    direction: [
      { label: "Vertical", value: "vertical" },
      { label: "Horizontal", value: "horizontal" }
    ]
  },
  Container: {
    variant: [
      { label: "Default", value: "default" },
      { label: "Stacked", value: "stacked" }
    ],
    disableContentPaddings: [true, false]
  },
  Box: {
    variant: [
      { label: "Default", value: "default" },
      { label: "Code", value: "code" },
      { label: "AWS UI", value: "awsui" }
    ],
    fontSize: [
      { label: "Body S", value: "body-s" },
      { label: "Body M", value: "body-m" },
      { label: "Heading XS", value: "heading-xs" },
      { label: "Heading S", value: "heading-s" },
      { label: "Heading M", value: "heading-m" },
      { label: "Heading L", value: "heading-l" },
      { label: "Heading XL", value: "heading-xl" },
      { label: "Display", value: "display" }
    ]
  }
};

// Add missing properties to components
const addMissingProps = (component: DraggableComponent): Record<string, any> => {
  const props = { ...component.props };
  
  // Add component-specific default props
  if (component.type === 'ColumnLayout') {
    if (!('columns' in props)) props.columns = 2;
    if (!('variant' in props)) props.variant = 'default';
    if (!('borders' in props)) props.borders = 'none';
  }
  
  if (component.type === 'SpaceBetween') {
    if (!('size' in props)) props.size = 'm';
    if (!('direction' in props)) props.direction = 'vertical';
  }
  
  if (component.type === 'Container') {
    if (!('variant' in props)) props.variant = 'default';
    if (!('disableContentPaddings' in props)) props.disableContentPaddings = false;
  }
  
  if (component.type === 'Box') {
    if (!('variant' in props)) props.variant = 'default';
    if (!('fontSize' in props)) props.fontSize = 'body-m';
  }
  
  return props;
};

const PropConfigSidebar: React.FC<PropConfigSidebarProps> = ({
  selectedComponent,
  onUpdateProps,
}) => {
  const [localProps, setLocalProps] = useState<Record<string, any>>({});

  // Update local props when selected component changes
  useEffect(() => {
    if (selectedComponent) {
      // Add missing props for the component type
      const enhancedProps = addMissingProps(selectedComponent);
      setLocalProps(enhancedProps);
    }
  }, [selectedComponent]);

  const handlePropChange = (key: string, value: any) => {
    const updatedProps = { ...localProps, [key]: value };
    setLocalProps(updatedProps);
  };

  const saveProps = () => {
    if (selectedComponent) {
      onUpdateProps(selectedComponent.id, localProps);
    }
  };

  if (!selectedComponent) {
    return (
      <Container>
        <p>Select a component to configure its properties</p>
      </Container>
    );
  }

  // Render different input types based on prop type and component type
  const renderPropInput = (key: string, value: any) => {
    // Skip rendering React elements as they can't be edited directly
    if (React.isValidElement(value)) {
      return (
        <div>Cannot edit React elements directly</div>
      );
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <Textarea
          value={JSON.stringify(value, null, 2)}
          onChange={({ detail }) => {
            try {
              const parsedValue = JSON.parse(detail.value);
              handlePropChange(key, parsedValue);
            } catch (e) {
              // Keep the text as is if it's not valid JSON yet
            }
          }}
        />
      );
    }
    
    // Handle boolean values
    if (typeof value === "boolean") {
      return (
        <Checkbox
          checked={value}
          onChange={({ detail }) => 
            handlePropChange(key, detail.checked)
          }
        />
      );
    }
    
    // Handle objects
    if (typeof value === "object" && value !== null) {
      return (
        <Textarea
          value={JSON.stringify(value, null, 2)}
          onChange={({ detail }) => {
            try {
              const parsedValue = JSON.parse(detail.value);
              handlePropChange(key, parsedValue);
            } catch (e) {
              // Keep the text as is if it's not valid JSON yet
            }
          }}
        />
      );
    }
    
    // Common handler for all Select components
    const renderSelect = (options: Array<{label: string, value: string}>, defaultValue: string) => {
      const currentValue = String(value || defaultValue);
      return (
        <Select
          selectedOption={{ label: currentValue, value: currentValue }}
          onChange={({ detail }) => 
            handlePropChange(key, detail.selectedOption?.value || defaultValue)
          }
          options={options}
        />
      );
    };
    
    // Handle specific component properties
    
    // ColumnLayout borders
    if (key === "borders" && selectedComponent.type === "ColumnLayout") {
      return renderSelect(COMPONENT_PROPS.ColumnLayout.borders, "none");
    }
    
    // ColumnLayout variant
    if (key === "variant" && selectedComponent.type === "ColumnLayout") {
      return renderSelect(COMPONENT_PROPS.ColumnLayout.variant, "default");
    }
    
    // ColumnLayout columns
    if (key === "columns" && selectedComponent.type === "ColumnLayout") {
      const currentValue = String(value || "2");
      return (
        <Select
          selectedOption={{ label: currentValue, value: currentValue }}
          onChange={({ detail }) => {
            if (detail.selectedOption?.value) {
              handlePropChange(key, parseInt(detail.selectedOption.value, 10));
            }
          }}
          options={COMPONENT_PROPS.ColumnLayout.columns.map(n => ({ label: String(n), value: String(n) }))}
        />
      );
    }
    
    // SpaceBetween size
    if (key === "size" && selectedComponent.type === "SpaceBetween") {
      return renderSelect(COMPONENT_PROPS.SpaceBetween.size, "m");
    }
    
    // SpaceBetween direction
    if (key === "direction" && selectedComponent.type === "SpaceBetween") {
      return renderSelect(COMPONENT_PROPS.SpaceBetween.direction, "vertical");
    }
    
    // Container variant
    if (key === "variant" && selectedComponent.type === "Container") {
      return renderSelect(COMPONENT_PROPS.Container.variant, "default");
    }
    
    // Box variant
    if (key === "variant" && selectedComponent.type === "Box") {
      return renderSelect(COMPONENT_PROPS.Box.variant, "default");
    }
    
    // Box fontSize
    if (key === "fontSize" && selectedComponent.type === "Box") {
      return renderSelect(COMPONENT_PROPS.Box.fontSize, "body-m");
    }
    
    // Button variant
    if (key === "variant" && selectedComponent.type === "Button") {
      return renderSelect([
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Link", value: "link" },
        { label: "Icon", value: "icon" }
      ], "primary");
    }
    
    // Badge color
    if (key === "color" && selectedComponent.type === "Badge") {
      return renderSelect([
        { label: "Blue", value: "blue" },
        { label: "Grey", value: "grey" },
        { label: "Green", value: "green" },
        { label: "Red", value: "red" }
      ], "blue");
    }
    
    // Alert type
    if (key === "type" && selectedComponent.type === "Alert") {
      return renderSelect([
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Error", value: "error" },
        { label: "Success", value: "success" }
      ], "info");
    }
    
    // StatusIndicator type
    if (key === "type" && selectedComponent.type === "StatusIndicator") {
      return renderSelect([
        { label: "Success", value: "success" },
        { label: "Warning", value: "warning" },
        { label: "Error", value: "error" },
        { label: "Info", value: "info" },
        { label: "Pending", value: "pending" },
        { label: "In progress", value: "in-progress" },
        { label: "Stopped", value: "stopped" }
      ], "success");
    }
    
    // Box padding
    if (key === "padding" && selectedComponent.type === "Box") {
      return renderSelect([
        { label: "None", value: "none" },
        { label: "XXS", value: "xxs" },
        { label: "XS", value: "xs" },
        { label: "S", value: "s" },
        { label: "M", value: "m" },
        { label: "L", value: "l" },
        { label: "XL", value: "xl" },
        { label: "XXL", value: "xxl" }
      ], "m");
    }
    
    // Default to text input
    return (
      <Input
        value={typeof value === "string" ? value : String(value || "")}
        onChange={({ detail }) => handlePropChange(key, detail.value)}
      />
    );
  };

  // Group props by category
  const commonProps = ["children", "id", "className", "style"];
  const otherProps = Object.keys(localProps).filter(key => !commonProps.includes(key));

  return (
    <Container header={<h3>Configure {selectedComponent.type}</h3>}>
      <SpaceBetween size="m">
        {/* Common props section */}
        {commonProps.map(key => {
          if (key in localProps) {
            return (
              <FormField key={key} label={key}>
                {renderPropInput(key, localProps[key])}
              </FormField>
            );
          }
          return null;
        })}
        
        {/* Other props in expandable section */}
        {otherProps.length > 0 && (
          <ExpandableSection headerText="Additional Properties" defaultExpanded={true}>
            <SpaceBetween size="m">
              {otherProps.map(key => (
                <FormField key={key} label={key}>
                  {renderPropInput(key, localProps[key])}
                </FormField>
              ))}
            </SpaceBetween>
          </ExpandableSection>
        )}
        
        <Button onClick={saveProps} variant="primary">Apply Changes</Button>
      </SpaceBetween>
    </Container>
  );
};

export default PropConfigSidebar;