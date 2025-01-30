import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Get Help",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={28} name="handshake-angle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="helpSomeone"
        options={{
          title: "Help Someone",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={28} name="people-group" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
