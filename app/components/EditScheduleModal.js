import * as React from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView, Alert,
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
import { useTheme } from "../ThemeContext";
import stylesLight from "../components/stylesLight";
import stylesDark from "../components/stylesDark";
import { supabase } from "../config/supabaseClient";
import * as Localization from "expo-localization";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EditScheduleModal = ({ show, business, onToggleCancel }) => {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  // prettier-ignore
  const [defaultSchedule, setDefaultSchedule] = React.useState({
   "1": { open: '', close: '' },
   "2": { open: '', close: '' },
   "3": { open: '', close: '' },
   "4": { open: '', close: '' },
   "5": { open: '', close: '' },
   "6": { open: '', close: '' },
   "7": { open: '', close: '' },
 });
  const [schedule, setSchedule] = React.useState(
    business.business_hours[0]?.schedule || defaultSchedule
  );

  const handleTimeChange = (dayIndex, timeType, fieldType, value) => {
    setSchedule((prevSchedule) => {
      let previousTime = prevSchedule[dayIndex][timeType] || "00:00";
      let [prevHours, prevMinutes] = previousTime.split(":");

      if (fieldType === "hours") {
        prevHours = value;
      } else if (fieldType === "minutes") {
        prevMinutes = value;
      }

      let newTime = `${prevHours}:${prevMinutes}`;

      return {
        ...prevSchedule,
        [dayIndex]: {
          ...prevSchedule[dayIndex],
          [timeType]: newTime,
        },
      };
    });
  };

  const handleSubmit = async () => {
    try {
      // Creating a new schedule object to ensure we don't mutate the state directly
      let newSchedule = { ...schedule };

      // Looping through each day in the schedule
      Object.keys(newSchedule).forEach((day) => {
        // If no time (or invalid time) is provided, set the time to "none"
        if (!isValidTime(newSchedule[day].open)) {
          newSchedule[day].open = "none";
        }
        if (!isValidTime(newSchedule[day].close)) {
          newSchedule[day].close = "none";
        }
      });
      if (business.business_hours.length > 0) {
        // Update existing business_hours
        const { data, error } = await supabase
          .from("business_hours")
          .update({ schedule: newSchedule })
          .eq("business_id", business.id);
        if (error) throw error;
        //console.log("Business Hours Updated:", data);
        onToggleCancel();
      } else {
        // Create new business_hours
        const { data, error } = await supabase
          .from("business_hours")
          .insert([{ business_id: business.id, schedule: newSchedule, timezone: Localization.getCalendars()[0].timeZone }])
        if (error) throw error;
        //console.log("Business Hours Created:", data);
        onToggleCancel();
      }
    } catch (error) {
        Alert.alert("Error", error.message, [{text: "OK"}], {cancelable: false});
    }
  };
  const isValidTime = (time) => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
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

  return (
    <Modal transparent={true} animationType="fade" visible={show}>
      <BlurView style={overlayStyles.absolute} intensity={2} tint="dark">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={overlayStyles.overlay}
        >
          <View
            style={{
              width: "85%",
              borderRadius: 16,
              position: "absolute",
              top: 64,
              backgroundColor: ColorDark.background,
              flex: 1,
              flexDirection: "column",
              padding: 24,
            }}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            >
              <View>
                {daysOfWeek.map((day, index) => (
                  <View
                    key={index}
                    style={{ flex: 1, flexDirection: "column" }}
                  >
                    <View
                      style={{
                        paddingTop: 16,
                        paddingBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: Color.text,
                          fontSize: 16,
                          fontFamily: FontFamily.medium,
                          textAlign: "center",
                        }}
                      >
                        {day}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 8,
                      }}
                    >
                      {["open", "close"].map((timeType) => (
                        <>
                          <TextInput
                            value={
                              schedule[`${index + 1}`][timeType]?.split(
                                ":"
                              )[0] || ""
                            }
                            onChangeText={(value) =>
                              handleTimeChange(
                                `${index + 1}`,
                                timeType,
                                "hours",
                                value
                              )
                            }
                            style={{
                              backgroundColor: ColorDark.white,
                              color: "black",
                              borderWidth: 0,
                              borderRadius: 8,
                              height: 30,
                              width: 50,
                              fontFamily: FontFamily.regular,
                              fontSize: 14,
                              paddingLeft: 16,
                              shadowColor: "rgba(0, 0, 0, 0.15)",
                              shadowRadius: 6,
                              elevation: 6,
                              shadowOpacity: 1,
                              shadowOffset: {
                                width: 0,
                                height: 2,
                              },
                            }}
                          />
                          <Text
                            style={{
                              color: Color.text,
                              fontSize: 24,
                              fontFamily: FontFamily.regular,
                              textAlign: "center",
                              marginHorizontal: 8,
                            }}
                          >
                            :
                          </Text>
                          <TextInput
                            value={
                              schedule[`${index + 1}`][timeType]?.split(
                                ":"
                              )[1] || ""
                            }
                            onChangeText={(value) =>
                              handleTimeChange(
                                `${index + 1}`,
                                timeType,
                                "minutes",
                                value
                              )
                            }
                            style={{
                              backgroundColor: ColorDark.white,
                              color: "black",
                              borderWidth: 0,
                              borderRadius: 8,
                              height: 30,
                              width: 50,
                              fontFamily: FontFamily.regular,
                              fontSize: 14,
                              paddingLeft: 16,
                              shadowColor: "rgba(0, 0, 0, 0.15)",
                              shadowRadius: 6,
                              elevation: 6,
                              shadowOpacity: 1,
                              shadowOffset: {
                                width: 0,
                                height: 2,
                              },
                            }}
                          />
                          {timeType === "open" && (
                            <Text
                              style={{
                                color: Color.text,
                                fontSize: 24,
                                fontFamily: FontFamily.regular,
                                textAlign: "center",
                                marginHorizontal: 8,
                              }}
                            >
                              -
                            </Text>
                          )}
                        </>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <TouchableOpacity
                  style={{
                    padding: 12,
                    paddingHorizontal: 32,
                    marginTop: 16,
                    backgroundColor: Color.darkslategray_100,
                    borderWidth: 0,
                    borderRadius: 8,
                  }}
                  onPress={onToggleCancel}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: FontFamily.medium,
                      color: Color.text,
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    padding: 12,
                    paddingHorizontal: 32,
                    marginTop: 16,
                    backgroundColor: Color.accentColor,
                    borderWidth: 0,
                    borderRadius: 8,
                    marginLeft: 8,
                  }}
                  onPress={handleSubmit}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: FontFamily.medium,
                      color: Color.white,
                    }}
                  >
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

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

export default EditScheduleModal;
