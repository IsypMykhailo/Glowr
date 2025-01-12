import * as React from "react";
import {
  StyleSheet,
  View,
  Button,
  Text,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  ColorLight,
  ColorDark,
  FontSize,
  FontFamily,
  Padding,
  Border,
} from "../../../GlobalStyles";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import { Stack, useRouter } from "expo-router";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { SelectList } from "react-native-dropdown-select-list";
import { useTheme } from "../../ThemeContext";
import { supabase } from "../../config/supabaseClient";
import BusinessComponent from "../../components/BusinessCard";
import {getDistance} from "geolib";
import * as Location from "expo-location";

export default function SavedScreen({ navigation }) {
  const [location, setLocation] = React.useState(null);
  const [selected, setSelected] = React.useState("");
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [fetchError, setFetchError] = React.useState(null);
  const [user, setUser] = React.useState({});
  const [savedBusinesses, setSavedBusinesses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  //const { savedBusinesses } = useSaved();
  const [refreshing, setRefreshing] = React.useState(false);
  const [locationServiceEnabled, setLocationServiceEnabled] =
      React.useState(null);



  const fetchSaved = async () => {
    setRefreshing(true);
    let { data: saved, error } = await supabase
      .from("saved")
      .select(
        `*, businesses(*, addresses(*, cities(name), states(state_code, country_code)), business_hours(*), workers(*, services(*), workerAvailability(*)))`
      )
      .eq("user_id", user.id);

    if (error) {
      setFetchError("Could not fetch the businesses");
      setSavedBusinesses(null);
      Alert.alert("Error", error, [{ text: "OK" }], { cancelable: false });
    }
    if (saved) {
      if(location) {
        const distances = await Promise.all(
            saved.map((saved) => GetDistance(saved.businesses))
        );

        saved.forEach((saved, index) => {
          saved.businesses.distance = distances[index];
        });
      }
      setSavedBusinesses(saved);
      setFetchError(null);
    }
    setRefreshing(false);
  };

  const CheckIfLocationEnabled = async () => {
    let enabled = await Location.hasServicesEnabledAsync();

    if (!enabled) {
      /*Alert.alert(
          "Location Service not enabled",
          "Please enable your location services to continue",
          [{ text: "OK" }],
          { cancelable: false }
      );*/
      /*if(user && user.id)
        fetchSaved().then(()=>setLoading(false));*/
    } else {
      setLocationServiceEnabled(enabled);
    }
  };

  // create the handler method

  const GetCurrentLocation = async () => {
    if(!locationServiceEnabled) return;
    let { status } = await Location.requestForegroundPermissionsAsync();

    let { coords } = await Location.getCurrentPositionAsync();

    if (coords) {
      const { latitude, longitude } = coords;
      let response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      for (let item of response) {
        let address = `${item.name}, ${item.street}, ${item.postalCode}, ${item.city}`;
        setLocation(address);
      }
    }
  };

  const getAddressString = (business) => {
    if (!business?.addresses) return "";
    return (
        (business.addresses.line_1 || "") +
        " " +
        (business.addresses.cities?.name || "") +
        " " +
        (business.addresses.states?.state_code || "") +
        " " +
        (business.addresses.states?.country_code || "")
    );
  };

  const getBusinessCoordinates = async (address) => {
    if (!address) return null;
    const coordsArray = await Location.geocodeAsync(address);
    return coordsArray[0]; // Since geocodeAsync returns an array, get the first item.
  };

  const GetDistance = async (business) => {
    /*const currentCoords = await getCurrentCoordinates();
    if (!currentCoords) return "Error getting user location";*/expo 
    const currentCoords = await getBusinessCoordinates(location);
    if (!currentCoords) return "Error getting user location";

    const address = getAddressString(business);
    const businessCoords = await getBusinessCoordinates(address);
    if (!businessCoords) return "Error getting business location";

    const dist =
        getDistance(
            {
              latitude: currentCoords.latitude,
              longitude: currentCoords.longitude,
            },
            {
              latitude: businessCoords.latitude,

              longitude: businessCoords.longitude,
            }
        ) / 1000;

    return dist.toFixed(2); // Using toFixed to format the number
  };
  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  React.useEffect(() => {
    setLoading(true);
    getCurrentUser();
    CheckIfLocationEnabled();
  }, []);

  React.useEffect(() => {
    if (user && user.id && locationServiceEnabled !== null) {
      GetCurrentLocation().then(() => fetchSaved().then(() => setLoading(false)));
    }
    else if(user && user.id && locationServiceEnabled === null) {
      fetchSaved().then(() => setLoading(false));
    }
  }, [user]);

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchSaved} />
          }
        >
          <View style={{ paddingLeft: 24, marginTop: 32 }}>
            <Text
              style={{
                fontSize: 28,
                //fontWeight: "bold",
                fontFamily: FontFamily.bold,
                color: Color.text,
              }}
            >
              Saved
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={Color.text}
              style={{ alignContent: "center", top: 250 }}
            />
          ) : (
            <View style={{ paddingBottom: 32 }}>
              {savedBusinesses.map((saved) => (
                <BusinessComponent
                  key={saved.saved_id}
                  business={saved.businesses}
                  user_id={user.id}
                  navigation={navigation}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
