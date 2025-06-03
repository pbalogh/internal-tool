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
import { Cards } from "@cloudscape-design/components";

interface PropConfigSidebarProps {
  selectedComponent?: DraggableComponent;
  onUpdateProps: (id: string, props: Record<string, any>) => void;
}

// Component-specific property definitions

// Add missing properties to components
// Add this at the top of your file with other imports
const COMPONENT_PROPS = {
  Alert: {
    type: [
      { label: "Info", value: "info" },
      { label: "Warning", value: "warning" },
      { label: "Error", value: "error" },
      { label: "Success", value: "success" },
    ],
  },
  Badge: {
    color: [
      { label: "Blue", value: "blue" },
      { label: "Grey", value: "grey" },
      { label: "Green", value: "green" },
      { label: "Red", value: "red" },
    ],
    size: [
      { label: "Normal", value: "normal" },
      { label: "Small", value: "small" },
    ],
  },
  Box: {
    variant: [
      { label: "Default", value: "default" },
      { label: "Code", value: "code" },
      { label: "AWS UI", value: "awsui" },
    ],
    fontSize: [
      { label: "Body S", value: "body-s" },
      { label: "Body M", value: "body-m" },
      { label: "Heading XS", value: "heading-xs" },
      { label: "Heading S", value: "heading-s" },
      { label: "Heading M", value: "heading-m" },
      { label: "Heading L", value: "heading-l" },
      { label: "Heading XL", value: "heading-xl" },
      { label: "Display", value: "display" },
    ],
    color: [
      { label: "Inherit", value: "inherit" },
      { label: "Text", value: "text" },
      { label: "Body", value: "body" },
      { label: "Link", value: "link" },
    ],
    display: [
      { label: "Block", value: "block" },
      { label: "Inline", value: "inline" },
      { label: "Inline Block", value: "inline-block" },
      { label: "None", value: "none" },
    ],
    float: [
      { label: "None", value: "none" },
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
    fontWeight: [
      { label: "Normal", value: "normal" },
      { label: "Bold", value: "bold" },
      { label: "Light", value: "light" },
      { label: "Heavy", value: "heavy" },
    ],
    textAlign: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
    padding: [
      { label: "None", value: "none" },
      { label: "XXS", value: "xxs" },
      { label: "XS", value: "xs" },
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
      { label: "XL", value: "xl" },
      { label: "XXL", value: "xxl" },
    ],
  },
  Button: {
    variant: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Link", value: "link" },
      { label: "Icon", value: "icon" },
    ],
    iconAlign: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
  },
  ColumnLayout: {
    borders: [
      { label: "None", value: "none" },
      { label: "Horizontal", value: "horizontal" },
      { label: "Vertical", value: "vertical" },
      { label: "All", value: "all" },
    ],
    variant: [
      { label: "Default", value: "default" },
      { label: "Text grid", value: "text-grid" },
    ],
    columns: [1, 2, 3, 4],
  },
  Container: {
    variant: [
      { label: "Default", value: "default" },
      { label: "Stacked", value: "stacked" },
    ],
  },
  ExpandableSection: {
    variant: [
      { label: "Default", value: "default" },
      { label: "Container", value: "container" },
    ],
  },
  Header: {
    variant: [
      { label: "H1", value: "h1" },
      { label: "H2", value: "h2" },
      { label: "H3", value: "h3" },
      { label: "H4", value: "h4" },
      { label: "H5", value: "h5" },
    ],
  },
  Input: {
    type: [
      { label: "Text", value: "text" },
      { label: "Password", value: "password" },
      { label: "Search", value: "search" },
      { label: "Number", value: "number" },
      { label: "Email", value: "email" },
      { label: "URL", value: "url" },
    ],
  },
  Link: {
    variant: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
    ],
    fontSize: [
      { label: "Normal", value: "normal" },
      { label: "Body S", value: "body-s" },
      { label: "Body M", value: "body-m" },
      { label: "Heading XS", value: "heading-xs" },
      { label: "Heading S", value: "heading-s" },
      { label: "Heading M", value: "heading-m" },
      { label: "Heading L", value: "heading-l" },
      { label: "Heading XL", value: "heading-xl" },
    ],
  },
  SpaceBetween: {
    size: [
      { label: "XXS", value: "xxs" },
      { label: "XS", value: "xs" },
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
      { label: "XL", value: "xl" },
      { label: "XXL", value: "xxl" },
    ],
    direction: [
      { label: "Vertical", value: "vertical" },
      { label: "Horizontal", value: "horizontal" },
    ],
    alignItems: [
      { label: "Stretch", value: "stretch" },
      { label: "Baseline", value: "baseline" },
      { label: "Center", value: "center" },
      { label: "Flex Start", value: "flex-start" },
      { label: "Flex End", value: "flex-end" },
    ],
    justifyContent: [
      { label: "Flex Start", value: "flex-start" },
      { label: "Center", value: "center" },
      { label: "Flex End", value: "flex-end" },
      { label: "Space Between", value: "space-between" },
      { label: "Space Around", value: "space-around" },
    ],
  },
  StatusIndicator: {
    type: [
      { label: "Success", value: "success" },
      { label: "Warning", value: "warning" },
      { label: "Error", value: "error" },
      { label: "Info", value: "info" },
      { label: "Pending", value: "pending" },
      { label: "In progress", value: "in-progress" },
      { label: "Stopped", value: "stopped" },
    ],
  },
  Tabs: {
    variant: [
      { label: "Default", value: "default" },
      { label: "Container", value: "container" },
    ],
  },
};

// Add this to your component
const addMissingProps = (
  component: DraggableComponent
): Record<string, any> => {
  const props = { ...component.props };

  // Alert
  if (component.type === "Alert") {
    if (!("type" in props)) props.type = "info";
    if (!("dismissible" in props)) props.dismissible = false;
    if (!("visible" in props)) props.visible = true;
    if (!("header" in props)) props.header = "";
    if (!("action" in props)) props.action = null;
  }

  // Autosuggest
  if (component.type === "Autosuggest") {
    if (!("value" in props)) props.value = "";
    if (!("options" in props)) props.options = [];
    if (!("ariaLabel" in props)) props.ariaLabel = "Autosuggest";
    if (!("placeholder" in props)) props.placeholder = "Search";
    if (!("empty" in props)) props.empty = "No matches found";
    if (!("expandToViewport" in props)) props.expandToViewport = false;
    if (!("disabled" in props)) props.disabled = false;
  }

  // Badge
  if (component.type === "Badge") {
    if (!("color" in props)) props.color = "blue";
    if (!("size" in props)) props.size = "normal";
  }

  // BreadcrumbGroup
  if (component.type === "BreadcrumbGroup") {
    if (!("items" in props)) props.items = [];
    if (!("ariaLabel" in props)) props.ariaLabel = "Breadcrumbs";
  }

  // Button
  if (component.type === "Button") {
    if (!("variant" in props)) props.variant = "primary";
    if (!("iconName" in props)) props.iconName = undefined;
    if (!("iconAlign" in props)) props.iconAlign = "left";
    if (!("loading" in props)) props.loading = false;
    if (!("disabled" in props)) props.disabled = false;
    if (!("formAction" in props)) props.formAction = undefined;
  }

  // ButtonDropdown
  if (component.type === "ButtonDropdown") {
    if (!("items" in props)) props.items = [];
    if (!("expandToViewport" in props)) props.expandToViewport = false;
    if (!("disabled" in props)) props.disabled = false;
  }

  // Cards
  if (component.type === "Cards") {
    if (!("items" in props)) props.items = [];
    if (!("cardDefinition" in props)) props.cardDefinition = {};
    if (!("header" in props)) props.header = "Cards";
    if (!("selectionType" in props)) props.selectionType = "single";
    if (!("trackBy" in props)) props.trackBy = "id";
    if (!("empty" in props)) props.empty = "No items found";
    if (!("loading" in props)) props.loading = false;
    if (!("loadingText" in props)) props.loadingText = "Loading resources";
    if (!("variant" in props)) props.variant = "container";
  }

  // Checkbox
  if (component.type === "Checkbox") {
    if (!("disabled" in props)) props.disabled = false;
    if (!("indeterminate" in props)) props.indeterminate = false;
  }

  // ColumnLayout
  if (component.type === "ColumnLayout") {
    if (!("columns" in props)) props.columns = 2;
    if (!("variant" in props)) props.variant = "default";
    if (!("borders" in props)) props.borders = "none";
  }

  // Container
  if (component.type === "Container") {
    if (!("variant" in props)) props.variant = "default";
    if (!("disableContentPaddings" in props))
      props.disableContentPaddings = false;
    if (!("fitHeight" in props)) props.fitHeight = false;
    if (!("disableHeaderPaddings" in props))
      props.disableHeaderPaddings = false;
  }

  // DatePicker
  if (component.type === "DatePicker") {
    if (!("disabled" in props)) props.disabled = false;
    if (!("placeholder" in props)) props.placeholder = "YYYY/MM/DD";
    if (!("todayAriaLabel" in props)) props.todayAriaLabel = "Today";
  }

  // ExpandableSection
  if (component.type === "ExpandableSection") {
    if (!("variant" in props)) props.variant = "default";
    if (!("defaultExpanded" in props)) props.defaultExpanded = false;
  }

  // FormField
  if (component.type === "FormField") {
    if (!("label" in props)) props.label = "Form field";
    if (!("description" in props)) props.description = "";
    if (!("constraintText" in props)) props.constraintText = "";
    if (!("errorText" in props)) props.errorText = "";
  }

  // Header
  if (component.type === "Header") {
    if (!("variant" in props)) props.variant = "h2";
    if (!("description" in props)) props.description = "";
    if (!("counter" in props)) props.counter = "";
  }

  // Input
  if (component.type === "Input") {
    if (!("disabled" in props)) props.disabled = false;
    if (!("placeholder" in props)) props.placeholder = "Enter text";
    if (!("value" in props)) props.value = "";
    if (!("type" in props)) props.type = "text";
    if (!("autoComplete" in props)) props.autoComplete = "on";
    if (!("spellcheck" in props)) props.spellcheck = true;
  }

  // Link
  if (component.type === "Link") {
    if (!("href" in props)) props.href = "#";
    if (!("external" in props)) props.external = false;
    if (!("fontSize" in props)) props.fontSize = "normal";
    if (!("variant" in props)) props.variant = "primary";
  }

  // RadioGroup
  if (component.type === "RadioGroup") {
    if (!("items" in props)) props.items = [];
    if (!("value" in props)) props.value = "";
    if (!("disabled" in props)) props.disabled = false;
  }

  // Select
  if (component.type === "Select") {
    if (!("options" in props)) props.options = [];
    if (!("selectedOption" in props)) props.selectedOption = null;
    if (!("disabled" in props)) props.disabled = false;
    if (!("placeholder" in props)) props.placeholder = "Choose an option";
  }

  // SpaceBetween
  if (component.type === "SpaceBetween") {
    if (!("size" in props)) props.size = "m";
    if (!("direction" in props)) props.direction = "vertical";
    if (!("alignItems" in props)) props.alignItems = "stretch";
    if (!("justifyContent" in props)) props.justifyContent = "flex-start";
    if (!("disableGutters" in props)) props.disableGutters = false;
  }

  // Table
  if (component.type === "Table") {
    if (!("items" in props)) props.items = [];
    if (!("columnDefinitions" in props)) props.columnDefinitions = [];
    if (!("loading" in props)) props.loading = false;
    if (!("loadingText" in props)) props.loadingText = "Loading";
    if (!("sortingDisabled" in props)) props.sortingDisabled = false;
    if (!("resizableColumns" in props)) props.resizableColumns = true;
    if (!("wrapLines" in props)) props.wrapLines = false;
    if (!("stripedRows" in props)) props.stripedRows = false;
    if (!("stickyHeader" in props)) props.stickyHeader = false;
    if (!("empty" in props)) props.empty = "No records";
  }

  // Tabs
  if (component.type === "Tabs") {
    if (!("tabs" in props)) props.tabs = [];
    if (!("activeTabId" in props)) props.activeTabId = "";
    if (!("variant" in props)) props.variant = "default";
  }

  // Textarea
  if (component.type === "Textarea") {
    if (!("disabled" in props)) props.disabled = false;
    if (!("placeholder" in props)) props.placeholder = "Enter text";
    if (!("value" in props)) props.value = "";
    if (!("rows" in props)) props.rows = 3;
    if (!("spellcheck" in props)) props.spellcheck = true;
  }

  // Toggle
  if (component.type === "Toggle") {
    if (!("checked" in props)) props.checked = false;
    if (!("disabled" in props)) props.disabled = false;
  }

  // Box
  if (component.type === "Box") {
    if (!("variant" in props)) props.variant = "default";
    if (!("fontSize" in props)) props.fontSize = "body-m";
    if (!("padding" in props)) props.padding = "m";
    if (!("color" in props)) props.color = "inherit";
    if (!("display" in props)) props.display = "block";
    if (!("float" in props)) props.float = "none";
    if (!("fontWeight" in props)) props.fontWeight = "normal";
    if (!("textAlign" in props)) props.textAlign = "left";
    if (!("lineHeight" in props)) props.lineHeight = "normal";
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
    console.log("renderPropInput");
    // Skip rendering React elements as they can't be edited directly
    if (React.isValidElement(value)) {
      return <div>Cannot edit React elements directly</div>;
    }

    // Add this special case for Table columnDefinitions
    if (key === "columnDefinitions" && selectedComponent.type === "Table") {
      return (
        <div>
          <p>
            Column definitions contain functions and can't be edited directly.
          </p>
          <Button
            onClick={() => {
              // Provide a template for column definitions with function placeholders
              const templateColumns = [
                {
                  id: "name",
                  header: "Name",
                  cell: "item => item.name", // String representation of function
                  sortingField: "name",
                },
                {
                  id: "type",
                  header: "Type",
                  cell: "item => item.type",
                  sortingField: "type",
                },
              ];

              // Convert existing column definitions to template format
              const currentColumns = Array.isArray(value)
                ? value.map((col) => ({
                    ...col,
                    cell:
                      typeof col.cell === "function"
                        ? col.cell.toString()
                        : "item => item['" + col.id + "']",
                  }))
                : templateColumns;

              // Update with template that preserves functions as strings
              handlePropChange(key, currentColumns);
            }}
          >
            Reset Column Definitions
          </Button>
        </div>
      );
    }

    // Autosuggest disabled, expandToViewport
    if (
      (key === "disabled" || key === "expandToViewport") &&
      selectedComponent.type === "Autosuggest"
    ) {
      return (
        <Checkbox
          checked={value === true}
          onChange={({ detail }) => handlePropChange(key, detail.checked)}
        />
      );
    }

    // Autosuggest options
    if (key === "options" && selectedComponent.type === "Autosuggest") {
      return (
        <Textarea
          value={JSON.stringify(value || [], null, 2)}
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
          onChange={({ detail }) => handlePropChange(key, detail.checked)}
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
    const renderSelect = (
      options: Array<{ label: string; value: string }>,
      defaultValue: string
    ) => {
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

    // Badge size
    if (key === "size" && selectedComponent.type === "Badge") {
      return renderSelect(COMPONENT_PROPS.Badge.size, "normal");
    }

    // Button iconAlign
    if (key === "iconAlign" && selectedComponent.type === "Button") {
      return renderSelect(COMPONENT_PROPS.Button.iconAlign, "left");
    }

    // Button loading, disabled, formAction
    if (
      (key === "loading" || key === "disabled" || key === "formAction") &&
      selectedComponent.type === "Button"
    ) {
      return (
        <Checkbox
          checked={value === true}
          onChange={({ detail }) => handlePropChange(key, detail.checked)}
        />
      );
    }

    // ExpandableSection variant
    if (key === "variant" && selectedComponent.type === "ExpandableSection") {
      return renderSelect(COMPONENT_PROPS.ExpandableSection.variant, "default");
    }

    // ExpandableSection defaultExpanded
    if (
      key === "defaultExpanded" &&
      selectedComponent.type === "ExpandableSection"
    ) {
      return (
        <Checkbox
          checked={value === true}
          onChange={({ detail }) => handlePropChange(key, detail.checked)}
        />
      );
    }

    // Header variant
    if (key === "variant" && selectedComponent.type === "Header") {
      return renderSelect(COMPONENT_PROPS.Header.variant, "h2");
    }

    // Input type
    if (key === "type" && selectedComponent.type === "Input") {
      return renderSelect(COMPONENT_PROPS.Input.type, "text");
    }

    // Input disabled, spellcheck
    if (
      (key === "disabled" || key === "spellcheck") &&
      (selectedComponent.type === "Input" ||
        selectedComponent.type === "Textarea")
    ) {
      return (
        <Checkbox
          checked={value === true}
          onChange={({ detail }) => handlePropChange(key, detail.checked)}
        />
      );
    }

    // Link variant
    if (key === "variant" && selectedComponent.type === "Link") {
      return renderSelect(COMPONENT_PROPS.Link.variant, "primary");
    }

    // Link fontSize
    if (key === "fontSize" && selectedComponent.type === "Link") {
      return renderSelect(COMPONENT_PROPS.Link.fontSize, "normal");
    }

    // Link external
    if (key === "external" && selectedComponent.type === "Link") {
      return (
        <Checkbox
          checked={value === true}
          onChange={({ detail }) => handlePropChange(key, detail.checked)}
        />
      );
    }

    // Tabs variant
    if (key === "variant" && selectedComponent.type === "Tabs") {
      return renderSelect(COMPONENT_PROPS.Tabs.variant, "default");
    }

    // Box color
    if (key === "color" && selectedComponent.type === "Box") {
      return renderSelect(COMPONENT_PROPS.Box.color, "inherit");
    }

    // Box display
    if (key === "display" && selectedComponent.type === "Box") {
      return renderSelect(COMPONENT_PROPS.Box.display, "block");
    }

    // Box float
    if (key === "float" && selectedComponent.type === "Box") {
      return renderSelect(COMPONENT_PROPS.Box.float, "none");
    }

    // Box fontWeight
    if (key === "fontWeight" && selectedComponent.type === "Box") {
      return renderSelect(COMPONENT_PROPS.Box.fontWeight, "normal");
    }

    // Box textAlign
    if (key === "textAlign" && selectedComponent.type === "Box") {
      return renderSelect(COMPONENT_PROPS.Box.textAlign, "left");
    }

    // Box padding
    if (key === "padding" && selectedComponent.type === "Box") {
      return renderSelect(COMPONENT_PROPS.Box.padding, "m");
    }

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
          options={COMPONENT_PROPS.ColumnLayout.columns.map((n) => ({
            label: String(n),
            value: String(n),
          }))}
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

    // SpaceBetween alignItems
    if (key === "alignItems" && selectedComponent.type === "SpaceBetween") {
      return renderSelect(COMPONENT_PROPS.SpaceBetween.alignItems, "stretch");
    }

    // SpaceBetween justifyContent
    if (key === "justifyContent" && selectedComponent.type === "SpaceBetween") {
      return renderSelect(
        COMPONENT_PROPS.SpaceBetween.justifyContent,
        "flex-start"
      );
    }

    // SpaceBetween disableGutters
    if (key === "disableGutters" && selectedComponent.type === "SpaceBetween") {
      return (
        <Checkbox
          checked={value === true}
          onChange={({ detail }) => handlePropChange(key, detail.checked)}
        />
      );
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
      return renderSelect(
        [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Link", value: "link" },
          { label: "Icon", value: "icon" },
        ],
        "primary"
      );
    }

    // Badge color
    if (key === "color" && selectedComponent.type === "Badge") {
      return renderSelect(
        [
          { label: "Blue", value: "blue" },
          { label: "Grey", value: "grey" },
          { label: "Green", value: "green" },
          { label: "Red", value: "red" },
        ],
        "blue"
      );
    }

    // Alert type
    if (key === "type" && selectedComponent.type === "Alert") {
      return renderSelect(
        [
          { label: "Info", value: "info" },
          { label: "Warning", value: "warning" },
          { label: "Error", value: "error" },
          { label: "Success", value: "success" },
        ],
        "info"
      );
    }

    // StatusIndicator type
    if (key === "type" && selectedComponent.type === "StatusIndicator") {
      return renderSelect(
        [
          { label: "Success", value: "success" },
          { label: "Warning", value: "warning" },
          { label: "Error", value: "error" },
          { label: "Info", value: "info" },
          { label: "Pending", value: "pending" },
          { label: "In progress", value: "in-progress" },
          { label: "Stopped", value: "stopped" },
        ],
        "success"
      );
    }

    // Box padding
    if (key === "padding" && selectedComponent.type === "Box") {
      return renderSelect(
        [
          { label: "None", value: "none" },
          { label: "XXS", value: "xxs" },
          { label: "XS", value: "xs" },
          { label: "S", value: "s" },
          { label: "M", value: "m" },
          { label: "L", value: "l" },
          { label: "XL", value: "xl" },
          { label: "XXL", value: "xxl" },
        ],
        "m"
      );
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
  const otherProps = Object.keys(localProps).filter(
    (key) => !commonProps.includes(key)
  );

  return (
    <Container header={<h3>Configure {selectedComponent.type}</h3>}>
      <SpaceBetween size="m">
        {/* Common props section */}
        {commonProps.map((key) => {
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
          <ExpandableSection
            headerText="Additional Properties"
            defaultExpanded={true}
          >
            <SpaceBetween size="m">
              {otherProps.map((key) => (
                <FormField key={key} label={key}>
                  {renderPropInput(key, localProps[key])}
                </FormField>
              ))}
            </SpaceBetween>
          </ExpandableSection>
        )}

        <Button onClick={saveProps} variant="primary">
          Apply Changes
        </Button>
      </SpaceBetween>
    </Container>
  );
};

export default PropConfigSidebar;
