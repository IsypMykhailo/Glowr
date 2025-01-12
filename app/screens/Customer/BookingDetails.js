import * as React from "react";
import {
    StyleSheet,
    View,
    Text,
    ImageBackground,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
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
import {Stack, useRouter} from "expo-router";
import {ScrollView, TextInput} from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
    ActionSheetProvider,
    connectActionSheet,
} from "@expo/react-native-action-sheet";
import BookingDetailsMenu from "../../components/BookingDetailsMenu";

const ConnectedComponent = connectActionSheet(BookingDetailsMenu);

export default function BookingDetails({route, navigation}) {
    const {totalSum, user_id} = route.params;
    const [businessAppointments, setBusinessAppointments] = React.useState(
        route.params.businessAppointments
    );
    const business = businessAppointments[0].workers.businesses;
    const worker = businessAppointments[0].workers;
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    const styles = theme === "light" ? stylesLight : stylesDark;

    const handleDelete = (deletedId) => {
        const updatedAppointments = businessAppointments.filter(
            (appointment) => appointment.id !== deletedId
        );
        setBusinessAppointments(updatedAppointments);
    };

    const formatDateToMonthDay = (date, start_time) => {
        // Combine the date string with the start_time
        const combinedDateTime = `${date}T${start_time.slice(0, 8)}Z`;

        // The offset (e.g., -07) indicates the time is 7 hours behind UTC.
        // Convert the offset to milliseconds to adjust our date.
        const offsetHours = parseInt(start_time.slice(-3), 10);
        const offsetMilliseconds = offsetHours * 60 * 60 * 1000;

        // Create the JavaScript Date object
        const dateObj = new Date(
            new Date(combinedDateTime).getTime() - offsetMilliseconds
        );

        // Format the date object in the desired output
        const formattedDate = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            timeZone: "UTC", // we've already adjusted for the timezone, so we'll display in UTC
        }).format(dateObj);

        return formattedDate;
    };

    const get12HoursFormat = (time) => {
        // Assuming the input is a string in the format "HH:mm"
        let [hours, minutes] = time.split(":");
        hours = parseInt(hours);
        let period = "AM";

        if (hours === 0) {
            hours = 12;
        } else if (hours === 12) {
            period = "PM";
        } else if (hours > 12) {
            hours -= 12;
            period = "PM";
        }

        return `${hours}:${minutes} ${period}`;
    };
    const formatDateNoOffset = (date) => {
        const dateObj = new Date(date);
        const formattedDate = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            timeZone: "UTC", // we've already adjusted for the timezone, so we'll display in UTC
        }).format(dateObj);

        return formattedDate;
    }
    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <View style={{width: "100%", height: "100%"}}>
                <TouchableOpacity
                    style={{position: "absolute", top: 24, left: 24, zIndex: 999}}
                    onPress={() => navigation.navigate("Booked1")}
                >
                    <FontAwesome5 name="arrow-left" size={26} style={styles.arrowBack}/>
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
                        {business.name}
                    </Text>
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{width: "100%", marginTop: 16, marginBottom:16}}>
                    <View style={{paddingHorizontal: 32, alignItems: "center", width: "100%", marginTop: 16}}>
                        <View style={{width: "100%", alignItems: "center"}}>
                            <View
                                style={[
                                    styles.location,
                                    {width: "100%", paddingTop: 0, marginBottom: 32},
                                ]}
                                color="white"
                            >
                                <Ionicons
                                    name="location-sharp"
                                    size={24}
                                    color={Color.text}
                                    style={styles.locationIcon}
                                />
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        color: Color.text,
                                        fontSize: 18,
                                        marginLeft: 8,
                                        fontFamily: FontFamily.regular,
                                    }}
                                >
                                    {business.addresses.line_1}, {business.addresses.cities.name},{" "}
                                    {business.addresses.states.state_code},{" "}
                                    {business.addresses.states.country_code}
                                </Text>
                            </View>
                                {businessAppointments.map((appointment) => (
                                    <View
                                        key={appointment.id}
                                        style={{
                                            flex: 0,
                                            flexDirection: "column",
                                            width: "100%",
                                            padding: 12,
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            borderRadius: 8,
                                            backgroundColor: Color.darkslategray_100,
                                            shadowColor: "#000",
                                            shadowOffset: {width: 0, height: 4},
                                            shadowOpacity: 0.1,
                                            shadowRadius: 4,

                                            // Android elevation
                                            elevation: 5,
                                            marginBottom: 16,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 0,
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                                marginBottom: 16,
                                            }}
                                        >
                                            <View>
                                                <Text
                                                    style={{
                                                        fontSize: 18,
                                                        fontFamily: FontFamily.medium,
                                                        color: Color.text,
                                                    }}
                                                >
                                                    {appointment.services.name}
                                                </Text>
                                            </View>
                                            <View>
                                                <ActionSheetProvider>
                                                    <ConnectedComponent
                                                        appointment={appointment}
                                                        business_id={business.id}
                                                        onDelete={handleDelete}
                                                        user_id={user_id}
                                                    />
                                                </ActionSheetProvider>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                flex: 0,
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                                marginBottom: 16,
                                            }}
                                        >
                                            <View>
                                                <Text
                                                    style={{
                                                        color: Color.text,
                                                        fontSize: 14,
                                                        fontFamily: FontFamily.regular,
                                                    }}
                                                >
                                                    Date and time
                                                </Text>
                                            </View>
                                            <View>
                                                <Text
                                                    style={{
                                                        color: Color.text,
                                                        fontSize: 14,
                                                        fontFamily: FontFamily.regular,
                                                    }}
                                                >
                                                    {formatDateNoOffset(
                                                        appointment.date
                                                    )}
                                                    , {get12HoursFormat(appointment.start_time)} -{" "}
                                                    {get12HoursFormat(appointment.end_time)}{" "}
                                                </Text>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                flex: 0,
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                                marginBottom: 16,
                                                borderBottomWidth: 2,
                                                borderBottomColor: "#404040",
                                                paddingBottom: 8,
                                            }}
                                        >
                                            <View>
                                                <Text
                                                    style={{
                                                        color: Color.text,
                                                        fontSize: 14,
                                                        fontFamily: FontFamily.regular,
                                                    }}
                                                >
                                                    {worker.role}
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    flex: 0,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 48,
                                                        height: 48,
                                                        borderWidth: 0,
                                                        borderRadius: "100%",
                                                        backgroundColor: Color.darkslategray_100,
                                                        overflow: "hidden",
                                                        marginRight: 8,
                                                    }}
                                                >
                                                    <ImageBackground
                                                        resizeMode="cover"
                                                        source={{uri: worker.image}}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                    ></ImageBackground>
                                                </View>
                                                <Text
                                                    style={{
                                                        color: Color.text,
                                                        fontSize: 14,
                                                        fontFamily: FontFamily.regular,
                                                    }}
                                                >
                                                    {worker.name}
                                                </Text>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                flex: 0,
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: Color.text,
                                                    fontSize: 14,
                                                    fontFamily: FontFamily.regular,
                                                }}
                                            >
                                                Price
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 21,
                                                    fontFamily: FontFamily.medium,
                                                    color: Color.text,
                                                }}
                                            >
                                                ${appointment.price_final}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            <View
                                style={{
                                    backgroundColor: Color.darkslategray_100,
                                    borderWidth: 0,
                                    borderRadius: 8,
                                    flex: 0,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                    padding: 10,
                                    marginTop: 32,
                                }}
                            >
                                <View>
                                    <Text
                                        style={{
                                            color: Color.text,
                                            fontSize: 16,
                                            fontFamily: FontFamily.regular,
                                        }}
                                    >
                                        Total:
                                    </Text>
                                </View>
                                <View>
                                    <Text
                                        style={{
                                            fontSize: 21,
                                            fontFamily: FontFamily.medium,
                                            color: Color.text,
                                            textAlign: "right",
                                        }}
                                    >
                                        ${totalSum}
                                    </Text>
                                    <Text
                                        style={{
                                            color: Color.text,
                                            fontSize: 14,
                                            fontFamily: FontFamily.regular,
                                            textAlign: "right",
                                            marginTop: 4,
                                        }}
                                    >
                                        {formatDateNoOffset(
                                            businessAppointments[0].date
                                        )}
                                        , {get12HoursFormat(businessAppointments[0].start_time)} -{" "}
                                        {get12HoursFormat(businessAppointments[businessAppointments.length - 1].end_time)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
