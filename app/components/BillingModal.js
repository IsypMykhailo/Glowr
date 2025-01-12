import React, {useState} from "react";
import Checkbox from "expo-checkbox";
import {
    View,
    TextInput,
    Text,
    Pressable,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    Button, Alert, ActivityIndicator,
} from "react-native";
import {BlurView} from "expo-blur";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTheme} from "../ThemeContext";
import stylesLight from "./stylesLight";
import stylesDark from "./stylesDark";
import {
    ColorLight,
    ColorDark,
    FontSize,
    FontFamily,
    Padding,
    Border, BoxShadow,
} from "../../GlobalStyles";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {supabase} from "../config/supabaseClient";
import {Picker} from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";

import {useTogglePasswordVisibility} from "../hook/useTogglePasswordVisibility";

export default function BillingModal({
                                         user_id,
                                         modalVisible,
                                         onToggleCancel,
                                         onToggleSubmit,
                                         setModalVisible,
                                         city,
                                         setCity,
                                         country,
                                         setCountry,
                                         line1,
                                         setLine1,
                                         line2,
                                         setLine2,
                                         postalCode,
                                         setPostalCode,
                                         state,
                                         setState,
                                         pointsToUse,
                                         setPointsToUse,
                                         price
                                     }) {
    const [errorMessage, setError] = useState("");
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [showAddressInput, setShowAddressInput] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [countryText, setCountryText] = useState("Select Country");
    const [stateText, setStateText] = useState("Select State");
    const [cityText, setCityText] = useState("Select City");
    const [selectedState, setSelectedState] = useState({});
    const [selectedCity, setSelectedCity] = useState({});
    const [showStates, setShowStates] = useState(false);
    const [showCities, setShowCities] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
    const [isStatePickerVisible, setStatePickerVisible] = useState(false);
    const [isCityPickerVisible, setCityPickerVisible] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    const styles = theme === "light" ? stylesLight : stylesDark;

    React.useEffect(() => {
        setLoading(true);
        fetchCountries();
        fetchPoints();
        setLoading(false);
    }, []);

    const fetchCountries = async () => {
        let {data: countries, error} = await supabase
            .from("countries")
            .select("*");
        setCountries(countries);
        if (countries.length > 0 && !selectedCountry) {
            setSelectedCountry(countries[0]);
        }
    };
    const fetchStates = async (country_id) => {
        let {data: states, error} = await supabase
            .from("states")
            .select("*")
            .eq("country_id", country_id);
        setStates(states);
        setShowStates(true);
    };

    const fetchCities = async (state_id) => {
        let {data: cities, error} = await supabase
            .from("cities")
            .select("*")
            .eq("state_id", state_id);
        setCities(cities);
        setShowCities(true);
    };

    const fetchPoints = async () => {
        let {data: points, error} = supabase
            .from("points")
            .select("*")
            .eq("user_id", user_id)
            .then((res) => {
                setTotalPoints(res.data[0].amount)
            });
        if (error) {
            Alert.alert("Error", error.message, [{text: "OK"}], {
                cancelable: false,
            });
        }
    }

    const handleSubmit = async () => {
        if (pointsToUse > totalPoints) {
            Alert.alert("Error", "You don't have enough points", [{text: "OK"}], {
                cancelable: false,
            });
        } else if(pointsToUse > price*1000) {
            Alert.alert("Error", "You can't use more points than the price", [{text: "OK"}], {
                cancelable: false,
            });
        } else {
            try {
                setLoading(true);
                setCountry(selectedCountry.iso2);
                setState(selectedState.name);
                setCity(selectedCity.name);
                setLoading(false);
                onToggleSubmit()
            } catch (exception) {
                console.error("Exception caught:", exception);
            }
        }
    };

    const checkIfDataEntered = () => {
        if (selectedCountry === null || selectedState === {} || selectedCity === {} || postalCode === "" || line1 === "") {
            return false;
        }
        return true;
    }

    return loading ? (
        <ActivityIndicator
            size="large"
            color={Color.text}
            style={{alignContent: "center", top: 250}}
        />
    ) : (
        <Modal
            animationType="fade"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
            }}
        >
            <View style={styles.authContainer}>
                <ScrollView>
                    <View
                        style={{marginTop: 200, marginBottom: 200}}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{width: "100%", alignItems: "center"}}>
                            <Text
                                style={[styles.signInHeader, {width: 300, marginBottom: 32}]}
                            >
                                Fill up your billing information
                            </Text>
                            {/*<Text style={styles.welcomeBackHeader}>Welcome back!</Text>*/}
                        </View>
                        <View style={{width: "100%", alignItems: "center"}}>
                            {errorMessage && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{errorMessage}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.formInput, {justifyContent: "center"}]}
                                onPress={() => setCountryPickerVisible(true)}
                            >
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontFamily: FontFamily.regular,
                                        color: "#000",
                                    }}
                                >
                                    {countryText}
                                </Text>
                            </TouchableOpacity>
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={isCountryPickerVisible}
                                onRequestClose={() => {
                                    setCountryPickerVisible(false);
                                }}
                            >
                                <BlurView
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                    }}
                                    intensity={5}
                                    tint="dark"
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            paddingLeft: 64,
                                            paddingRight: 64,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: "100%",
                                                borderWidth: 0,
                                                borderRadius: 8,
                                            }}
                                        >
                                            <ScrollView
                                                style={{
                                                    height: 200,
                                                    width: "100%",
                                                    backgroundColor: Color.white,
                                                    padding: 10,
                                                    borderWidth: 0,
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        borderBottomWidth: 2,
                                                        borderBottomColor: "#000",
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontSize: 18,
                                                            fontFamily: FontFamily.medium,
                                                            color: "#000",
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        Countries:
                                                    </Text>
                                                </View>
                                                {countries.map((country) => (
                                                    <TouchableOpacity
                                                        key={country.id}
                                                        style={
                                                            country.name === countryText
                                                                ? {
                                                                    marginTop: 8,
                                                                    marginBottom: 8,
                                                                    backgroundColor: Color.accentColor,
                                                                    padding: 8,
                                                                    borderRadius: 8,
                                                                }
                                                                : {margin: 8}
                                                        }
                                                        onPress={() => {
                                                            setSelectedCountry(country);
                                                            setCountryPickerVisible(false);
                                                            setCountryText(country.name);
                                                            fetchStates(country.id);
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                fontSize: 16,
                                                                fontFamily: FontFamily.regular,
                                                                color: "#000",
                                                            }}
                                                        >
                                                            {country.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                </BlurView>
                            </Modal>
                            {//showStates && (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.formInput,
                                            showStates ?
                                                {justifyContent: "center"} : {
                                                    disabled: true,
                                                    justifyContent: "center",
                                                    opacity: 0.5
                                                }
                                        ]}
                                        disabled={!showStates}
                                        onPress={() => setStatePickerVisible(true)}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: FontFamily.regular,
                                                color: "#000",
                                            }}
                                        >
                                            {stateText}
                                        </Text>
                                    </TouchableOpacity>
                                    <Modal
                                        animationType="fade"
                                        transparent={true}
                                        visible={isStatePickerVisible}
                                        onRequestClose={() => {
                                            setStatePickerVisible(false);
                                        }}
                                    >
                                        <BlurView
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                            }}
                                            intensity={5}
                                            tint="dark"
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    paddingLeft: 64,
                                                    paddingRight: 64,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: "100%",
                                                        borderWidth: 0,
                                                        borderRadius: 8,
                                                    }}
                                                >
                                                    <ScrollView
                                                        style={{
                                                            height: 200,
                                                            width: "100%",
                                                            backgroundColor: Color.white,
                                                            padding: 10,
                                                            borderWidth: 0,
                                                            borderRadius: 8,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                borderBottomWidth: 2,
                                                                borderBottomColor: "#000",
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontSize: 18,
                                                                    fontFamily: FontFamily.medium,
                                                                    color: "#000",
                                                                    marginBottom: 8,
                                                                }}
                                                            >
                                                                States:
                                                            </Text>
                                                        </View>
                                                        {states.map((state) => (
                                                            <TouchableOpacity
                                                                key={state.id}
                                                                style={
                                                                    state.name === stateText
                                                                        ? {
                                                                            marginTop: 8,
                                                                            marginBottom: 8,
                                                                            backgroundColor: Color.accentColor,
                                                                            padding: 8,
                                                                            borderRadius: 8,
                                                                        }
                                                                        : {margin: 8}
                                                                }
                                                                onPress={() => {
                                                                    setSelectedState(state);
                                                                    setStatePickerVisible(false);
                                                                    setStateText(state.name);
                                                                    fetchCities(state.id);
                                                                }}
                                                            >
                                                                <Text
                                                                    style={{
                                                                        fontSize: 16,
                                                                        fontFamily: FontFamily.regular,
                                                                        color: "#000",
                                                                    }}
                                                                >
                                                                    {state.name}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </ScrollView>
                                                </View>
                                            </View>
                                        </BlurView>
                                    </Modal>
                                </>
                            }

                            {//showCities && (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.formInput,
                                            showCities ?
                                                {justifyContent: "center"} : {
                                                    disabled: true,
                                                    justifyContent: "center",
                                                    opacity: 0.5
                                                }]}
                                        disabled={!showCities}
                                        onPress={() => setCityPickerVisible(true)}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: FontFamily.regular,
                                                color: "#000",
                                            }}
                                        >
                                            {cityText}
                                        </Text>
                                    </TouchableOpacity>
                                    <Modal
                                        animationType="fade"
                                        transparent={true}
                                        visible={isCityPickerVisible}
                                        onRequestClose={() => {
                                            setCityPickerVisible(false);
                                        }}
                                    >
                                        <BlurView
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                            }}
                                            intensity={5}
                                            tint="dark"
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    paddingLeft: 64,
                                                    paddingRight: 64,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: "100%",
                                                        borderWidth: 0,
                                                        borderRadius: 8,
                                                    }}
                                                >
                                                    <ScrollView
                                                        style={{
                                                            height: 200,
                                                            width: "100%",
                                                            backgroundColor: Color.white,
                                                            padding: 10,
                                                            borderWidth: 0,
                                                            borderRadius: 8,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                borderBottomWidth: 2,
                                                                borderBottomColor: "#000",
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontSize: 18,
                                                                    fontFamily: FontFamily.medium,
                                                                    color: "#000",
                                                                    marginBottom: 8,
                                                                }}
                                                            >
                                                                Cities:
                                                            </Text>
                                                        </View>
                                                        {cities.map((city) => (
                                                            <TouchableOpacity
                                                                key={city.id}
                                                                style={
                                                                    city.name === cityText
                                                                        ? {
                                                                            marginTop: 8,
                                                                            marginBottom: 8,
                                                                            backgroundColor: Color.accentColor,
                                                                            padding: 8,
                                                                            borderRadius: 8,
                                                                        }
                                                                        : {margin: 8}
                                                                }
                                                                onPress={() => {
                                                                    setSelectedCity(city);
                                                                    setCityPickerVisible(false);
                                                                    setCityText(city.name);
                                                                    setShowAddressInput(true);
                                                                }}
                                                            >
                                                                <Text
                                                                    style={{
                                                                        fontSize: 16,
                                                                        fontFamily: FontFamily.regular,
                                                                        color: "#000",
                                                                    }}
                                                                >
                                                                    {city.name}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </ScrollView>
                                                </View>
                                            </View>
                                        </BlurView>
                                    </Modal>
                                </>
                            }

                            {//showAddressInput && (
                                <>
                                    <TextInput
                                        placeholder="Postal Code"
                                        placeholderTextColor="#656565"
                                        value={postalCode}
                                        onChangeText={setPostalCode}
                                        style={styles.formInput}

                                    />
                                    <TextInput
                                        placeholder="Address Line 1"
                                        placeholderTextColor="#656565"
                                        value={line1}
                                        onChangeText={setLine1}
                                        style={styles.formInput}
                                    />
                                    <TextInput
                                        placeholder="Address Line 2 (optional)"
                                        placeholderTextColor="#656565"
                                        value={line2}
                                        onChangeText={setLine2}
                                        style={styles.formInput}
                                    />
                                </>
                            }
                            <TouchableOpacity style={{
                                flex: 0,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                width: 296
                            }}
                                              onPress={() => setChecked(!isChecked)}
                            >
                                <Checkbox
                                    style={{marginVertical: 8, marginRight: 8}}
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
                                    I would like to use points
                                </Text>
                            </TouchableOpacity>
                            <TextInput
                                placeholder="Points to use"
                                placeholderTextColor="#656565"
                                value={String(pointsToUse)}
                                onChangeText={(value) => setPointsToUse(Number(value))}
                                style={isChecked ? styles.formInput : [styles.formInput, {opacity: 0.5}]}
                                keyboardType="numeric"
                                editable={isChecked}
                            />
                            <View style={{
                                flex: 0,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 16
                            }}>
                                <TouchableOpacity
                                    onPress={() => onToggleCancel()}
                                    style={[
                                        {
                                            paddingVertical: 8,
                                            backgroundColor: Color.darkslategray_100,
                                            borderWidth: 0,
                                            borderRadius: 8,
                                            paddingHorizontal: 16,
                                            marginRight: 16
                                        },
                                        BoxShadow]}
                                >
                                    <Text style={{
                                        fontSize: 16,
                                        fontFamily: FontFamily.medium,
                                        color: Color.text,
                                    }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    style={[
                                        checkIfDataEntered() ? {
                                            paddingVertical: 8,
                                            backgroundColor: Color.accentColor,
                                            borderWidth: 0,
                                            borderRadius: 8,
                                            paddingHorizontal: 16
                                        } : {
                                            paddingVertical: 8,
                                            backgroundColor: Color.accentColor,
                                            borderWidth: 0,
                                            borderRadius: 8,
                                            paddingHorizontal: 16,
                                            opacity: 0.5
                                        },
                                        BoxShadow]}
                                    disabled={!checkIfDataEntered()}
                                >
                                    <Text style={{
                                        fontSize: 16,
                                        fontFamily: FontFamily.medium,
                                        color: Color.white,
                                    }}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}
