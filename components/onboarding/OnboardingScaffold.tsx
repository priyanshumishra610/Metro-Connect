import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';

export interface OnboardingScaffoldProps {
  step: number; // 1-11
  totalSteps?: number;
  children: React.ReactNode;
  ctaLabel: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  onSkip?: () => void;
  showBack?: boolean;
  /** Screens with a scrollable/searchable body (station pickers, interest grids) want top alignment instead of the default vertical centering used for the narrative screens. */
  stretch?: boolean;
}

export function OnboardingScaffold({
  step,
  totalSteps = 11,
  children,
  ctaLabel,
  onCta,
  ctaDisabled,
  ctaLoading,
  onSkip,
  showBack = true,
  stretch = false,
}: OnboardingScaffoldProps) {
  const router = useRouter();

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        {showBack && router.canGoBack() ? (
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back" accessibilityRole="button">
            <Icon name="chevron-left" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={{ width: 22 }} />
        )}

        <View style={styles.dots}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i < step ? colors.interactive : colors.border, width: i + 1 === step ? 18 : 6 }]}
            />
          ))}
        </View>

        {onSkip ? (
          <Pressable onPress={onSkip} hitSlop={10} accessibilityRole="button">
            <Text variant="smallMedium" color="textSecondary">Skip</Text>
          </Pressable>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      <Animated.View entering={FadeIn.duration(220)} style={[styles.content, stretch && styles.contentStretch]}>
        {children}
      </Animated.View>

      <View style={styles.footer}>
        <Button label={ctaLabel} onPress={onCta} disabled={ctaDisabled} loading={ctaLoading} fullWidth />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.sm,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
  content: { flex: 1, justifyContent: 'center' },
  contentStretch: { justifyContent: 'flex-start', paddingTop: space.md },
  footer: { paddingBottom: space.md },
});
