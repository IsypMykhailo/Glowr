import React, { useState } from "react";
import {
    View,
    TextInput,
    Text,
    Pressable,
    TouchableOpacity, Alert,
} from "react-native";
import { supabase } from "../../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../ThemeContext";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import {
  ColorLight,
  ColorDark,
  FontSize,
  FontFamily,
  Padding,
  Border,
} from "../../../GlobalStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import { useTogglePasswordVisibility } from "../../hook/useTogglePasswordVisibility";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;

  const handleLogin = async () => {
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        setError(error.message);
      }
    } catch (exception) {
        Alert.alert("Error", exception.message, [{text: "OK"}], {cancelable: false});
    }
  };

  return (
    <SafeAreaView style={styles.containerLogin}>
      <View style={styles.authContainer}>
        <TouchableOpacity
          style={{ position: "absolute", top: 24, left: 24 }}
          onPress={() => navigation.navigate("Welcome")}
        >
          <FontAwesome5 name="arrow-left" size={28} style={styles.arrowBack} />
        </TouchableOpacity>
        <View>
          <Text style={styles.signInHeader}>Sign in</Text>
          {/*<Text style={styles.welcomeBackHeader}>Welcome back!</Text>*/}
        </View>
        <View style={{ width: "100%", alignItems: "center" }}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#656565"
            value={email}
            onChangeText={setEmail}
            style={styles.formInput}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: 296,
              backgroundColor: "white",
              height: 40,
              borderWidth: 0,
              borderRadius: 8,
              margin: 8,
              shadowColor: "rgba(0, 0, 0, 0.15)",
              shadowRadius: 6,
              elevation: 6,
              shadowOpacity: 1,
              shadowOffset: {
                width: 0,
                height: 2,
              },
            }}
          >
            <TextInput
              placeholder="Password"
              placeholderTextColor="#656565"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={passwordVisibility}
              style={styles.formInputPassword}
            />
            <Pressable onPress={handlePasswordVisibility}>
              <MaterialCommunityIcons
                name={rightIcon}
                size={22}
                color={Color.accentColor}
              />
            </Pressable>
          </View>

          <TouchableOpacity onPress={handleLogin} style={styles.signInButton}>
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <Text
              style={{
                color: Color.accentColor,
                fontSize: 16,
                fontFamily: FontFamily.regular,
                textDecorationLine: "underline",
                marginTop: 16,
              }}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
