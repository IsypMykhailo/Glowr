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

export default function ChooseServiceScreen({ route, navigation }) {
  const { business, rating, worker, user_id } = route.params;
  //console.log(business);
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const initialState = worker.services.reduce((acc, service) => {
    acc[service.id] = null; // initialize with null
    return acc;
  }, {});

  const [checkedServices, setCheckedServices] = React.useState(initialState);

  // This useEffect was added to handle potential changes in worker.services prop
  React.useEffect(() => {
    setCheckedServices(initialState);
  }, [worker.services]);

  const isAnyServiceChecked = () => {
    return Object.values(checkedServices).some((value) => value);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={{ width: "100%", height: "100%" }}>
        <TouchableOpacity
          style={{ position: "absolute", top: 24, left: 24, zIndex: 999 }}
          onPress={() =>
            navigation.navigate("Details", {
              business: business,
              rating: rating,
              user_id: user_id,
            })
          }
        >
          <FontAwesome5 name="arrow-left" size={26} style={styles.arrowBack} />
        </TouchableOpacity>
        <View
          style={{
            width: "100%",
            marginTop: 24,
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 24,
              fontFamily: FontFamily.bold,
              color: Color.text,
            }}
          >
            {worker.name}
          </Text>
        </View>
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
              width: 184,
              height: 184,
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ paddingHorizontal: 32, width: "100%", marginTop: 16 }}
          >
            <Text
              style={{
                fontSize: 21,
                fontFamily: FontFamily.medium,
                color: Color.text,
                letterSpacing: 0.4,
              }}
            >
              Choose the service
            </Text>
            <View style={{ marginBottom: 64 }}>
              {worker.services.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setCheckedServices((prev) => ({
                      ...prev,
                      [service.id]: prev[service.id] ? null : service, // if already stored, revert to null. Else, store the service
                    }));
                  }}
                >
                  <View
                    style={{
                      flex: 0,
                      flexDirection: "row",
                      backgroundColor: Color.darkslategray_100,
                      marginTop: 16,
                      borderWidth: 0,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,

                      // Android elevation
                      elevation: 5,
                    }}
                  >
                    <Checkbox
                      style={
                        checkedServices[service.id]
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
                      value={checkedServices[service.id]}
                      onValueChange={() => {
                        // Toggle the checked state for the service
                        setCheckedServices((prev) => ({
                          ...prev,
                          [service.id]: prev[service.id] ? null : service, // if already stored, revert to null. Else, store the service
                        }));
                      }}
                      color={
                        checkedServices[service.id]
                          ? Color.accentColor
                          : undefined
                      }
                    />
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
                </TouchableOpacity>
              ))}
            </View>
            <View
              style={{
                width: "100%",
                alignItems: "center",
              }}
            >
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
                  opacity: isAnyServiceChecked() ? 1 : 0.5,
                }}
                disabled={!isAnyServiceChecked()}
                onPress={() => {
                  const selectedServices =
                    Object.values(checkedServices).filter(Boolean);
                  navigation.navigate("DateTime", {
                    business: business,
                    rating: rating,
                    worker: worker,
                    user_id: user_id,
                    checkedServices: selectedServices,
                  });
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
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
