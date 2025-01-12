import * as React from "react";
import {
  StyleSheet,
  View,
  Button,
  Text,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Animated,
  ScrollView,
  Modal,
  Dimensions,
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
import Checkbox from "expo-checkbox";
import Slider from "@react-native-community/slider";
import Ionicons from "@expo/vector-icons/Ionicons";

const FilterModal = ({
  show,
  onToggleShow,
  onToggleCancel,
  isBarbershopChecked,
  setBarbershopChecked,
  isTattooChecked,
  setTattooChecked,
  isGymChecked,
  setGymChecked,
  isOpenNowChecked,
  setOpenNowChecked,
  isRatingChecked,
  setRatingChecked,
  sliderValue,
  setSliderValue,
  sliderWidth,
  setSliderWidth,
  resetFilters,
}) => {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const THUMB_WIDTH = 32;
  const MIN_VALUE = 5;
  const MAX_VALUE = 300;
  const getTextPosition = () => {
    const usableWidth = 320 - THUMB_WIDTH;
    const positionRatio =
      (sliderValue - MIN_VALUE) / (MAX_VALUE + 6 - MIN_VALUE);
    return positionRatio * usableWidth + THUMB_WIDTH / 2 - 64 / 2;
  };
  return (
    <Modal transparent={true} animationType="fade" visible={show}>
      <BlurView style={overlayStyles.absolute} intensity={2} tint="dark">
        <View style={overlayStyles.overlay}>
          <View style={styles.overlay}>
            <View
              style={{
                position: "absolute",
                left: 24,
                top: 24,
                zIndex: 3,
                width: 32,
                height: 32,
              }}
            >
              <TouchableOpacity
                style={{ width: "100%", height: "100%" }}
                onPress={onToggleCancel}
              >
                <Ionicons name="close" size={22} color={Color.text} />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                color: Color.white,
                fontFamily: FontFamily.medium,
                fontSize: 18,
                textAlign: "center",
              }}
            >
              What are you looking for ?
            </Text>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                width: "100%",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  marginTop: 32,
                  marginRight: 132,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                  onPress={() => {
                    setBarbershopChecked(!isBarbershopChecked);
                  }}
                >
                  <Checkbox
                    style={
                      isBarbershopChecked
                        ? {
                            marginRight: 8,
                            width: 26,
                            height: 26,
                            borderWidth: 4,
                            borderRadius: "50%",
                          }
                        : {
                            marginRight: 8,
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                          }
                    }
                    value={isBarbershopChecked}
                    onValueChange={setBarbershopChecked}
                    color={isBarbershopChecked ? Color.accentColor : undefined}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: FontFamily.regular,
                      color: Color.text,
                    }}
                  >
                    Barbershop
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                  onPress={() => {
                    setTattooChecked(!isTattooChecked);
                  }}
                >
                  <Checkbox
                    style={
                      isTattooChecked
                        ? {
                            marginRight: 8,
                            width: 26,
                            height: 26,
                            borderWidth: 4,
                            borderRadius: "50%",
                          }
                        : {
                            marginRight: 8,
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                          }
                    }
                    value={isTattooChecked}
                    onValueChange={setTattooChecked}
                    color={isTattooChecked ? Color.accentColor : undefined}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: FontFamily.regular,
                      color: Color.text,
                    }}
                  >
                    Tattoo Salon
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                  onPress={() => {
                    setGymChecked(!isGymChecked);
                  }}
                >
                  <Checkbox
                    style={
                      isGymChecked
                        ? {
                            marginRight: 8,
                            width: 26,
                            height: 26,
                            borderWidth: 4,
                            borderRadius: "50%",
                          }
                        : {
                            marginRight: 8,
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                          }
                    }
                    value={isGymChecked}
                    onValueChange={setGymChecked}
                    color={isGymChecked ? Color.accentColor : undefined}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: FontFamily.regular,
                      color: Color.text,
                    }}
                  >
                    Fitness Center
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, flexDirection: "column", marginTop: 24 }}>
                <TouchableOpacity
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                  onPress={() => {
                    setOpenNowChecked(!isOpenNowChecked);
                  }}
                >
                  <Checkbox
                    style={
                      isOpenNowChecked
                        ? {
                            marginBottom: 8,
                            width: 26,
                            height: 26,
                            borderWidth: 4,
                          }
                        : { marginBottom: 8, width: 26, height: 26 }
                    }
                    value={isOpenNowChecked}
                    onValueChange={setOpenNowChecked}
                    color={isOpenNowChecked ? Color.accentColor : undefined}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: FontFamily.medium,
                      color: Color.text,
                    }}
                  >
                    Open now
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                  onPress={() => {
                    setRatingChecked(!isRatingChecked);
                  }}
                >
                  <Checkbox
                    style={
                      isRatingChecked
                        ? {
                            marginBottom: 8,
                            width: 26,
                            height: 26,
                            borderWidth: 4,
                          }
                        : { marginBottom: 8, width: 26, height: 26 }
                    }
                    value={isRatingChecked}
                    onValueChange={setRatingChecked}
                    color={isRatingChecked ? Color.accentColor : undefined}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: FontFamily.medium,
                      color: Color.text,
                    }}
                  >
                    Sort by rating
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text
              style={{
                color: Color.text,
                fontSize: 18,
                fontFamily: FontFamily.medium,
                marginTop: 32,
                marginBottom: 32,
              }}
            >
              Choose the distance
            </Text>
            <View style={{ width: "100%", alignItems: "center" }}>
              <View style={{ flex: 1, alignItems: "stretch" }}>
                <View
                  style={{
                    position: "absolute",
                    top: -16,
                    left: getTextPosition() + 14,
                  }}
                >
                  <Text
                    style={{
                      color: Color.text,
                      fontSize: 14,
                      fontFamily: FontFamily.regular,
                      width: 64,
                    }}
                  >
                    {sliderValue} km
                  </Text>
                </View>
                <Slider
                  maximumValue={300}
                  minimumValue={5}
                  minimumTrackTintColor={Color.accentColor}
                  maximumTrackTintColor="#000000"
                  thumbTintColor={Color.white}
                  step={1}
                  value={sliderValue}
                  onValueChange={(value) => setSliderValue(value)}
                  style={{ marginBottom: 32, flex: 1, width: 320 }}
                />
              </View>
            </View>
            <View
              style={{
                width: "100%",
                justifyContent: "space-between",
                flex: 1,
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={{
                  width: 124,
                  height: 32,
                  borderWidth: 0,
                  borderRadius: 8,

                  backgroundColor: Color.darkslategray_100,
                  justifyContent: "center",
                }}
                onPress={resetFilters}
              >
                <Text
                  style={{
                    color: Color.text,
                    fontSize: 16,
                    fontFamily: FontFamily.medium,
                    textAlign: "center",
                  }}
                >
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 124,
                  height: 32,
                  borderWidth: 0,
                  borderRadius: 8,

                  backgroundColor: Color.accentColor,
                  justifyContent: "center",
                }}
                onPress={onToggleShow}
              >
                <Text
                  style={{
                    color: Color.white,
                    fontSize: 16,
                    fontFamily: FontFamily.medium,
                    textAlign: "center",
                  }}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default FilterModal;

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
