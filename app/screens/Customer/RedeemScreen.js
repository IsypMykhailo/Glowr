import * as React from "react";
import {
    StyleSheet,
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    RefreshControl, ActivityIndicator, Alert,
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
    Border, BoxShadow,
} from "../../../GlobalStyles";
import {Stack, useRouter} from "expo-router";
import {ScrollView, TextInput} from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import {useTheme} from "../../ThemeContext";
import {supabase} from "../../config/supabaseClient";
import Wallet from "../../../assets/wallet.svg";
import moment from "moment";
/*import { LogLevel, OneSignal } from "react-native-onesignal";

// Remove this method to stop OneSignal Debugging
OneSignal.Debug.setLogLevel(LogLevel.Verbose);

// OneSignal Initialization
OneSignal.initialize("5fc328cb-c117-4225-b370-bf1004d83cb0");

// requestPermission will show the native iOS or Android notification permission prompt.
// We recommend removing the following code and instead using an In-App Message to prompt for notification permission
OneSignal.Notifications.requestPermission(true);

// Method for listening for notification clicks
OneSignal.Notifications.addEventListener("click", (event) => {
  console.log("OneSignal: notification clicked:", event);
});*/

export default function ProfileScreen({route, navigation}) {
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    const styles = theme === "light" ? stylesLight : stylesDark;
    const [user, setUser] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [historyLoading, setHistoryLoading] = React.useState(false);
    const [history, setHistory] = React.useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [points, setPoints] = React.useState([]);

    React.useEffect(() => {
        setLoading(true);
        getCurrentUser();
        setLoading(false);
    }, []);
    React.useEffect(() => {
        setLoading(true);
        fetchHistory();
        setLoading(false)
        setHistoryLoading(true);
        fetchPoints();
        setHistoryLoading(false);
    }, [user]);

    const getCurrentUser = async () => {
        const {
            data: {user},
        } = await supabase.auth.getUser();
        setUser(user);
    };

    const fetchHistory = async () => {
        let {data: history, error} = await supabase
            .from("point_history")
            .select("*, businesses(*)")
            .eq("user_id", user.id);

        // Check if notifications is null or undefined; if so, set it to an empty array
        if (!history) {
            history = [];
        }
        const reversedHistory = history.reverse();
        setHistory(reversedHistory);
    };

    const fetchPoints = async () => {
        if (user.id !== undefined) {
            let {data: points, error} = await supabase
                .from('points')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                Alert.alert("Error", error.message, [{text: "OK"}], {cancelable: false});
                console.error(error)
            }
            if (points) {
                setPoints(points[0]);
            }
        }
    }

    function formatTimestamp(timestamp) {
        return moment(timestamp).format('MMM D, YYYY, HH:mm');
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setLoading(true);
        fetchHistory();
        setLoading(false)
        setHistoryLoading(true);
        fetchPoints();
        setHistoryLoading(false);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <View>
                <View>
                    <Text style={{
                        fontSize: 28,
                        fontFamily: FontFamily.medium,
                        color: Color.text,
                        textAlign: 'center',
                        marginTop: 24,
                    }}>Reward Points</Text>
                </View>
                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color={Color.text}
                        style={{alignContent: "center", top: 250}}
                    />
                ) : (
                    <>
                        <View style={{
                            flex: 0,
                            flexDirection: 'row',
                            marginTop: 32,
                            paddingHorizontal: 32,
                            justifyContent: 'center',
                        }}>
                            <View style={{
                                marginRight: 16,
                            }}>
                                <Wallet width={63} height={48}/>
                            </View>
                            <View>
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: FontFamily.regular,
                                    color: Color.text,
                                }}>You have total amount of</Text>
                                <View
                                    style={{
                                        flex: 0,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                    <Text style={{
                                        fontSize: 26,
                                        fontFamily: FontFamily.medium,
                                        color: Color.accentColor,
                                    }}>{points.amount || 0} points </Text>
                                    <Text style={{
                                        fontSize: 14,
                                        fontFamily: FontFamily.regular,
                                        color: Color.text,
                                    }}>≈ CAD {points.amount / 1000 || 0}</Text>
                                </View>

                            </View>
                        </View>
                        <View
                            style={{
                                marginTop: 32,
                                backgroundColor: Color.darkslategray_100,
                                borderWidth: 0,
                                borderTopLeftRadius: 32,
                                borderTopRightRadius: 32,
                                width: "100%",
                                alignItems: "center",
                                paddingTop: 16,
                                paddingHorizontal: 32,
                                paddingBottom: 325,
                            }}
                        >
                            <View
                                style={{flex: 0, flexDirection: "row", alignItems: "center"}}
                            >
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontFamily: FontFamily.medium,
                                        color: Color.text,
                                        marginLeft: 4,
                                    }}
                                >
                                    Points history
                                </Text>
                            </View>
                            <View style={{height: "100%"}}>
                                {historyLoading ? (
                                    <ActivityIndicator
                                        size="large"
                                        color={Color.text}
                                        style={{alignContent: "center", top: 250}}
                                    />
                                ) : history.length > 0 ? (
                                    <ScrollView
                                        showsVerticalScrollIndicator={false}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={() => {
                                                    onRefresh();
                                                }}
                                            />
                                        }
                                    >
                                        {history.map((history) => (
                                            <View
                                                key={history.id}
                                                style={[{
                                                    backgroundColor: Color.historyColor,
                                                    borderWidth: 0,
                                                    borderRadius: 8,
                                                    flex: 0,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: 12,
                                                    marginTop: 16,
                                                    marginHorizontal:14,
                                                }, BoxShadow]}
                                            >
                                                <View
                                                    style={{
                                                        width: 60,
                                                        height: 60,
                                                        borderWidth: 0,
                                                        borderRadius: "100%",
                                                        backgroundColor: Color.darkslategray_100,
                                                        overflow: "hidden",
                                                        marginRight: 8,
                                                    }}
                                                >
                                                    <ImageBackground
                                                        resizeMode="cover"
                                                        source={{
                                                            uri: history.businesses.image[0],
                                                        }}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                    ></ImageBackground>
                                                </View>
                                                <View style={{
                                                    flex: 0,
                                                    flexDirection: "column",
                                                    justifyContent: "space-between",
                                                    marginRight: 8,
                                                    flexShrink: 1
                                                }}>
                                                    <Text
                                                        style={{
                                                            fontSize: 16,
                                                            fontFamily: FontFamily.regular,
                                                            color: Color.text,
                                                        }}
                                                    >
                                                        {history.businesses.name}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            fontSize: 12,
                                                            fontFamily: FontFamily.light,
                                                            color: Color.text,
                                                        }}
                                                    >
                                                        You have successfully booked this place
                                                        at {formatTimestamp(history.created_at)}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text
                                                        style={{
                                                            fontSize: 16,
                                                            fontFamily: FontFamily.regular,
                                                            color: Color.accentColor,
                                                        }}
                                                    >
                                                        + {history.amount} points
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                        <View style={{height:32}}></View>
                                    </ScrollView>
                                ) : (
                                    <ScrollView
                                        showsVerticalScrollIndicator={false}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={() => {
                                                    onRefresh();
                                                }}
                                            />
                                        }
                                    >
                                    <View style={{height: "100%", marginTop: 200}}>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: FontFamily.regular,
                                                color: Color.text,
                                                textAlign: "center",
                                            }}
                                        >
                                            You don't have any point history yet.
                                        </Text>
                                    </View>
                                    </ScrollView>
                                )}
                            </View>
                        </View>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}
