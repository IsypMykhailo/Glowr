import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
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
import { Stack, useRouter } from "expo-router";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import { useTheme } from "../../ThemeContext";
import { supabase } from "../../config/supabaseClient";
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

export default function ProfileScreen({ route, navigation }) {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [user, setUser] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [notificationsLoading, setNotificationsLoading] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);

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
    setNotificationsLoading(false);
  }, [user]);

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
        user !== {} &&
        user.user_metadata != undefined && (
          <>
            <View>
              <Text
                style={{
                  fontSize: 21,
                  fontFamily: FontFamily.medium,
                  color: Color.text,
                  textAlign: "center",
                  marginTop: 48,
                }}
              >
                {user.user_metadata.full_name}
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
                {user.email}
              </Text>
              <TouchableOpacity
                style={{ marginTop: 48 }}
                onPress={() =>
                  navigation.navigate("ManageAccount", { user: user })
                }
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: FontFamily.regular,
                    color: Color.text,
                    textAlign: "center",
                    textDecorationLine: "underline",
                  }}
                >
                  Manage account
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                marginTop: 32,
                backgroundColor: Color.darkslategray_100,
                borderWidth: 0,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                height: "100%",
                width: "100%",
                alignItems: "center",
                paddingTop: 16,
                paddingHorizontal: 32,
              }}
            >
              <View
                style={{ flex: 0, flexDirection: "row", alignItems: "center" }}
              >
                <Ionicons name="notifications" size={24} color={Color.text} />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: FontFamily.medium,
                    color: Color.text,
                    marginLeft: 4,
                  }}
                >
                  Notifications
                </Text>
              </View>
              <View style={{ height: "100%" }}>
                {notificationsLoading ? (
                  <ActivityIndicator
                    size="large"
                    color={Color.text}
                    style={{ alignContent: "center", top: 250 }}
                  />
                ) : notifications.length > 0 ? (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                          onRefresh();
                        }}
                      />
                    }
                  >
                    {notifications.map((notification) => (
                      <View
                        style={{
                          background: Color.background,
                          padding: 8,
                          borderWidth: 0,
                          borderRadius: 8,
                          flex: 0,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            width: 53,
                            height: 53,
                            borderWidth: 0,
                            borderRadius: "100%",
                            backgroundColor: Color.darkslategray_100,
                            overflow: "hidden",
                            marginRight: 4,
                          }}
                        >
                          <ImageBackground
                            resizeMode="cover"
                            source={{
                              uri: notification.appointments.workers.businesses
                                .image,
                            }}
                            style={{
                              width: "100%",
                              height: "100%",
                            }}
                          ></ImageBackground>
                        </View>
                        <View>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: FontFamily.regular,
                              color: Color.text,
                            }}
                          >
                            {notification.appointments.workers.businesses.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              fontFamily: FontFamily.light,
                              color: Color.text,
                            }}
                          >
                            You have a booking here on{" "}
                            {formatDateToMonthDay(
                              notification.appointments.date,
                              notification.appointments.start_time
                            )}
                            ,{" "}
                            {get12HoursFormat(
                              notification.appointments.start_time
                            )}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={{ height: "100%", marginTop: 200 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: FontFamily.regular,
                        color: Color.text,
                        textAlign: "center",
                      }}
                    >
                      You don't have any notifications
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )
      )}
    </SafeAreaView>
  );
}
