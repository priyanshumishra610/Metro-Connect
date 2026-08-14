import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';

export interface ScreenContainerProps extends ViewProps {
  edges?: Edge[];
  padded?: boolean;
}

export function ScreenContainer({ edges = ['top'], padded = true, style, children, ...rest }: ScreenContainerProps) {
  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <View style={[padded && styles.padded, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  padded: { flex: 1, paddingHorizontal: space.md },
});
