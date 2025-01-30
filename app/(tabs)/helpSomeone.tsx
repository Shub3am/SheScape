import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import { useFonts, Poppins_800ExtraBold } from "@expo-google-fonts/poppins";
import * as Location from "expo-location";
import { supabase } from "../utils/supabase";
// import Map from "react-map-gl/mapbox";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

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
  // let [fontsLoaded] = useFonts({
  //   Poppins_800ExtraBold,
  // });
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
        let getNearByVictims = await supabase.from("allVictims").select("*");
        // console.log(getNearByVictims);
        if (getNearByVictims.data) {
          setVictims(getNearByVictims.data);
        }
      })();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchLocation();
  }, []);
  if (uniqueUser && location) {
    return (
      <SafeAreaView style={styles.container}>
        {!victims.length ? (
          <Text
            style={{
              fontSize: 20,
              color: "white",
              fontFamily: "Poppins_800ExtraBold",
            }}>
            No One Looking For Help At the moment
          </Text>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 120,
            }}>
            {victims.map((i, index) => {
              return (
                <View
                  key={index}
                  style={{
                    padding: 15,
                    marginVertical: 5,
                    backgroundColor: "#ecf0f1",
                    borderBottomWidth: 1,
                    borderRadius: 8,
                    marginHorizontal: 10,
                  }}>
                  <Text style={{ fontSize: 30 }}>{i.name} Needs Help</Text>
                  <MapView
                    style={{ width: 300, height: 300 }}
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
                        latitudeDelta: 0.01, // Zoom in more
                        longitudeDelta: 0.01,
                      }}
                      title={`${i.name}'s Location`}
                      description="Help Her"
                    />
                  </MapView>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View
          style={{
            backgroundColor: "white",
            position: "absolute",
            bottom: 100,
          }}>
          <View
            style={[
              styles.SOS,
              readyToHelp
                ? { backgroundColor: "green", borderColor: "green" }
                : { backgroundColor: "red", borderColor: "red" },
            ]}>
            <Text
              onPress={async () => {
                fetchLocation();
                if (!readyToHelp && location) {
                  let addToDB = await supabase
                    .from("availableVolunteers")
                    .insert({ name: uniqueUser, location: location });
                } else {
                  let removefromDb = await supabase
                    .from("availableVolunteers")
                    .delete()
                    .eq("name", uniqueUser);
                }
                setReadyToHelp(!readyToHelp);
              }}
              style={[
                {
                  fontSize: 20,
                  fontFamily: "Poppins_800ExtraBold",
                  color: "white",
                },
              ]}>
              {readyToHelp ? "I am Ready To Help" : "Not Ready"}
            </Text>
          </View>
        </View>
      </SafeAreaView>
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
        <View style={{ backgroundColor: "white", padding: 10 }}>
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
