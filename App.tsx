import React from 'react';
import {View} from 'react-native';

import Tree from './components/Tree';

function App(): JSX.Element {
  return (
    <View style={{flex: 1}}>
      <Tree />
    </View>
  );
}

export default App;
