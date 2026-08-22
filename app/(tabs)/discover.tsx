import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { AdBanner } from '@/components/ads/AdBanner';
import { PersonCard } from '@/components/discovery/PersonCard';
import { SegmentedControl } from '@/components/discovery/SegmentedControl';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { relevanceReasons, voice } from '@/constants/copy';
import { space, tabBarClearance } from '@/constants/spacing';
import { useAuth, useGuestGate } from '@/hooks/useAuth';
import { listCommunitiesForCity, type CommunityWithCount } from '@/services/communities';
import { requestConnection } from '@/services/connections';
import { discoverCommuters, type DiscoveredPerson } from '@/services/discovery';
import { track } from '@/services/analytics';

type Segment = 'for_you' | 'your_route' | 'circles' | 'professional' | 'dating';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'for_you', label: 'For You' },
  { key: 'your_route', label: 'Your Route' },
  { key: 'circles', label: 'Interest Circles' },
  { key: 'professional', label: 'Professional' },
  { key: 'dating', label: 'Dating Lobby' },
];

export default function Discover() {
  const router = useRouter();
  const { userId, profile, isGuest } = useAuth();
  const { guard } = useGuestGate();
  const [segment, setSegment] = useState<Segment>('for_you');
  const [people, setPeople] = useState<DiscoveredPerson[]>([]);
  const [communities, setCommunities] = useState<CommunityWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    if (segment === 'circles') {
      listCommunitiesForCity(profile?.city_id ?? '').then((result) => {
        setCommunities(result.data ?? []);
        setLoading(false);
      });
      return;
    }

    discoverCommuters(userId).then((result) => {
      const all = result.data ?? [];
      const filtered =
        segment === 'professional'
          ? all.filter((p) => p.profession)
          : segment === 'your_route'
            ? all.filter((p) =>
                p.reasons.some(
                  (r) => r === relevanceReasons.highRouteOverlap || r === relevanceReasons.sameHomeStation || r === relevanceReasons.sameDestination
                )
              )
            : all;
      setPeople(filtered);
      setLoading(false);
    });
  }, [segment, userId, profile?.city_id]);

  useEffect(() => {
    if (isGuest) track('guest_discovery_viewed');
  }, [isGuest]);

  const onConnect = async (personId: string) => {
    if (!userId) return;
    if (!guard('connection')) return;
    const result = await requestConnection(userId, personId);
    if (!result.error) setConnectedIds((prev) => new Set(prev).add(personId));
  };

  return (
    <ScreenContainer edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: space.md }}>
        <Text variant="h1" style={{ marginBottom: space.xs }}>Discover</Text>
        <SegmentedControl
          segments={SEGMENTS}
          selected={segment}
          onSelect={(key) => {
            const next = key as Segment;
            if (next === 'dating') {
              if (!guard('dating')) return;
              router.push('/dating-lobby');
              return;
            }
            setSegment(next);
          }}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: space.xl }} />
      ) : segment === 'circles' ? (
        <FlatList
          data={communities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: tabBarClearance, gap: space.sm }}
          ListEmptyComponent={<EmptyState icon="hash" title="No circles here yet." body="Interest circles form as more commuters on your route join." />}
          renderItem={({ item }) => (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Pressable
                onPress={() => {
                  if (isGuest) guard('community');
                }}
                style={{ flex: 1 }}
                accessibilityRole="button"
              >
                <Text variant="bodySemiBold">{item.name}</Text>
                <Text variant="small" color="textSecondary">
                  {item.member_count} commuter{item.member_count === 1 ? '' : 's'} on nearby routes
                </Text>
              </Pressable>
            </Card>
          )}
        />
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: tabBarClearance, gap: space.md }}
          ListHeaderComponent={segment === 'professional' ? <ProfessionalHint /> : null}
          ListEmptyComponent={
            <EmptyState icon="users" title={voice.emptyDiscoveryTitle('current')} body={voice.emptyDiscoveryBody} />
          }
          renderItem={({ item, index }) => (
            <PersonCard
              person={item}
              index={index}
              connectLabel={connectedIds.has(item.userId) ? 'Request sent' : 'Connect'}
              connectDisabled={connectedIds.has(item.userId)}
              connected={connectedIds.has(item.userId)}
              onConnect={() => onConnect(item.userId)}
            />
          )}
          ListFooterComponent={<AdBanner surface="discovery_feed" />}
        />
      )}
    </ScreenContainer>
  );
}

function ProfessionalHint() {
  return (
    <Text variant="small" color="textSecondary" style={{ marginBottom: space.sm }}>
      People on your route who share a professional world with you — not a network of strangers, just neighbors who happen to work in it too.
    </Text>
  );
}
