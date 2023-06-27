import React from 'react';
import {View} from 'react-native';

import {useWindowDimensions} from 'react-native';

import Tree from './components/Tree';

function App(): JSX.Element {
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;
  return (
    <View style={{height: height}}>
      <Tree height={height} width={width} />
    </View>
  );
}

export default App;
