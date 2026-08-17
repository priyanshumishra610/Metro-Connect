import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import type { DiscoveredPerson } from '@/services/discovery';

export interface PersonCardProps {
  person: DiscoveredPerson;
  onConnect?: () => void;
  connectLabel?: string;
  connectDisabled?: boolean;
  connected?: boolean;
  flavorLine?: string;
  /** Position within its list — staggers the entrance so a feed doesn't pop in as one flat block. */
  index?: number;
}

/**
 * The core discovery unit (brief §24) — every card must answer "why am I
 * seeing this person?" with real reasons, never a bare score. Memoized: in
 * a list of these, tapping Connect on one card previously re-rendered every
 * card in the list (the parent's connectedIds Set changing triggers a
 * re-render of the whole renderItem tree) — the custom comparator below
 * only re-renders the specific card whose own props actually changed.
 */
export const PersonCard = React.memo(function PersonCard({
  person,
  onConnect,
  connectLabel = 'Connect',
  connectDisabled,
  connected,
  flavorLine,
  index = 0,
}: PersonCardProps) {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index, 6) * 70).duration(360).springify().damping(18)}>
      <Card elevated style={styles.card}>
        <Pressable onPress={() => router.push(`/profile/${person.userId}`)} style={styles.header} accessibilityRole="button">
          <Avatar name={person.displayName} imageUrl={person.avatarUrl} verified={person.isCommuteVerified} size={52} />
          <View style={{ flex: 1 }}>
            <Text variant="h3">{person.displayName}</Text>
            {person.profession && (
              <Text variant="small" color="textSecondary">{person.profession}</Text>
            )}
            {person.isIdentityVerified && <VerificationBadge kind="identity_verified" />}
          </View>
        </Pressable>

        {person.reasons.length > 0 && (
          <View style={styles.reasons}>
            {person.reasons.map((reason) => (
              <Chip key={reason} label={reason} tone="routeMatch" />
            ))}
          </View>
        )}

        {flavorLine && (
          <Text variant="small" color="textSecondary" style={{ fontStyle: 'italic' }}>
            {flavorLine}
          </Text>
        )}

        {onConnect && (
          <View style={styles.connectRow}>
            <Button label={connectLabel} onPress={onConnect} disabled={connectDisabled} variant="primary" fullWidth />
            {connected && (
              <Animated.View entering={ZoomIn.duration(280).springify().damping(12)} style={styles.successBadge}>
                <Icon name="check" size={14} color={colors.textOnAccent} />
              </Animated.View>
            )}
          </View>
        )}
      </Card>
    </Animated.View>
  );
},
function areEqual(prev, next) {
  // Deliberately excludes onConnect from the comparison: callers pass a
  // fresh closure per render, but it always does the same thing for the
  // same person, so treating it as "changed" would defeat the memo entirely.
  return (
    prev.person === next.person &&
    prev.connectLabel === next.connectLabel &&
    prev.connectDisabled === next.connectDisabled &&
    prev.connected === next.connected &&
    prev.flavorLine === next.flavorLine &&
    prev.index === next.index
  );
});

const styles = StyleSheet.create({
  card: { gap: space.sm, width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  connectRow: { position: 'relative' },
  successBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
