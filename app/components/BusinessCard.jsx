import * as React from "react";
import {View, Text, ImageBackground, TouchableOpacity, Alert, ActivityIndicator} from "react-native";
import { Image } from "expo-image";
import { ColorLight, ColorDark, BoxShadow } from "../../GlobalStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../ThemeContext";
import stylesLight from "./stylesLight";
import stylesDark from "./stylesDark";
import { supabase } from "../config/supabaseClient";

const BusinessComponent = ({ business, user_id, navigation }) => {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;

  const [isLiked, setIsLiked] = React.useState(false);
  const [averageRating, setAverageRating] = React.useState(null);
    const [averageLoading, setAverageLoading] = React.useState(false);
  /*const fetchAverageRating = async () => {
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
        setAverageRating("-");
        business.rating = 0;
      }
    } catch (error) {
      Alert.alert("Error", error.message, [{text: "OK"}], {cancelable: false});
    }
  };*/
  const fetchAverageRating = async () => {
    setAverageLoading(true);
    let { data, error } = supabase
        .rpc('avg_rating', { business_id: business.id }).then(response => {
          if(response.data === null){
            setAverageRating("-")
            setAverageLoading(false)
          }
          else{
            setAverageRating(response.data.toPrecision(2))
            setAverageLoading(false)
          }
        });
    if (error) {
      Alert.alert("Error", error.message, [{text: "OK"}], {
        cancelable: false,
      });
    }
  }

  React.useEffect(() => {
    fetchAverageRating();
  }, [business.id]);

  React.useEffect(() => {
    const checkIfLiked = async () => {
      const { data } = await supabase
        .from("saved")
        .select("*")
        .eq("saved_id", business.id)
        .eq("user_id", user_id);

      if (data && data.length > 0) {
        setIsLiked(true);
      }
    };

    checkIfLiked();
  }, [business.id, user_id]);

  const toggleLike = async () => {
    if (isLiked) {
      // Delete from saved table
      await supabase
        .from("saved")
        .delete()
        .eq("saved_id", business.id)
        .eq("user_id", user_id);
    } else {
      // Add to saved table
      await supabase
        .from("saved")
        .insert([{ saved_id: business.id, user_id: user_id }]);
    }

    // Toggle the state
    setIsLiked(!isLiked);
  };

  return (
    <View style={[styles.frameParent, BoxShadow]}>
      <View style={styles.frameGroup}>
        <ImageBackground
          style={styles.frameImage}
          resizeMode="cover"
          source={{ uri: business.image[0] }}
          //source={require("../assets/barbershop-card.webp")}
        >
          <View style={[styles.frameContainer, styles.frameContainerFlexBox]}>
            <View style={styles.bookWrapperShadowBox1}>
              <Image
                style={styles.frameChild}
                contentFit="cover"
                source={require("../../assets/polygon-1.png")}
              />
              {averageLoading ? (
                  <ActivityIndicator
                      size="small"
                      color={Color.text}
                      style={{alignContent: "center", top: "-50%"}}
                  />
              ) : (
                  <Text style={[styles.text, styles.textTypo]}>
                    {averageRating}
                  </Text>
              )}
            </View>
            <TouchableOpacity style={styles.likeButton} onPress={toggleLike}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                style={styles.iconHeart}
                contentFit="cover"
                //source={require("../assets/-icon-heart.png")}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[styles.megaharoshWrapper, styles.navBarUpperSpaceBlock]}
          >
            <Text style={[styles.megaharosh, styles.textTypo]}>
              {business.name}
            </Text>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.frameView}>
        <View style={styles.armandoJunctionsCarolyneberParent}>
          <Ionicons
            name="location-sharp"
            size={14}
            color={Color.text}
            style={styles.locationIcon}
          />
          <Text
            style={[styles.armandoJunctionsCarolyneber, styles.address]}
            numberOfLines={1}
          >
            {business.addresses.line_1}, {business.addresses.cities.name},{" "}
            {business.addresses.states.state_code},{" "}
            {business.addresses.states.country_code}
          </Text>
          <Text style={[styles.barbershop, styles.type]}>{business.type}</Text>
          <Text style={[styles.barbershop1, styles.distance]}>
            ~{business.distance || "Calculating..."} km
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookWrapper, styles.bookWrapperShadowBox]}
          onPress={() =>
            navigation.navigate("Details", {
              business: business,
              rating: averageRating,
              user_id: user_id,
            })
          }
        >
          <Text style={styles.book}>Open</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default BusinessComponent;
