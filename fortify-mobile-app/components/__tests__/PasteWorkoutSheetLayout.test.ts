import fs from 'fs';
import path from 'path';

describe('PasteWorkoutSheet layout', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../../src/components/workout/PasteWorkoutSheet.tsx'),
    'utf8'
  );

  it('does not change the sheet structure based on the system font scale', () => {
    expect(source).not.toContain('isLargeText');
    expect(source).not.toContain('rowStacked');
    expect(source).not.toContain('inputLargeText');
    expect(source).not.toContain('fontScale >=');
  });

  it('keeps the simulator title and actions on one line with controlled scaling', () => {
    for (const label of ['Paste Workout', 'Paste Clipboard', 'Import Workout']) {
      const labelIndex = source.indexOf(label);
      expect(labelIndex).toBeGreaterThan(-1);
      const nearbyProps = source.slice(Math.max(0, labelIndex - 500), labelIndex);
      expect(nearbyProps).toContain('allowFontScaling={false}');
      expect(nearbyProps).toContain('adjustsFontSizeToFit');
      expect(nearbyProps).toContain('numberOfLines={1}');
    }
  });

  it('renders the empty input prompt as a single shrinking line', () => {
    const promptIndex = source.indexOf('Paste an exercise list or workout notes');
    const nearbyProps = source.slice(Math.max(0, promptIndex - 500), promptIndex);
    expect(nearbyProps).toContain('styles.inputPlaceholder');
    expect(nearbyProps).toContain('minimumFontScale={0.72}');
    expect(nearbyProps).toContain('numberOfLines={1}');
  });

  it('keeps Make Template interactive while the tour overlay blocks scrolling', () => {
    const tourOverlayIndex = source.indexOf('<TourOverlay');
    const tourOverlayProps = source.slice(tourOverlayIndex, tourOverlayIndex + 500);
    expect(tourOverlayProps).toContain('allowAnchorInteraction');
    expect(source).toContain('scrollEnabled={!isTourExample}');
  });
});
