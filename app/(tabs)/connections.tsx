import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { ConnectionCelebration } from '@/components/connections/ConnectionCelebration';
import { AnimatedListItem } from '@/components/ui/AnimatedListItem';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { space, tabBarClearance } from '@/constants/spacing';
import { voice } from '@/constants/copy';
import { useAuth } from '@/hooks/useAuth';
import {
  getConversationIdForConnection,
  listAcceptedConnections,
  listIncomingRequests,
  respondToConnection,
  type ConnectionWithProfile,
} from '@/services/connections';

export default function Connections() {
  const router = useRouter();
  const { userId } = useAuth();
  const [incoming, setIncoming] = useState<ConnectionWithProfile[]>([]);
  const [accepted, setAccepted] = useState<ConnectionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState<{ name: string; avatarUrl: string | null; conversationId: string | null } | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [incomingResult, acceptedResult] = await Promise.all([listIncomingRequests(userId), listAcceptedConnections(userId)]);
    setIncoming(incomingResult.data ?? []);
    setAccepted(acceptedResult.data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (request: ConnectionWithProfile, status: 'accepted' | 'declined') => {
    setRespondingId(request.id);
    const result = await respondToConnection(request.id, status);
    setRespondingId(null);

    if (status === 'accepted' && !result.error) {
      const conversation = await getConversationIdForConnection(request.id);
      setCelebrating({
        name: request.counterpart.display_name ?? 'A fellow commuter',
        avatarUrl: request.counterpart.avatar_url,
        conversationId: conversation.data,
      });
    }

    load();
  };

  return (
    <ScreenContainer edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: space.md }}>
        <Text variant="h1" style={{ marginBottom: space.md }}>Connections</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: space.xl }} />
      ) : (
        <FlatList
          data={accepted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: tabBarClearance, gap: space.sm }}
          ListHeaderComponent={
            <View style={{ gap: space.sm, marginBottom: space.lg }}>
              {incoming.length > 0 && (
                <>
                  <Text variant="h3">Requests</Text>
                  {incoming.map((request) => (
                    <Card key={request.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                      <Avatar name={request.counterpart.display_name ?? 'Commuter'} imageUrl={request.counterpart.avatar_url} />
                      <View style={{ flex: 1 }}>
                        <Text variant="bodySemiBold">{request.counterpart.display_name ?? 'A fellow commuter'}</Text>
                        <Text variant="small" color="textSecondary">Someone on your route wants to connect.</Text>
                      </View>
                      <View style={{ gap: space.xs }}>
                        <Button
                          label="Accept"
                          onPress={() => respond(request, 'accepted')}
                          loading={respondingId === request.id}
                        />
                        <Button label="Decline" onPress={() => respond(request, 'declined')} variant="ghost" />
                      </View>
                    </Card>
                  ))}
                </>
              )}
              <Text variant="h3">Your route crew</Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="user-plus"
              title={voice.emptyConnectionsTitle}
              body="Once you connect with someone on your route, they'll show up here."
            />
          }
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <Pressable onPress={() => router.push(`/profile/${item.counterpart.id}`)} accessibilityRole="button">
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <Avatar name={item.counterpart.display_name ?? 'Commuter'} imageUrl={item.counterpart.avatar_url} verified={item.counterpart.is_commute_verified} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodySemiBold">{item.counterpart.display_name ?? 'A fellow commuter'}</Text>
                    {item.counterpart.profession && (
                      <Text variant="small" color="textSecondary">{item.counterpart.profession}</Text>
                    )}
                  </View>
                </Card>
              </Pressable>
            </AnimatedListItem>
          )}
        />
      )}

      <ConnectionCelebration
        visible={celebrating !== null}
        personName={celebrating?.name ?? ''}
        personAvatarUrl={celebrating?.avatarUrl}
        onSayHello={() => {
          const conversationId = celebrating?.conversationId;
          setCelebrating(null);
          if (conversationId) router.push(`/conversation/${conversationId}`);
          else router.push('/(tabs)/messages');
        }}
        onDismiss={() => setCelebrating(null)}
      />
    </ScreenContainer>
  );
}
