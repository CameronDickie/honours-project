import React from 'react';

import {Circle} from '@shopify/react-native-skia';

interface Node {
  position: [number, number];
  radius: number;
  src: string;
}
const Node = (props: Node) => {
  const [x, y] = props.position;
  const r = props.radius;
  return <Circle cx={x} cy={y} r={r} />;
};
export default Node;
