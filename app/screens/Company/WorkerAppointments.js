import * as React from "react";
import {
    StyleSheet,
    View,
    Button,
    Text,
    ImageBackground,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Dimensions,
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
    BoxShadow,
} from "../../../GlobalStyles";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import {Stack, useRouter} from "expo-router";
import {ScrollView, TextInput} from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {SelectList} from "react-native-dropdown-select-list";
import {useTheme} from "../../ThemeContext";
import {supabase} from "../../config/supabaseClient";
import {ActionSheetProvider, connectActionSheet} from "@expo/react-native-action-sheet";
import BookingDetailsMenu from "../../components/BookingDetailsMenu";
import Calendar from "../../components/Calendar";
import Checkbox from "expo-checkbox";
import {showMessage} from "react-native-flash-message";
import AddTimeModal from "../../components/AddTimeModal";
import ScheduleModal from "../../components/ScheduleModal";

const ConnectedComponent = connectActionSheet(BookingDetailsMenu);

export default function WorkerAppointmentsScreen({route, navigation}) {
    const {employee} = route.params;
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    const styles = theme === "light" ? stylesLight : stylesDark;
    let [appointmentsSelected, setAppointmentsSelected] = React.useState(true);
    let [appointments, setAppointments] = React.useState(employee.appointments);
    const [selectedDate, setSelectedDate] = React.useState(null);
    const [availableTimes, setAvailableTimes] = React.useState([]);
    const [selectedTime, setSelectedTime] = React.useState(null);
    const [showAddTimeModal, setShowAddTimeModal] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchEmployees = async () => {
        setRefreshing(true);
        let {data: workers, error} = await supabase
            .from("workers")
            .select(`*, appointments(*, services(*), clients(*) ), workerAvailability(*)`)
            .eq("id", employee.id);

        if (error) {
            Alert.alert("Error", error, [{text: "OK"}], {cancelable: false});
        }
        if (workers) {
            navigation.setParams({employee: workers[0]});
        }
        setRefreshing(false);
    };

    const isSameDate = (selectedDate, availabilityDate, timezoneOffset) => {
        const adjustedSelectedDate = new Date(
            selectedDate.getTime() + timezoneOffset * 60 * 60 * 1000
        );

        return (
            adjustedSelectedDate.getFullYear() === availabilityDate.getFullYear() &&
            adjustedSelectedDate.getMonth() === availabilityDate.getMonth() &&
            adjustedSelectedDate.getDate() === availabilityDate.getDate()
        );
    };

    React.useEffect(() => {
        if (!selectedDate) {
            // If there's no selected date, clear available times.
            setAvailableTimes([]);
            return;
        }
        const filteredTimes = employee.workerAvailability.filter((availability) => {
            // Extract timezone from timetz format e.g., 13:30:00-07
            const timezoneMatch = availability.start_time.match(/([+-][0-9]{2}):?/);
            const timezoneOffset = timezoneMatch ? parseInt(timezoneMatch[1], 10) : 0; // Convert it to a number

            // Since your date is a separate field and is adjusted according to the timezone in start_time
            const availabilityDate = new Date(availability.date);

            return isSameDate(selectedDate, availabilityDate, timezoneOffset);
        });

        setAvailableTimes(filteredTimes);

        const initialState = filteredTimes.reduce((acc, time) => {
            acc[time.id] = false; // assuming each service has an id
            return acc;
        }, {});

    }, [selectedDate, employee.workerAvailability]);


    const deleteTime = async (start_time, date) => {
        const {error} = await supabase
            .from('workerAvailability')
            .delete()
            .eq('worker_id', employee.id)
            .eq('start_time', start_time)
            .eq('date', date);
        if (error) {
            Alert.alert("Error", error, [{text: "OK"}], {cancelable: false});
        } else {
            Alert.alert("Success", "Time deleted successfully", [{text: "OK"}], {cancelable: false});
            fetchEmployees()
        }
    };


    const handleDelete = (deletedId) => {
        fetchEmployees()
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

    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            {showAddTimeModal && (
                <AddTimeModal
                    show={showAddTimeModal}
                    onToggleCancelSubmit={() => {
                        setShowAddTimeModal(!showAddTimeModal);
                        fetchEmployees();
                    }}
                    onToggleCancel={() => setShowAddTimeModal(!showAddTimeModal)}
                    date={selectedDate}
                    worker_id={employee.id}
                />
            )}
            {refreshing || employee === undefined ? (
                <ActivityIndicator
                    size="large"
                    color={Color.text}
                    style={{alignContent: "center", top: 250}}
                />
            ) : (
                <View style={{width: "100%", height: "100%"}}>
                    <TouchableOpacity
                        style={{position: "absolute", top: 24, left: 24, zIndex: 999}}
                        onPress={() =>
                            navigation.navigate("Appointments1")
                        }
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
                            {employee.name}
                        </Text>
                    </View>

                    <View style={[{
                        marginHorizontal: 32,
                        backgroundColor: Color.accentColor,
                        height: 36,
                        marginTop: 16,
                        borderWidth: 0,
                        borderRadius: 8,
                        padding: 4,
                        flex: 0,
                        flexDirection: "row",
                    }]}>
                        <TouchableOpacity
                            style={appointmentsSelected ? {
                                backgroundColor: Color.darkslategray_100,
                                borderWidth: 0,
                                borderRadius: 8,
                                width: "50%",
                                height: "100%",
                                justifyContent: "center",
                                alignItems: "center"
                            } : {
                                width: "50%",
                                height: "100%",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                            onPress={() => setAppointmentsSelected(true)}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontFamily: FontFamily.medium,
                                    color: Color.text,
                                    textAlign: 'center'
                                }}>
                                My appointments
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={appointmentsSelected ? {
                                width: "50%",
                                height: "100%",
                                justifyContent: "center",
                                alignItems: "center"
                            } : {
                                backgroundColor: Color.darkslategray_100,
                                borderWidth: 0,
                                borderRadius: 8,
                                width: "50%",
                                height: "100%",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                            onPress={() => setAppointmentsSelected(false)}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontFamily: FontFamily.medium,
                                    color: Color.text,
                                    textAlign: 'center'
                                }}>
                                Schedule
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            marginHorizontal: 32,
                            marginTop: 36,
                        }}
                    >
                        {appointmentsSelected ? (employee.appointments.map((appointment, index) => (
                            <ScrollView style={{width: "100%"}}>
                                <View
                                    style={[
                                        {
                                            flex: 0,
                                            flexDirection: "row",
                                            backgroundColor: Color.darkslategray_100,
                                            borderWidth: 0,
                                            borderRadius: 8,
                                            marginBottom: 16,
                                            //justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: 16,
                                        },
                                        BoxShadow,
                                    ]}
                                    key={index}
                                >
                                    <View
                                        style={{
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: FontFamily.medium,
                                                color: Color.text,
                                            }}
                                        >
                                            {appointment.clients.name}
                                        </Text>

                                    </View>
                                    <View
                                        style={{
                                            flex: 0,
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginLeft: "auto"
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: FontFamily.medium,
                                                color: Color.text,
                                                marginBottom: 8
                                            }}
                                        >
                                            {appointment.services.name}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: FontFamily.regular,
                                                color: Color.text,
                                            }}
                                        >
                                            {formatDateToMonthDay(appointment.date, appointment.start_time)}, {get12HoursFormat(appointment.start_time)}
                                        </Text>
                                    </View>
                                    <View>
                                        <ActionSheetProvider>
                                            <ConnectedComponent
                                                appointment={appointment}
                                                onDelete={handleDelete}
                                            />
                                        </ActionSheetProvider>
                                    </View>
                                </View>
                            </ScrollView>
                        ))) : (
                            <ScrollView style={{width: "100%"}}>
                                <View style={{width: "100%"}}>
                                    <Text
                                        style={{
                                            color: Color.text,
                                            fontSize: 21,
                                            fontFamily: FontFamily.medium,
                                            marginBottom: 16,
                                            textAlign: "left",
                                        }}
                                    >
                                        Date
                                    </Text>
                                    <View style={{width: "100%", alignItems: "center"}}>
                                        <Calendar
                                            selectedDate={selectedDate}
                                            setSelectedDate={setSelectedDate}
                                        />
                                    </View>
                                </View>

                                <Text
                                    style={{
                                        color: Color.text,
                                        fontSize: 21,
                                        fontFamily: FontFamily.medium,
                                        marginBottom: 16,
                                        textAlign: "left",
                                        marginTop: 16,
                                    }}
                                >
                                    Time
                                </Text>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        width: "100%",
                                        marginBottom: 32,
                                        justifyContent: 'center',
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {availableTimes.map((availability, index) => (
                                        <View
                                            key={index}
                                            style={{
                                                height: 40,
                                                borderWidth: 0,
                                                borderRadius: 16,
                                                backgroundColor: Color.darkslategray_100,
                                                padding: 8,
                                                marginRight: 8,
                                                marginBottom: 12,
                                                shadowColor: "#000",
                                                shadowOffset: {width: 0, height: 4},
                                                shadowOpacity: 0.1,
                                                shadowRadius: 4,

                                                // Android elevation
                                                elevation: 5,
                                                width: "45%"
                                            }}
                                        >
                                            <TouchableOpacity
                                                style={{
                                                    flex: 0,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    paddingHorizontal: 8
                                                }}
                                                onPress={() =>
                                                    deleteTime(availability.start_time, availability.date)
                                                }
                                            >
                                                <Text
                                                    style={{
                                                        color: Color.text,
                                                        fontSize: 14,
                                                        fontFamily: FontFamily.regular,
                                                    }}
                                                >
                                                    {get12HoursFormat(availability.start_time)}
                                                </Text>
                                                <Ionicons name={"trash-outline"} color={"#F45E5E"} size={24}/>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {selectedDate && (
                                        <View
                                            style={{
                                                height: 40,
                                                borderWidth: 0,
                                                borderRadius: 16,
                                                backgroundColor: Color.darkslategray_100,
                                                padding: 8,
                                                marginRight: 8,
                                                marginBottom: 12,
                                                shadowColor: "#000",
                                                shadowOffset: {width: 0, height: 4},
                                                shadowOpacity: 0.1,
                                                shadowRadius: 4,

                                                // Android elevation
                                                elevation: 5,
                                                width: "45%"
                                            }}
                                        >
                                            <TouchableOpacity
                                                style={{
                                                    flex: 0,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                                onPress={() => setShowAddTimeModal(true)}
                                            >

                                                <Ionicons name={"add"} color={Color.text} size={24}/>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}