import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#FFFBF5',
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="tree"
        options={{
          title: '家族树',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🌳</Text>,
        }}
      />
      <Tabs.Screen
        name="tree-demo"
        options={{
          title: '树演示',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: '成员',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: '大事记',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🤖</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
