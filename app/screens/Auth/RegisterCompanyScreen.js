import React, { useState } from "react";
import Checkbox from "expo-checkbox";
import {
    View,
    TextInput,
    Text,
    Pressable,
    TouchableOpacity, Alert,
} from "react-native";
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
import { supabase } from "../../config/supabaseClient";

import { useTogglePasswordVisibility } from "../../hook/useTogglePasswordVisibility";

export default function RegisterCompanyScreen({ route, navigation }) {
  const { accountType } = route.params;
  const [isChecked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const handleRegistration = async () => {
    try {
      if (isChecked === false) {
        setError(
          "You have to accept the terms and policy if you want to sign up"
        );
      }
      if (password !== confirmPassword) {
        setError("Password and Password Confirmation should be equal");
      }
      if (isChecked === true && password === confirmPassword) {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              account_type: accountType,
            },
          },
        });
        if (error) {
          setError(error.message);
        } else {
          //console.log(data);
          navigation.replace("SuccessScreen");
        }
      }
    } catch (exception) {
        Alert.alert("Error", exception.toString(), [{text: "OK"}], {cancelable: false});
    }
  };
  return (
    <SafeAreaView style={styles.containerLogin}>
      <View style={styles.authContainer}>
        <TouchableOpacity
          style={{ position: "absolute", top: 24, left: 24 }}
          onPress={() => navigation.navigate("AccountType")}
        >
          <FontAwesome5 name="arrow-left" size={28} style={styles.arrowBack} />
        </TouchableOpacity>

        <View style={{ width: "100%", alignItems: "center" }}>
          <Text style={[styles.signInHeader, { width: 300, marginBottom: 32 }]}>
            Create an account
          </Text>
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
              placeholder="Confirm Password"
              placeholderTextColor="#656565"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox
              style={{ margin: 16, marginLeft: 0 }}
              value={isChecked}
              onValueChange={setChecked}
              color={isChecked ? Color.accentColor : undefined}
            />
            <Text
              style={{
                fontSize: 14,
                fontFamily: FontFamily.regular,
                color: Color.text,
              }}
            >
              I agree to terms and privacy policy
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRegistration}
            style={[styles.signInButton, { marginTop: 16 }]}
          >
            <Text style={styles.signInText}>Create</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.stationBar}>
          <View>
            <Text style={styles.type1}>Type</Text>
            <View style={[styles.registrationChild, styles.childLayout]} />
          </View>
          <View>
            <Text style={styles.type1}>Registration</Text>
            <View style={[styles.typeChild, styles.childLayout]} />
          </View>
          <View>
            <Text style={styles.type1}>Verify</Text>
            <View style={[styles.doneChild, styles.childLayout]} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
