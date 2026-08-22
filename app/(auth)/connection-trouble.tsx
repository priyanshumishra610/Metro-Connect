import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { AUTH_COPY } from '@/lib/authErrors';
import { space } from '@/constants/spacing';
import { track } from '@/services/analytics';
import { useAuthStore } from '@/store/authStore';

export default function ConnectionTrouble() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const enterGuest = useAuthStore((s) => s.enterGuest);
  const status = useAuthStore((s) => s.status);
  const [retrying, setRetrying] = React.useState(false);
  const [guestLoading, setGuestLoading] = React.useState(false);

  if (status === 'GUEST' || status === 'AUTHENTICATED') return <Redirect href="/" />;
  if (status === 'UNAUTHENTICATED') return <Redirect href="/(auth)/welcome" />;

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ flex: 1, justifyContent: 'center', gap: space.md }}>
        <Icon name="wifi" size={32} color={colors.warning} />
        <Text variant="h1">{AUTH_COPY.connectingTrouble}</Text>
        <Text variant="bodyLarge" color="textSecondary">
          {AUTH_COPY.connectingTroubleBody}
        </Text>
        <View style={{ height: space.sm }} />
        <Button
          label="Retry"
          onPress={async () => {
            setRetrying(true);
            await bootstrap();
            setRetrying(false);
          }}
          loading={retrying}
          fullWidth
        />
        <Button
          label="Continue as Guest"
          variant="secondary"
          onPress={async () => {
            setGuestLoading(true);
            track('guest_started');
            await enterGuest();
            setGuestLoading(false);
          }}
          loading={guestLoading}
          fullWidth
        />
      </View>
    </ScreenContainer>
  );
}
