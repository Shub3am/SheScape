import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TextInput,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../utils/supabase";

// A simple NavBar pinned to the top
export function NavBar() {
  return (
    <View style={styles.navBar}>
      <Text style={styles.navBarTitle}>sheScape - A Safer World</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [SOS, setSOS] = useState(false);
  const [victims, setVictims] = useState([]);
  const [readyToHelp, setReadyToHelp] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const [temp, setTemp] = useState("");
  const [uniqueUser, setUser] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Optional font usage:
  // const [fontsLoaded] = useFonts({
  //   Poppins_800ExtraBold,
  // });

  // Fetch location
  const fetchLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);
    } catch (error) {
      setErrorMsg("Error fetching location");
    } finally {
      setLoading(false);
    }
  };

  // Fetch victims periodically
  useEffect(() => {
    const interval = setInterval(() => {
      (async () => {
        let getNearByVictims = await supabase.from("allVictims").select("*");
        if (getNearByVictims.data) {
          setVictims(getNearByVictims.data);
        }
      })();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch location on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  // If user has entered name and location is available
  const renderMainContent = () => {
    if (uniqueUser && location) {
      return (
        <>
          {!victims.length ? (
            <Text style={styles.infoText}>
              No One Looking For Help At The Moment
            </Text>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {victims.map((i, index) => {
                return (
                  <View key={index} style={styles.victimCard}>
                    <Text style={styles.victimName}>{i.name} Needs Help</Text>
                    <Text>
                      Emergency Keywords: {i.texts ? i.texts.join(", ") : null}
                    </Text>
                    <MapView
                      style={styles.mapStyle}
                      initialRegion={{
                        latitude: i.location.coords.latitude,
                        longitude: i.location.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: i.location.coords.latitude,
                          longitude: i.location.coords.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                        title={`${i.name}'s Location`}
                        description="Help"
                      />
                    </MapView>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Ready/Not Ready button */}
          <View style={styles.helpButtonWrapper}>
            <View
              style={[
                styles.SOS,
                readyToHelp
                  ? { backgroundColor: "green", borderColor: "green" }
                  : { backgroundColor: "red", borderColor: "red" },
              ]}
            >
              <Text
                onPress={async () => {
                  fetchLocation();
                  if (!readyToHelp && location) {
                    await supabase
                      .from("availableVolunteers")
                      .insert({ name: uniqueUser, location: location });
                  } else {
                    await supabase
                      .from("availableVolunteers")
                      .delete()
                      .eq("name", uniqueUser);
                  }
                  setReadyToHelp(!readyToHelp);
                }}
                style={styles.helpText}
              >
                {readyToHelp ? "I am Ready To Help" : "Not Ready"}
              </Text>
            </View>
          </View>
        </>
      );
    } else {
      // If user name not entered or location not fetched, show input
      return (
        <View style={styles.inputContainer}>
          <Text style={{ borderBottomWidth: 1, marginBottom: 10 }}>
            Enter Your Name:
          </Text>
          <TextInput
            onChangeText={(e) => {
              setTemp(e);
            }}
            style={styles.textInput}
          />
          <Button
            onPress={() => {
              setUser(temp);
            }}
            title="Submit"
          />
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar pinned at top */}
      <NavBar />

      {/* Main content: use marginTop to avoid overlap by the NavBar */}
      <View style={styles.mainContent}>{renderMainContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // NavBar: pinned to the top
  navBar: {
    // position: "absolute",
    // top: 0,
    
  
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#3A3A3A",
    zIndex: 999, // Ensures it's above other content
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  navBarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  // Content below the NavBar
  mainContent: {
    flex: 1,
    marginTop: 60, // This ensures the content starts below the NavBar
    alignItems: "center", // Center horizontally if you like
  },

  // When no victims
  infoText: {
    fontSize: 18,
    color: "black",
    marginTop: 20,
    textAlign: "center",
  },

  // Scroll
  scrollContent: {
    paddingBottom: 120,
  },

  // Victim card
  victimCard: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
    width: "90%",
    marginBottom: 15,
  },
  victimName: {
    fontSize: 24,
    marginBottom: 5,
  },

  // Map
  mapStyle: {
    width: "100%",
    height: 200,
    marginTop: 10,
  },

  // Help Button
  helpButtonWrapper: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
  },
  SOS: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  helpText: {
    color: "white",
    fontSize: 18,
  },

  // User Input
  inputContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    // optional shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    // elevation for Android
    elevation: 2,
    marginTop: 50,
  },
  textInput: {
    backgroundColor: "#f0f0f0",
    borderColor: "black",
    borderWidth: 0.5,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
