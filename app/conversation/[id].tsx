import { Icon } from '@/components/ui/Icon';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { MessageBubble } from '@/components/chat/MessageBubble';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { icebreakers } from '@/constants/copy';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import {
  getConversationContext,
  listMessages,
  markConversationRead,
  sendMessage,
  subscribeToConversation,
  type ConversationContext,
} from '@/services/messages';
import type { Message } from '@/types/database';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useAuth();

  const [context, setContext] = useState<ConversationContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!id || !userId) return;

    getConversationContext(id, userId).then((result) => setContext(result.data));
    listMessages(id).then((result) => setMessages(result.data ?? []));
    markConversationRead(id, userId);

    const subscription = subscribeToConversation(id, (message) => {
      setMessages((prev) => [...prev, message]);
      markConversationRead(id, userId);
    });

    return () => subscription.unsubscribe();
  }, [id, userId]);

  const onSend = async (text?: string) => {
    const body = text ?? draft;
    if (!id || !body.trim()) return;
    if (!userId) return;

    setSending(true);
    const result = await sendMessage(id, userId, body);
    setSending(false);
    if (!result.error && result.data) {
      setMessages((prev) => [...prev, result.data]);
      setDraft('');
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']} padded={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
        {context && <Avatar name={context.counterpart.display_name ?? 'Commuter'} imageUrl={context.counterpart.avatar_url} size={36} />}
        <View style={{ flex: 1 }}>
          <Text variant="bodySemiBold">{context?.counterpart.display_name ?? 'Conversation'}</Text>
          {context?.routeNote && (
            <Text variant="caption" color="textSecondary">{context.routeNote}</Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: space.md, flexGrow: 1 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <EmptyState icon="message-circle" title="Say hello." body="You both commute the same route — start with something easy." />
              <View style={styles.icebreakers}>
                {icebreakers.map((line) => (
                  <Pressable key={line} style={styles.icebreakerChip} onPress={() => onSend(line)}>
                    <Text variant="smallMedium" color="interactive">{line}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => <MessageBubble body={item.body} mine={item.sender_id === userId} />}
        />

        <View style={styles.composer}>
          <TextField
            placeholder="Message"
            value={draft}
            onChangeText={setDraft}
            style={{ flex: 1 }}
            multiline
          />
          <Pressable onPress={() => onSend()} disabled={sending || !draft.trim()} style={styles.sendButton} accessibilityLabel="Send">
            <Icon name="arrow-up" size={18} color={colors.textOnAccent} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    padding: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.interactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icebreakers: { gap: space.xs, marginTop: space.md, alignItems: 'center' },
  icebreakerChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
});
