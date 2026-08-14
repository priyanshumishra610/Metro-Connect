import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { space } from '@/constants/spacing';
import type { DiscoveredPerson } from '@/services/discovery';

export interface PersonCardProps {
  person: DiscoveredPerson;
  onConnect?: () => void;
  connectLabel?: string;
  connectDisabled?: boolean;
  flavorLine?: string;
}

/** The core discovery unit (brief §24) — every card must answer "why am I seeing this person?" with real reasons, never a bare score. */
export function PersonCard({ person, onConnect, connectLabel = 'Connect', connectDisabled, flavorLine }: PersonCardProps) {
  const router = useRouter();

  return (
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
        <Button label={connectLabel} onPress={onConnect} disabled={connectDisabled} variant="primary" fullWidth />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm, width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
});
