import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  RefreshControl, Alert,
} from "react-native";
import { BlurView } from "expo-blur";
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
} from "../../../GlobalStyles";
import { TextInput } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as Location from "expo-location";
import { supabase } from "../../config/supabaseClient";
import { useTheme } from "../../ThemeContext";
import { getDistance, getPreciseDistance } from "geolib";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import ScheduleModal from "../../components/ScheduleModal";
import ServicesModal from "../../components/ServicesModal";
import Carousel from "react-native-snap-carousel";

export default function ProfileInfoScreen({ route, navigation }) {
  const { business, user_id } = route.params;
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [showScheduleModal, setShowScheduleModal] = React.useState(false);
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [averageRating, setAverageRating] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [localBusinessData, setLocalBusinessData] = React.useState(business);

  React.useEffect(() => {
    fetchAverageRating();
  }, [business.id, user_id]);

  const fetchBusinessData = async () => {
    try {
      const { data: businesses, error } = await supabase
        .from("businesses")
        .select(
          "*, addresses(*, cities(id, name), states(id, name), countries(id, name)), business_hours(*)"
        )
        .eq("id", business.id); // Adjust the query according to your needs

      if (error) {
        throw error;
      }
      setLocalBusinessData(businesses[0]);
    } catch (error) {
      Alert.alert("Error", error.message, [{text: "OK"}], {cancelable: false});
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchBusinessData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const fetchAverageRating = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("business_id", business.id);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const totalRatings = data.reduce((acc, curr) => acc + curr.rating, 0);
        const average = (totalRatings / data.length).toFixed(1);
        setAverageRating(average);
        business.rating = average;
      } else {
        setAverageRating("0");
        business.rating = 0;
      }
    } catch (error) {
      Alert.alert("Error fetching average rating", error.message, [{text: "OK"}], {cancelable: false});
    }
  };

  const renderItem = ({ item, index }) => {
    return <Image source={{ uri: item }} style={styles.frameDetailsImage} />;
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {showScheduleModal && localBusinessData && (
        <ScheduleModal
          show={showScheduleModal}
          schedule={localBusinessData.business_hours[0].schedule}
          onToggleCancel={() => {
            setShowScheduleModal(!showScheduleModal);
          }}
        />
      )}

      <View style={{ width: "100%", height: "100%" }}>
        <TouchableOpacity
          style={{ position: "absolute", top: 24, left: 24, zIndex: 999 }}
          onPress={() =>
            navigation.navigate("Profile1", {
              editedBusiness: localBusinessData,
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
            {localBusinessData.name}
          </Text>
        </View>
        <TouchableOpacity
          style={{ position: "absolute", top: 24, right: 24, zIndex: 999 }}
          onPress={() =>
            navigation.navigate("EditProfile", {
              business: localBusinessData,
              user_id: user_id,
            })
          }
        >
          <Ionicons name="pencil" size={26} color={Color.text} />
        </TouchableOpacity>
        {localBusinessData && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.carouselContainer}>
              <Carousel
                data={localBusinessData.image}
                renderItem={renderItem}
                sliderWidth={Dimensions.get("window").width}
                itemWidth={Dimensions.get("window").width}
                layout={"default"}
                onSnapToItem={(index) => setActiveSlide(index)}
              />
              <View
                style={{
                  width: "100%",
                  position: "absolute",
                  left: 0,
                  right: 0,
                  alignItems: "center",
                  justifyContent: "flex-end",
                  aspectRatio: 18 / 9,
                  pointerEvents: "none",
                }}
              >
                <View style={styles.paginationContainer}>
                  {localBusinessData.image.map((image, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        index === activeSlide
                          ? styles.activeDot
                          : styles.inactiveDot,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.ratingContainer}>
                <Image
                  style={styles.ratingImage}
                  source={require("../../../assets/Polygon2.png")}
                />
                <Text style={styles.ratingText}>{averageRating}</Text>
              </View>
            </View>
            <View
              style={{
                width: "100%",
              }}
            >
              <View
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor: Color.darkslategray_100,
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 16,
                    paddingBottom: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 21,
                      fontFamily: FontFamily.medium,
                      color: Color.text,
                      marginBottom: 8,
                    }}
                  >
                    About us
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: FontFamily.regular,
                    color: Color.text,
                    paddingHorizontal: 16,
                  }}
                >
                  {localBusinessData.description}
                </Text>
              </View>

              <View
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor: Color.darkslategray_100,
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 16,
                    paddingBottom: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 21,
                      fontFamily: FontFamily.medium,
                      color: Color.text,
                      marginBottom: 8,
                    }}
                  >
                    Address
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: FontFamily.regular,
                    color: Color.text,
                    paddingHorizontal: 16,
                  }}
                >
                  {localBusinessData.addresses.line_1},{" "}
                  {localBusinessData.addresses.cities.name},{" "}
                  {localBusinessData.addresses.states.name},{" "}
                  {localBusinessData.addresses.countries.name}
                </Text>
              </View>
              <View
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor: Color.darkslategray_100,
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 16,
                    paddingBottom: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 21,
                      fontFamily: FontFamily.medium,
                      color: Color.text,
                      marginBottom: 8,
                    }}
                  >
                    Working hours
                  </Text>
                </View>
                <TouchableOpacity
                  style={
                    localBusinessData.business_hours.length === 0
                      ? {
                          opacity: 0.5,
                          padding: 14,
                          backgroundColor: Color.darkslategray_100,
                          justifyContent: "center",
                          borderWidth: 0,
                          borderRadius: 8,
                          marginTop: 16,
                          marginHorizontal: 16,
                        }
                      : {
                          padding: 14,
                          backgroundColor: Color.darkslategray_100,
                          justifyContent: "center",
                          borderWidth: 0,
                          borderRadius: 8,
                          marginTop: 16,
                          marginHorizontal: 16,
                        }
                  }
                  disabled={localBusinessData.business_hours.length === 0}
                  onPress={() => setShowScheduleModal(true)}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: Color.text,
                      fontSize: 14,
                      fontFamily: FontFamily.medium,
                    }}
                  >
                    {localBusinessData.business_hours.length === 0
                      ? "Not set"
                      : "Show schedule"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
