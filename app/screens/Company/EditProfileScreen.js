import React, { useState } from "react";
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
  Button,
  ActivityIndicator, Alert,
} from "react-native";
import { BlurView } from "expo-blur";
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
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
//import * as Permissions from "expo-permissions";
import EditScheduleModal from "../../components/EditScheduleModal";
import Toast from "react-native-toast-message";

export default function EditProfileScreen({ route, navigation }) {
  const { business, user_id } = route.params;
  const [name, setName] = useState(business.name);
  const [description, setDescription] = useState(business.description);
  const [images, setImages] = useState([]);
  const [oldImages, setOldImages] = useState(business.image);
  const [type, setType] = useState(business.type);
  const [errorMessage, setError] = useState("");
  const [types, setTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    business.addresses.countries
  );
  const [countryText, setCountryText] = useState(
    business.addresses.countries.name
  );
  const [stateText, setStateText] = useState(business.addresses.states.name);
  const [cityText, setCityText] = useState(business.addresses.cities.name);
  const [selectedState, setSelectedState] = useState(business.addresses.states);
  const [selectedCity, setSelectedCity] = useState(business.addresses.cities);
  const [showStates, setShowStates] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [postcode, setPostcode] = useState(business.addresses.postcode);
  const [line_1, setLine_1] = useState(business.addresses.line_1);
  const [line_2, setLine_2] = useState(business.addresses.line_2);
  const [loading, setLoading] = useState(false);
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
  const [isStatePickerVisible, setStatePickerVisible] = useState(false);
  const [isCityPickerVisible, setCityPickerVisible] = useState(false);
  const [isTypePickerVisible, setTypePickerVisible] = useState(false);
  const [typeText, setTypeText] = useState(business.type);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [stripeId, setStripeId] = useState(business.stripe_id);
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;

  React.useEffect(() => {
    setLoading(true);
    fetchTypes();
    fetchCountries();
    fetchStates(business.addresses.countries.id);
    fetchCities(business.addresses.states.id);
    setLoading(false);
  }, []);

  const fetchTypes = async () => {
    let { data: types, error } = await supabase.from("types").select("*");
    setTypes(types);
  };
  const fetchCountries = async () => {
    let { data: countries, error } = await supabase
      .from("countries")
      .select("*");
    setCountries(countries);
  };
  const fetchStates = async (country_id) => {
    let { data: states, error } = await supabase
      .from("states")
      .select("*")
      .eq("country_id", country_id);
    setStates(states);
    setShowStates(true);
  };

  const fetchCities = async (state_id) => {
    let { data: cities, error } = await supabase
      .from("cities")
      .select("*")
      .eq("state_id", state_id);
    setCities(cities);
    setShowCities(true);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      /*console.log(
        selectedCountry.id +
          " " +
          selectedState.id +
          " " +
          selectedCity.id +
          " " +
          postcode +
          " " +
          line_1 +
          " " +
          line_2
      );*/
      const { data: address, error: errorAddress } = await supabase
        .from("addresses")
        .update({
          country_id: selectedCountry.id,
          state_id: selectedState.id,
          city_id: selectedCity.id,
          postcode: postcode,
          line_1: line_1,
          line_2: line_2,
        })
        .eq("id", business.addresses.id)
        .select();

      console.log(errorAddress);

      const uploadedLinks = [];

      for (let image of images) {
        //console.log("Uploading image:", image.uri);

        const { error } = await supabase.storage
          .from("business_images")
          .upload(image.uri.split("/").pop(), image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          Alert.alert("Error uploading image", error.message, [{text: "OK"}], {cancelable: false});
        } else {
          const imageUrl = supabase.storage
            .from("business_images")
            .getPublicUrl(image.uri.split("/").pop());
          uploadedLinks.push(imageUrl.data.publicUrl);
        }
      }

      // Combine old image URLs from the database with new image URLs
      const allImageLinks = [...oldImages, ...uploadedLinks];

      /*console.log("Uploaded links:", uploadedLinks); // Log the uploaded image links
      console.log(name);
      console.log(description);
      console.log(allImageLinks); // Log combined image links
      console.log(type);
      console.log(user_id);
      console.log(address[0].id);*/

      const { data, errorBusiness } = await supabase
        .from("businesses")
        .update({
          name: name,
          description: description,
          image: allImageLinks, // Use combined image links
          type: type.name,
          user_id: user_id,
          address_id: address[0].id,
          stripe_id: stripeId,
        })
        .eq("id", business.id)
        .select();

      /*console.log(data);
      console.log(errorBusiness);*/

      if (errorBusiness) {
        setError(errorBusiness);
        console.log(errorBusiness);
      } else {
        Toast.show({
          type: "success",
          text1: "The profile has been updated!",
        });
      }
      setLoading(false);
    } catch (exception) {
      Alert.alert("Error", exception.toString(), [{text: "OK"}], {cancelable: false});
    }
  };
  const pickMultiple = async () => {
    /*const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }*/

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, { uri: result.assets[0].uri }]);
      //setImages([...images, { uri: result.uri }]);
    }
  };

  /*const pickMultiple = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
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
      console.log("Picked image URI:", result.uri);
      setImages([...images, { uri: result.uri }]);
    } else {
      console.log("Image picking was canceled.");
    }
  };*/
  const deleteImage = (imageUri) => {
    setImages((prevImages) => {
      return prevImages.filter((image) => image.uri !== imageUri);
    });
  };

  const deleteOldImage = (imageUri) => {
    setOldImages((prevImages) => {
      return prevImages.filter((image) => image !== imageUri);
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {scheduleVisible && (
        <EditScheduleModal
          show={scheduleVisible}
          business={business}
          onToggleCancel={() => {
            setScheduleVisible(!scheduleVisible);
          }}
        />
      )}
      <View style={{ width: "100%", height: "100%" }}>
        <TouchableOpacity
          style={{ position: "absolute", top: 24, left: 24, zIndex: 999 }}
          onPress={() =>
            navigation.navigate("ProfileInfo", {
              business: business,
              user_id: user_id,
            })
          }
        >
          <FontAwesome5 name="arrow-left" size={26} style={styles.arrowBack} />
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
            Edit profile
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Color.text}
            style={{ alignContent: "center", top: 250 }}
          />
        ) : (
          <ScrollView
            style={{ paddingHorizontal: 24, width: "100%" }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ marginBottom: 32, width: "100%" }}>
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: FontFamily.medium,
                  color: Color.text,
                }}
              >
                Company name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={{
                  backgroundColor: ColorDark.white,
                  color: "black",
                  borderWidth: 0,
                  borderRadius: 8,
                  height: 40,
                  fontFamily: FontFamily.regular,
                  fontSize: 16,
                  paddingLeft: 16,
                  marginTop: 8,
                  marginBottom: 32,
                  shadowColor: "rgba(0, 0, 0, 0.15)",
                  shadowRadius: 6,
                  elevation: 6,
                  shadowOpacity: 1,
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                }}
              />

              <Text
                  style={{
                    fontSize: 18,
                    fontFamily: FontFamily.medium,
                    color: Color.text,
                  }}
              >
                Stripe ID
              </Text>
              <TextInput
                  value={stripeId}
                  onChangeText={setStripeId}
                  style={{
                    backgroundColor: ColorDark.white,
                    color: "black",
                    borderWidth: 0,
                    borderRadius: 8,
                    height: 40,
                    fontFamily: FontFamily.regular,
                    fontSize: 16,
                    paddingLeft: 16,
                    marginTop: 8,
                    marginBottom: 32,
                    shadowColor: "rgba(0, 0, 0, 0.15)",
                    shadowRadius: 6,
                    elevation: 6,
                    shadowOpacity: 1,
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                  }}
              />

              <Text
                style={{
                  fontSize: 18,
                  fontFamily: FontFamily.medium,
                  color: Color.text,
                }}
              >
                Type
              </Text>
              <TouchableOpacity
                value={type}
                onChangeText={setType}
                style={[
                  {
                    backgroundColor: ColorDark.white,
                    color: "black",
                    borderWidth: 0,
                    borderRadius: 8,
                    height: 40,
                    fontFamily: FontFamily.regular,
                    fontSize: 16,
                    paddingLeft: 16,
                    marginTop: 8,
                    marginBottom: 32,
                    shadowColor: "rgba(0, 0, 0, 0.15)",
                    shadowRadius: 6,
                    elevation: 6,
                    shadowOpacity: 1,
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                  },
                  { justifyContent: "center" },
                ]}
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
                            style={{ marginTop: 8, marginBottom: 8 }}
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
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: FontFamily.medium,
                  color: Color.text,
                }}
              >
                Address
              </Text>
              <TouchableOpacity
                style={[
                  {
                    backgroundColor: ColorDark.white,
                    color: "black",
                    borderWidth: 0,
                    borderRadius: 8,
                    height: 40,
                    fontFamily: FontFamily.regular,
                    fontSize: 16,
                    paddingLeft: 16,
                    marginVertical: 8,
                    shadowColor: "rgba(0, 0, 0, 0.15)",
                    shadowRadius: 6,
                    elevation: 6,
                    shadowOpacity: 1,
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                  },
                  { justifyContent: "center" },
                ]}
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
                          height: 300,
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
                                : { margin: 8 }
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
              <TouchableOpacity
                style={[
                  {
                    backgroundColor: ColorDark.white,
                    color: "black",
                    borderWidth: 0,
                    borderRadius: 8,
                    height: 40,
                    fontFamily: FontFamily.regular,
                    fontSize: 16,
                    paddingLeft: 16,
                    marginVertical: 8,
                    shadowColor: "rgba(0, 0, 0, 0.15)",
                    shadowRadius: 6,
                    elevation: 6,
                    shadowOpacity: 1,
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                  },
                  { justifyContent: "center" },
                ]}
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
                          height: 300,
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
                                : { margin: 8 }
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

              <TouchableOpacity
                style={[
                  {
                    backgroundColor: ColorDark.white,
                    color: "black",
                    borderWidth: 0,
                    borderRadius: 8,
                    height: 40,
                    fontFamily: FontFamily.regular,
                    fontSize: 16,
                    paddingLeft: 16,
                    marginVertical: 8,
                    shadowColor: "rgba(0, 0, 0, 0.15)",
                    shadowRadius: 6,
                    elevation: 6,
                    shadowOpacity: 1,
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                  },
                  { justifyContent: "center" },
                ]}
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
                          height: 300,
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
                                : { margin: 8 }
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

              <TextInput
                placeholder="Postal Code"
                placeholderTextColor="#656565"
                value={postcode}
                onChangeText={setPostcode}
                style={{
                  backgroundColor: ColorDark.white,
                  color: "black",
                  borderWidth: 0,
                  borderRadius: 8,
                  height: 40,
                  fontFamily: FontFamily.regular,
                  fontSize: 16,
                  paddingLeft: 16,
                  marginVertical: 8,
                  shadowColor: "rgba(0, 0, 0, 0.15)",
                  shadowRadius: 6,
                  elevation: 6,
                  shadowOpacity: 1,
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                }}
              />
              <TextInput
                placeholder="Address Line 1"
                placeholderTextColor="#656565"
                value={line_1}
                onChangeText={setLine_1}
                style={{
                  backgroundColor: ColorDark.white,
                  color: "black",
                  borderWidth: 0,
                  borderRadius: 8,
                  height: 40,
                  fontFamily: FontFamily.regular,
                  fontSize: 16,
                  paddingLeft: 16,
                  marginVertical: 8,
                  shadowColor: "rgba(0, 0, 0, 0.15)",
                  shadowRadius: 6,
                  elevation: 6,
                  shadowOpacity: 1,
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                }}
              />
              <TextInput
                placeholder="Address Line 2 (optional)"
                placeholderTextColor="#656565"
                value={line_2}
                onChangeText={setLine_2}
                style={{
                  backgroundColor: ColorDark.white,
                  color: "black",
                  borderWidth: 0,
                  borderRadius: 8,
                  height: 40,
                  fontFamily: FontFamily.regular,
                  fontSize: 16,
                  paddingLeft: 16,
                  marginTop: 8,
                  marginBottom: 32,
                  shadowColor: "rgba(0, 0, 0, 0.15)",
                  shadowRadius: 6,
                  elevation: 6,
                  shadowOpacity: 1,
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: FontFamily.medium,
                  color: Color.text,
                }}
              >
                Description
              </Text>
              <TextInput
                style={{
                  backgroundColor: ColorDark.white,
                  color: "black",
                  borderWidth: 0,
                  borderRadius: 8,
                  height: 40,
                  fontFamily: FontFamily.regular,
                  fontSize: 16,
                  paddingLeft: 16,
                  marginTop: 8,
                  marginBottom: 32,
                  shadowColor: "rgba(0, 0, 0, 0.15)",
                  shadowRadius: 6,
                  elevation: 6,
                  shadowOpacity: 1,
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                }}
                multiline={true}
                numberOfLines={5}
                onChangeText={setDescription}
                value={description}
                placeholder="Enter your description..."
              />
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: FontFamily.medium,
                  color: Color.text,
                }}
              >
                Working schedule
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: ColorDark.white,
                  color: "black",
                  borderWidth: 0,
                  borderRadius: 8,
                  height: 40,
                  fontFamily: FontFamily.regular,
                  fontSize: 16,
                  paddingLeft: 16,
                  marginTop: 8,
                  marginBottom: 32,
                  shadowColor: "rgba(0, 0, 0, 0.15)",
                  shadowRadius: 6,
                  elevation: 6,
                  shadowOpacity: 1,
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  justifyContent: "center",
                }}
                onPress={() => setScheduleVisible(true)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: FontFamily.regular,
                    color: "#000",
                  }}
                >
                  Show schedule
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: FontFamily.medium,
                  color: Color.text,
                }}
              >
                Images
              </Text>
              <View style={{ width: "100%" }}>
                {oldImages.length === 0 && (
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
                  {oldImages.map((image, i) => (
                    <View
                      style={{
                        flex: 0,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                      }}
                      key={i}
                    >
                      <Image
                        key={i}
                        source={{ uri: image }}
                        style={{ width: 100, height: 100, margin: 8 }}
                      />
                      <TouchableOpacity
                        style={{
                          padding: 10,
                          backgroundColor: Color.darkslategray_100,
                          borderWidth: 0,
                          borderRadius: 8,
                          marginLeft: 16,
                        }}
                        onPress={() => deleteOldImage(image)}
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
                        source={{ uri: image.uri }}
                        style={{ width: 100, height: 100, margin: 8 }}
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
                  {oldImages.length > 0 && (
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
                      <Ionicons name="add" size={48} color={Color.text} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={{ width: "100%", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={handleUpdate}
                  style={[styles.signInButton, { marginTop: 16 }]}
                >
                  <Text style={styles.signInText}>Apply changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
