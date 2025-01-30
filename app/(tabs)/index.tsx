import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { supabase } from "../utils/supabase"
import * as Location from "expo-location"
import MapView, { Marker } from "react-native-maps"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

export default function HomeScreen() {
  const [SOS, setSOS] = useState(false)
  const [Volunteers, setVolunteers] = useState([])
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [temp, setTemp] = useState("")
  const [uniqueUser, setUser] = useState("")
  const [userProfile, setUserProfile] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [newText, setNewText] = useState("")

  const fetchLocation = async () => {
    setLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied")
        return
      }

      const locationData = await Location.getCurrentPositionAsync({})
      setLocation(locationData)
    } catch (error) {
      setErrorMsg("Error fetching location")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      ;(async () => {
        const getAllVolunteers = await supabase.from("availableVolunteers").select("*")
        setVolunteers(getAllVolunteers.data)
      })()
    }, 5000)

    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    fetchLocation()
  }, [fetchLocation]) // Added fetchLocation to dependencies
  if (uniqueUser && location) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.background} />
        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.sosButton, SOS && styles.sosButtonActive]}
            onPress={async () => {
              fetchLocation()
              if (!SOS && location) {
                const d = await supabase.from("allVictims").insert({
                  name: uniqueUser,
                  location: location,
                })
                setUserProfile({
                  name: uniqueUser,
                  location: location,
                  texts: [],
                })
              } else {
                const d = await supabase.from("allVictims").delete().eq("name", uniqueUser)
                setUserProfile(null)
              }
              setSOS(!SOS)
            }}
          >
            <Text style={styles.sosButtonText}>{SOS ? "CANCEL SOS" : "SOS"}</Text>
          </TouchableOpacity>

          {SOS && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>{`Saathi's Near You: ${Volunteers.length}`}</Text>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="My Location"
                >
                  <View style={styles.markerContainer}>
                    <Ionicons name="person" size={24} color="#FF416C" />
                  </View>
                </Marker>
                {Volunteers.map((i, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: i.location.coords.latitude,
                      longitude: i.location.coords.longitude,
                    }}
                    title={`${i.name}'s Location`}
                    description="Coming For Your Help"
                  >
                    <View style={styles.markerContainer}>
                      <Ionicons name="people" size={24} color="#4A90E2" />
                    </View>
                  </Marker>
                ))}
              </MapView>

              <View style={styles.messageContainer}>
                <Text style={styles.messageTitle}>Emergency Keywords</Text>
                <TextInput
                  style={styles.messageInput}
                  onChangeText={(t) => setNewText(t)}
                  placeholder="Type your message here"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={async () => {
                    const currentProfile = userProfile
                    currentProfile.texts = [...currentProfile.texts, newText]
                    const sendText = await supabase
                      .from("allVictims")
                      .update({ texts: currentProfile.texts })
                      .eq("name", uniqueUser)
                  }}
                >
                  <Text style={styles.sendButtonText}>Send Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    )
  } else {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.background} />
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Enter Your Name</Text>
          <TextInput
            style={styles.loginInput}
            onChangeText={(e) => setTemp(e)}
            placeholder="Your name"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.loginButton} onPress={() => setUser(temp)}>
            <Text style={styles.loginButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF416C",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  sosButtonActive: {
    backgroundColor: "#4CAF50",
  },
  sosButtonText: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  infoContainer: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
  },
  messageContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 15,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  messageInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  loginInput: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 5,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

