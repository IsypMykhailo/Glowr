import * as React from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated, Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import {
  ColorLight,
  ColorDark,
  FontSize,
  FontFamily,
  Padding,
  Border,
} from "../../GlobalStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TextInput } from "react-native-gesture-handler";
import { useTheme } from "../ThemeContext";
import stylesLight from "../components/stylesLight";
import stylesDark from "../components/stylesDark";
import {env} from "../../env.development"
// Import any other required components or libraries

const FadeInView = (props) => {
  const [fadeAnim] = React.useState(new Animated.Value(0)); // Initial value for opacity: 0

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true, // Using native driver for better performance.
    }).start();
  }, []);

  return (
    <Animated.View // Special animated View
      style={{
        ...props.style,
        opacity: fadeAnim, // Bind opacity to animated value
      }}
    >
      {props.children}
    </Animated.View>
  );
};

export default function LocationModal({
  visible,
  onRequestClose,
  recentAddresses,
  setRecentAddresses,
  onSetLocation,
  onGetCurrentLocation,
  onSearchLocation,
}) {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const handleSearchPress = async () => {
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search?key=${env.accessToken}&q=${searchTerm}&format=json&accept-language=en`
      );
      const json = await response.json();
      setSearchResults(json);
    } catch (error) {
        Alert.alert("Error", error.message, [{text: "OK"}], {cancelable: false});
    }
  };
  const [uniqueResults, setUniqueResults] = React.useState([]);
  React.useEffect(() => {
    if (searchResults.length > 0) {
      //console.log(searchResults);
      let uniqueNames = [];

      let _uniqueResults = searchResults.filter((result) => {
        if (uniqueNames.includes(result.display_name)) {
          return false; // Skip this item
        } else {
          uniqueNames.push(result.display_name);
          return true; // Keep this item
        }
      });
      setUniqueResults(_uniqueResults);
    }
  }, [searchResults]);
  return (
    <>
      <FadeInView style={locationStyles.absolute}></FadeInView>
      <Modal
        visible={visible}
        onRequestClose={onRequestClose}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.locationOverlay}>
          <View style={styles.locationHeader}>
            <View style={styles.searchInput}>
              <Ionicons
                style={styles.searchImage}
                name="search"
                size={18}
                color="grey"
              />
              <TextInput
                style={styles.locationSearch}
                //placeholder="Search"
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                }}
              ></TextInput>
              <TouchableOpacity
                style={[
                  styles.searchFilter,
                  {
                    backgroundColor: Color.accentColor,
                    borderWidth: 0,
                    borderTopRightRadius: 32,
                    borderBottomRightRadius: 32,
                    right: 0,
                    height: 40,
                    justifyContent: "center",
                    width: 70,
                  },
                ]}
                onPress={handleSearchPress}
              >
                <Text
                  style={{
                    color: Color.text,
                    fontSize: 14,
                    fontFamily: FontFamily.medium,
                    textAlign: "center",
                  }}
                >
                  Search
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 16, width: "100%" }}>
              {uniqueResults.slice(0, 5).map((address, index) => (
                <TouchableOpacity
                  style={
                    index === 0
                      ? {
                          height: 52,
                          borderTopWidth: 1,
                          borderBottomWidth: 1,
                          borderColor: Color.darkslategray_100,
                          paddingTop: 10,
                          paddingBottom: 10,
                          flex: 0,
                          flexDirection: "row",
                          alignItems: "center",
                        }
                      : {
                          height: 52,
                          borderBottomWidth: 1,
                          borderColor: Color.darkslategray_100,
                          paddingTop: 10,
                          paddingBottom: 10,
                          flex: 0,
                          flexDirection: "row",
                          alignItems: "center",
                        }
                  }
                  key={address.place_id}
                  onPress={() => onSearchLocation(address.display_name)}
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
                      fontSize: 16,
                      fontFamily: FontFamily.regular,
                      width: "90%",
                      marginLeft: 8,
                    }}
                  >
                    {address.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View>
              <TouchableOpacity
                style={styles.currentLocation}
                color="white"
                onPress={onGetCurrentLocation}
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
                    textDecorationLine: "underline",
                  }}
                >
                  Use current location
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 28,
                fontFamily: FontFamily.bold,
                fontWeight: "bold",
                color: Color.text,
              }}
            >
              Recent
            </Text>
            <View style={{ marginTop: 24 }}>
              {recentAddresses.map((address, index) => (
                <TouchableOpacity
                  style={{
                    flex: 0,
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                  color="white"
                  onPress={() => onSetLocation(index)}
                  key={index}
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
                    {address}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ width: "100%", alignItems: "center", marginTop: 8 }}>
            <TouchableOpacity
              style={{
                width: 124,
                height: 32,
                borderWidth: 0,
                borderRadius: 8,
                backgroundColor: Color.darkslategray_100,
                justifyContent: "center",
                padding: 8,
              }}
              onPress={onRequestClose}
            >
              <Text
                style={{
                  color: Color.text,
                  fontSize: 16,
                  fontFamily: FontFamily.medium,
                  textAlign: "center",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const locationStyles = StyleSheet.create({
  absolute: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    zIndex: 2,
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
