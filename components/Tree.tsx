import React from 'react';

import {Group, Canvas, Path, Skia} from '@shopify/react-native-skia';
import Node from './Node';
interface TreeProps {
  width: number;
  height: number;
}
const Tree = (props: TreeProps) => {
  const globalRadius = props.width * 0.08;
  //TO BE REFACTORED: PATHING
  const path = Skia.Path.Make();
  const isNodeOnScreen = (x: number, y: number, r: number) => {
    if (!(x + r < 0 && y + r < 0)) return true;
    else if (!(x + r > props.width && y + r > props.width)) return true;
    else return false;
  };
  path.moveTo(globalRadius, globalRadius);
  path.lineTo(globalRadius, globalRadius + 200);
  const testX = -globalRadius;
  const testY = 0;
  return (
    <Canvas style={{flex: 1}}>
      <Group blendMode="src">
        {/*
            render top most node
            then render all children of that node
            draw lines from top most node to all of the children nodes
            repeat for all nodes until no more children
        */}
        {isNodeOnScreen(testX, testY, globalRadius) ? (
          <Node position={[testX, testY]} radius={globalRadius} src="" />
        ) : null}

        <Path
          path={path}
          color="black"
          strokeWidth={props.width * 0.016}
          style="stroke"
        />
        <Node
          position={[globalRadius, globalRadius + 200]}
          radius={globalRadius}
          src=""
        />
      </Group>
    </Canvas>
  );
};
export default Tree;
