import React, { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { widthPercentageToDP } from 'react-native-responsive-screen';

interface SegmentedControlProps {
  /**
   * The Segments Text Array
   */
  segments: Array<string>;
  /**
   * The Current Active Segment Index
   */
  currentIndex: number;
  /**
   * A callback onPress of a Segment
   */
  onChange: (index: number) => void;
  /**
   * An array of Badge Values corresponding to the Segment
   */
  badgeValues?: Array<number | null>;
  /**
   * Is right-to-left mode.
   */
  isRTL?: boolean;
  /**
   * The container margin for the segmented control
   * Used to calculate the width of Segmented Control
   */
  containerMargin?: number;
  /**
   * Active Segment Text Style
   */
  activeTextStyle?: TextStyle;
  /**
   * InActive Segment Text Style
   */
  inactiveTextStyle?: TextStyle;
  /**
   * Segment Container Styles
   */
  segmentedControlWrapper?: ViewStyle;
  /**
   * Pressable Container Styles
   */
  pressableWrapper?: ViewStyle;
  /**
   * The moving Tile Container Styles
   */
  tileStyle?: ViewStyle;
  /**
   * Active Badge Styles
   */
  activeBadgeStyle?: ViewStyle;
  /**
   * Inactive Badge Styles
   */
  inactiveBadgeStyle?: ViewStyle;
  /**
   * Badge Text Styles
   */
  badgeTextStyle?: TextStyle;
  /**
   * The segment component
   */
  SegmentComponent?: React.ComponentType<SegmentProps>;
}

const defaultShadowStyle = {
  shadowColor: '#000',
  shadowOffset: {
    width: 1,
    height: 1,
  },
  shadowOpacity: 0.025,
  shadowRadius: 1,

  elevation: 1,
};

const DEFAULT_SPRING_CONFIG = {
  stiffness: 150,
  damping: 20,
  mass: 1,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};

export interface SegmentProps {
  /**
   * The string value of the segment
   */
  segment: string | null;
  /**
   * The selection state of this segment
   */
  selected: boolean;
  /**
   * The selection state of this segment
   */
  badgeValue: number | null;
  /**
   * Active Segment Text Style
   */
  activeTextStyle?: TextStyle;
  /**
   * InActive Segment Text Style
   */
  inactiveTextStyle?: TextStyle;
  /**
   * The moving Tile Container Styles
   */
  tileStyle?: ViewStyle;
  /**
   * Active Badge Styles
   */
  activeBadgeStyle?: ViewStyle;
  /**
   * Inactive Badge Styles
   */
  inactiveBadgeStyle?: ViewStyle;
  /**
   * Badge Text Styles
   */
  badgeTextStyle?: TextStyle;
}

const DefaultSegment: React.FC<SegmentProps> = ({
  segment,
  selected,
  badgeValue,
  activeTextStyle,
  inactiveTextStyle,
  activeBadgeStyle,
  inactiveBadgeStyle,
  badgeTextStyle,
}) => {
  const finalisedActiveTextStyle: TextStyle = {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
    ...activeTextStyle,
  };

  const finalisedInActiveTextStyle: TextStyle = {
    fontSize: 15,
    textAlign: 'center',
    color: '#4b5563',
    ...inactiveTextStyle,
  };

  const finalisedActiveBadgeStyle: ViewStyle = {
    backgroundColor: '#27272a',
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...activeBadgeStyle,
  };

  const finalisedInActiveBadgeStyle: ViewStyle = {
    backgroundColor: '#6b7280',
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
    ...inactiveBadgeStyle,
  };

  const finalisedBadgeTextStyle: TextStyle = {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    color: '#FFFFFF',
    ...badgeTextStyle,
  };

  return (
    <View style={styles.textWrapper}>
      <Text
        style={[
          selected ? finalisedActiveTextStyle : finalisedInActiveTextStyle,
        ]}
      >
        {segment}
      </Text>
      {badgeValue && (
        <View
          style={[
            styles.defaultBadgeContainerStyle,
            selected ? finalisedActiveBadgeStyle : finalisedInActiveBadgeStyle,
          ]}
        >
          <Text style={finalisedBadgeTextStyle}>{badgeValue}</Text>
        </View>
      )}
    </View>
  );
};

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  currentIndex,
  onChange,
  isRTL = false,
  containerMargin = 0,
  segmentedControlWrapper,
  pressableWrapper,
  tileStyle,
  SegmentComponent = DefaultSegment,
  badgeValues = [],
  ...rest
}: SegmentedControlProps) => {
  const width = widthPercentageToDP('100%') - containerMargin * 2;
  const translateValue = width / segments.length;
  const tabTranslateValue = useSharedValue(0);

  // useCallBack with an empty array as input, which will call inner lambda only once and memoize the reference for future calls
  const memoizedTabPressCallback = React.useCallback(
    (index: number) => {
      onChange(index);
    },
    [onChange]
  );
  useEffect(() => {
    // If phone is set to RTL, make sure the animation does the correct transition.
    const transitionMultiplier = isRTL ? -1 : 1;
    tabTranslateValue.value = withSpring(
      currentIndex * (translateValue * transitionMultiplier),
      DEFAULT_SPRING_CONFIG
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const tabTranslateAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabTranslateValue.value }],
    };
  });

  return (
    <Animated.View
      style={[styles.defaultSegmentedControlWrapper, segmentedControlWrapper]}
    >
      <Animated.View
        style={[
          styles.movingSegmentStyle,
          defaultShadowStyle,
          tileStyle,
          StyleSheet.absoluteFill,
          {
            width: width / segments.length - 4,
          },
          tabTranslateAnimatedStyles,
        ]}
      />
      {segments.map((segment, index) => {
        return (
          <Pressable
            onPress={() => memoizedTabPressCallback(index)}
            key={index}
            style={[styles.touchableContainer, pressableWrapper]}
          >
            <SegmentComponent
              selected={index === currentIndex}
              badgeValue={badgeValues[index]}
              segment={segment}
              {...rest}
            />
          </Pressable>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  defaultSegmentedControlWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  touchableContainer: {
    flex: 1,
    elevation: 9,
    paddingVertical: 12,
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  movingSegmentStyle: {
    top: 0,
    marginVertical: 2,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  // Badge Styles
  defaultBadgeContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    width: 16,
    borderRadius: 9999,
    alignContent: 'flex-end',
  },
});

export default SegmentedControl;
