import * as React from "react";
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
    Modal,
    Dimensions, TextInput,
} from "react-native";
import {BlurView} from "expo-blur";
import {
    ColorLight,
    ColorDark,
    FontSize,
    FontFamily,
    Padding,
    Border,
} from "../../GlobalStyles";
import {useTheme} from "../ThemeContext";
import stylesLight from "../components/stylesLight";
import stylesDark from "../components/stylesDark";
import Checkbox from "expo-checkbox";
import Slider from "@react-native-community/slider";
import Ionicons from "@expo/vector-icons/Ionicons";
import moment from "moment-timezone";
import Dropdown from "./Dropdown";
import {supabase} from "../config/supabaseClient";

const AddTimeModal = ({
                          show,
                          onToggleCancel,
                          date,
                          worker_id,
                          onToggleCancelSubmit,
                      }) => {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    const styles = theme === "light" ? stylesLight : stylesDark;
    let data = ["am", "pm"];
    const [hours, setHours] = React.useState("");
    const [minutes, setMinutes] = React.useState("");
    const [amPm, setAmPm] = React.useState("am");

    const convertTo24Hour = (time) => {
        var hours = parseInt(time.substr(0, 2));
        if (time.indexOf('am') != -1 && hours == 12) {
            time = time.replace('12', '0');
        }
        if (time.indexOf('pm') != -1 && hours < 12) {
            time = time.replace(hours, (hours + 12));
        }
        return time.replace(/(am|pm)/, '');
    }

    const onSubmit = async () => {
        if (hours === "" || minutes === "") {
            Alert.alert("Please enter a valid time");
        } else {
            let time24 = convertTo24Hour(hours + ":" + minutes + " " + amPm);
            let timezone = moment.tz.guess();
            let hours1 = time24.split(":")[0];
            let minutes1 = time24.split(":")[1];
            minutes1 = minutes1.trim();
            let time = moment().tz(timezone);
            let offset = time.utcOffset()/60;
            let start_time = hours1+":"+minutes1+":00"+offset;

            const {availability, error} = await supabase
                .from('workerAvailability')
                .insert([
                    {worker_id: worker_id, date: date, start_time: start_time},
                ])
                .select()
            if (error) {
                Alert.alert("Error adding time" + error.message);
            } else
                onToggleCancelSubmit();
        }
    }

    return (
        <Modal transparent={true} animationType="fade" visible={show}>
            <BlurView style={overlayStyles.absolute} intensity={2} tint="dark">
                <View style={overlayStyles.overlay}>
                    <View style={styles.overlay}>
                        <View
                            style={{
                                position: "absolute",
                                left: 24,
                                top: 24,
                                zIndex: 3,
                                width: 32,
                                height: 32,
                            }}
                        >
                            <TouchableOpacity
                                style={{width: "100%", height: "100%"}}
                                onPress={onToggleCancel}
                            >
                                <Ionicons name="close" size={22} color={Color.text}/>
                            </TouchableOpacity>
                        </View>
                        <Text
                            style={{
                                color: Color.white,
                                fontFamily: FontFamily.medium,
                                fontSize: 18,
                                textAlign: "center",
                            }}
                        >
                            Add a time slot
                        </Text>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: Color.white,
                                borderWidth: 0,
                                borderRadius: 8,
                                padding: 4,
                                marginTop: 24,
                                zIndex: 999
                            }}>
                            <TextInput
                                value={hours}
                                onChangeText={setHours}
                                placeholder={"--"}
                                style={{
                                    color: "black",
                                    marginHorizontal: 4,
                                    fontSize: 16
                                }}
                                placeholderTextColor={"black"}
                            />
                            <Text style={{fontSize: 16}}> : </Text>
                            <TextInput
                                value={minutes}
                                onChangeText={setMinutes}
                                placeholder={"--"}
                                style={{
                                    color: "black",
                                    marginHorizontal: 4,
                                    fontSize: 16
                                }}
                                placeholderTextColor={"black"}
                            />
                            <Dropdown
                                data={data}
                                onSelect={(value) => {
                                    setAmPm(value);
                                }}
                                label={"am/pm"}
                            />
                        </View>
                        <TouchableOpacity
                            style={{
                                backgroundColor: Color.accentColor,
                                padding: 12,
                                borderRadius: 8,
                                marginTop: 24,
                            }}
                            onPress={onSubmit}
                        >
                            <Text
                                style={{
                                    color: Color.white,
                                    fontFamily: FontFamily.medium,
                                    fontSize: 16,
                                    textAlign: "center",
                                }}
                            >
                                Add
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
};

export default AddTimeModal;

const overlayStyles = StyleSheet.create({
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    overlay: {
        //flex: 1,
        height: "100%",
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.8)",
        alignItems: "center",
        //opacity: 0.8, // adjust as needed
    },
});
