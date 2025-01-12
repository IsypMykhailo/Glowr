import * as React from "react";

import {
    StyleSheet,
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    Modal, Alert, ActivityIndicator,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
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
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {supabase} from "../../config/supabaseClient";
import {showMessage} from "react-native-flash-message";
import {
    initStripe,
    useStripe,
    PaymentSheet,
    PaymentSheetError,
} from "@stripe/stripe-react-native";
import BillingModal from "../../components/BillingModal";

export default function CheckoutScreen({route, navigation}) {
    const {business, rating, worker, user_id, checkedServices, selectedTime} =
        route.params;
    let price = 0;
    checkedServices.map((service, index) => {
        price += service.price;
    });
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    const styles = theme === "light" ? stylesLight : stylesDark;
    const [overallPrice, setOverallPrice] = React.useState(price);
    const [user, setUser] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [client, setClient] = React.useState({});
    const {initPaymentSheet, presentPaymentSheet} = useStripe();
    const [paymentSheetEnabled, setPaymentSheetEnabled] = React.useState(false);
    const [clientSecret, setClientSecret] = React.useState("");
    const [modalVisible, setModalVisible] = React.useState(false);
    const [city, setCity] = React.useState("");
    const [state, setState] = React.useState("");
    const [country, setCountry] = React.useState("");
    const [postalCode, setPostalCode] = React.useState("");
    const [line1, setLine1] = React.useState("");
    const [line2, setLine2] = React.useState("");
    const [billingEntered, setBillingEntered] = React.useState(false);
    const [pointsToUse, setPointsToUse] = React.useState(0);
    /*checkedServices.map((service, index) => {
        overallPrice += service.price;
    });*/

    React.useEffect(() => {
        setLoading(true)
        getCurrentUser();
        //console.log("Overall Price: " + overallPrice)
        /*const firstCalculation = () => {
            let price = 0;
            checkedServices.map((service, index) => {
                price += service.price;
            });
            console.log(price)
            setOverallPrice(price);
            console.log("First Calculation: " + overallPrice)
        }
        firstCalculation();*/
        setModalVisible(true)
        setLoading(false)

    }, []);

    React.useEffect(() => {
        if (billingEntered) {
            initialize();
        }
    }, [billingEntered]);

    async function initialize() {
        initialisePaymentSheet();
    }

    const calculatePrice = () => {
        let price = overallPrice;

        if (pointsToUse > 0) {
            price = price - pointsToUse / 1000;
        }
        price = Math.floor(price*100)/100;

        setOverallPrice(price)
        //console.log("Calculate price: " + overallPrice);
    }

    const fetchPaymentSheetParams = async () => {
        // Create payment session for our customer
        //console.log(overallPrice)
        const {data, error} = await supabase.functions.invoke(
            "payments",
            {body: JSON.stringify({price: price*100, stripe_id: business.stripe_id, user_points: pointsToUse/10})}
        );
        //console.log(data, error);
        if (!data || error) {
            Alert.alert(`Error: ${error?.message ?? "no data"}`);
            return {};
        }
        const {paymentIntent, ephemeralKey, customer, stripe_pk} = data;
        setClientSecret(paymentIntent);
        return {
            paymentIntent,
            ephemeralKey,
            customer,
            stripe_pk,
        };
    };

    const openPaymentSheet = async () => {
        console.log("Entered Payment Sheet")
        if (!clientSecret) {
            return;
        }
        setLoading(true);
        if(price*100-pointsToUse/10 === 0){
            let applicationFee = Math.round(price * 100 * 0.15) - pointsToUse/10;
            if (applicationFee < 0) {
                const remainingAmount = Math.abs(Math.round(price * 100 * 0.15) - pointsToUse / 10);
                const {data, errorPayment} = await supabase.functions.invoke(
                    "payment-transfer",
                    {body: JSON.stringify({remainingAmount: remainingAmount, stripe_id: business.stripe_id})}
                )
                //console.log(data, errorPayment);
                if (!data || errorPayment) {
                    Alert.alert(`Error: ${errorPayment?.message ?? "no data"}`);
                }
            }
            handleBooking();
        } else {
            const {error} = await presentPaymentSheet();

            if (!error) {
                Alert.alert("Success", "The payment was confirmed successfully");``
                let applicationFee = Math.round(price * 100 * 0.15) - pointsToUse / 10;
                if (applicationFee < 0 && price * 100 - pointsToUse / 10 !== 0) {
                    const remainingAmount = Math.abs(Math.round(price * 100 * 0.15) - pointsToUse / 10);
                    const {data, errorPayment} = await supabase.functions.invoke(
                        "payment-transfer",
                        {body: JSON.stringify({remainingAmount: remainingAmount, stripe_id: business.stripe_id})}
                    )
                    //console.log(data, errorPayment);
                    if (!data || errorPayment) {
                        Alert.alert(`Error: ${errorPayment?.message ?? "no data"}`);
                    }
                }
                handleBooking();
            } else if (error.code === PaymentSheetError.Failed) {
                Alert.alert(
                    `PaymentSheet present failed with error code: ${error.code}`,
                    error.message
                );
            } else if (error.code === PaymentSheetError.Canceled) {
                Alert.alert(
                    `PaymentSheet present was canceled with code: ${error.code}`,
                    error.message
                );
            }
            setPaymentSheetEnabled(false);
        }
        setLoading(false);
    };

    const initialisePaymentSheet = async () => {
        setLoading(true);
        const {paymentIntent, ephemeralKey, customer, stripe_pk} =
            await fetchPaymentSheetParams();

        if (!stripe_pk || !paymentIntent) return setLoading(false);

        await initStripe({
            publishableKey: stripe_pk,
            merchantIdentifier: "merchant.com.stripe.react.native",
            urlScheme: "supabase-stripe-example",
            setUrlSchemeOnAndroid: true,
        });

        const address = {
            city: city,
            country: country,
            line1: line1,
            line2: line2,
            postalCode: postalCode,
            state: state,
        };
        const billingDetails = {
            name: user.user_metadata.full_name,
            email: user.email,
            phone: user.user_metadata.phone,
            address: address,
        };

        const {error} = await initPaymentSheet({
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,
            customFlow: false,
            merchantDisplayName: "Example Inc.",
            applePay: true,
            merchantCountryCode: "CA",
            style: "automatic",
            googlePay: true,
            testEnv: true,
            primaryButtonColor: "#635BFF", // Blurple
            returnURL: "stripe-example://stripe-redirect",
            defaultBillingDetails: billingDetails,
            allowsDelayedPaymentMethods: true,
        });
        if (!error) {
            setPaymentSheetEnabled(true);
        } else if (error.code === PaymentSheetError.Failed) {
            Alert.alert(
                `PaymentSheet init failed with error code: ${error.code}`,
                error.message
            );
        } else if (error.code === PaymentSheetError.Canceled) {
            Alert.alert(
                `PaymentSheet init was canceled with code: ${error.code}`,
                error.message
            );
        }
        setLoading(false);
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

    const getCurrentUser = async () => {
        const {
            data: {user},
        } = await supabase.auth.getUser();
        setUser(user);
    };

    const handleBooking = async () => {

        let {data: clients, errorClient} = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user_id)
        if (errorClient) {
            Alert.alert("Error Client Read", errorClient, [{text: "OK"}], {cancelable: false});
        }
        if (clients.length === 0) {
            let {data: clients, errorClient} = await supabase
                .from('clients')
                .insert([
                    {user_id: user_id, name: user.user_metadata.full_name},
                ])
                .select('*')
            if (errorClient) {
                Alert.alert("Error Client Insert", errorClient, [{text: "OK"}], {cancelable: false});
            }
            if (clients) {
                setClient(clients[0])
            }
        } else {
            setClient(clients[0])
        }
        let currentStartTime = selectedTime.start_time;

        for (let service of checkedServices) {
            const endTime = calculateEndTime(currentStartTime, service.duration);

            // Insert into appointments
            const {data, error} = await supabase.from("appointments").insert([
                {
                    worker_id: worker.id,
                    start_time: currentStartTime,
                    end_time: endTime,
                    price_final: service.price,
                    client_id: clients[0].id,
                    service_id: service.id,
                    date: selectedTime.date
                },
            ]);

            if (error) {
                Alert.alert("Error inserting appointment", error.message, [{text: "OK"}], {cancelable: false});
                break;
            }

            // Delete intersecting rows from workerAvailability for the specific date and time
            const {error: deleteError} = await supabase
                .from("workerAvailability")
                .delete()
                .eq("date", selectedTime.date) // Ensure we're only targeting rows for the chosen date
                .eq("worker_id", worker.id)
                .gte("start_time", currentStartTime)
                .lt("start_time", endTime); // Use service duration instead of SLOT_DURATION_MINUTES

            if (deleteError) {
                Alert.alert("Error deleting from workerAvailability", deleteError.message, [{text: "OK"}], {cancelable: false});
                break;
            }

            currentStartTime = endTime;
        }


        let {data: points, errorPoints} = await supabase
            .from('points')
            .select('*')
            .eq('user_id', user_id)
        if (errorPoints) {
            Alert.alert("Error Points Read", errorPoints.message, [{text: "OK"}], {cancelable: false});
        }
        if (points.length > 0) {
            let {data: points2, errorPoints2} = await supabase
                .from('points')
                .update({amount: points[0].amount + overallPrice * 50-pointsToUse})
                .eq('user_id', user_id)
            if (errorPoints2) {
                Alert.alert("Error Points Update", errorPoints.message, [{text: "OK"}], {cancelable: false});
            }


            const {data, errorHistory} = await supabase
                .from('point_history')
                .insert([
                    {business_id: business.id, user_id: user_id, amount: overallPrice * 50},
                ])
                .select()
            if (errorHistory) {
                Alert.alert("Error Points History", errorHistory.message, [{text: "OK"}], {cancelable: false});
            }
        } else {
            let {data: points2, errorPoints2} = await supabase
                .from('points')
                .insert([
                    {user_id: user_id, amount: overallPrice * 50-pointsToUse},
                ])
                .select('*')
            if (errorPoints2) {
                Alert.alert("Error Points Insert", errorPoints2.message, [{text: "OK"}], {cancelable: false});
            }

            const {data, errorHistory} = await supabase
                .from('point_history')
                .insert([
                    {business_id: business.id, user_id: user_id, amount: overallPrice * 50},
                ])
                .select()
            if (errorHistory) {
                Alert.alert("Error Points History", errorHistory.message, [{text: "OK"}], {cancelable: false});
            }
        }

        navigation.navigate("Home1");

        showMessage({
            message: "Success",
            description: "Your booking was successful!",
            type: "success", // can be "default", "success", "info", "danger", or "warning"
        });
    };

    // Revised calculateEndTime function
    const calculateEndTime = (startTime, duration) => {
        // Assumes startTime is a string in the format 'HH:MI:SSOF' and duration is in minutes
        const hours = parseInt(startTime.split(":")[0], 10);
        const minutes = parseInt(startTime.split(":")[1], 10);
        const timeZoneOffset = startTime.split(":")[2]; // like -07

        let totalMinutes = minutes + duration;
        let addedHours = Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;

        const endHours = hours + addedHours;
        const endTime = `${String(endHours).padStart(2, "0")}:${String(
            totalMinutes
        ).padStart(2, "0")}:${timeZoneOffset}`;

        return endTime;
    };

    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            {modalVisible && (
                <BillingModal
                    modalVisible={modalVisible}
                    onToggleSubmit={async () => {
                        setModalVisible(false);
                        calculatePrice();
                        setBillingEntered(true)
                    }}
                    onToggleCancel={() => {
                        setModalVisible(false);
                        navigation.navigate("DateTime", {
                            business: business,
                            rating: rating,
                            worker: worker,
                            user_id: user_id,
                            checkedServices: checkedServices,
                        });
                    }}
                    setModalVisible={setModalVisible}
                    city={city}
                    state={state}
                    country={country}
                    postalCode={postalCode}
                    line1={line1}
                    line2={line2}
                    setCity={setCity}
                    setState={setState}
                    setCountry={setCountry}
                    setPostalCode={setPostalCode}
                    setLine1={setLine1}
                    setLine2={setLine2}
                    user_id={user_id}
                    pointsToUse={pointsToUse}
                    setPointsToUse={setPointsToUse}
                    price={price}
                />
            )}
            <View style={{width: "100%", height: "100%"}}>
                <TouchableOpacity
                    style={{position: "absolute", top: 24, left: 24, zIndex: 999}}
                    onPress={() =>
                        navigation.navigate("DateTime", {
                            business: business,
                            rating: rating,
                            worker: worker,
                            user_id: user_id,
                            checkedServices: checkedServices,
                        })
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
                        Booking information
                    </Text>
                </View>
                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color={Color.text}
                        style={{alignContent: "center", top: 250}}
                    />
                ) : (
                    <>
                        <View style={{width: "100%", alignItems: "center", marginTop: 16}}>
                            <View style={{paddingHorizontal: 32, width: "100%", marginTop: 16}}>
                                <View>
                                    {checkedServices.map((service, index) => (
                                        <View
                                            key={index}
                                            style={{
                                                flex: 0,
                                                flexDirection: "row",
                                                backgroundColor: Color.darkslategray_100,
                                                marginTop: 16,
                                                borderWidth: 0,
                                                borderRadius: 8,
                                                paddingHorizontal: 16,
                                                paddingVertical: 16,
                                                alignItems: "center",
                                                shadowColor: "#000",
                                                shadowOffset: {width: 0, height: 4},
                                                shadowOpacity: 0.1,
                                                shadowRadius: 4,

                                                // Android elevation
                                                elevation: 5,
                                            }}
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
                                            <View style={{flex: 1, flexDirection: "column"}}>
                                                <Text
                                                    style={{
                                                        color: Color.text,
                                                        textAlign: "right",
                                                        fontSize: 14,
                                                        fontFamily: FontFamily.regular,
                                                    }}
                                                >
                                                    {service.duration} min
                                                </Text>
                                                <Text
                                                    style={{
                                                        color: Color.text,
                                                        textAlign: "right",
                                                        fontSize: 14,
                                                        fontFamily: FontFamily.regular,
                                                    }}
                                                >
                                                    ${service.price}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                        <View style={{position: "absolute", bottom: 64, left: 32, right: 32}}>
                            <View
                                style={{
                                    flex: 0,
                                    flexDirection: "row",
                                    backgroundColor: Color.darkslategray_100,
                                    marginTop: 16,
                                    borderWidth: 0,
                                    borderRadius: 8,
                                    paddingHorizontal: 16,
                                    paddingVertical: 32,
                                    alignItems: "center",
                                    shadowColor: "#000",
                                    shadowOffset: {width: 0, height: 4},
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,

                                    // Android elevation
                                    elevation: 5,
                                    marginBottom: 48,
                                }}
                            >
                                <View>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontFamily: FontFamily.regular,
                                            color: Color.text,
                                        }}
                                    >
                                        Total
                                    </Text>
                                </View>

                                <View style={{flex: 1, flexDirection: "column"}}>
                                    <Text
                                        style={{
                                            color: Color.text,
                                            textAlign: "right",
                                            fontSize: 21,
                                            fontFamily: FontFamily.regular,
                                        }}
                                    >
                                        ${overallPrice}
                                    </Text>
                                    <Text
                                        style={{
                                            color: Color.text,
                                            textAlign: "right",
                                            fontSize: 14,
                                            fontFamily: FontFamily.regular,
                                        }}
                                    >
                                        {formatDateToMonthDay(
                                            selectedTime.date,
                                            selectedTime.start_time
                                        )}
                                        , {get12HoursFormat(selectedTime.start_time)}
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    marginTop: 16,
                                    width: "100%",
                                    justifyContent: "space-between",
                                    flex: 0,
                                    flexDirection: "row",
                                }}
                            >
                                <TouchableOpacity
                                    style={{
                                        width: 120,
                                        height: 32,
                                        backgroundColor: Color.darkslategray_100,
                                        borderWidth: 0,
                                        borderRadius: 8,
                                        shadowColor: "#000",
                                        shadowOffset: {width: 0, height: 4},
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,

                                        // Android elevation
                                        elevation: 5,
                                        justifyContent: "center",
                                        marginRight: 64,
                                    }}
                                    onPress={() => navigation.navigate("Home1")}
                                >
                                    <Text
                                        style={{
                                            color: Color.text,
                                            fontSize: 16,
                                            fontFamily: FontFamily.medium,
                                            textAlign: "center",
                                        }}
                                    >
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        width: 120,
                                        height: 32,
                                        backgroundColor: Color.accentColor,
                                        borderWidth: 0,
                                        borderRadius: 8,
                                        shadowColor: "#000",
                                        shadowOffset: {width: 0, height: 4},
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,

                                        // Android elevation
                                        elevation: 5,
                                        justifyContent: "center",
                                    }}
                                    onPress={() => openPaymentSheet()}
                                >
                                    <Text
                                        style={{
                                            color: Color.text,
                                            fontSize: 16,
                                            fontFamily: FontFamily.medium,
                                            textAlign: "center",
                                        }}
                                    >
                                        Book
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}
