import { View, StyleSheet } from 'react-native';
import { StarIcon } from 'react-native-heroicons/solid';

type RatingStarsProps = {
  count?: number;
  size?: number;
  color?: string;
  gap?: number;
};

export function RatingStars({
  count = 5,
  size = 24,
  color = '#F5C451',
  gap = 6,
}: RatingStarsProps) {
  return (
    <View style={[styles.row, { gap }]}>
      {Array.from({ length: count }).map((_, index) => (
        <StarIcon key={index} size={size} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
