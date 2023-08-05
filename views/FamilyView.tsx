import React from 'react';
import {View} from 'react-native';
import Tree from '../components/Tree';

interface FamilyViewProps {
  screenHeight: number;
  screenWidth: number;
}

export const FamilyView: React.FC<FamilyViewProps> = ({
  screenHeight,
  screenWidth,
}) => {
  return <Tree screenHeight={screenHeight} screenWidth={screenWidth} />;
};
