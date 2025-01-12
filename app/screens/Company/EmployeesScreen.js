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
import { Image } from "expo-image";
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
import { Stack, useRouter } from "expo-router";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { SelectList } from "react-native-dropdown-select-list";
import { useTheme } from "../../ThemeContext";
import { supabase } from "../../config/supabaseClient";

export default function EmployeesScreen({ navigation }) {
  const [selected, setSelected] = React.useState("");
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [fetchError, setFetchError] = React.useState(null);
  const [user, setUser] = React.useState({});
  const [employees, setEmployees] = React.useState([]);
  const [business, setBusiness] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const windowHeight = Dimensions.get("window").height;
  //const { savedBusinesses } = useSaved();
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchBusiness = async () => {
    let { data: businesses, error } = await supabase
      .from("businesses")
      .select(`*`)
      .eq("user_id", user.id);
    if (error) {
      Alert.alert("Error", error, [{ text: "OK" }], { cancelable: false });
    }
    setBusiness(businesses[0]);
  };

  const fetchEmployees = async () => {
    setRefreshing(true);
    let { data: workers, error } = await supabase
      .from("workers")
      .select(`*, businesses(*), services(*)`)
      .eq("business_id", business.id);

    if (error) {
      setFetchError("Could not fetch the businesses");
      Alert.alert("Error", error, [{ text: "OK" }], { cancelable: false });
    }
    if (workers) {
      setEmployees(workers);
      setFetchError(null);
    }
    setRefreshing(false);
  };
  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  React.useEffect(() => {
    setLoading(true);
    getCurrentUser();
  }, []);

  React.useEffect(() => {
    if (user && user.id) {
      fetchBusiness();
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (business && business.id) {
      fetchEmployees();
    }
  }, [business]);
  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchEmployees}
            />
          }
        >
          <View style={{ paddingLeft: 24, marginTop: 32 }}>
            <Text
              style={{
                fontSize: 28,
                //fontWeight: "bold",
                fontFamily: FontFamily.bold,
                color: Color.text,
              }}
            >
              Employees
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={Color.text}
              style={{ alignContent: "center", top: windowHeight / 3 }}
            />
          ) : (
            <View
              style={{
                paddingBottom: 32,
              }}
            >
              {employees.length > 0 ? (
                <View style={{ marginTop: 32, marginHorizontal: 32 }}>
                  {employees.map((employee, index) => (
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
                          padding: 8,
                        },
                        BoxShadow,
                      ]}
                      key={index}
                    >
                      <View
                        style={{
                          width: 64,
                          height: 64,
                          borderWidth: 0,
                          borderRadius: "100%",
                          overflow: "hidden",
                        }}
                      >
                        <ImageBackground
                          resizeMode="cover"
                          source={{ uri: employee.image }}
                          style={{
                            width: "100%",
                            height: "100%",
                          }}
                        ></ImageBackground>
                      </View>
                      <View
                        style={{
                          justifyContent: "center",
                          marginHorizontal: 16,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 21,
                            fontFamily: FontFamily.medium,
                            color: Color.text,
                          }}
                        >
                          {employee.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: FontFamily.regular,
                            color: Color.text,
                            marginTop: 4,
                          }}
                        >
                          {employee.role}
                        </Text>
                      </View>
                      <View style={{ marginLeft: "auto", marginRight: 0 }}>
                        <TouchableOpacity
                          style={[
                            {
                              borderWidth: 0,
                              borderRadius: 8,
                              backgroundColor: Color.accentColor,
                              justifyContent: "center",
                              alignItems: "center",
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                            },
                            BoxShadow,
                          ]}
                          onPress={() =>
                            navigation.navigate("ManageEmployee", {
                              business: business,
                              user_id: user.id,
                              worker: employee,
                            })
                          }
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: FontFamily.medium,
                              color: Color.white,
                              textAlign: "center",
                            }}
                          >
                            Manage
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={{
                      flex: 0,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 8,
                    }}
                    onPress={() =>
                      navigation.navigate("AddEmployee", {
                        business: business,
                        user_id: user.id,
                      })
                    }
                  >
                    <Ionicons name="add" size={32} color={Color.text} />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: FontFamily.regular,
                        color: Color.text,
                      }}
                    >
                      Add employee
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={{
                    marginHorizontal: 60,
                    alignItems: "center",
                    marginTop: windowHeight / 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: FontFamily.regular,
                      color: Color.text,
                    }}
                  >
                    You don't have any employees yet.
                  </Text>
                  <TouchableOpacity
                    style={[
                      {
                        marginTop: 16,
                        padding: 10,
                        borderWidth: 0,
                        borderRadius: 8,
                        backgroundColor: Color.accentColor,
                      },
                      BoxShadow,
                    ]}
                    onPress={() =>
                      navigation.navigate("AddEmployee", {
                        business: business,
                        user_id: user.id,
                      })
                    }
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: FontFamily.medium,
                        color: Color.white,
                        textAlign: "center",
                      }}
                    >
                      Add employee
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
