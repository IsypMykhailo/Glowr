import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Pressable,
  TouchableOpacity,
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

import { useTogglePasswordVisibility } from "../../hook/useTogglePasswordVisibility";

export default function AccountType({ navigation }) {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  return (
    <SafeAreaView style={styles.containerLogin}>
      <View style={styles.authContainer}>
        <TouchableOpacity
          style={{ position: "absolute", top: 24, left: 24 }}
          onPress={() => navigation.navigate("Welcome")}
        >
          <FontAwesome5 name="arrow-left" size={28} style={styles.arrowBack} />
        </TouchableOpacity>

        <View style={{ width: "100%", alignItems: "center" }}>
          <Text style={[styles.signInHeader, { width: 270, marginBottom: 64 }]}>
            Choose the type of the account
          </Text>
          {/*<Text style={styles.welcomeBackHeader}>Welcome back!</Text>*/}
        </View>
        <View style={{ width: "100%", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.signIn}
            onPress={() =>
              navigation.navigate("RegisterScreen", { accountType: "customer" })
            }
          >
            <Text style={styles.signInText}>Customer</Text>
          </TouchableOpacity>
          <Text
            style={{
              color: Color.text,
              fontSize: 16,
              fontFamily: FontFamily.regular,
              marginTop: 12,
            }}
          >
            or
          </Text>
          <TouchableOpacity
            style={styles.signUp}
            onPress={() =>
              navigation.navigate("RegisterCompanyScreen", {
                accountType: "company",
              })
            }
          >
            <Text style={styles.signUpText}>Company</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.stationBar}>
          <View>
            <Text style={styles.type1}>Type</Text>
            <View style={[styles.typeChild, styles.childLayout]} />
          </View>
          <View>
            <Text style={styles.type1}>Registration</Text>
            <View style={[styles.registrationChild, styles.childLayout]} />
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
