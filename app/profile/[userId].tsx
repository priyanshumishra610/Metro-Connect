import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { blockUser } from '@/services/blocks';
import { getPrimaryCommuteWithStations, type CommuteWithStations } from '@/services/commute';
import { requestConnection } from '@/services/connections';
import { getUserInterestIds } from '@/services/interests';
import { getProfile } from '@/services/profiles';
import { formatFrequency, formatTime } from '@/utils/format';
import type { Profile } from '@/types/database';
import { interestCatalog } from '@/constants/interests';

export default function PublicProfile() {
  const { userId: targetId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { userId: myId } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [commute, setCommute] = useState<CommuteWithStations | null>(null);
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (!targetId || !myId) return;
    setLoading(true);

    Promise.all([
      getProfile(targetId),
      getPrimaryCommuteWithStations(targetId),
      getUserInterestIds(targetId),
      getUserInterestIds(myId),
    ]).then(([profileResult, commuteResult, theirInterests, myInterests]) => {
      setProfile(profileResult.data);
      setCommute(commuteResult.data);
      const mine = new Set(myInterests.data ?? []);
      const shared = (theirInterests.data ?? []).filter((id) => mine.has(id));
      setSharedInterests(shared.map((id) => interestCatalog.find((i) => i.slug === id)?.label ?? id));
      setLoading(false);
    });
  }, [targetId, myId]);

  const onConnect = async () => {
    if (!myId || !targetId) return;
    const result = await requestConnection(myId, targetId);
    if (!result.error) setRequested(true);
  };

  const onBlock = () => {
    Alert.alert('Block this person?', "They won't be able to see your profile or message you.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          if (myId && targetId) await blockUser(myId, targetId);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer edges={['top']}>
        <ActivityIndicator style={{ marginTop: space.xl }} />
      </ScreenContainer>
    );
  }

  if (!profile) {
    return (
      <ScreenContainer edges={['top']}>
        <Text variant="body" color="textSecondary" style={{ marginTop: space.xl, textAlign: 'center' }}>
          This profile isn't available.
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']} padded={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.md, paddingTop: space.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Feather name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert('Report or block', undefined, [
              { text: 'Report', onPress: () => router.push({ pathname: '/safety/report', params: { userId: targetId } }) },
              { text: 'Block', style: 'destructive', onPress: onBlock },
              { text: 'Cancel', style: 'cancel' },
            ])
          }
          hitSlop={10}
          accessibilityLabel="More options"
        >
          <Feather name="more-horizontal" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: space.xxl }}>
        <View style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.lg }}>
          <Avatar name={profile.display_name ?? 'Commuter'} imageUrl={profile.avatar_url} size={96} verified={profile.is_commute_verified} />
          <Text variant="h2">{profile.display_name ?? 'A fellow commuter'}</Text>
          {profile.profession && <Text variant="body" color="textSecondary">{profile.profession}</Text>}
          {profile.education && <Text variant="small" color="textSecondary">{profile.education}</Text>}

          <View style={{ flexDirection: 'row', gap: space.xs }}>
            {profile.is_commute_verified && <VerificationBadge kind="commute_verified" />}
            {profile.is_identity_verified && <VerificationBadge kind="identity_verified" />}
          </View>
        </View>

        {profile.bio && <Text variant="body" style={{ marginBottom: space.lg }}>{profile.bio}</Text>}

        {commute && (
          <View style={{ marginBottom: space.lg }}>
            <Text variant="label" color="textSecondary" style={{ marginBottom: space.xs }}>ROUTE</Text>
            <Text variant="bodyMedium">
              {commute.home_station?.name} → {commute.destination_station?.name}
            </Text>
            <Text variant="small" color="textSecondary">
              Usually around {formatTime(commute.start_time)} · {formatFrequency(commute.frequency)}
            </Text>
            <Text variant="small" color="textSecondary" style={{ marginTop: 2, fontStyle: 'italic' }}>
              You both usually travel this route around {formatTime(commute.start_time)}.
            </Text>
          </View>
        )}

        {sharedInterests.length > 0 && (
          <View style={{ marginBottom: space.lg }}>
            <Text variant="label" color="textSecondary" style={{ marginBottom: space.xs }}>SHARED INTERESTS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
              {sharedInterests.map((label) => (
                <Chip key={label} label={label} tone="interestMatch" />
              ))}
            </View>
          </View>
        )}

        <Button
          label={requested ? 'Request sent' : 'Connect'}
          onPress={onConnect}
          disabled={requested}
          fullWidth
        />
      </ScrollView>
    </ScreenContainer>
  );
}
