import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../utils/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// A simple NavBar pinned to the top
export function NavBar() {
  return (
    <LinearGradient
      colors={["#FF416C", "#FF4B2B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.navBar}>
      <Text style={styles.navBarTitle}>sheScape - A Safer World</Text>
    </LinearGradient>
  );
}

export default function HomeScreen() {
  const [SOS, setSOS] = useState(false);
  const [victims, setVictims] = useState([]);
  const [readyToHelp, setReadyToHelp] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  const [temp, setTemp] = useState("");
  const [uniqueUser, setUser] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch location
  const fetchLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      const locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);
    } catch (error) {
      setErrorMsg("Error fetching location");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch victims periodically
  useEffect(() => {
    const fetchVictims = async () => {
      const getNearByVictims = await supabase.from("allVictims").select("*");
      if (getNearByVictims.data) {
        setVictims(getNearByVictims.data);
      }
    };

    fetchVictims();
    const interval = setInterval(fetchVictims, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch location on mount
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // If user has entered name and location is available
  const renderMainContent = () => {
    if (uniqueUser && location) {
      return (
        <>
          {!victims.length ? (
            <View style={styles.noVictimsContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
              <Text style={styles.infoText}>
                No One Looking For Help At The Moment
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {victims.map((i, index) => {
                return (
                  <View key={index} style={styles.victimCard}>
                    <Text style={styles.victimName}>{i.name} Needs Help</Text>
                    <Text style={styles.emergencyKeywords}>
                      Emergency Keywords:{" "}
                      {i.texts ? i.texts.join(", ") : "None"}
                    </Text>
                    <MapView
                      style={styles.mapStyle}
                      initialRegion={{
                        latitude: i.location.coords.latitude,
                        longitude: i.location.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}>
                      <Marker
                        coordinate={{
                          latitude: i.location.coords.latitude,
                          longitude: i.location.coords.longitude,
                        }}
                        title={`${i.name}'s Location`}
                        description="Help">
                        <View style={styles.markerContainer}>
                          <Ionicons name="warning" size={24} color="#FF416C" />
                        </View>
                      </Marker>
                    </MapView>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Ready/Not Ready button */}
          <View style={styles.helpButtonWrapper}>
            <TouchableOpacity
              style={[
                styles.SOS,
                readyToHelp
                  ? { backgroundColor: "#4CAF50" }
                  : { backgroundColor: "#FF416C" },
              ]}
              onPress={async () => {
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
              }}>
              <Text style={styles.helpText}>
                {readyToHelp ? "I am Ready To Help" : "Not Ready"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    } else {
      // If user name not entered or location not fetched, show input
      return (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter Your Name:</Text>
          <TextInput
            onChangeText={(e) => {
              setTemp(e);
            }}
            style={styles.textInput}
            placeholder="Your name"
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              setUser(temp);
            }}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar pinned at top */}
      <NavBar />

      {/* Main content: use marginTop to avoid overlap by the NavBar */}
      <View style={styles.mainContent}>
        {/* {loading ? (
          <ActivityIndicator size="large" color="#FF416C" />
        ) : ( */}
        {renderMainContent()}
        {/* )} */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  navBar: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  navBarTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
    marginTop: 10,
    alignItems: "center",
  },
  noVictimsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 18,
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 120,
    alignItems: "center",
  },
  victimCard: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  victimName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  emergencyKeywords: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  mapStyle: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
  },
  helpButtonWrapper: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    width: "90%",
  },
  SOS: {
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  helpText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 50,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  textInput: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#FF416C",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
