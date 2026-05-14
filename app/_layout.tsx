import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { OfflineModeProvider } from '../src/components/common/OfflineModeProvider';
import { ApiProvider } from '../src/providers/ApiProvider';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

function ThemedStack() {
  const { colors, isDark } = useTheme();
  
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: colors.background.primary,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="family/[id]"
          options={{
            title: '家族详情',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="person/[id]"
          options={{
            title: '成员详情',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="family/create"
          options={{
            title: '创建家族',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="person/add"
          options={{
            title: '添加成员',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <OfflineModeProvider>
        <ApiProvider>
          <ThemedStack />
        </ApiProvider>
      </OfflineModeProvider>
    </ThemeProvider>
  );
}
