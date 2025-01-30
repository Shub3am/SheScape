import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { useState, useEffect } from "react";
import { useFonts, Poppins_800ExtraBold } from "@expo-google-fonts/poppins";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../utils/supabase";
import geolib from "geolib";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { NavBar } from "./helpSomeone";
export default function HomeScreen() {
  const [SOS, setSOS] = useState(false);
  const [Volunteers, setVolunteers] = useState([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [temp, setTemp] = useState("");
  const [uniqueUser, setUser] = useState("");
  const [userProfile, setUserProfile] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [newText, setNewText] = useState("");

  // let [fontsLoaded] = useFonts({
  //   Poppins_800ExtraBold,
  // });

  // if (!fontsLoaded) {
  //   return null;
  // }
  // useEffect(() => {
  //   fetchLocation();
  // }, []);

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

  useEffect(() => {
    const interval = setInterval(() => {
      (async () => {
        let getAllVolunteers = await supabase
          .from("availableVolunteers")
          .select("*");
        setVolunteers(getAllVolunteers.data);
      })();
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    fetchLocation();
  }, []);
  if (uniqueUser && location) {
    return (
      <View style={styles.container}>
        {/* <NavBar/> */}
        <View
          style={[
            styles.SOS,
            ,
            SOS
              ? {
                  backgroundColor: "green",
                  borderColor: "green",
                  position: "absolute",
                  bottom: 100,
                }
              : { backgroundColor: "red", borderColor: "red" },
            ,
            ,
          ]}>
          <Text
            onPress={async () => {
              fetchLocation();
              if (!SOS && location) {
                let d = await supabase.from("allVictims").insert({
                  name: uniqueUser,
                  location: location,
                });
                setUserProfile({
                  name: uniqueUser,
                  location: location,
                  texts: [],
                });
              } else {
                let d = await supabase
                  .from("allVictims")
                  .delete()
                  .eq("name", uniqueUser);
                setUserProfile(null);
              }
              setSOS(!SOS);
            }}
            style={[
              {
                fontSize: 40,
                fontFamily: "Poppins_800ExtraBold",
              },
              ,
              SOS ? { color: "white" } : { color: "white" },
            ]}>
            {SOS ? "Looking For Help" : "SOS"}
          </Text>
        </View>
        {SOS ? (
          <>
            <View>
              <Text
                style={{
                  fontSize: 20,
                  color: "black",
                  padding: 10,
                  marginTop: 20,
                  fontFamily: "Poppins_800ExtraBold",
                }}>
                {`All Saathi's Near You ${Volunteers.length}`}
              </Text>
              <MapView
                style={{ width: 300, height: 300 }}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}>
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01, // Zoom in more
                    longitudeDelta: 0.01,
                  }}
                  title={`My Location`}
                />
                {Volunteers.map((i, index) => {
                  return (
                    <Marker
                      key={index}
                      coordinate={{
                        latitude: i.location.coords.latitude,
                        longitude: i.location.coords.longitude,
                        latitudeDelta: 0.01, // Zoom in more
                        longitudeDelta: 0.01,
                      }}
                      title={`${i.name}'s Location`}
                      description="Coming For Your Help"
                    />
                  );
                })}
              </MapView>
            </View>
            <View
              style={{
                backgroundColor: "white",

                gap: 2,
                padding: 10,
                width: 200,
                margin: 20,
                borderWidth: 1,
              }}>
              <Text>Emergency Keywords</Text>
              <TextInput
                style={{ borderWidth: 1 }}
                onChangeText={(t) => {
                  setNewText(t);
                }}
              />
              <Button
                title="Send Message"
                onPress={async () => {
                  let currentProfile = userProfile;
                  currentProfile.texts = [...currentProfile.texts, newText];
                  let sendText = await supabase
                    .from("allVictims")
                    .update({ texts: currentProfile.texts })
                    .eq("name", uniqueUser);
                }}
              />
            </View>
          </>
        ) : null}
      </View>
    );
  } else {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          width: "80%",
          alignContent: "center",
          margin: "auto",
        }}>
           {/* <NavBar/> */}
        <View
          style={{ backgroundColor: "white", padding: 10, borderRadius: 10 }}>
          <Text style={{ borderBottomWidth: 1 }}>Enter Your Name:</Text>
          <TextInput
            onChangeText={(e) => {
              setTemp(e);
            }}
            style={{
              backgroundColor: "white",
              borderColor: "black",
              borderWidth: 0.5,
              padding: 10,
              margin: 2,
            }}
          />
          <Button
            onPress={() => {
              setUser(temp);
            }}
            title="Submit"
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  SOS: {
    borderRadius: "10px",
    borderColor: "red",
    backgroundColor: "red",
    padding: 10,
    borderWidth: 1,
  },
  sosText: {
    color: "white",
    fontSize: 40,
  },
});
