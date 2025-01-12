import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SuccessScreen({ navigation }) {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  return (
    <SafeAreaView style={styles.containerLogin}>
      <View style={styles.authContainer}>
        <View style={{ width: "100%", alignItems: "center" }}>
          <Image
            source={require("../../../assets/CheckIcon.png")}
            contentFit="cover"
            style={{
              overflow: "hidden",
              width: 112,
              height: 112,
              marginBottom: 32,
            }}
          />
          <Text style={[styles.signInHeader, { width: 300 }]}>
            Your account has been created
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: Color.text,
              fontSize: 16,
              fontFamily: FontFamily.regular,
              width: 250,
            }}
          >
            Thank you for joining Bookstyle!{"\n"}Please, open your email to see
            the verification letter.
          </Text>
        </View>
        <View style={{ width: "100%", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.signIn}
            onPress={() => navigation.replace("Welcome")}
          >
            <Text style={styles.signInText}>Done</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.stationBar}>
          <View>
            <Text style={styles.type1}>Type</Text>
            <View style={[styles.registrationChild, styles.childLayout]} />
          </View>
          <View>
            <Text style={styles.type1}>Registration</Text>
            <View style={[styles.doneChild, styles.childLayout]} />
          </View>
          <View>
            <Text style={styles.type1}>Verify</Text>
            <View style={[styles.typeChild, styles.childLayout]} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
