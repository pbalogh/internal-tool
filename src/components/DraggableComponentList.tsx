// src/components/DraggableComponentList.tsx
import React from "react";
import { useDrag } from "react-dnd";
import { v4 as uuidv4 } from "uuid";
import { ComponentDefinition } from "../types/ComponentTypes";

// Import Cloudscape components
import Alert from "@cloudscape-design/components/alert";
import AnchorNavigation from "@cloudscape-design/components/anchor-navigation";
import AppLayout from "@cloudscape-design/components/app-layout";
import Autosuggest from "@cloudscape-design/components/autosuggest";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Button from "@cloudscape-design/components/button";
import ButtonDropdown from "@cloudscape-design/components/button-dropdown";
import Calendar from "@cloudscape-design/components/calendar";
import Cards from "@cloudscape-design/components/cards";
import Checkbox from "@cloudscape-design/components/checkbox";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import DatePicker from "@cloudscape-design/components/date-picker";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Icon from "@cloudscape-design/components/icon";
import Input from "@cloudscape-design/components/input";
import Link from "@cloudscape-design/components/link";
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

// Component map with proper typing
export const componentMap: Record<string, React.ComponentType<any>> = {
  Alert,
  AnchorNavigation,
  AppLayout,
  Autosuggest,
  Badge,
  Box,
  BreadcrumbGroup,
  Button,
  ButtonDropdown,
  Calendar,
  Cards,
  Checkbox,
  ColumnLayout,
  Container,
  ContentLayout,
  DatePicker,
  ExpandableSection,
  FormField,
  Header,
  Icon,
  Input,
  Link,
  Popover,
  ProgressBar,
  RadioGroup,
  Select,
  SpaceBetween,
  Spinner,
  StatusIndicator,
  Table,
  Tabs,
  TextContent,
  Textarea,
  Toggle,
};

// Define which components can contain children
const containerComponents: string[] = [
  "Box",
  "Container",
  "ColumnLayout",
  "ExpandableSection",
  "FormField",
  "SpaceBetween",
  "Popover",
  "TextContent",
  "AppLayout",
  "ContentLayout",
  "Cards",
];

// Define default props for components
const defaultPropsMap: Record<string, Record<string, any>> = {
  Alert: { type: "info", children: "This is an alert message" },
  AnchorNavigation: {
    anchors: [
      {
        text: "Section 1",
        href: "#section1",
        level: 1,
      },
      {
        text: "Section 2",
        href: "#section2",
        level: 1,
      },
      {
        text: "Section 3",
        href: "#section3",
        level: 1,
      },
    ],
  },
  // Add this to your defaultPropsMap
  Autosuggest: {
    value: "",
    onChange: () => {},
    options: [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
      { value: "option3", label: "Option 3" },
    ],
    ariaLabel: "Autosuggest",
    placeholder: "Search",
    empty: "No matches found",
    enteredTextLabel: (value: any) => `Use: "${value}"`,
    expandToViewport: false,
    disabled: false,
  },

  Badge: { children: "New", color: "blue" },
  Box: {
    padding: "m",
    fontSize: "body-m",
    children: "Box content",
    style: { minHeight: "100px" },
  },
  BreadcrumbGroup: {
    items: [
      { text: "Home", href: "#" },
      { text: "Category", href: "#" },
      { text: "Current page", href: "#" },
    ],
  },
  Button: { children: "Click me", variant: "primary" },
  ButtonDropdown: {
    items: [
      { text: "Option 1", id: "option1" },
      { text: "Option 2", id: "option2" },
      { text: "Option 3", id: "option3" },
    ],
    children: "Actions",
  },
  Cards: {
    items: [
      {
        id: "item1",
        name: "Item 1",
        description: "Description for item 1",
        category: "Category A",
      },
      {
        id: "item2",
        name: "Item 2",
        description: "Description for item 2",
        category: "Category B",
      },
      {
        id: "item3",
        name: "Item 3",
        description: "Description for item 3",
        category: "Category A",
      },
    ],
    cardDefinition: {
      header: (item: any) => item.name,
      sections: [
        {
          id: "description",
          header: "Description",
          content: (item: any) => item.description,
        },
        {
          id: "category",
          header: "Category",
          content: (item: any) => item.category,
        },
      ],
    },
    header: "Cards",
    selectionType: "single",
    trackBy: "id",
    empty: "No items found",
    loading: false,
    loadingText: "Loading resources",
    variant: "container",
    visibleSections: ["description", "category"],
  },

  Checkbox: { children: "Check me" },
  ColumnLayout: { columns: 2 },
  Container: {
    header: "Container Header",
    children: "Container content goes here",
    style: { minHeight: "100px" }, // Add minimum height
  },
  DatePicker: { placeholder: "YYYY/MM/DD" },
  ExpandableSection: {
    headerText: "Expandable section",
    children: "Expandable content goes here",
    style: { minHeight: "100px" },
  },
  FormField: { label: "Form field label" },
  Header: { children: "Page title" },
  Icon: { name: "settings" },
  Input: { placeholder: "Enter text", value: "" },
  Link: { href: "#", children: "Link text" },
  ProgressBar: { value: 40, label: "Progress" },
  RadioGroup: {
    items: [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
    ],
    value: "option1",
  },
  Select: {
    options: [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
    ],
    selectedOption: { label: "Option 1", value: "1" },
    placeholder: "Choose an option",
  },
  SpaceBetween: {
    size: "m",
    direction: "vertical",
    style: { minHeight: "100px" },
  },
  Spinner: { size: "normal" },
  StatusIndicator: { type: "success", children: "Success" },
  Table: {
    header: "Table Header",
    columnDefinitions: [
      {
        id: "name",
        header: "Name",
        cell: (item: any) => item.name,
        sortingField: "name",
      },
      {
        id: "type",
        header: "Type",
        cell: (item: any) => item.type,
        sortingField: "type",
      },
      {
        id: "size",
        header: "Size",
        cell: (item: any) => item.size,
        sortingField: "size",
      },
    ],
    items: [
      { name: "Document 1", type: "PDF", size: "1.2 MB" },
      { name: "Image", type: "JPG", size: "3.4 MB" },
      { name: "Spreadsheet", type: "XLS", size: "2.8 MB" },
    ],
    sortingColumn: { sortingField: "name" },
    sortingDescending: false,
    variant: "embedded",
    selectionType: "single",
    ariaLabels: {
      selectionGroupLabel: "Selection group",
      allItemsSelectionLabel: "Select all items",
      itemSelectionLabel: (item: any) => `Select ${item.name}`,
    },
  },
  Tabs: {
    tabs: [
      {
        label: "First",
        id: "first",
        content: "Content of the first tab",
      },
      {
        label: "Second",
        id: "second",
        content: "Content of the second tab",
      },
    ],
  },
  TextContent: { children: "This is a paragraph of text." },
  Textarea: { placeholder: "Enter multiple lines of text", value: "" },
  Toggle: { children: "Toggle me" },
};

const DraggableComponentItem: React.FC<ComponentDefinition> = ({
  name,
  component,
  defaultProps,
  isContainer,
}) => {
  const [, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: () => {
      // Add minimum height to container components
      if (isContainer) {
        defaultProps!.style = {
          ...(defaultProps!.style || {}),
          minHeight: "100px",
        };
      }
      if (name === "Cards") {
        console.trace("In drag, props are", defaultProps);
      }
      return {
        id: uuidv4(),
        type: name,
        component: component,
        // props: JSON.parse(JSON.stringify(defaultProps || {})),
        props: defaultProps,
        children: isContainer ? [] : undefined,
      };
    },
  }));

  if (name === "Cards") {
    console.log("In DraggableComponentItem, props are", defaultProps);
  }

  return (
    <div
      ref={drag}
      style={{
        padding: "10px",
        margin: "5px",
        border: "1px dashed gray",
        cursor: "move",
        backgroundColor: "transparent",
      }}
    >
      {name} {isContainer && "📦"}
    </div>
  );
};

const DraggableComponentList: React.FC = () => {
  // Generate component definitions from componentMap with proper typing
  const componentDefinitions: ComponentDefinition[] = Object.entries(
    componentMap
  ).map(([name, component]) => ({
    name,
    component,
    defaultProps: defaultPropsMap[name] || {},
    isContainer: containerComponents.includes(name),
  }));

  console.log("Cards defaultProps are ", defaultPropsMap["Cards"]);

  return (
    <div style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search components..."
          style={{ width: "100%", padding: "8px" }}
          onChange={(e) => {
            // You could add filtering logic here
          }}
        />
      </div>
      {componentDefinitions.map((component) => (
        <DraggableComponentItem key={component.name} {...component} />
      ))}
    </div>
  );
};

export default DraggableComponentList;
