import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Modal } from "react-native";
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

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ScheduleModal = ({ show, schedule, onToggleCancel }) => {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;

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
        <View style={overlayStyles.overlay}>
          <View style={styles.overlay}>
            <View style={{ borderWidth: 1, borderColor: Color.text }}>
              {daysOfWeek.map((day, index) => (
                <View key={index} style={{ flex: 1, flexDirection: "row" }}>
                  <View
                    style={{
                      width: "50%",
                      borderWidth: 1,
                      borderColor: Color.text,
                      padding: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: Color.text,
                        fontSize: 14,
                        fontFamily: FontFamily.regular,
                        textAlign: "center",
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "50%",
                      borderWidth: 1,
                      borderColor: Color.text,
                      padding: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: Color.text,
                        fontSize: 14,
                        fontFamily: FontFamily.regular,
                        textAlign: "center",
                      }}
                    >
                      {schedule[`${index + 1}`].open === "none"
                        ? "Closed"
                        : get12HoursFormat(schedule[`${index + 1}`].open)}{" "}
                      {schedule[`${index + 1}`].open === "none" ? "" : "-"}{" "}
                      {schedule[`${index + 1}`].close === "none"
                        ? ""
                        : get12HoursFormat(schedule[`${index + 1}`].close)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={{ width: "100%", alignItems: "center" }}>
              <TouchableOpacity
                style={{
                  padding: 12,
                  paddingHorizontal: 64,
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
            </View>
          </View>
        </View>
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

export default ScheduleModal;
