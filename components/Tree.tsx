import React from 'react';

import {useWindowDimensions} from 'react-native';

import {Group, Canvas, Path, Skia} from '@shopify/react-native-skia';
import Node from './Node';

const Tree = () => {
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;

  const globalRadius = width * 0.08;
  //TO BE REFACTORED: PATHING
  const path = Skia.Path.Make();
  path.moveTo(globalRadius, globalRadius);
  path.lineTo(globalRadius, globalRadius + 200);
  return (
    <Canvas style={{flex: 1}}>
      <Group blendMode="src">
        {/*
            render top most node
            then render all children of that node
            draw lines from top most node to all of the children nodes
            repeat for all nodes until no more children
        */}
        <Node
          position={[globalRadius, globalRadius]}
          radius={globalRadius}
          src=""
        />
        <Path
          path={path}
          color="black"
          strokeWidth={width * 0.016}
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
