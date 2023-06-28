import React from 'react';

import {Group, Canvas, Path, Skia, Circle} from '@shopify/react-native-skia';
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
      {node.children.map(child => {
        const path = Skia.Path.Make();
        path.moveTo(node.position[0], node.position[1]);
        path.lineTo(child.position[0], child.position[1]);
        return (
          <React.Fragment>
            <Path path={path} color="black" style="stroke" strokeWidth={5} />
            {renderNodes(child)}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};
const Tree = (props: TreeProps) => {
  const isNodeOnScreen = (x: number, y: number, r: number) => {
    if (!(x + r < 0 && y + r < 0)) return true;
    else if (!(x + r > props.screenWidth && y + r > props.screenWidth))
      return true;
    else return false;
  };
  const globalRadius = props.screenWidth * 0.08;
  //TO BE REFACTORED: PATHING
  // const path = Skia.Path.Make();

  // path.moveTo(globalRadius, globalRadius);
  // path.lineTo(globalRadius, globalRadius + 200);
  const testX = globalRadius;
  const testY = globalRadius;

  const heightSpacing = 100;
  const widthSpacing = 100;

  const exampleTree: Node = {
    id: 'root',
    position: [props.screenWidth / 2, globalRadius],
    radius: globalRadius,
    src: '',
    children: [
      {
        id: 'child1',
        position: [-1, -1],
        radius: globalRadius,
        src: '',
        children: [
          {
            id: 'child5',
            position: [-1, -1],
            radius: globalRadius,
            src: '',
            children: [],
          },
          {
            id: 'child6',
            position: [-1, -1],
            radius: globalRadius,
            src: '',
            children: [],
          },
        ],
      },
      {
        id: 'child2',
        position: [-1, -1],
        radius: globalRadius,
        src: '',
        children: [
          {
            id: 'child7',
            position: [-1, -1],
            radius: globalRadius,
            src: '',
            children: [],
          },
          {
            id: 'child8',
            position: [-1, -1],
            radius: globalRadius,
            src: '',
            children: [],
          },
        ],
      },
    ],
  };

  positionNodes(exampleTree, widthSpacing, heightSpacing);
  return (
    <Canvas style={{flex: 1}}>
      <Group blendMode="src">
        {/*
            render top most node
            then render all children of that node
            draw lines from top most node to all of the children nodes
            repeat for all nodes until no more children
        */}
        {renderNodes(exampleTree)}
      </Group>
    </Canvas>
  );
};
export default Tree;
