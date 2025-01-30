import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { useState, useEffect } from "react";
import { useFonts, Poppins_800ExtraBold } from "@expo-google-fonts/poppins";

import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../utils/supabase";
import * as Location from "expo-location";
export default function HomeScreen() {
  const [SOS, setSOS] = useState(false);
  const [Volunteers, setVolunteers] = useState([]);
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
      console.log(locationData, "hehehe");
      setLocation(locationData);
    } catch (error) {
      setErrorMsg("Error fetching location");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     (async () => {
  //       let getNearByVolunteers = await supabase
  //         .from("availableVolunteers")
  //         .select("*");
  //       console.log(getNearByVolunteers);
  //       setVolunteers(getNearByVolunteers.data);
  //     })();
  //   }, 6000);

  //   return () => clearInterval(interval);
  // }, []);
  useEffect(() => {
    fetchLocation();
  }, []);
  console.log(JSON.stringify(location));
  if (uniqueUser && location) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.SOS,
            SOS
              ? { backgroundColor: "green", borderColor: "green" }
              : { backgroundColor: "red", borderColor: "red" },
          ]}>
          <Text
            onPress={async () => {
              fetchLocation();
              if (!SOS && location) {
                let d = await supabase.from("allVictims").insert({
                  name: uniqueUser,
                  location: location,
                });
              } else {
                let d = await supabase
                  .from("allVictims")
                  .delete()
                  .eq("name", uniqueUser);
              }
              setSOS(!SOS);
            }}
            style={[
              {
                fontSize: 40,
                fontFamily: "Poppins_800ExtraBold",
              },
              SOS ? { color: "white" } : { color: "white" },
            ]}>
            {SOS ? "Looking For Help" : "SOS"}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 20,
            color: "white",
            marginTop: 20,
            fontFamily: "Poppins_800ExtraBold",
          }}>
          {Volunteers.length
            ? `Nearest Saathi is ${Volunteers.length} Away`
            : null}
        </Text>
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
    backgroundColor: "black",
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
