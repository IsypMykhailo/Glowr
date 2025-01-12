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
    Button, Alert,
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
    Border,
} from "../../GlobalStyles";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {supabase} from "../config/supabaseClient";
import {Picker} from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";

import {useTogglePasswordVisibility} from "../hook/useTogglePasswordVisibility";

export default function CompanyDataModal({
                                             user_id,
                                             modalVisible,
                                             setModalVisible,
                                         }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [type, setType] = useState("");
    const [errorMessage, setError] = useState("");
    const [types, setTypes] = useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [showAddressInput, setShowAddressInput] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [countryText, setCountryText] = useState("Canada");
    const [stateText, setStateText] = useState("Select State");
    const [cityText, setCityText] = useState("Select City");
    const [selectedState, setSelectedState] = useState({});
    const [selectedCity, setSelectedCity] = useState({});
    const [showStates, setShowStates] = useState(false);
    const [showCities, setShowCities] = useState(false);
    const [postcode, setPostcode] = useState("");
    const [line_1, setLine_1] = useState("");
    const [line_2, setLine_2] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
    const [isStatePickerVisible, setStatePickerVisible] = useState(false);
    const [isCityPickerVisible, setCityPickerVisible] = useState(false);
    const [isTypePickerVisible, setTypePickerVisible] = useState(false);
    const [typeText, setTypeText] = useState("Type");
    const [stripeId, setStripeId] = useState("");
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    const styles = theme === "light" ? stylesLight : stylesDark;

    React.useEffect(() => {
        setLoading(true);
        fetchTypes();
        fetchCountries();
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchStates(selectedCountry.id);
        setShowStates(true)
    }, [selectedCountry]);

    const fetchTypes = async () => {
        let {data: types, error} = await supabase.from("types").select("*");
        setTypes(types);
    };
    const fetchCountries = async () => {
        let {data: countries, error} = await supabase
            .from("countries")
            .select("*")
            .eq("name", "Canada");
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

    const handleRegistration = async () => {
        try {
            setLoading(true);
            const {data: address, error: errorAddress} = await supabase
                .from("addresses")
                .insert([
                    {
                        country_id: selectedCountry.id,
                        state_id: selectedState.id,
                        city_id: selectedCity.id,
                        postcode: postcode,
                        line_1: line_1,
                        line_2: line_2,
                    },
                ])
                .select();
            console.log(errorAddress);

            const uploadedLinks = [];

            for (let image of images) {
                // Directly using the image file (blob) for upload
                const {error} = await supabase.storage
                    .from("business_images")
                    .upload(image.uri.split("/").pop(), image, {
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (error) {
                    Alert.alert("Error", error.message, [{text: "OK"}], {cancelable: false});
                } else {
                    const imageUrl = supabase.storage
                        .from("business_images")
                        .getPublicUrl(image.uri.split("/").pop());
                    uploadedLinks.push(imageUrl.data.publicUrl);
                }
            }

            /*console.log(name);
            console.log(description);
            console.log(uploadedLinks);
            console.log(type);
            console.log(user_id);
            console.log(address[0].id);*/

            const {data, errorBusiness} = await supabase
                .from("businesses")
                .insert([
                    {
                        name: name,
                        description: description,
                        image: uploadedLinks,
                        type: type.name,
                        user_id: user_id,
                        address_id: address[0].id,
                        stripe_id: stripeId,
                    },
                ])
                .select();
            /*console.log(data);
            console.log(errorBusiness);*/

            if (errorBusiness) {
                setError(errorBusiness);
                Alert.alert("Error", errorBusiness, [{text: "OK"}], {cancelable: false});
            } else {
                setModalVisible(false);
            }
            setLoading(false);
        } catch (exception) {
            console.error("Exception caught:", exception);
        }
    };

    const pickMultiple = async () => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== "granted") {
            alert("Sorry, we need camera roll permissions to make this work!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImages([...images, {uri: result.assets[0].uri}]);
        }
    };
    const deleteImage = (imageUri) => {
        setImages((prevImages) => {
            return prevImages.filter((image) => image.uri !== imageUri);
        });
    };

    return (loading ? (
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
                                Fill up your profile
                            </Text>
                            {/*<Text style={styles.welcomeBackHeader}>Welcome back!</Text>*/}
                        </View>
                        <View style={{width: "100%", alignItems: "center"}}>
                            {errorMessage && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{errorMessage}</Text>
                                </View>
                            )}
                            <TextInput
                                placeholder="Company Name"
                                placeholderTextColor="#656565"
                                value={name}
                                onChangeText={setName}
                                style={styles.formInput}
                            />
                            <TextInput
                                placeholder="Stripe account ID"
                                placeholderTextColor="#656565"
                                value={stripeId}
                                onChangeText={setStripeId}
                                style={styles.formInput}
                            />
                            <TouchableOpacity
                                value={type}
                                onChangeText={setType}
                                style={[styles.formInput, {justifyContent: "center"}]}
                                onPress={() => setTypePickerVisible(true)}
                            >
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontFamily: FontFamily.regular,
                                        color: "#000",
                                    }}
                                >
                                    {typeText}
                                </Text>
                            </TouchableOpacity>
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={isTypePickerVisible}
                                onRequestClose={() => {
                                    setTypePickerVisible(false);
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
                                                    width: "100%",
                                                    backgroundColor: Color.white,
                                                    padding: 10,
                                                    borderWidth: 0,
                                                    borderRadius: 8,
                                                }}
                                            >
                                                {types.map((type) => (
                                                    <TouchableOpacity
                                                        key={type.id}
                                                        style={{marginTop: 8, marginBottom: 8}}
                                                        onPress={() => {
                                                            setType(type);
                                                            setTypePickerVisible(false);
                                                            setTypeText(type.name);
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                fontSize: 16,
                                                                fontFamily: FontFamily.regular,
                                                                color: "#000",
                                                            }}
                                                        >
                                                            {type.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                </BlurView>
                            </Modal>
                            <View
                                style={[styles.formInput, {justifyContent: "center", opacity: 0.5}]}
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
                            </View>
                            {/*<Modal
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
                            </Modal>*/}
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.formInput,
                                        showStates ?
                                            {justifyContent: "center"} :
                                            {
                                                opacity: 0.5,
                                                justifyContent: "center"
                                            }]}
                                    onPress={() => setStatePickerVisible(true)}
                                    disabled={!showStates}
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

                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.formInput,
                                        showCities ?
                                            {justifyContent: "center"} :
                                            {opacity: 0.5, justifyContent: "center"}]}
                                    onPress={() => setCityPickerVisible(true)}
                                    disabled={!showCities}
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

                            <>
                                <TextInput
                                    placeholder="Postal Code"
                                    placeholderTextColor="#656565"
                                    value={postcode}
                                    onChangeText={setPostcode}
                                    style={styles.formInput}
                                />
                                <TextInput
                                    placeholder="Address Line 1"
                                    placeholderTextColor="#656565"
                                    value={line_1}
                                    onChangeText={setLine_1}
                                    style={styles.formInput}
                                />
                                <TextInput
                                    placeholder="Address Line 2 (optional)"
                                    placeholderTextColor="#656565"
                                    value={line_2}
                                    onChangeText={setLine_2}
                                    style={styles.formInput}
                                />
                            </>
                            <TextInput
                                style={styles.formInput}
                                multiline={true}
                                numberOfLines={5}
                                onChangeText={setDescription}
                                value={description}
                                placeholder="Enter your description..."
                            />
                            <View style={{width: "100%"}}>
                                {images.length === 0 && (
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: Color.darkslategray_100,
                                            padding: 16,
                                            borderWidth: 0,
                                            borderRadius: 8,
                                            marginRight: 64,
                                            marginLeft: 64,
                                            marginTop: 8,
                                        }}
                                        onPress={pickMultiple}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: FontFamily.medium,
                                                color: Color.text,
                                                textAlign: "center",
                                            }}
                                        >
                                            Select Images
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <View
                                    style={{
                                        flex: 0,
                                        flexDirection: "column",
                                        flexWrap: "wrap",
                                        margin: 5,
                                        paddingLeft: 64,
                                        paddingRight: 64,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {images.map((image, i) => (
                                        <View
                                            style={{
                                                flex: 0,
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: "100%",
                                            }}
                                        >
                                            <Image
                                                key={i}
                                                source={{uri: image.uri}}
                                                style={{width: 100, height: 100, margin: 8}}
                                            />
                                            <TouchableOpacity
                                                style={{
                                                    padding: 10,
                                                    backgroundColor: Color.darkslategray_100,
                                                    borderWidth: 0,
                                                    borderRadius: 8,
                                                    marginLeft: 16,
                                                }}
                                                onPress={() => deleteImage(image.uri)}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 14,
                                                        fontFamily: FontFamily.regular,
                                                        color: "#F45E5E",
                                                    }}
                                                >
                                                    Delete
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {images.length > 0 && (
                                        <TouchableOpacity
                                            onPress={pickMultiple}
                                            style={{
                                                margin: 8,
                                                width: 100,
                                                height: 100,
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Ionicons name="add" size={48} color={Color.text}/>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleRegistration}
                                style={[styles.signInButton, {marginTop: 16}]}
                            >
                                <Text style={styles.signInText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    ));
}