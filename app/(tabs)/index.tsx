import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { AdBanner } from '@/components/ads/AdBanner';
import { MetroRouteVisual } from '@/components/metro/MetroRouteVisual';
import { PersonCard } from '@/components/discovery/PersonCard';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { voice } from '@/constants/copy';
import { space, tabBarClearance } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { useHomeData } from '@/hooks/useHomeData';
import { requestConnection } from '@/services/connections';
import { formatFrequency, formatTime, greetingForNow } from '@/utils/format';

export default function Home() {
  const router = useRouter();
  const { profile, userId } = useAuth();
  const { commute, spotlight, incomingRequests, loading, error, reload } = useHomeData();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const onConnect = async () => {
    if (!userId || !spotlight) return;
    setConnecting(true);
    const result = await requestConnection(userId, spotlight.userId);
    setConnecting(false);
    if (!result.error) setConnected(true);
  };

  const firstName = profile?.display_name?.split(' ')[0];

  return (
    <ScreenContainer edges={['top']} padded={false}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: tabBarClearance }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.interactive} />}
      >
        <View style={{ paddingTop: space.sm, marginBottom: space.lg }}>
          <Text variant="body" color="textSecondary">{greetingForNow()}</Text>
          <Text variant="h1">{firstName ? `Hey, ${firstName}.` : 'Hey there.'}</Text>
        </View>

        {commute ? (
          <Card elevated style={{ marginBottom: space.lg, gap: space.md, alignItems: 'center' }}>
            <View style={{ alignSelf: 'flex-start' }}>
              <Text variant="label" color="textSecondary">YOUR COMMUTE</Text>
              <Text variant="h2">
                {commute.home_station?.name ?? 'Home'} → {commute.destination_station?.name ?? 'Destination'}
              </Text>
              <Text variant="body" color="textSecondary">
                Around {formatTime(commute.start_time)} · {formatFrequency(commute.frequency)}
              </Text>
            </View>
            <MetroRouteVisual
              homeLabel={commute.home_station?.name ?? 'Home'}
              destinationLabel={commute.destination_station?.name ?? 'Destination'}
            />
          </Card>
        ) : loading ? (
          <ActivityIndicator style={{ marginBottom: space.xl }} />
        ) : null}

        {error && <InlineError message={error.message} />}

        {incomingRequests.length > 0 && (
          <Pressable onPress={() => router.push('/(tabs)/connections')} accessibilityRole="button">
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.lg }}>
              <Avatar name={incomingRequests[0].counterpart.display_name ?? 'Commuter'} imageUrl={incomingRequests[0].counterpart.avatar_url} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="bodySemiBold">
                  {incomingRequests.length === 1
                    ? `${incomingRequests[0].counterpart.display_name ?? 'Someone'} wants to connect`
                    : `${incomingRequests.length} connection requests`}
                </Text>
                <Text variant="small" color="textSecondary">From people on your route</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textSecondary} />
            </Card>
          </Pressable>
        )}

        <Text variant="h3" style={{ marginBottom: space.md }}>Today's top match</Text>

        {!loading && !spotlight ? (
          <EmptyState
            icon="users"
            title={voice.coldStartTitle}
            body={voice.coldStartBody}
            actionLabel="Invite people from your route"
            onAction={() => router.push('/settings')}
          />
        ) : spotlight ? (
          <PersonCard
            person={spotlight}
            connectLabel={connected ? 'Request sent' : 'Connect'}
            connectDisabled={connecting || connected}
            connected={connected}
            onConnect={onConnect}
          />
        ) : null}

        {spotlight && (
          <View style={{ alignItems: 'flex-start', marginTop: space.md }}>
            <Chip
              label="See everyone on your route"
              icon="arrow-right"
              tone="interactive"
              onPress={() => router.push('/(tabs)/discover')}
            />
          </View>
        )}

        <AdBanner surface="home" />
      </ScrollView>
    </ScreenContainer>
  );
}
