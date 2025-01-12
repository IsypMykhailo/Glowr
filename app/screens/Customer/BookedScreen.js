import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity, Alert,
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
import { useTheme } from "../../ThemeContext";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import { Stack, useRouter } from "expo-router";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { supabase } from "../../config/supabaseClient";

export default function BookedScreen({ navigation }) {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [appointments, setAppointments] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [groupedAppointments, setGroupedAppointments] = React.useState({});
  const [averageRating, setAverageRating] = React.useState("-" +
      "");

  //const [isLiked, setIsLiked] = React.useState(false);
  //const [averageRating, setAverageRating] = React.useState(null);
  const fetchAverageRating = async (business) => {
    if (business) {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("rating")
          .eq("business_id", business.id);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const totalRatings = data.reduce((acc, curr) => acc + curr.rating, 0);
          const average = (totalRatings / data.length).toFixed(1);
          setAverageRating(average);
          business.rating = average;
        } else {
          //setAverageRating("0");
          business.rating = 0;
        }
      } catch (error) {
        Alert.alert("Error fetching average rating", error.message, [{text: "OK"}], {cancelable: false});
      }
    }
  };

  React.useEffect(() => {
    setLoading(true);
    getCurrentUser();
  }, []);
  React.useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  React.useEffect(() => {
    const updateLikes = async () => {
      if (appointments.length > 0 && appointments[0].workers) {
        const updatedAppointments = [...appointments];

        for (let appointment of appointments) {
          if (appointment.workers && appointment.workers.businesses) {
            await fetchAverageRating(appointment.workers.businesses);
            await checkIfLiked(
              appointment.workers.businesses,
              appointment,
              updatedAppointments
            );
          }
        }

        // Update appointments state with batched changes
        setAppointments(updatedAppointments);
      }
      setLoading(false);
    };

    updateLikes();
  }, [appointments, user]);

  const checkIfLiked = async (business, appointment, updatedAppointments) => {
    if (business && user) {
      const { data } = await supabase
        .from("saved")
        .select("*")
        .eq("saved_id", business.id)
        .eq("user_id", user.id);

      const appointmentIndex = appointments.indexOf(appointment);

      if (data && data.length > 0) {
        if (appointmentIndex !== -1) {
          updatedAppointments[
            appointmentIndex
          ].workers.businesses.isLiked = true;
        }
      } else {
        if (appointmentIndex !== -1) {
          updatedAppointments[
            appointmentIndex
          ].workers.businesses.isLiked = false;
        }
      }
    }
  };

  const toggleLike = async (business, appointment) => {
    const updatedAppointments = [...appointments]; // Create a shallow copy
    const appointmentIndex = appointments.indexOf(appointment);

    if (business.isLiked) {
      // Delete from saved table
      await supabase
        .from("saved")
        .delete()
        .eq("saved_id", business.id)
        .eq("user_id", user.id);

      if (appointmentIndex !== -1) {
        updatedAppointments[
          appointmentIndex
        ].workers.businesses.isLiked = false;
      }
    } else {
      // Add to saved table
      await supabase
        .from("saved")
        .insert([{ saved_id: business.id, user_id: user.id }]);

      if (appointmentIndex !== -1) {
        updatedAppointments[appointmentIndex].workers.businesses.isLiked = true;
      }
    }

    // Update the appointments state
    setAppointments(updatedAppointments);
  };

  const fetchBookings = async () => {
    if (user) {
      let {data: clients, errorClient} = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
      if (errorClient) {
        Alert.alert("Error Client Read", errorClient, [{text: "OK"}], {cancelable: false});
      }
      if(clients.length > 0) {
        const {data: appointments, error} = await supabase
            .from("appointments")
            .select(
                `*, workers(*, businesses(*,addresses(*, cities(name), states(state_code, country_code)))), services(*)`
            )
            .eq("client_id", clients[0].id);
        if (appointments) {
          setAppointments(appointments);
          const groupedData = groupAppointmentsByDateAndBusiness(appointments);
          setGroupedAppointments(groupedData);
        }
      }
    }
  };

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  function groupAppointmentsByDateAndBusiness(appointments) {
    return appointments.reduce((acc, appointment) => {
      const date = appointment.date;
      const businessId = appointment.workers.businesses.id;

      if (!acc[date]) {
        acc[date] = {};
      }

      if (!acc[date][businessId]) {
        acc[date][businessId] = [];
      }

      acc[date][businessId].push(appointment);
      return acc;
    }, {});
  }

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

  const formatDateNoOffset = (date) => {
    const dateObj = new Date(date);
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      timeZone: "UTC", // we've already adjusted for the timezone, so we'll display in UTC
    }).format(dateObj);

    return formattedDate;
  }

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
    setLoading(true);
    fetchBookings().then(() => {setLoading(false);});
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View
        style={{
          paddingLeft: 24,
          marginTop: 32,
          borderBottomWidth: 2,
          borderBottomColor: Color.darkslategray_100,
          paddingBottom: 32,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontFamily: FontFamily.bold,
            color: Color.text,
          }}
        >
          Your bookings
        </Text>
      </View>
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
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Color.text}
            style={{ alignContent: "center", top: 250 }}
          />
        ) : (
          <View style={{ paddingBottom: 32 }}>
            {Object.keys(groupedAppointments).map((date) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeading}>
                  {/*formatDateToMonthDay(
                    date,
                    groupedAppointments[date][
                      Object.keys(groupedAppointments[date])[0]
                    ][0].start_time
                  )*/} {formatDateNoOffset(date)}
                </Text>
                {Object.keys(groupedAppointments[date]).map((businessId) => {
                  const businessAppointments =
                    groupedAppointments[date][businessId];
                  const firstAppointment = businessAppointments[0];
                  const lastAppointment =
                    businessAppointments[businessAppointments.length - 1];
                  const business = firstAppointment.workers.businesses;
                  const worker = firstAppointment.workers;
                  const totalSum = businessAppointments.reduce(
                    (acc, appointment) => acc + (appointment.price_final || 0),
                    0
                  );

                  return (
                    <View style={styles.frameParentBooking} key={businessId}>
                      <View style={styles.frameGroup}>
                        <ImageBackground
                          style={styles.frameImage}
                          resizeMode="cover"
                          source={{ uri: business.image[0] }}
                        >
                          <View
                            style={[
                              styles.frameContainer,
                              styles.frameContainerFlexBox,
                            ]}
                          >
                            <View style={styles.bookWrapperShadowBox1}>
                              <Image
                                style={styles.frameChild}
                                source={require("../../../assets/polygon-1.png")}
                              />
                              <Text style={[styles.text, styles.textTypo]}>
                                {averageRating}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={styles.likeButton}
                              onPress={() =>
                                toggleLike(business, firstAppointment)
                              }
                            >
                              <Ionicons
                                name={
                                  business.isLiked ? "heart" : "heart-outline"
                                }
                                size={24}
                                style={styles.iconHeart}
                              />
                            </TouchableOpacity>
                          </View>
                          <View
                            style={[
                              styles.megaharoshWrapper,
                              styles.navBarUpperSpaceBlock,
                            ]}
                          >
                            <Text style={[styles.megaharosh, styles.textTypo]}>
                              {business.name}
                            </Text>
                          </View>
                        </ImageBackground>
                      </View>
                      <View style={styles.frameViewBooking}>
                        <View style={{ alignItems: "center" }}>
                          <View
                            style={{
                              width: 48,
                              height: 48,
                              borderWidth: 0,
                              borderRadius: "100%",
                              backgroundColor: Color.darkslategray_100,
                              overflow: "hidden",
                            }}
                          >
                            <ImageBackground
                              resizeMode="cover"
                              source={{ uri: worker.image }}
                              style={{
                                width: "100%",
                                height: "100%",
                              }}
                            ></ImageBackground>
                          </View>
                          <Text
                            style={{
                              color: Color.text,
                              fontSize: 12,
                              fontFamily: FontFamily.regular,
                            }}
                          >
                            {firstAppointment.workers.name}
                          </Text>
                        </View>
                        <View style={{ flex: 0, flexDirection: "column" }}>
                          <View>
                            <Text
                              style={{
                                fontSize: 16,
                                fontFamily: FontFamily.regular,
                                color: Color.text,
                                textAlign: "center",
                              }}
                            >
                              {get12HoursFormat(firstAppointment.start_time)} -{" "}
                              {get12HoursFormat(lastAppointment.end_time)}
                            </Text>
                          </View>
                          <View style={{ marginTop: 4 }}>
                            <Text
                              style={{
                                color: Color.text,
                                fontSize: 16,
                                fontFamily: FontFamily.regular,
                              }}
                            >
                              ${totalSum}
                            </Text>
                          </View>
                        </View>
                        <View>
                          <TouchableOpacity
                            style={[
                              styles.bookWrapper,
                              styles.bookWrapperShadowBox,
                            ]}
                            onPress={() =>
                              navigation.navigate("BookingDetails", {
                                businessAppointments: businessAppointments,
                                totalSum: totalSum,
                                user_id:user.id,
                              })
                            }
                          >
                            <Text style={styles.book}>Details</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
