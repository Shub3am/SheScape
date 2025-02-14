import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, View, ScrollView, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";

export default function Safe() {
  const [getPlace, setPlace] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchLocation() {
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
  }
  useEffect(() => {
    fetchLocation();
    (async () => {
      fetchLocation();
      if (location) {
        let places = await fetch(
          `https://api.geoapify.com/v2/place-details?lat=${location.coords.latitude}&lon=${location.coords.longitude}&features=radius_500,radius_500.supermarket,walk_10,drive_5,walk_10.supermarket,drive_5.supermarket,drive_5.shopping_mall,drive_5.fuel,drive_5.parking&apiKey=80ff7d38a43b4d539b9d6f18903dc6b0`
        ).then((response) => response.json());
        console.log(location);
        setPlace(places);
      }
    })();
  }, []);

  if (location && getPlace) {
    // console.log(getPlace.features[0].properties, location);
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Text style={styles.title}>Locations</Text>
          <MapView
            style={{
              width: "100%",
              height: 600,
              marginTop: 10,
            }}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}>
            {getPlace &&
              getPlace.features.map((i, index) => {
                return (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: i.properties.lat,
                      longitude: i.properties.lon,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    title={`${i.name}'s Location`}
                    description="Help"
                  />
                );
              })}
          </MapView>
        </View>
        <Text style={{ position: "absolute", bottom: 200, color: "black" }}>
          Nearest Store: Starbucks C4E Marker, 5 Mins Away
        </Text>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView>
        <Text
          style={{ color: "black" }}
          onPress={() => {
            fetchLocation();
            console.log(location, getPlace);
          }}>
          Get Locations
        </Text>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scrollContainer: {
    maxHeight: 300,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "gray",
  },
});

/* 

 {"coords": {"accuracy": 8.709641981210833, "altitude": 219.20735232393605, "altitudeAccuracy": 30, "heading": -1, "latitude": 28.621029404051196, "longitude": 77.09252715072714, "speed": -1}, "timestamp": 1738216550153.12}

*/
