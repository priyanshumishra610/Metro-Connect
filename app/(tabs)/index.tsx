import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';

import { AdBanner } from '@/components/ads/AdBanner';
import { MetroRouteVisual } from '@/components/metro/MetroRouteVisual';
import { PersonCard } from '@/components/discovery/PersonCard';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { voice } from '@/constants/copy';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { useHomeData } from '@/hooks/useHomeData';
import { requestConnection } from '@/services/connections';
import { formatFrequency, formatTime, greetingForNow } from '@/utils/format';

export default function Home() {
  const router = useRouter();
  const { profile, userId } = useAuth();
  const { commute, people, loading, error, reload } = useHomeData();
  const [connectingIds, setConnectingIds] = useState<Set<string>>(new Set());
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  const onConnect = async (personId: string) => {
    if (!userId) return;
    setConnectingIds((prev) => new Set(prev).add(personId));
    const result = await requestConnection(userId, personId);
    setConnectingIds((prev) => {
      const next = new Set(prev);
      next.delete(personId);
      return next;
    });
    if (!result.error) setConnectedIds((prev) => new Set(prev).add(personId));
  };

  const firstName = profile?.display_name?.split(' ')[0];

  return (
    <ScreenContainer edges={['top']} padded={false}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: space.xxl }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor="#ffffff" />}
      >
        <View style={{ paddingTop: space.sm, marginBottom: space.lg }}>
          <Text variant="body" color="textSecondary">{greetingForNow()}</Text>
          <Text variant="h1">{firstName ? `Hey, ${firstName}.` : 'Hey there.'}</Text>
        </View>

        {commute ? (
          <Card elevated style={{ marginBottom: space.xl, gap: space.md, alignItems: 'center' }}>
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

        <Text variant="h3" style={{ marginBottom: space.md }}>People on your route</Text>

        {!loading && people.length === 0 ? (
          <EmptyState
            icon="users"
            title={voice.coldStartTitle}
            body={voice.coldStartBody}
            actionLabel="Invite people from your route"
            onAction={() => router.push('/settings')}
          />
        ) : (
          <View style={{ gap: space.md }}>
            {people.map((person) => (
              <PersonCard
                key={person.userId}
                person={person}
                connectLabel={connectedIds.has(person.userId) ? 'Request sent' : 'Connect'}
                connectDisabled={connectingIds.has(person.userId) || connectedIds.has(person.userId)}
                onConnect={() => onConnect(person.userId)}
              />
            ))}
          </View>
        )}

        {people.length > 0 && (
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
