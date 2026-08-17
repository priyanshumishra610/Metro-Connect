import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';

const TIPS = [
  'Meet in public places you both already know — a station, a café near your route.',
  'Daytime works better for a first meeting than late evening.',
  "Tell a friend where you're going and who you're meeting.",
  "You're never obligated to meet in person. Take your time.",
];

export default function SafetyCenter() {
  const router = useRouter();
  const { profile } = useAuth();

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingTop: space.md, paddingBottom: space.xxl, gap: space.lg }}>
        <View>
          <Text variant="h3" style={{ marginBottom: space.sm }}>Your verification</Text>
          <Card style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
              {profile?.is_profile_complete && <VerificationBadge kind="profile_complete" />}
              {profile?.is_commute_verified && <VerificationBadge kind="commute_verified" />}
              {profile?.is_identity_verified && <VerificationBadge kind="identity_verified" />}
            </View>
            {!profile?.is_identity_verified && (
              <Text variant="small" color="textSecondary">
                Identity verification isn't live yet — this badge only ever appears once it's real.
              </Text>
            )}
          </Card>
        </View>

        <View>
          <Text variant="h3" style={{ marginBottom: space.sm }}>Controls</Text>
          <Pressable style={styles.row} onPress={() => router.push('/safety/blocked')} accessibilityRole="button">
            <Icon name="user-x" size={18} color={colors.textPrimary} />
            <Text variant="bodyMedium" style={{ flex: 1 }}>Blocked people</Text>
            <Icon name="chevron-right" size={18} color={colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.row} onPress={() => router.push('/safety/report')} accessibilityRole="button">
            <Icon name="flag" size={18} color={colors.textPrimary} />
            <Text variant="bodyMedium" style={{ flex: 1 }}>Report a problem</Text>
            <Icon name="chevron-right" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View>
          <Text variant="h3" style={{ marginBottom: space.sm }}>Meeting someone for the first time</Text>
          <Card style={{ gap: space.sm }}>
            {TIPS.map((tip) => (
              <View key={tip} style={{ flexDirection: 'row', gap: space.xs }}>
                <Icon name="check" size={14} color={colors.success} style={{ marginTop: 3 }} />
                <Text variant="small" color="textSecondary" style={{ flex: 1 }}>{tip}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View>
          <Text variant="h3" style={{ marginBottom: space.sm }}>Community guidelines</Text>
          <Card>
            <Text variant="small" color="textSecondary">
              Metro Connect exists to help real commuters meet honestly. Harassment, fake profiles,
              and unsolicited content aren't tolerated — reports are reviewed and acted on, and
              blocking is always available and never disclosed to the person you blocked.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
