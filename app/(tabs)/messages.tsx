import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { AnimatedListItem } from '@/components/ui/AnimatedListItem';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { voice } from '@/constants/copy';
import { space, tabBarClearance } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { listConversations, type ConversationSummary } from '@/services/messages';

export default function Messages() {
  const router = useRouter();
  const { userId } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const result = await listConversations(userId);
    setConversations(result.data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenContainer edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: space.md }}>
        <Text variant="h1" style={{ marginBottom: space.md }}>Messages</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: space.xl }} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversation.id}
          contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: tabBarClearance }}
          ListEmptyComponent={<EmptyState icon="message-circle" title={voice.emptyMessagesTitle} body={voice.emptyMessagesBody} />}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <Pressable
                onPress={() => router.push(`/conversation/${item.conversation.id}`)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm }}
                accessibilityRole="button"
              >
                <Avatar name={item.counterpart.display_name ?? 'Commuter'} imageUrl={item.counterpart.avatar_url} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodySemiBold">{item.counterpart.display_name ?? 'A fellow commuter'}</Text>
                  <Text variant="small" color="textSecondary" numberOfLines={1}>
                    {item.lastMessage?.body ?? 'Say hello — start with an icebreaker.'}
                  </Text>
                </View>
                {item.unreadCount > 0 && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.interactive }} />}
              </Pressable>
            </AnimatedListItem>
          )}
        />
      )}
    </ScreenContainer>
  );
}
