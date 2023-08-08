import React, {useMemo} from 'react';

import {Group, Canvas, Path, Skia, Circle} from '@shopify/react-native-skia';
import {useFamilyData, FamilyMember} from './FamilyDataContext'; // Assuming it's in the same directory
// import Node from './Node';
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
) {
  // Assign y coordinates and center nodes based on their hierarchy
  const dfs = (node: Node, x: number, depth: number) => {
    node.position[0] = x;

    // If depth is 0 (root node), don't overwrite its y position
    if (depth !== 0) {
      node.position[1] = depth * heightSpacing;
    }

    const childrenCount = node.children.length;

    if (childrenCount > 0) {
      const totalWidthForChildren = widthSpacing * (childrenCount - 1);
      let currentX = x - totalWidthForChildren / 2;
      for (const child of node.children) {
        dfs(child, currentX, depth + 1);
        currentX += widthSpacing;
      }
    }
  };

  dfs(root, root.position[0], 0);
}

const renderNodes = (node: Node) => {
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
            {renderNodes(child)}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

const Tree = (props: TreeProps) => {
  const {familyData} = useFamilyData();
  const rootFamilyMember = familyData.rootMember;

  // Convert FamilyMember to Node structure.
  const familyToNodeTree = (familyMember: FamilyMember | null): Node | null => {
    if (!familyMember) return null;
    return {
      id: familyMember.id,
      position: [-1, -1],
      radius: props.screenWidth * 0.08,
      src: '', // Assuming you don't have this information in FamilyMember
      children: familyMember.relationships.children
        .map(child => familyToNodeTree(child))
        .filter(Boolean) as Node[], // filter out null children
    };
  };
  const rootNode = useMemo(() => {
    const yPadding = 50;
    const initialNode = familyToNodeTree(rootFamilyMember);
    if (initialNode) {
      initialNode.position = [props.screenWidth / 2, yPadding]; // Adjust Y value as needed
    }
    return initialNode;
  }, [rootFamilyMember]);

  if (!rootNode) return null; // Early exit if rootNode is null

  positionNodes(rootNode, 100, 100);

  return (
    <Canvas style={{flex: 1}}>
      <Group blendMode="src">{renderNodes(rootNode)}</Group>
    </Canvas>
  );
};

export default Tree;
