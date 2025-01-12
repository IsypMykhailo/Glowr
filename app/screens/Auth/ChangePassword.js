import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
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
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import { useTheme } from "../../ThemeContext";
import { supabase } from "../../config/supabaseClient";
import FlashMessage, { showMessage } from "react-native-flash-message";
import Toast from "react-native-toast-message";

export default function ChangePassword({ navigation }) {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [email, setEmail] = React.useState("");

  const sendEmailLink = async () => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://example.com/account/update-password",
    });
    Toast.show({
      type: "success",
      text1: "The email link has been sent!",
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={{ width: "100%", height: "100%", alignItems: "center" }}>
        <TouchableOpacity
          style={{ position: "absolute", top: 24, left: 24, zIndex: 999 }}
          onPress={() =>
            navigation.navigate("Profile1", { updatedUser: { email, name } })
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
        ></View>
        <View
          style={{
            width: "100%",
            marginTop: 32,
            height: "100%",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: "100%",
              marginBottom: 32,
              borderBottomWidth: 2,
              borderBottomColor: Color.darkslategray_100,
              paddingBottom: 32,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: FontFamily.medium,
                color: Color.text,
                marginBottom: 12,
              }}
            >
              Enter your email:
            </Text>
            <TextInput
              style={{
                fontSize: 16,
                fontFamily: FontFamily.regular,
                color: "#000",
                backgroundColor: Color.white,
                paddingHorizontal: 8,
                borderWidth: 0,
                borderRadius: 8,
                paddingVertical: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 4,

                // Android elevation
                elevation: 5,
              }}
              onChangeText={setEmail}
              value={email}
            />
            <TouchableOpacity
              style={{
                marginLeft: 64,
                marginRight: 64,
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
              }}
              onPress={sendEmailLink}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontFamily: FontFamily.medium,
                  color: Color.white,
                }}
              >
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
