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

const ServicesModal = ({ show, services, onToggleCancel }) => {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  
  return (
    <Modal transparent={true} animationType="fade" visible={show}>
      <BlurView style={overlayStyles.absolute} intensity={2} tint="dark">
        <View style={overlayStyles.overlay}>
          <View style={styles.servicesContainer}>
            <View style={{}}>
              {services.map((service, index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    backgroundColor: Color.background,
                    marginTop: 16,
                    borderWidth: 0,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: Color.text,
                      height: 8,
                      width: 8,
                      borderRadius: "50%",
                      marginRight: 16,
                    }}
                  ></View>
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: FontFamily.regular,
                        color: Color.text,
                      }}
                    >
                      {service.name}
                    </Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: "column" }}>
                    <Text
                      style={{
                        color: Color.text,
                        textAlign: "right",
                        fontSize: 14,
                        fontFamily: FontFamily.regular,
                      }}
                    >
                      {service.duration} min
                    </Text>
                    <Text
                      style={{
                        color: Color.text,
                        textAlign: "right",
                        fontSize: 14,
                        fontFamily: FontFamily.regular,
                      }}
                    >
                      ${service.price}
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
                  backgroundColor: Color.accentColor,
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
    justifyContent: "center",
    //opacity: 0.8, // adjust as needed
  },
});

export default ServicesModal;
