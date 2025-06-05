import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Textarea from "@cloudscape-design/components/textarea";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DraggableComponent } from "../types/ComponentTypes";
import { componentMap } from "./DraggableComponentList";

interface PreviewModeProps {
  components: DraggableComponent[];
  setComponents: React.Dispatch<React.SetStateAction<DraggableComponent[]>>;
}

// Component to render components in preview mode
const PreviewComponent: React.FC<{
  component: DraggableComponent;
  renderChildren: (parentId: string) => React.ReactNode;
}> = ({ component, renderChildren }) => {
  const Component = component.component;
  console.log("In PreviewComponent, my type is", component.type);
  console.log("In PreviewComponent, my props are", component.props);

  // Determine if this component can have children
  const canHaveChildren = component.props.children !== undefined;

  if (!Component) {
    console.error("In PreviewComponent, NO COMPONENT FOUND");
    return null;
  }

  return (
    <Component
      {...component.props}
      children={
        canHaveChildren
          ? renderChildren(component.id)
          : component.props.children
      }
    />
  );
};

// Generate JSX markup for a component
const generateMarkup = (component: DraggableComponent, level = 0): string => {
  if (!component) return "";
  console.log("Inside generateMarkup for component", component);

  const indent = "  ".repeat(level);
  const nextIndent = "  ".repeat(level + 1);

  // Start tag
  let markup = `${indent}<${component.type}`;

  // Add props
  Object.entries(component.props).forEach(([key, value]) => {
    // Skip children prop as it will be handled separately
    if (key === "children") return;

    // Skip React elements
    if (React.isValidElement(value)) return;

    // Handle different value types
    if (key === "cardDefinition" && component.type === "Cards") {
      const cardDefinitionSectionsString =
        component.props.cardDefinition.sections.map(
          (section: { content: { toString: () => any } }) => ({
            ...section,
            content:
              typeof section.content === "function"
                ? section.content.toString()
                : section.content,
          })
        );
      markup += `\n${nextIndent}cardDefinition={{sections:${JSON.stringify(
        cardDefinitionSectionsString
      )}}}`;
    } else if (key === "columnDefinitions" && component.type === "Table") {
      const columnDefinitionsString = component.props.columnDefinitions.map(
        (col: { cell: { toString: () => any } }) => ({
          ...col,
          cell: typeof col.cell === "function" ? col.cell.toString() : col.cell,
        })
      );
      markup += `\n${nextIndent}columnDefinitions={${JSON.stringify(
        columnDefinitionsString
      )}}`;
    } else if (typeof value === "string") {
      markup += `\n${nextIndent}${key}="${value}"`;
    } else if (typeof value === "number" || typeof value === "boolean") {
      markup += `\n${nextIndent}${key}={${value}}`;
    } else if (typeof value === "object" && value !== null) {
      markup += `\n${nextIndent}${key}={${JSON.stringify(value)}}`;
    } else if (typeof value === "function" && value !== null) {
      markup += `\n${nextIndent}${key}={${value.toString()}}`;
    }
  });

  // Handle children
  const hasStringChildren = typeof component.props.children === "string";
  const hasComponentChildren =
    component.props.children &&
    component.props.children.length > 0 &&
    Array.isArray(component.props.children);

  if (hasStringChildren || hasComponentChildren) {
    markup += ">\n";

    // Add string children
    if (hasStringChildren) {
      markup += `${nextIndent}${component.props.children}\n`;
    }

    // Add component children - with null check to satisfy TypeScript
    if (hasComponentChildren && component.props.children) {
      component.props.children.forEach((child: any) => {
        markup += generateMarkup(child, level + 1) + "\n";
      });
    }

    // Close tag
    markup += `${indent}</${component.type}>`;
  } else {
    // Self-closing tag
    markup += " />";
  }

  return markup;
};

// Generate full markup for all components
const generateFullMarkup = (components: DraggableComponent[]): string => {
  if (!components || components.length === 0) return "";

  // Only include top-level components
  const topLevelComponents = components.filter((comp) => !comp.parentId);

  return topLevelComponents.map((comp) => generateMarkup(comp)).join("\n\n");
};

const PreviewMode: React.FC<PreviewModeProps> = ({
  components,
  setComponents,
}) => {
  const [markup, setMarkup] = useState<string>("");
  const [editedMarkup, setEditedMarkup] = useState<string>("");

  // Generate markup whenever components change
  useEffect(() => {
    const generatedMarkup = generateFullMarkup(components);
    setMarkup(generatedMarkup);
    setEditedMarkup(generatedMarkup);
  }, [components]);

  // Add this helper function to extract array values
  // Enhanced function to extract array values with proper object handling
  const extractArrayValues = (arrayExpr: t.ArrayExpression): any[] => {
    return arrayExpr.elements
      .map((element) => {
        if (t.isObjectExpression(element)) {
          // Handle object literals in arrays
          const obj: Record<string, any> = {};
          element.properties.forEach((prop) => {
            if (t.isObjectProperty(prop)) {
              let key = "";

              // Handle different key types
              if (t.isIdentifier(prop.key)) {
                key = prop.key.name;
              } else if (t.isStringLiteral(prop.key)) {
                key = prop.key.value;
              }

              if (key) {
                // Handle different value types
                if (t.isStringLiteral(prop.value)) {
                  obj[key] = prop.value.value;
                } else if (t.isNumericLiteral(prop.value)) {
                  obj[key] = prop.value.value;
                } else if (t.isBooleanLiteral(prop.value)) {
                  obj[key] = prop.value.value;
                } else if (t.isObjectExpression(prop.value)) {
                  // Handle nested objects
                  obj[key] = extractObjectProperties(prop.value);
                } else if (t.isArrayExpression(prop.value)) {
                  // Handle nested arrays
                  obj[key] = extractArrayValues(prop.value);
                }
              }
            }
          });
          return obj;
        } else if (t.isStringLiteral(element)) {
          return element.value;
        } else if (t.isNumericLiteral(element)) {
          return element.value;
        } else if (t.isBooleanLiteral(element)) {
          return element.value;
        }
        return null;
      })
      .filter((item) => item !== null);
  };

  // Helper function to extract object properties
  const extractObjectProperties = (
    objExpr: t.ObjectExpression
  ): Record<string, any> => {
    const obj: Record<string, any> = {};
    objExpr.properties.forEach((prop) => {
      if (t.isObjectProperty(prop)) {
        let key = "";

        // Handle different key types
        if (t.isIdentifier(prop.key)) {
          key = prop.key.name;
        } else if (t.isStringLiteral(prop.key)) {
          key = prop.key.value;
        }

        if (key) {
          // Handle different value types
          if (t.isStringLiteral(prop.value)) {
            obj[key] = prop.value.value;
          } else if (t.isNumericLiteral(prop.value)) {
            obj[key] = prop.value.value;
          } else if (t.isBooleanLiteral(prop.value)) {
            obj[key] = prop.value.value;
          } else if (t.isObjectExpression(prop.value)) {
            // Handle nested objects recursively
            obj[key] = extractObjectProperties(prop.value);
          } else if (t.isArrayExpression(prop.value)) {
            // Handle nested arrays
            obj[key] = extractArrayValues(prop.value);
          }
        }
      }
    });
    return obj;
  };

  // Add this function to process JSX elements recursively
  const processJsxElement = (
    jsxElement: t.JSXElement,
    parentId?: string
  ): DraggableComponent | null => {
    const jsxName = jsxElement.openingElement.name;

    // Only handle JSXIdentifier (simple component names)
    if (!t.isJSXIdentifier(jsxName)) {
      return null;
    }

    const componentType = jsxName.name;

    // Skip if component type is not in our map
    if (!componentMap[componentType]) {
      return null;
    }

    // Extract props
    // Extract props
    const props: Record<string, any> = {};
    jsxElement.openingElement.attributes.forEach((attr) => {
      if (!t.isJSXAttribute(attr)) return;
      const name = attr.name.name as string;
      const value = attr.value;

      if (t.isStringLiteral(value)) {
        // Handle string literals
        props[name] = value.value;
      } else if (t.isJSXExpressionContainer(value)) {
        // Handle expressions like {true}, {42}, etc.
        const expression = value.expression;
        if (t.isBooleanLiteral(expression)) {
          props[name] = expression.value;
        } else if (t.isNumericLiteral(expression)) {
          props[name] = expression.value;
        } else if (t.isObjectExpression(expression)) {
          // Extract object properties using the helper function
          props[name] = extractObjectProperties(expression);
        } else if (t.isArrayExpression(expression)) {
          // Extract array values using the enhanced function
          props[name] = extractArrayValues(expression);
        }
      }
    });

    // Handle text children
    if (jsxElement.children.length > 0) {
      const textChildren = jsxElement.children
        .filter((child) => t.isJSXText(child))
        .map((child) => (child as t.JSXText).value.trim())
        .filter((text) => text.length > 0);

      if (textChildren.length > 0) {
        props.children = textChildren.join(" ");
      }
    }

    // Create the component
    const componentId = uuidv4();
    const component: DraggableComponent = {
      id: componentId,
      type: componentType,
      component: componentMap[componentType],
      props,
      parentId,
    };

    // Process JSX children (nested components)
    const jsxChildren = jsxElement.children.filter(
      (child) =>
        t.isJSXElement(child) && t.isJSXIdentifier(child.openingElement.name)
    ) as t.JSXElement[];

    if (jsxChildren.length > 0) {
      component.props.children = [];

      // Process each child recursively
      jsxChildren.forEach((childElement) => {
        const childComponent = processJsxElement(childElement, componentId);
        if (childComponent) {
          component.props.children!.push(childComponent);
        }
      });
    }

    return component;
  };

  // Function to apply code changes
  const applyCodeChanges = () => {
    try {
      // Wrap the JSX in a fragment to make it parseable
      const wrappedCode = `<>${editedMarkup}</>`;

      // Parse the JSX code
      const ast = parse(wrappedCode, {
        plugins: ["jsx"],
        sourceType: "module",
      });

      const newComponents: DraggableComponent[] = [];

      // Find top-level JSX elements (direct children of the fragment)
      let topLevelElements: t.JSXElement[] = [];

      traverse(ast, {
        JSXFragment(path) {
          // Get direct children of the fragment
          topLevelElements = path.node.children.filter((child) =>
            t.isJSXElement(child)
          ) as t.JSXElement[];
        },
      });

      // Process each top-level element
      topLevelElements.forEach((element) => {
        const component = processJsxElement(element);
        if (component) {
          if (component.type === "Table") {
            console.log("We're trying to deal with a Table");
          }
          if (component.type === "Table" && component.props.columnDefinitions) {
            component.props.columnDefinitions =
              component.props.columnDefinitions.map((col: any) => {
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
              });
          }

          if (
            component.type === "Cards" &&
            component.props.cardDefinition.sections
          ) {
            component.props.cardDefinition.sections =
              component.props.cardDefinition.sections.map((section: any) => {
                const newCol = { ...section };
                if (
                  typeof section.content === "string" &&
                  section.content.includes("=>")
                ) {
                  try {
                    // Convert string representation back to function
                    // eslint-disable-next-line no-new-func
                    console.log("section.content is", section.content);
                    newCol.content = new Function(
                      "return " + section.content
                    )();
                  } catch (e) {
                    console.error("Error parsing function:", e);
                    // Fallback to a simple function if parsing fails
                    newCol.content = (item: any) => item[section.id] || "";
                  }
                }
                return newCol;
              });
          }

          newComponents.push(component);
        }
      });

      if (newComponents.length > 0) {
        setComponents(newComponents);
      }
    } catch (error) {
      console.error("Error applying code changes:", error);
      alert("Failed to parse the code. Please check for syntax errors.");
    }
  };

  // Recursively render children components
  const renderChildren = (parentId: string): React.ReactNode => {
    // Find the parent component
    const parent = findComponentById(components, parentId);

    if (!parent || !parent.props.children) {
      return null;
    }

    // For SpaceBetween, we need to render children differently
    if (parent.type === "SpaceBetween") {
      if (Array.isArray(parent.props.children)) {
        return parent.props.children.map((child: any) => (
          <PreviewComponent
            key={child.id}
            component={child}
            renderChildren={renderChildren}
          />
        ));
      }
    }

    if (typeof parent.props.children === "string") return parent.props.children;

    // Default rendering for other container types
    if (Array.isArray(parent.props.children)) {
      return parent.props.children.map((child: any) => (
        <PreviewComponent
          key={child.id}
          component={child}
          renderChildren={renderChildren}
        />
      ));
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
      if (
        comp.props.children &&
        comp.props.children.length > 0 &&
        Array.isArray(comp.props.children)
      ) {
        const found = findComponentById(comp.props.children, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

  // Only render top-level components (those without parents)
  const topLevelComponents = components.filter((comp) => !comp.parentId);

  return (
    <SpaceBetween size="l">
      <Container>
        <Box padding="m">
          {topLevelComponents.map((comp) => (
            <PreviewComponent
              key={comp.id}
              component={comp}
              renderChildren={renderChildren}
            />
          ))}
        </Box>
      </Container>

      <Container
        header={<Header>Cloudscape Markup</Header>}
        footer={
          <Box float="right">
            <Button onClick={applyCodeChanges} variant="primary">
              Apply Changes
            </Button>
          </Box>
        }
      >
        <Textarea
          value={editedMarkup}
          onChange={({ detail }) => setEditedMarkup(detail.value)}
          rows={20}
          spellcheck={false}
        />
      </Container>
    </SpaceBetween>
  );
};

export default PreviewMode;
