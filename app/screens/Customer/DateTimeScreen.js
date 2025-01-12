import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
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
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useTheme } from "../../ThemeContext";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import Checkbox from "expo-checkbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import Calendar from "../../components/Calendar";

export default function DateTimeScreen({ route, navigation }) {
  const { business, rating, worker, user_id, checkedServices } = route.params;
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;

  const [selectedDate, setSelectedDate] = React.useState(null);
  const [availableTimes, setAvailableTimes] = React.useState([]);
  const [checkedTimes, setCheckedTimes] = React.useState({});
  const [selectedTime, setSelectedTime] = React.useState(null);

  const isSameDate = (selectedDate, availabilityDate, timezoneOffset) => {
    const adjustedSelectedDate = new Date(
      selectedDate.getTime() + timezoneOffset * 60 * 60 * 1000
    );

    return (
      adjustedSelectedDate.getFullYear() === availabilityDate.getFullYear() &&
      adjustedSelectedDate.getMonth() === availabilityDate.getMonth() &&
      adjustedSelectedDate.getDate() === availabilityDate.getDate()
    );
  };

  React.useEffect(() => {
    if (!selectedDate) {
      // If there's no selected date, clear available times.
      setAvailableTimes([]);
      return;
    }
    const filteredTimes = worker.workerAvailability.filter((availability) => {
      // Extract timezone from timetz format e.g., 13:30:00-07
      const timezoneMatch = availability.start_time.match(/([+-][0-9]{2}):?/);
      const timezoneOffset = timezoneMatch ? parseInt(timezoneMatch[1], 10) : 0; // Convert it to a number

      // Since your date is a separate field and is adjusted according to the timezone in start_time
      const availabilityDate = new Date(availability.date);

      return isSameDate(selectedDate, availabilityDate, timezoneOffset);
    });

    setAvailableTimes(filteredTimes);

    const initialState = filteredTimes.reduce((acc, time) => {
      acc[time.id] = false; // assuming each service has an id
      return acc;
    }, {});

    setCheckedTimes(initialState);
  }, [selectedDate, worker.workerAvailability]);

  const handleTimeSelect = (selectedId, time) => {
    const newCheckedTimes = { ...checkedTimes }; // Start with the current state
    // Reset all to false
    Object.keys(newCheckedTimes).forEach((key) => {
      newCheckedTimes[key] = false;
    });
    newCheckedTimes[selectedId] = true; // Set the selected one to true
    setCheckedTimes(newCheckedTimes);
    setSelectedTime(time);
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

  const isAnyTimeSelected = () => {
    return Object.values(checkedTimes).some((value) => value);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={{ width: "100%", height: "100%" }}>
        <TouchableOpacity
          style={{ position: "absolute", top: 24, left: 24, zIndex: 999 }}
          onPress={() =>
            navigation.navigate("ChooseService", {
              business: business,
              rating: rating,
              worker: worker,
              user_id: user_id,
            })
          }
        >
          <FontAwesome5 name="arrow-left" size={26} style={styles.arrowBack} />
        </TouchableOpacity>
        <View
          style={{
            width: "100%",
            alignItems: "center",
            marginTop: 16,
            height: "100%",
          }}
        >
          <View
            style={{
              paddingHorizontal: 32,
              width: "100%",
              marginTop: 16,
              height: "100%",
            }}
          >
            <View
              style={{
                marginTop: 16,
                width: "100%",
                alignItems: "center",
                height: "100%",
              }}
            >
              <ScrollView style={{ width: "100%" }}>
                <View style={{ width: "100%", marginTop: 32 }}>
                  <Text
                    style={{
                      color: Color.text,
                      fontSize: 21,
                      fontFamily: FontFamily.medium,
                      marginBottom: 16,
                      textAlign: "left",
                    }}
                  >
                    Date
                  </Text>
                  <View style={{ width: "100%", alignItems: "center" }}>
                    {/*<RNDateTimePicker
                    display="calendar"
                    value={new Date()}
                    minimumDate={new Date()}
                  />*/}
                    <Calendar
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                    />
                  </View>
                </View>

                <Text
                  style={{
                    color: Color.text,
                    fontSize: 21,
                    fontFamily: FontFamily.medium,
                    marginBottom: 16,
                    textAlign: "left",
                    marginTop: 16,
                  }}
                >
                  Time
                </Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    width: "100%",
                    marginBottom: 32,
                  }}
                >
                  {availableTimes.map((availability, index) => (
                    <View
                      key={index}
                      style={{
                        height: 40,
                        borderWidth: 0,
                        borderRadius: 16,
                        backgroundColor: Color.darkslategray_100,
                        padding: 8,
                        marginRight: 8,
                        marginBottom: 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,

                        // Android elevation
                        elevation: 5,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          flex: 0,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                        onPress={() =>
                          handleTimeSelect(availability.id, availability)
                        }
                      >
                        <Checkbox
                          style={
                            checkedTimes[availability.id]
                              ? {
                                  marginRight: 16,
                                  width: 24,
                                  height: 24,
                                  borderWidth: 4,
                                  borderRadius: "50%",
                                }
                              : {
                                  marginRight: 16,
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                }
                          }
                          value={checkedTimes[availability.id]}
                          onValueChange={() => {
                            // Toggle the checked state for the service
                            handleTimeSelect(availability.id, availability);
                          }}
                          color={
                            checkedTimes[availability.id]
                              ? Color.accentColor
                              : undefined
                          }
                        />
                        <Text
                          style={{
                            color: Color.text,
                            fontSize: 14,
                            fontFamily: FontFamily.regular,
                          }}
                        >
                          {get12HoursFormat(availability.start_time)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <View style={{ width: "100%", alignItems: "center" }}>
                  <TouchableOpacity
                    style={{
                      width: 120,
                      height: 32,
                      backgroundColor: Color.accentColor,
                      borderWidth: 0,
                      borderRadius: 8,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,

                      // Android elevation
                      elevation: 5,
                      justifyContent: "center",
                      opacity: isAnyTimeSelected() ? 1 : 0.5,
                    }}
                    disabled={!isAnyTimeSelected()}
                    onPress={() =>
                      navigation.navigate("Checkout", {
                        business: business,
                        rating: rating,
                        worker: worker,
                        user_id: user_id,
                        checkedServices: checkedServices,
                        selectedTime: selectedTime,
                      })
                    }
                  >
                    <Text
                      style={{
                        color: Color.text,
                        fontSize: 16,
                        fontFamily: FontFamily.medium,
                        textAlign: "center",
                      }}
                    >
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
