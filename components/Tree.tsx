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

//THIS NEEDS FURTHER TESTING FOR POSITIONING OF NODES AND SUBSEQUENT NODES
function positionNodes(
  root: Node,
  widthSpacing: number,
  heightSpacing: number,
) {
  //First pass: assign y coordinates and mark levels
  const levels: Node[][] = [];
  const dfs = (node: Node, depth: number, initialY: number) => {
    node.position[1] = depth * heightSpacing + initialY;

    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);
    if (node.children) {
      for (const child of node.children) {
        dfs(child, depth + 1, initialY);
      }
      // const childrenWidth = (node.children.length - 1) * widthSpacing;

      // let currentX = node.position[0] - childrenWidth / 2;

      // for (const child of node.children) {
      //   child.position[0] = currentX;
      //   currentX += widthSpacing;
      //   dfs(child, depth + 1, initialY);
      // }
    }
  };
  dfs(root, 0, root.position[1]);

  //Second pass: adjust widthSpacing for the next level
  for (let i = levels.length - 1; i >= 0; i--) {
    const levelNodes = levels[i];
    const levelWidth = (levelNodes.length - 1) * widthSpacing;
    let currentX = root.position[0] - levelWidth / 2;
    for (const node of levelNodes) {
      node.position[0] = currentX;
      currentX += widthSpacing;
    }

    //adjust widthSpacing for the next level
    if (i > 0) {
      widthSpacing = levelWidth / (levels[i - 1].length - 1 || 1);
    }
  }
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
    return familyToNodeTree(rootFamilyMember);
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
