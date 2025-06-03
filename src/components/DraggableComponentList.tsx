import React from "react";
import { useDrag } from "react-dnd";
import { v4 as uuidv4 } from "uuid";
import { ComponentDefinition } from "../types/ComponentTypes";

// Import Cloudscape components
import Alert from "@cloudscape-design/components/alert";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Button from "@cloudscape-design/components/button";
import ButtonDropdown from "@cloudscape-design/components/button-dropdown";
import Cards from "@cloudscape-design/components/cards";
import Checkbox from "@cloudscape-design/components/checkbox";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Container from "@cloudscape-design/components/container";
import DatePicker from "@cloudscape-design/components/date-picker";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Icon from "@cloudscape-design/components/icon";
import Input from "@cloudscape-design/components/input";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import Multiselect from "@cloudscape-design/components/multiselect";
import Pagination from "@cloudscape-design/components/pagination";
import Popover from "@cloudscape-design/components/popover";
import ProgressBar from "@cloudscape-design/components/progress-bar";
import RadioGroup from "@cloudscape-design/components/radio-group";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import TextContent from "@cloudscape-design/components/text-content";
import Textarea from "@cloudscape-design/components/textarea";
import Toggle from "@cloudscape-design/components/toggle";
import TokenGroup from "@cloudscape-design/components/token-group";

const AVAILABLE_COMPONENTS: ComponentDefinition[] = [
  {
    name: "Alert",
    component: Alert,
    defaultProps: {
      type: "info",
      children: "This is an alert message",
    },
  },
  {
    name: "Badge",
    component: Badge,
    defaultProps: {
      children: "New",
      color: "blue",
    },
  },
  {
    name: "Box",
    component: Box,
    defaultProps: {
      padding: "m",
      fontSize: "body-m",
      children: "Box content",
    },
    isContainer: true,
  },
  {
    name: "BreadcrumbGroup",
    component: BreadcrumbGroup,
    defaultProps: {
      items: [
        { text: "Home", href: "#" },
        { text: "Category", href: "#" },
        { text: "Current page", href: "#" },
      ],
    },
  },
  {
    name: "Button",
    component: Button,
    defaultProps: {
      children: "Click me",
      variant: "primary",
    },
  },
  {
    name: "ButtonDropdown",
    component: ButtonDropdown,
    defaultProps: {
      items: [
        { text: "Option 1", id: "option1" },
        { text: "Option 2", id: "option2" },
        { text: "Option 3", id: "option3" },
      ],
      children: "Actions",
    },
  },
  {
    name: "Checkbox",
    component: Checkbox,
    defaultProps: {
      children: "Check me",
    },
  },
  {
    name: "ColumnLayout",
    component: ColumnLayout,
    defaultProps: {
      columns: 2,
      children: [
        <div key="col1">Column 1 content</div>,
        <div key="col2">Column 2 content</div>,
      ],
    },
    isContainer: true,
  },
  {
    name: "Container",
    component: Container,
    defaultProps: {
      header: "Container Header",
      children: "Container content goes here",
    },
    isContainer: true,
  },
  {
    name: "DatePicker",
    component: DatePicker,
    defaultProps: {
      placeholder: "YYYY/MM/DD",
    },
  },
  {
    name: "ExpandableSection",
    component: ExpandableSection,
    defaultProps: {
      headerText: "Expandable section",
      children: "Expandable content goes here",
    },
    isContainer: true,
  },
  {
    name: "FormField",
    component: FormField,
    defaultProps: {
      label: "Form field label",
      children: <Input value="" onChange={() => {}} />,
    },
    isContainer: true,
  },
  {
    name: "Header",
    component: Header,
    defaultProps: {
      children: "Page title",
    },
  },
  {
    name: "Icon",
    component: Icon,
    defaultProps: {
      name: "settings",
    },
  },
  {
    name: "Input",
    component: Input,
    defaultProps: {
      placeholder: "Enter text",
      value: "",
    },
  },
  {
    name: "Link",
    component: Link,
    defaultProps: {
      href: "#",
      children: "Link text",
    },
  },
  {
    name: "Popover",
    component: Popover,
    defaultProps: {
      position: "right",
      size: "medium",
      triggerType: "custom",
      content: <div>Popover content</div>,
      children: <Button>Hover me</Button>,
    },
    isContainer: true,
  },
  {
    name: "ProgressBar",
    component: ProgressBar,
    defaultProps: {
      value: 40,
      label: "Progress",
    },
  },
  {
    name: "RadioGroup",
    component: RadioGroup,
    defaultProps: {
      items: [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
      ],
      value: "option1",
    },
  },
  {
    name: "Select",
    component: Select,
    defaultProps: {
      options: [
        { label: "Option 1", value: "1" },
        { label: "Option 2", value: "2" },
      ],
      selectedOption: { label: "Option 1", value: "1" },
      placeholder: "Choose an option",
    },
  },
  {
    name: "SpaceBetween",
    component: SpaceBetween,
    defaultProps: {
      size: "m",
      direction: "vertical",
      children: [],
    },
    isContainer: true,
  },
  {
    name: "Spinner",
    component: Spinner,
    defaultProps: {
      size: "normal",
    },
  },
  {
    name: "StatusIndicator",
    component: StatusIndicator,
    defaultProps: {
      type: "success",
      children: "Success",
    },
  },
  {
    name: "TextContent",
    component: TextContent,
    defaultProps: {
      children: <p>This is a paragraph of text.</p>,
    },
    isContainer: true,
  },
  {
    name: "Textarea",
    component: Textarea,
    defaultProps: {
      placeholder: "Enter multiple lines of text",
      value: "",
    },
  },
  {
    name: "Toggle",
    component: Toggle,
    defaultProps: {
      children: "Toggle me",
    },
  },
];

const DraggableComponentItem: React.FC<ComponentDefinition> = ({
  name,
  component,
  defaultProps,
  isContainer,
}) => {
  const [, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: () => {
      // Create a new ID and deep clone the props for each drag operation
      // This ensures each instance gets its own unique props object
      return {
        id: uuidv4(),
        type: name,
        component: component,
        props: JSON.parse(JSON.stringify(defaultProps || {})),
        children: isContainer ? [] : undefined,
      };
    },
  }));

  return (
    <div
      ref={drag}
      style={{
        padding: "10px",
        margin: "5px",
        border: "1px dashed gray",
        cursor: "move",
        backgroundColor: isContainer ? "#f0f7ff" : "transparent",
      }}
    >
      {name} {isContainer && "📦"}
    </div>
  );
};

const DraggableComponentList: React.FC = () => {
  return (
    <div style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
      <SpaceBetween size="s">
        {AVAILABLE_COMPONENTS.map((component) => (
          <DraggableComponentItem key={component.name} {...component} />
        ))}
      </SpaceBetween>
    </div>
  );
};

export default DraggableComponentList;