import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
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

export default function ManageAccountScreen({ route, navigation }) {
  const { user } = route.params;
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [name, onChangeName] = React.useState(user.user_metadata.full_name);
  const [email, onChangeEmail] = React.useState(user.email);

  const showConfirmation = () => {
    Alert.alert(
      "Reset Password", // Title
      "Are you sure you want to reset password?", // Message
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            // Call the function to reset password here
            resetPassword();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const changeUserNameEmail = async () => {
    const { data, error } = await supabase.auth.updateUser({
      email: email,
      data: { full_name: name },
    });
    if (error) {
      console.log(error);
    }
    if (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred. Please try again later.",
      });
    } else {
      user.user_metadata.full_name = name;
      user.email = email;
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Changes applied!",
      });
    }
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
  };

  const resetPassword = async () => {
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: "http://example.com/account/update-password",
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
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 24,
              fontFamily: FontFamily.bold,
              color: Color.text,
            }}
          >
            Manage account
          </Text>
        </View>
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
                fontSize: 18,
                fontFamily: FontFamily.medium,
                color: Color.text,
                marginBottom: 32,
              }}
            >
              Personal information
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: FontFamily.medium,
                color: Color.text,
                marginBottom: 12,
              }}
            >
              Name
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
              onChangeText={onChangeName}
              value={name}
            />
            <Text
              style={{
                fontSize: 16,
                fontFamily: FontFamily.medium,
                color: Color.text,
                marginBottom: 12,
              }}
            >
              Email
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
                marginBottom: 32,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 4,

                // Android elevation
                elevation: 5,
              }}
              onChangeText={onChangeEmail}
              value={email}
            />
            <TouchableOpacity
              style={{
                backgroundColor: Color.accentColor,
                borderWidth: 0,
                borderRadius: 8,
                paddingVertical: 8,
                marginLeft: 64,
                marginRight: 64,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 4,

                // Android elevation
                elevation: 5,
              }}
              onPress={changeUserNameEmail}
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
          <View style={{ width: "100%" }}>
            <TouchableOpacity
              style={{
                marginLeft: 64,
                marginRight: 64,
                backgroundColor: Color.darkslategray_100,
                borderWidth: 0,
                borderRadius: 8,
                paddingVertical: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 4,

                // Android elevation
                elevation: 5,
              }}
              onPress={showConfirmation}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: FontFamily.medium,
                  color: Color.text,
                  textAlign: "center",
                }}
              >
                Reset password
              </Text>
            </TouchableOpacity>
          </View>
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
            position: "absolute",
            bottom: 128,
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
    </SafeAreaView>
  );
}
