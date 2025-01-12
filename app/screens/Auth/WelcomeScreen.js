import * as React from "react";
import {
    SafeAreaView,
} from "react-native-safe-area-context";
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
    Dimensions,
    StatusBar,
} from "react-native";
import {Image} from "expo-image";
import {
    ColorLight,
    ColorDark,
    FontSize,
    FontFamily,
    Padding,
    Border,
} from "../../../GlobalStyles";
import {useTheme} from "../../ThemeContext";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import Blending from "../../../assets/blending.svg";
/*import EllipseTop from "../../assets/ellipse_top.svg";
import EllipseBottom from "../../assets/ellipse_bottom.svg";*/

const {width, height} = Dimensions.get("window");

const Welcome = ({navigation}) => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    const styles = theme === "light" ? stylesLight : stylesDark;
    return (
        <>
        <View style={{flex:1, height:"100%", width:"100%", pointerEvents:'box-none', position:'absolute', zIndex:2, backgroundColor:Color.background}}>
            <Blending style={{position:'absolute'}} width={"100%"} height={"100%"} />
        </View>
            {/*<SafeAreaView edges={["top"]} style={[styles.container]}>*/}

            <View
                style={[
                    {height: "100%", width: "100%", alignItems: "center", justifyContent:'center', zIndex:3},
                ]}
            >

                {/*<View
                    style={{
                        width: 184,
                        height: 184,
                        borderWidth: 0,
                        borderRadius: "100%",
                        overflow: "hidden",
                    }}
                >
                    <ImageBackground
                        resizeMode="cover"
                        source={require("../../../assets/logo.png")}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    ></ImageBackground>
                </View>*/}
                <Text style={{fontSize:48, fontFamily:FontFamily.bold, color:Color.text}}>Welcome to</Text>
                <Text style={{fontSize:63, fontFamily:FontFamily.logo, color: Color.accentColor, letterSpacing: 5.04}}>Glowr</Text>
                <View style={{width:184}}>
                <Text style={[styles.textDescription, {marginBottom:32, fontFamily: FontFamily.regular}]}>
                    Book, Beautify, Benefit - All with Glowr
                </Text>
                </View>
                <TouchableOpacity
                    style={styles.signIn}
                    onPress={() => navigation.navigate("LoginScreen")}
                >
                    <Text style={styles.signInText}>Sign in</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.signUp}
                    onPress={() => navigation.navigate("AccountType")}
                >
                    <Text style={styles.signUpText}> Sign up</Text>
                </TouchableOpacity>
                {/*<View
                    style={{
                        height: "16%",
                        width: "100%",
                        backgroundColor: ColorDark.accentColor,
                        bottom: 0,
                        position: "absolute",
                        borderWidth: 0,
                        borderTopLeftRadius: 150,
                        borderTopRightRadius: 150,
                    }}
                ></View>*/}
            </View>
            {/*}</SafeAreaView>*/}
        </>
    );
};
export default Welcome;
