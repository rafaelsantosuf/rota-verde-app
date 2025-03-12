import { Tabs } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import React from 'react';
import { Platform } from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen name="rota" options={{
        headerTitle: "Rota",
        tabBarLabel: "Rota",
        tabBarIcon: ({color}) => (
          <Ionicons 
            name="home" size={30} 
            color={"#43B877"}
          />
        ),

        }} />
      <Tabs.Screen name="dados" options = {{
        headerTitle: "Dados",
        tabBarLabel: "Dados",
        tabBarIcon: ({color}) => (
          <Ionicons 
            name="folder" size={30}
            color={"#43B877"} 
          />
        ),
        }} />
    </Tabs>
  );
}
