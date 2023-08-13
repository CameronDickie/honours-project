import React, {useMemo} from 'react';
import {Group, Canvas, Path, Skia, Circle} from '@shopify/react-native-skia';
import {useFamilyData, FamilyMember} from './FamilyDataContext';

interface TreeProps {
  screenWidth: number;
  screenHeight: number;
}

interface Node {
  id: string;
  position: [number, number];
  radius: number;
  src: string;
  children: Node[];
}

function positionNodes(
  root: Node,
  widthSpacing: number,
  heightSpacing: number,
  screenHeight: number,
) {
  // Assign y coordinates and center nodes based on their hierarchy
  const dfs = (node: Node, x: number, depth: number) => {
    node.position[0] = x;

    if (depth === 0) {
      // root node
      node.position[1] = screenHeight / 2;
    } else if (depth > 0) {
      // children
      node.position[1] = screenHeight / 2 + depth * heightSpacing;
    } else {
      // parents (negative depth)
      node.position[1] = screenHeight / 2 + depth * heightSpacing;
    }

    let currentX = x;
    for (const child of node.children) {
      dfs(child, currentX, depth + 1);
      currentX += widthSpacing;
    }
  };

  dfs(root, root.position[0], 0);
}

const renderNodes = (node: Node, visited: Set<string>) => {
  // If the node has already been visited, return immediately
  if (visited.has(node.id)) {
    return null;
  }
  // Mark the current node as visited
  visited.add(node.id);

  return (
    <React.Fragment>
      <Circle cx={node.position[0]} cy={node.position[1]} r={node.radius} />
      {node.children.map((child, keyIndex) => {
        const path = Skia.Path.Make();
        path.moveTo(node.position[0], node.position[1]);
        path.lineTo(child.position[0], child.position[1]);
        return (
          <React.Fragment key={keyIndex}>
            <Path path={path} color="black" style="stroke" strokeWidth={5} />
            {renderNodes(child, visited)}
            {/* Pass the visited set down the recursive call */}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

const Tree = ({screenWidth, screenHeight}: TreeProps) => {
  const {familyData} = useFamilyData();

  const familyToNodeTree = (
    familyMember: FamilyMember | null,
    visited: Set<string> = new Set(),
  ): Node | null => {
    if (!familyMember) return null;

    // If the member has already been visited, return null
    if (visited.has(familyMember.id)) {
      return null;
    }

    // Mark the current member as visited
    visited.add(familyMember.id);

    // Get all direct relations (children and parents)
    const relations = [
      ...familyMember.relationships.children,
      ...familyMember.relationships.parents,
    ];

    return {
      id: familyMember.id,
      position: [-1, -1],
      radius: screenWidth * 0.08,
      src: '', // Assuming you don't have this information in FamilyMember
      children: relations
        .map(member => familyToNodeTree(member, visited)) // Pass the visited set down the recursive call
        .filter(Boolean) as Node[], // filter out null children
    };
  };

  const rootNode = useMemo(() => {
    const initialNode = familyToNodeTree(
      familyData.rootMember,
      new Set<string>(),
    );
    if (initialNode) {
      initialNode.position = [screenWidth / 2, 50]; // Start from the center-top
    }
    return initialNode;
  }, [familyData.rootMember, screenWidth]);

  if (!rootNode) return null;

  positionNodes(rootNode, 100, 100, screenHeight);
  return (
    <Canvas style={{flex: 1}}>
      <Group blendMode="src">{renderNodes(rootNode, new Set<string>())}</Group>
    </Canvas>
  );
};

export default Tree;
