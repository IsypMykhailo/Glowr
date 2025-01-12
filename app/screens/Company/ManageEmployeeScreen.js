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
    Button,
    ActivityIndicator,
    ImageBackground, Alert,
} from "react-native";
import {BlurView} from "expo-blur";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTheme} from "../../ThemeContext";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import {
    ColorLight,
    ColorDark,
    FontSize,
    FontFamily,
    Padding,
    Border,
    BoxShadow,
} from "../../../GlobalStyles";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {supabase} from "../../config/supabaseClient";
import {Picker} from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
//import * as Permissions from "expo-permissions";
import Toast from "react-native-toast-message";
import AddServiceModal from "../../components/AddServiceModal";

export default function ManageEmployee({route, navigation}) {
    const {business, user_id, worker} = route.params;
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    const styles = theme === "light" ? stylesLight : stylesDark;
    const [image, setImage] = useState(worker.image);
    const [name, setName] = useState(worker.name);
    const [job, setJob] = useState(worker.role);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [services, setServices] = useState(worker.services);
    const [addServiceModalVisible, setAddServiceModalVisible] = useState(false);

    const insertServices = async (worker_id) => {
        const promises = services.map(async (service) => {
            const {data, error} = await supabase
                .from("services")
                .insert([
                    {
                        name: service.name,
                        price: service.price,
                        duration: service.duration,
                        description: service.description,
                        worker_id: worker_id,
                    },
                ])
                .select();
            if (error) {
                Alert.alert("Error", error.message, [{text: "OK"}], {cancelable: false});
            }
            return data;
        });

        const results = await Promise.all(promises);
        return results;
    };

    const handleInsert = async () => {
        let uploadedLink;
        const {errorImage} = await supabase.storage
            .from("profile_images")
            .upload(image.uri.split("/").pop(), image, {
                cacheControl: "3600",
                upsert: false,
            });

        if (errorImage) {
            console.log("Error uploading image:", errorImage);
        } else {
            const imageUrl = supabase.storage
                .from("profile_images")
                .getPublicUrl(image.uri.split("/").pop());
            uploadedLink = imageUrl.data.publicUrl;
        }

        const {workers, errorWorker} = await supabase
            .from("workers")
            .insert([
                {
                    name: name,
                    role: job,
                    business_id: business.id,
                    image: uploadedLink,
                },
            ])
            .select();

        insertServices(workers[0].id);

        navigation.navigate("Employees1");
    };

    const pickImage = async () => {
        /*const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
          return;
        }*/

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage({uri: result.assets[0].uri});
        }
    };

    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            {addServiceModalVisible && (
                <AddServiceModal
                    services={services}
                    setServices={setServices}
                    addServiceModalVisible={addServiceModalVisible}
                    setAddServiceModalVisible={setAddServiceModalVisible}
                />
            )}
            <View style={{width: "100%", height: "100%"}}>
                <TouchableOpacity
                    style={{position: "absolute", top: 24, left: 24, zIndex: 999}}
                    onPress={() => navigation.navigate("Employees1")}
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
                        Manage employee
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color={Color.text}
                        style={{alignContent: "center", top: 250}}
                    />
                ) : (
                    <ScrollView
                        style={{paddingHorizontal: 24, width: "100%"}}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{marginBottom: 32, width: "100%"}}>
                            {errorMessage && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{errorMessage}</Text>
                                </View>
                            )}
                            <View style={{width: "100%", alignItems: "center"}}>
                                <TouchableOpacity
                                    style={[
                                        {
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: 132,
                                            height: 132,
                                        },
                                        BoxShadow,
                                    ]}
                                    onPress={pickImage}
                                >

                                    <>
                                        <View
                                            style={{
                                                width: 132,
                                                height: 132,
                                                overflow: "hidden",
                                                borderWidth: 0,
                                                borderRadius: "100%",
                                                backgroundColor: Color.darkslategray_100,
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <ImageBackground
                                                resizeMode="cover"
                                                source={{uri: image}}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                }}
                                            ></ImageBackground>
                                        </View>
                                        <View
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                backgroundColor: Color.darkslategray_100,
                                                padding: 4,
                                                borderWidth: 0,
                                                borderRadius: 8,
                                            }}
                                        >
                                            <Ionicons name="pencil" size={26} color={Color.text}/>
                                        </View>
                                    </>
                                </TouchableOpacity>
                            </View>
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontFamily: FontFamily.medium,
                                    color: Color.text,
                                }}
                            >
                                Name
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
                                Job title
                            </Text>
                            <TextInput
                                value={job}
                                onChangeText={setJob}
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
                            <View
                                style={{
                                    flex: 0,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontFamily: FontFamily.medium,
                                        color: Color.text,
                                    }}
                                >
                                    Services
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setAddServiceModalVisible(true)}
                                >
                                    <Ionicons name="pencil" size={26} color={Color.text}/>
                                </TouchableOpacity>
                            </View>
                            {services.map((service, index) => (
                                <View style={{marginBottom: 16}} key={index}>
                                    <TouchableOpacity
                                        onPress={() => setIsOpen(!isOpen)}
                                        style={[
                                            {
                                                flex: 0,
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                backgroundColor: Color.darkslategray_100,
                                                borderWidth: 0,
                                                borderRadius: 8,
                                                paddingHorizontal: 16,
                                                paddingVertical: 8,
                                            },
                                            BoxShadow,
                                        ]}
                                    >
                                        <View>
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontFamily: FontFamily.regular,
                                                    color: Color.text,
                                                }}
                                            >
                                                {service.name}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    fontFamily: FontFamily.regular,
                                                    color: Color.text,
                                                }}
                                            >
                                                {service.duration} min
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    fontFamily: FontFamily.regular,
                                                    color: Color.text,
                                                }}
                                            >
                                                ${service.price}
                                            </Text>
                                        </View>
                                        <View>
                                            <Ionicons
                                                name="chevron-down"
                                                size={32}
                                                color={Color.text}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={{width: "100%", alignItems: "center"}}>
                                <TouchableOpacity
                                    onPress={handleInsert}
                                    style={[styles.signInButton, {marginTop: 64}]}
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
