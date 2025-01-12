import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  RefreshControl, Alert,
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
import { Stack, useRouter } from "expo-router";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import { useTheme } from "../../ThemeContext";
import { supabase } from "../../config/supabaseClient";
import CompanyDataModal from "../../components/CompanyDataModal";
/*import { LogLevel, OneSignal } from "react-native-onesignal";

// Remove this method to stop OneSignal Debugging
OneSignal.Debug.setLogLevel(LogLevel.Verbose);

// OneSignal Initialization
OneSignal.initialize("5fc328cb-c117-4225-b370-bf1004d83cb0");

// requestPermission will show the native iOS or Android notification permission prompt.
// We recommend removing the following code and instead using an In-App Message to prompt for notification permission
OneSignal.Notifications.requestPermission(true);

// Method for listening for notification clicks
OneSignal.Notifications.addEventListener("click", (event) => {
  console.log("OneSignal: notification clicked:", event);
});*/

export default function ProfileCompanyScreen({ route, navigation }) {
  const { editedBusiness = {} } = route.params || {};
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [modalVisible, setModalVisible] = React.useState(false);
  const [user, setUser] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [notificationsLoading, setNotificationsLoading] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [hasBusinesses, setHasBusinesses] = React.useState(false);
  const [business, setBusiness] = React.useState(null);

  if (route.params && route.params.updatedUser) {
    user.email = route.params.updatedUser.email;
    user.user_metadata.full_name = route.params.updatedUser.name;
  }

  React.useEffect(() => {
    setLoading(true);
    getCurrentUser();
    setLoading(false);
  }, []);
  React.useEffect(() => {
    setNotificationsLoading(true);
    fetchNotifications();
    if (Object.keys(editedBusiness).length === 0) {
      checkBusinesses();
    } else {
      setBusiness(editedBusiness);
    }
    setNotificationsLoading(false);
  }, [user]);

  const checkBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select(
          "*, addresses(*, cities(id, name), states(id, name), countries(id, name)), business_hours(*)"
        )
        .eq("user_id", user.id);

      // Check if there is an error first
      if (error) {
        console.log("Error fetching businesses:", error);
        return;
      }

      // Check if data exists and if it has length 0
      if (data && data.length === 0) {
        setModalVisible(true);
      } else if (data) {
        setBusiness(data[0]);
      }
    } catch (error) {
      // Catch any other errors and log them
      Alert.alert("Error", error.message, [{text: "OK"}], {cancelable: false});
    }
  };

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchNotifications = async () => {
    let { data: notifications, error } = await supabase
      .from("notifications")
      .select("*, appointments(*,workers(*,businesses(*)))")
      .eq("appointments.client_id", user.id);

    // Check if notifications is null or undefined; if so, set it to an empty array
    if (!notifications) {
      notifications = [];
    }

    setNotifications(notifications);
  };

  const formatDateToMonthDay = (date, start_time) => {
    // Combine the date string with the start_time
    const combinedDateTime = `${date}T${start_time.slice(0, 8)}Z`;

    // The offset (e.g., -07) indicates the time is 7 hours behind UTC.
    // Convert the offset to milliseconds to adjust our date.
    const offsetHours = parseInt(start_time.slice(-3), 10);
    const offsetMilliseconds = offsetHours * 60 * 60 * 1000;

    // Create the JavaScript Date object
    const dateObj = new Date(
      new Date(combinedDateTime).getTime() - offsetMilliseconds
    );

    // Format the date object in the desired output
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      timeZone: "UTC", // we've already adjusted for the timezone, so we'll display in UTC
    }).format(dateObj);

    return formattedDate;
  };

  const get12HoursFormat = (time) => {
    // Assuming the input is a string in the format "HH:mm"
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);
    let period = "AM";

    if (hours === 0) {
      hours = 12;
    } else if (hours === 12) {
      period = "PM";
    } else if (hours > 12) {
      hours -= 12;
      period = "PM";
    }

    return `${hours}:${minutes} ${period}`;
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setNotificationsLoading(true);
    fetchNotifications();
    setNotificationsLoading(false);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Color.text}
          style={{ alignContent: "center", top: 250 }}
        />
      ) : (
        user.user_metadata != undefined &&
        business && (
          <>
            {modalVisible && (
              <CompanyDataModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                user_id={user.id}
              />
            )}
            <View style={{ alignItems: "center", width: "100%" }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderWidth: 0,
                  borderRadius: "100%",
                  backgroundColor: Color.darkslategray_100,
                  overflow: "hidden",
                  marginTop: 64,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,

                  // Android elevation
                  elevation: 5,
                }}
              >
                <ImageBackground
                  resizeMode="cover"
                  source={{ uri: business.image[0] }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                ></ImageBackground>
              </View>
              <Text
                style={{
                  fontSize: 21,
                  fontFamily: FontFamily.medium,
                  color: Color.text,
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
                {business.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: FontFamily.light,
                  color: Color.text,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {business.type}
              </Text>
              <View
                style={{
                  width: "100%",
                  paddingHorizontal: 32,
                  marginTop: 90,
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: Color.darkslategray_100,
                    padding: 8,
                    borderWidth: 0,
                    borderRadius: 8,
                    flex: 0,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,

                    // Android elevation
                    elevation: 5,
                  }}
                  onPress={() =>
                    navigation.navigate("ProfileInfo", {
                      business: business,
                      user_id: user.id,
                    })
                  }
                >
                  <Ionicons
                    name="person-outline"
                    size={21}
                    color={Color.text}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: FontFamily.regular,
                      color: Color.text,
                      textAlign: "center",
                      marginLeft: 10,
                    }}
                  >
                    Edit profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: Color.darkslategray_100,
                    padding: 8,
                    borderWidth: 0,
                    borderRadius: 8,
                    flex: 0,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,

                    // Android elevation
                    elevation: 5,
                    marginTop: 16,
                  }}
                >
                  <Ionicons
                    name="settings-outline"
                    size={21}
                    color={Color.text}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: FontFamily.regular,
                      color: Color.text,
                      textAlign: "center",
                      marginLeft: 10,
                    }}
                  >
                    Settings
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => signOutUser()}
                style={{
                  width: 232,
                  paddingVertical: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 0,
                  borderRadius: 8,
                  backgroundColor: Color.darkslategray_100,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,

                  // Android elevation
                  elevation: 5,
                  marginTop: 105,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: FontFamily.medium,
                    color: "#F45E5E",
                    textAlign: "center",
                  }}
                >
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )
      )}
    </SafeAreaView>
  );
}
