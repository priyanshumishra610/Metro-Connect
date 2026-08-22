import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { useAuth, useGuestGate } from '@/hooks/useAuth';
import { getDatingPreferences, leaveDatingLobby, optIntoDatingLobby } from '@/services/dating';
import { discoverDatingLobby, type DatingProspect } from '@/services/discovery';

export default function DatingLobby() {
  const router = useRouter();
  const { userId, isGuest } = useAuth();
  const { open } = useGuestGate();
  const [optedIn, setOptedIn] = useState<boolean | null>(null);
  const [prospects, setProspects] = useState<DatingProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const prefsResult = await getDatingPreferences(userId);
    const isOptedIn = prefsResult.data?.is_opted_in ?? false;
    setOptedIn(isOptedIn);

    if (isOptedIn) {
      const result = await discoverDatingLobby(userId);
      setProspects(result.data ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (isGuest) {
      open('dating');
      setLoading(false);
      return;
    }
    load();
  }, [load, isGuest, open]);

  const onOptIn = async () => {
    if (!userId) return;
    setBusy(true);
    await optIntoDatingLobby(userId);
    setBusy(false);
    load();
  };

  const onLeave = async () => {
    if (!userId) return;
    setBusy(true);
    await leaveDatingLobby(userId);
    setBusy(false);
    load();
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md }}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h2">Dating Lobby</Text>
      </View>

      {isGuest ? (
        <View style={{ gap: space.md }}>
          <Icon name="heart" size={28} color={colors.dating} />
          <Text variant="h3">Dating Lobby stays off the demo route.</Text>
          <Text variant="body" color="textSecondary">
            Create an account to opt in. Nobody sees you here unless you turn it on.
          </Text>
          <Button label="Create an account" onPress={() => open('dating')} fullWidth />
        </View>
      ) : loading ? (
        <ActivityIndicator style={{ marginTop: space.xl }} />
      ) : !optedIn ? (
        <View style={{ gap: space.md }}>
          <Icon name="heart" size={28} color={colors.dating} />
          <Text variant="body" color="textSecondary">
            This is a separate, opt-in space — nobody sees you here unless you turn it on, and
            it's completely independent from the friendship and networking side of Metro Connect.
            No precise location is ever shared, and meeting up is always your choice.
          </Text>
          <Button label="Join the Dating Lobby" onPress={onOptIn} loading={busy} variant="destructive" fullWidth />
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: space.sm }}>
            <Pressable onPress={onLeave} disabled={busy} accessibilityRole="button">
              <Text variant="smallMedium" color="textSecondary">Leave Dating Lobby</Text>
            </Pressable>
          </View>
          <FlatList
            data={prospects}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={{ gap: space.md, paddingBottom: space.xxl }}
            ListEmptyComponent={
              <EmptyState icon="heart" title="Nobody in the lobby yet." body="More opted-in commuters will show up here as they join." />
            }
            renderItem={({ item }) => (
              <Card elevated style={{ gap: space.sm }}>
                <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
                  <Avatar name={item.displayName} imageUrl={item.avatarUrl} verified={item.isIdentityVerified} />
                  <View style={{ flex: 1 }}>
                    <Text variant="h3">{item.displayName}</Text>
                    {item.showCommuteTime && (
                      <Text variant="small" color="textSecondary">Usually on the same line as you</Text>
                    )}
                  </View>
                </View>
                {item.bio && <Text variant="body" color="textSecondary">{item.bio}</Text>}
                {item.sharedInterestCount > 0 && (
                  <Chip label={`${item.sharedInterestCount} shared interest${item.sharedInterestCount === 1 ? '' : 's'}`} tone="dating" />
                )}
              </Card>
            )}
          />
        </>
      )}
    </ScreenContainer>
  );
}
