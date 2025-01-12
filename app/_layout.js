import * as React from "react";
import "intl";
import "intl/locale-data/jsonp/en";

import {StyleSheet, View, Text, Alert} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {useFonts} from "expo-font";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";
import Ionicons from "@expo/vector-icons/Ionicons";
import {ColorDark, ColorLight, FontFamily} from "../GlobalStyles";
import {ThemeProvider, useTheme} from "./ThemeContext";
import {supabase} from "./config/supabaseClient";
import {Session} from "@supabase/supabase-js";

import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {initStripe} from "@stripe/stripe-react-native";

// Customer Screens
import HomeScreen from "./screens/Customer/HomeScreen";
import Welcome from "./screens/Auth/WelcomeScreen";
import BookedScreen from "./screens/Customer/BookedScreen";
import ProfileScreen from "./screens/Customer/ProfileScreen";
import SavedScreen from "./screens/Customer/SavedScreen";
import RedeemScreen from "./screens/Customer/RedeemScreen";
import DetailsScreen from "./screens/Customer/DetailsScreen";
import ChooseServiceScreen from "./screens/Customer/ChooseServiceScreen";
import DateTimeScreen from "./screens/Customer/DateTimeScreen";
import CheckoutScreen from "./screens/Customer/CheckoutScreen";
import BookingDetails from "./screens/Customer/BookingDetails";
import ManageAccountScreen from "./screens/Customer/ManageAccountScreen";

// Company Screens
import ProfileCompanyScreen from "./screens/Company/ProfileScreen";
import AppointmentsScreen from "./screens/Company/AppointmentsScreen";
import EmployeesScreen from "./screens/Company/EmployeesScreen";
import ProfileInfoScreen from "./screens/Company/ProfileInfoScreen";
import EditProfileScreen from "./screens/Company/EditProfileScreen";
import AddEmployeeScreen from "./screens/Company/AddEmployeeScreen";
import ManageEmployee from "./screens/Company/ManageEmployeeScreen";
import WorkerAppointmentsScreen from "./screens/Company/WorkerAppointments";

// Auth Screens
import LoginScreen from "./screens/Auth/LoginScreen";
import AccountType from "./screens/Auth/AccountType";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import SuccessScreen from "./screens/Auth/SuccessScreen";
import ChangePassword from "./screens/Auth/ChangePassword";
import RegisterCompanyScreen from "./screens/Auth/RegisterCompanyScreen";


const homeName = "Home";
const bookedName = "Booked";
const profileName = "Profile";
const savedName = "Saved";
const redeemName = "Rewards";

const Tab = createBottomTabNavigator();

initStripe({
    publishableKey: 'pk_test_51OEmaiGwybuQiwu1P2ZnsbVJewmMEMapKH0HhnyHZXYcEPkDZosoT0csJQDnqnMvFXny9P2434FhKFRTqxLbRuSu008VmF1B5E',
});

const CustomerContent = () => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;

    return (
        <NavigationContainer independent={true}
                             theme={{ colors: { background: Color.background } }}>
            <Tab.Navigator
                initialRouteName={homeName}
                screenOptions={({route}) => ({
                    tabBarIcon: ({focused, color, size}) => {
                        let iconName;
                        let rn = route.name;

                        if (rn === homeName) {
                            iconName = focused ? "home" : "home-outline";
                        } else if (rn === bookedName) {
                            iconName = focused ? "calendar" : "calendar-outline";
                        } else if (rn === profileName) {
                            iconName = focused ? "person" : "person-outline";
                        } else if (rn === savedName) {
                            iconName = focused ? "heart" : "heart-outline";
                        } else if (rn === redeemName) {
                            iconName = focused ? "gift" : "gift-outline";
                        }

                        return <Ionicons name={iconName} size={size} color={color}/>;
                    },
                    tabBarActiveTintColor: Color.accentColor,
                    tabBarInactiveTintColor: Color.text,
                    tabBarStyle: {
                        backgroundColor: Color.tabBar,
                        borderTopWidth: 0,
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: -4, // Negative for the shadow to appear on top
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,

                        // Android shadow properties
                        elevation: 4,
                    },
                    tabBarLabelStyle: {
                        fontFamily: FontFamily.regular,
                    },
                    headerShown: false,
                })}
                cardStyle={{backgroundColor: Color.background}}
            >
                <Tab.Screen name={homeName} component={HomeStackScreen}/>
                <Tab.Screen name={bookedName} component={BookingStackScreen}/>
                <Tab.Screen name={savedName} component={SavedStackScreen}/>
                <Tab.Screen name={redeemName} component={RedeemScreen}/>
                <Tab.Screen name={profileName} component={ProfileStackScreen}/>
            </Tab.Navigator>
        </NavigationContainer>
    );
};

const CompanyContent = () => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;

    return (
        <NavigationContainer independent={true}
                             theme={{ colors: { background: Color.background } }}>
            <Tab.Navigator
                initialRouteName={profileName}
                screenOptions={({route}) => ({
                    tabBarIcon: ({focused, color, size}) => {
                        let iconName;
                        let rn = route.name;

                        if (rn === profileName) {
                            iconName = focused ? "person" : "person-outline";
                        } else if (rn === "Appointments") {
                            iconName = focused ? "calendar" : "calendar-outline";
                        } else if (rn === "Employees") {
                            iconName = focused ? "people" : "people-outline";
                        }

                        return <Ionicons name={iconName} size={size} color={color}/>;
                    },
                    tabBarActiveTintColor: Color.accentColor,
                    tabBarInactiveTintColor: Color.text,
                    tabBarStyle: {
                        backgroundColor: Color.tabBar,
                        borderTopWidth: 0,
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: -4, // Negative for the shadow to appear on top
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,

                        // Android shadow properties
                        elevation: 4,
                    },
                    tabBarLabelStyle: {
                        fontFamily: FontFamily.regular,
                    },
                    headerShown: false,
                })}
                cardStyle={{backgroundColor: Color.background}}
            >
                <Tab.Screen name={"Appointments"} component={AppointmentsStackScreen}/>
                <Tab.Screen name={"Employees"} component={EmployeeStackScreen}/>
                <Tab.Screen name={profileName} component={ProfileCompanyStackScreen}/>
            </Tab.Navigator>
        </NavigationContainer>
    );
};

const Stack = createNativeStackNavigator();
const AuthContent = () => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    return (
        <NavigationContainer independent={true}
                             theme={{ colors: { background: Color.background } }}>
            <Stack.Navigator
                screenOptions={() => ({
                    headerShown: false,
                })}
                cardStyle={{backgroundColor: Color.background}}
            >
                <Stack.Screen name="Welcome" component={Welcome}/>
                <Stack.Screen name="LoginScreen" component={LoginScreen}/>
                <Stack.Screen name="RegisterScreen" component={RegisterScreen}/>
                <Stack.Screen
                    name="RegisterCompanyScreen"
                    component={RegisterCompanyScreen}
                />
                <Stack.Screen name="AccountType" component={AccountType}/>
                <Stack.Screen name="SuccessScreen" component={SuccessScreen}/>
                <Stack.Screen name="ChangePassword" component={ChangePassword}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const HomeStack = createNativeStackNavigator();

const HomeStackScreen = () => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    return (
        <HomeStack.Navigator
            screenOptions={() => ({
                headerShown: false,
            })}
            cardStyle={{backgroundColor: Color.background}}
        >
            <HomeStack.Screen name="Home1" component={HomeScreen}/>
            <HomeStack.Screen name="Details" component={DetailsScreen}/>
            <HomeStack.Screen name="ChooseService" component={ChooseServiceScreen}/>
            <HomeStack.Screen name="DateTime" component={DateTimeScreen}/>
            <HomeStack.Screen name="Checkout" component={CheckoutScreen}/>
        </HomeStack.Navigator>
    );
};

const SavedStack = createNativeStackNavigator();

const SavedStackScreen = () => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    return (
        <SavedStack.Navigator
            screenOptions={() => ({
                headerShown: false,
            })}
            cardStyle={{backgroundColor: Color.background}}
        >
            <SavedStack.Screen name="Home1" component={SavedScreen}/>
            <SavedStack.Screen name="Details" component={DetailsScreen}/>
            <SavedStack.Screen name="ChooseService" component={ChooseServiceScreen}/>
            <SavedStack.Screen name="DateTime" component={DateTimeScreen}/>
            <SavedStack.Screen name="Checkout" component={CheckoutScreen}/>
        </SavedStack.Navigator>
    );
};

const BookingStack = createNativeStackNavigator();

const BookingStackScreen = () => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    return (
        <BookingStack.Navigator
            screenOptions={() => ({
                headerShown: false,
            })}
            cardStyle={{backgroundColor: Color.background}}
        >
            <BookingStack.Screen name="Booked1" component={BookedScreen}/>
            <BookingStack.Screen name="BookingDetails" component={BookingDetails}/>
        </BookingStack.Navigator>
    );
};

const ProfileStack = createNativeStackNavigator();

const ProfileStackScreen = () => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    return (
        <ProfileStack.Navigator
            screenOptions={() => ({
                headerShown: false,
            })}
            cardStyle={{backgroundColor: Color.background}}
        >
            <ProfileStack.Screen name="Profile1" component={ProfileScreen}/>
            <ProfileStack.Screen
                name="ManageAccount"
                component={ManageAccountScreen}
            />
        </ProfileStack.Navigator>
    );
};

const ProfileCompanyStack = createNativeStackNavigator();

const ProfileCompanyStackScreen = () => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    return (
        <ProfileCompanyStack.Navigator
            screenOptions={() => ({
                headerShown: false,
            })}
            cardStyle={{backgroundColor: Color.background}}
        >
            <ProfileCompanyStack.Screen
                name="Profile1"
                component={ProfileCompanyScreen}
            />
            <ProfileCompanyStack.Screen
                name="ProfileInfo"
                component={ProfileInfoScreen}
            />
            <ProfileCompanyStack.Screen
                name="EditProfile"
                component={EditProfileScreen}
            />
        </ProfileCompanyStack.Navigator>
    );
};

const EmployeeStack = createNativeStackNavigator();

const EmployeeStackScreen = () => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    return (
        <EmployeeStack.Navigator
            screenOptions={() => ({
                headerShown: false,
            })}
            cardStyle={{backgroundColor: Color.background}}
        >
            <EmployeeStack.Screen name="Employees1" component={EmployeesScreen}/>
            <EmployeeStack.Screen name="AddEmployee" component={AddEmployeeScreen}/>
            <EmployeeStack.Screen name="ManageEmployee" component={ManageEmployee}/>
        </EmployeeStack.Navigator>
    );
};

const AppointmentsStack = createNativeStackNavigator();

const AppointmentsStackScreen = () => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    return (
        <AppointmentsStack.Navigator
            screenOptions={() => ({
                headerShown: false,
            })}
            cardStyle={{backgroundColor: Color.background}}
        >
            <AppointmentsStack.Screen
                name="Appointments1"
                component={AppointmentsScreen}
            />
            <AppointmentsStack.Screen name={"WorkerAppointments"} component={WorkerAppointmentsScreen}/>
        </AppointmentsStack.Navigator>
    );
}

SplashScreen.preventAutoHideAsync();
export default function App() {
    const [appIsReady, setAppIsReady] = React.useState(false);
    const [session, setSession] = React.useState(null);
    const [accountType, setAccountType] = React.useState(null);

    React.useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);

            if (session) {
                fetchUserMetadata();
            }
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);

            if (session) {
                fetchUserMetadata();
            }
        });
        setAppIsReady(true)
    }, []);
    React.useEffect(() => {
        if (appIsReady) {
            SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    const fetchUserMetadata = async () => {
        const {
            data: {user},
        } = await supabase.auth.getUser();

        if (error) {
            Alert.alert("Error", error.message, [{text: "OK"}], {cancelable: false});
            return;
        }

        if (user && user.user_metadata) {
            setAccountType(user.user_metadata.account_type);
        }
    };


    const [fontsLoaded, error] = useFonts({
        "Ubuntu-Medium": require("../assets/fonts/Ubuntu-Medium.ttf"),
        "Ubuntu-Light": require("../assets/fonts/Ubuntu-Light.ttf"),
        "Ubuntu-Bold": require("../assets/fonts/Ubuntu-Bold.ttf"),
        "Ubuntu-BoldItalic": require("../assets/fonts/Ubuntu-BoldItalic.ttf"),
        "Ubuntu-Italic": require("../assets/fonts/Ubuntu-Italic.ttf"),
        "Ubuntu-LightItalic": require("../assets/fonts/Ubuntu-LightItalic.ttf"),
        "Ubuntu-MediumItalic": require("../assets/fonts/Ubuntu-MediumItalic.ttf"),
        "Ubuntu-Regular": require("../assets/fonts/Ubuntu-Regular.ttf"),
        "Harlow-Solid-Italic": require("../assets/fonts/HARLOWSI.ttf"),
    });

    if (!fontsLoaded && !error) {
        return null;
    }
    if (!appIsReady) {
        return null;
    }

    return (
        <ThemeProvider>
            {session && session.user ? (
                accountType === "customer" ? (
                    <CustomerContent/>
                ) : (
                    <CompanyContent/>
                )
            ) : (
                <AuthContent/>
            )}
            <Toast/>
        </ThemeProvider>
    );
};
