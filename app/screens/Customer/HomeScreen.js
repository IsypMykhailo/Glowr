import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Animated,
  ScrollView,
  Modal,
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
import { TextInput } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Location from "expo-location";
import { supabase } from "../../config/supabaseClient";
import { useTheme } from "../../ThemeContext";
import { getDistance, getPreciseDistance } from "geolib";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import BusinessComponent from "../../components/BusinessCard";
import FilterModal from "../../components/FilterModal";
import LocationModal from "../../components/LocationModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Pagination from "../../components/Pagination";
import FlashMessage from "react-native-flash-message";

const RECENT_ADDRESSES_KEY = "@recent_addresses";

const storeAddress = async (address) => {
  try {
    let addresses = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
    addresses = addresses ? JSON.parse(addresses) : [];

    // Check if the address already exists. If it does, remove it.
    const index = addresses.indexOf(address);
    if (index > -1) {
      addresses.splice(index, 1);
    }

    // Add the new address to the beginning
    addresses.unshift(address);

    // Only keep the last three addresses
    addresses = addresses.slice(0, 3);

    await AsyncStorage.setItem(RECENT_ADDRESSES_KEY, JSON.stringify(addresses));
  } catch (e) {
    Alert.alert("Error", e.toString(), [{text: "OK"}], {cancelable: false});
  }
};

const fetchRecentAddresses = async () => {
  try {
    const addresses = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
    return addresses ? JSON.parse(addresses) : [];
  } catch (e) {
    Alert.alert("Error", e.toString(), [{text: "OK"}], {cancelable: false});
    return [];
  }
};

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [businesses, setBusinesses] = React.useState([]);
  const [distances, setDistances] = React.useState({});
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredBusinesses, setFilteredBusinesses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [user, setUser] = React.useState({});
  const [isBarbershopChecked, setBarbershopChecked] = React.useState(false);
  const [isTattooChecked, setTattooChecked] = React.useState(false);
  const [isGymChecked, setGymChecked] = React.useState(false);
  const [isOpenNowChecked, setOpenNowChecked] = React.useState(false);
  const [isRatingChecked, setRatingChecked] = React.useState(false);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const [locationServiceEnabled, setLocationServiceEnabled] =
    React.useState(false);
  const [displayCurrentAddress, setDisplayCurrentAddress] = React.useState(
    "Choose your location"
  );
  const [fetchError, setFetchError] = React.useState(null);
  const [lastPage, setLastPage] = React.useState(false);
  const [recentAddresses, setRecentAddresses] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showBlurOverlay, setShowBlurOverlay] = React.useState(false);
  const [defaultBusinesses, setDefaultBusinesses] = React.useState([]);

  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;

  React.useEffect(() => {
    getCurrentUser();
    const loadRecentAddresses = async () => {
      const addresses = await fetchRecentAddresses();
      setRecentAddresses(addresses);
    };

    loadRecentAddresses();
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [location]);

  const fetchBusinesses = async () => {
    let { data: businesses, error } = await supabase
      .from("businesses")
      .select(
        `*, addresses(*, cities(name), states(state_code, country_code)), business_hours(*), workers(*, services(*), workerAvailability(*))`
      );

    if (error) {
      setFetchError("Could not fetch the businesses");
      setBusinesses(null);
      Alert.alert("Error", error, [{ text: "OK" }], { cancelable: false });
    }
    if (businesses) {
      const distances = await Promise.all(
        businesses.map((business) => GetDistance(business))
      );

      businesses.forEach((business, index) => {
        business.distance = distances[index];
      });

      // Sort businesses based on computed distances:
      businesses.sort((a, b) => a.distance - b.distance);

      // 4. Distance Filtering using the slider value
      let businessesCopy = businesses.filter(
        (business) => business.distance <= sliderValue
      );

      // 5. Sorting businesses based on the rating and distance:
      const ratingWeight = 1; // Adjust based on how much weight you want to give rating
      const distanceWeight = 1; // Adjust based on how much weight you want to give distance

      businessesCopy.sort((a, b) => {
        const scoreA = a.rating * ratingWeight - a.distance * distanceWeight;
        const scoreB = b.rating * ratingWeight - b.distance * distanceWeight;
        return scoreB - scoreA; // Sort in descending order
      });

      setBusinesses(businesses);
      setFilteredBusinesses(businessesCopy);
      setDefaultBusinesses(businessesCopy);
      setFetchError(null);
    }
  };

  const fetchData = async () => {
    /*setDisplayCurrentAddress("Wait, we are fetching you location...");
    setLoading(true);
    await CheckIfLocationEnabled();
    await GetCurrentLocation();*/
    await fetchBusinesses();

    const newDistances = {};
    for (let business of businesses) {
      newDistances[business.id] = await GetDistance(business);
    }
    setDistances(newDistances);
    //isSaved();

    setLoading(false);
  };

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const searchBusinesses = (term) => {
    if (term.trim()) {
      const lowerCaseTerm = term.toLowerCase();
      const results = businesses.filter((business) =>
        business.name.toLowerCase().includes(lowerCaseTerm)
      );
      setFilteredBusinesses(results);
    } else {
      // If search term is empty, revert to showing all businesses or the filtered businesses
      filterBusinesses();
    }
  };

  const { utcToZonedTime, format } = require("date-fns-tz");
  const { isWithinInterval, getDay, parseISO } = require("date-fns");

  const isOpened = (business) => {
    if (business.business_hours[0] !== undefined) {
      const business_timezone = business.business_hours[0].timezone;

      const localTimeInBusinessTimeZone = utcToZonedTime(
          new Date(),
          business_timezone
      );

      // Get the current day of the week (0 for Sunday, 1 for Monday, etc.)
      const currentDayOfWeek = getDay(localTimeInBusinessTimeZone);
      const weekDay = parseInt(currentDayOfWeek);

      const scheduleForToday = business.business_hours[0].schedule[weekDay];

      if (!scheduleForToday) return false; // If there's no schedule for today, return false

      const openTimeString = scheduleForToday.open;
      const closeTimeString = scheduleForToday.close;

      // If "none", it means it's closed for the entire day
      if (openTimeString === "none" || closeTimeString === "none") {
        return false;
      }

      try {
        // Convert the open and close time strings to actual Date objects
        const openTime = parseISO(
            format(localTimeInBusinessTimeZone, "yyyy-MM-dd") +
            "T" +
            openTimeString +
            ":00"
        );
        const closeTime = parseISO(
            format(localTimeInBusinessTimeZone, "yyyy-MM-dd") +
            "T" +
            closeTimeString +
            ":00"
        );

        return isWithinInterval(localTimeInBusinessTimeZone, {
          start: openTime,
          end: closeTime,
        });
      } catch (error) {
        Alert.alert("Error parsing times", error.message, [{text: "OK"}], {cancelable: false});
        return false; // Return false by default if there's an error parsing
      }
    }
  };

  const filterBusinesses = () => {
    let results = [...businesses];
    results.forEach((business, index) => {
      business.isOpen = isOpened(business);
    });

    // 1. Text-based Filtering
    /*if (term.trim()) {
      const lowerCaseTerm = term.toLowerCase();
      results = results.filter((business) =>
        business.name.toLowerCase().includes(lowerCaseTerm)
      );
    }*/

    // 2. Business Type Filtering
    if (isBarbershopChecked || isTattooChecked || isGymChecked) {
      results = results.filter((business) => {
        if (isBarbershopChecked && business.type === "Barbershop") return true;
        if (isTattooChecked && business.type === "Tattoo Salon") return true;
        if (isGymChecked && business.type === "Fitness Center") return true;
        return false; // exclude other types
      });
    }

    // 3. Open Now Filtering (assuming business object has a isOpen attribute)
    if (isOpenNowChecked) {
      results = results.filter((business) => business.isOpen);
    }

    // 4. Distance Filtering using the slider value
    results = results.filter((business) => business.distance <= sliderValue);

    // 5. Sorting businesses based on the rating and distance:
    const ratingWeight = 1; // Adjust based on how much weight you want to give rating
    const distanceWeight = 1; // Adjust based on how much weight you want to give distance

    results.sort((a, b) => {
      const scoreA = a.rating * ratingWeight - a.distance * distanceWeight;
      const scoreB = b.rating * ratingWeight - b.distance * distanceWeight;
      return scoreB - scoreA; // Sort in descending order
    });

    setFilteredBusinesses(results);
  };

  const CheckIfLocationEnabled = async () => {
    let enabled = await Location.hasServicesEnabledAsync();

    if (!enabled) {
      Alert.alert(
        "Location Service not enabled",
        "Please enable your location services to continue",
        [{ text: "OK" }],
        { cancelable: false }
      );
    } else {
      setLocationServiceEnabled(enabled);
    }
  };

  // create the handler method

  const GetCurrentLocation = async () => {
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

        setDisplayCurrentAddress(address);
        setLocation(address);
        storeAddress(address);
        if (address.length > 0) {
          setTimeout(() => {
            navigation.navigate("Home", { item: address });
          }, 2000);
        }
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

  const getCurrentCoordinates = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    let { coords } = await Location.getCurrentPositionAsync();
    return coords;
  };

  const getBusinessCoordinates = async (address) => {
    if (!address) return null;
    const coordsArray = await Location.geocodeAsync(address);
    return coordsArray[0]; // Since geocodeAsync returns an array, get the first item.
  };

  const GetDistance = async (business) => {
    /*const currentCoords = await getCurrentCoordinates();
    if (!currentCoords) return "Error getting user location";*/
    //console.log(location);
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

  const onSetLocationHandler = async (index) => {
    setLoading(true);
    setLocation(recentAddresses[index]);
    //console.log(location);
    setDisplayCurrentAddress(recentAddresses[index]);
    storeAddress(recentAddresses[index]);
    //fetchData();
    setShowLocationModal(false);
  };

  const onSearchLocation = async (address) => {
    setLoading(true);
    setLocation(address);
    setDisplayCurrentAddress(address);
    storeAddress(address);
    setShowLocationModal(false);
  };

  const resetFilters = () => {
    // Assuming these are useState setters
    setSearchTerm(""); // Reset the search term (assuming you have a setSearchTerm setter)
    setBarbershopChecked(false);
    setTattooChecked(false);
    setGymChecked(false);
    setOpenNowChecked(false);
    // isOpenNowChecked && setIsOpenNowChecked(false); // If you have this filter
    setSliderValue(50); // Assuming MAX_DISTANCE is the maximum allowed distance
    setFilteredBusinesses(defaultBusinesses); // Reset the filtered results to the original list
    setShowBlurOverlay(false);
  };

  const onRefresh = React.useCallback((address) => {
    setRefreshing(true);
    setLoading(true);
    setLocation(address + " ");
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.container}>
        {showBlurOverlay && (
          <FilterModal
            show={showBlurOverlay}
            onToggleShow={() => {
              setShowBlurOverlay(!showBlurOverlay);
              filterBusinesses(searchTerm);
            }}
            onToggleCancel={() => {
              setShowBlurOverlay(!showBlurOverlay);
            }}
            isBarbershopChecked={isBarbershopChecked}
            setBarbershopChecked={setBarbershopChecked}
            isTattooChecked={isTattooChecked}
            setTattooChecked={setTattooChecked}
            isGymChecked={isGymChecked}
            setGymChecked={setGymChecked}
            isOpenNowChecked={isOpenNowChecked}
            setOpenNowChecked={setOpenNowChecked}
            isRatingChecked={isRatingChecked}
            setRatingChecked={setRatingChecked}
            sliderValue={sliderValue}
            setSliderValue={setSliderValue}
            resetFilters={resetFilters}
          />
        )}

        {showLocationModal && (
          <LocationModal
            show={showLocationModal}
            onRequestClose={() => setShowLocationModal(false)}
            recentAddresses={recentAddresses}
            setRecentAddresses={setRecentAddresses}
            onSetLocation={onSetLocationHandler}
            onGetCurrentLocation={async () => {
              await CheckIfLocationEnabled();
              if (locationServiceEnabled) {
                setDisplayCurrentAddress(
                  "Wait, we are fetching you location..."
                );
                setLoading(true);
                await GetCurrentLocation();
                //fetchData();
                setShowLocationModal(false);
              }
            }}
            onSearchLocation={onSearchLocation}
          />
        )}
        <View style={styles.header}>
          <View style={styles.searchInput}>
            <Ionicons
              style={styles.searchImage}
              name="search"
              size={18}
              color="grey"
            />
            <TouchableOpacity
              style={styles.searchFilter}
              onPress={() => setShowBlurOverlay(!showBlurOverlay)}
              disabled={location === null}
            >
              <Ionicons name="filter" size={18} color="grey" />
            </TouchableOpacity>

            <TextInput
              style={styles.navBarUpper}
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text);
                searchBusinesses(text);
                //filterBusinesses(text);
              }}
              placeholder="Search"
            ></TextInput>
          </View>
          <View style={{ width: "100%", alignItems: "center" }}>
            <TouchableOpacity
              style={styles.location}
              color="white"
              onPress={() => setShowLocationModal(true)}
            >
              <Ionicons
                name="location-sharp"
                size={24}
                color={Color.text}
                style={styles.locationIcon}
              />
              <Text
                numberOfLines={1}
                style={{
                  color: Color.text,
                  fontSize: 18,
                  marginLeft: 8,
                  fontFamily: FontFamily.regular,
                }}
              >
                {displayCurrentAddress}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color={Color.text}
              />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                onRefresh(location);
              }}
            />
          }
        >
          {location !== null &&
          displayCurrentAddress !== "Wait, we are fetching you location..." ? (
            loading ? (
              <ActivityIndicator
                size="large"
                color={Color.text}
                style={{ alignContent: "center", top: 250 }}
              />
            ) : (
              <View>
                {filteredBusinesses.length > 0 ? (
                  <>
                    <View style={[{ paddingLeft: 24 }]}>
                      <Text
                        style={{
                          fontSize: 28,
                          fontFamily: FontFamily.bold,
                          fontWeight: "bold",
                          color: Color.text,
                        }}
                      >
                        Near you
                      </Text>
                    </View>
                    <Pagination
                      data={filteredBusinesses}
                      RenderComponent={BusinessComponent}
                      dataLimit={10}
                      userId={user.id}
                      navigation={navigation}
                    />
                  </>
                ) : (
                  <View style={{ width: "100%", marginTop: 250 }}>
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 24,
                        fontWeight: "200",
                        color: Color.white,
                        fontFamily: FontFamily.light,
                      }}
                    >
                      No results
                    </Text>
                  </View>
                )}
              </View>
            )
          ) : (
            <View style={{ width: "100%", marginTop: 250 }}>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: "200",
                  color: Color.white,
                  fontFamily: FontFamily.light,
                }}
              >
                You haven't chosen any location
              </Text>
            </View>
          )}
        </ScrollView>
        <FlashMessage position="top" />
      </SafeAreaView>
    </>
  );
}

const overlayStyles = StyleSheet.create({
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
    //flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    //opacity: 0.8, // adjust as needed
  },
});
