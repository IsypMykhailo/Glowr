import * as React from "react";
import {
    StyleSheet,
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    Modal,
    Dimensions, Alert, ActivityIndicator,
} from "react-native";
import {BlurView} from "expo-blur";
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
import {TextInput} from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as Location from "expo-location";
import {supabase} from "../../config/supabaseClient";
import {useTheme} from "../../ThemeContext";
import {getDistance, getPreciseDistance} from "geolib";
import stylesLight from "../../components/stylesLight";
import stylesDark from "../../components/stylesDark";
import ScheduleModal from "../../components/ScheduleModal";
import ServicesModal from "../../components/ServicesModal";
import Carousel from "react-native-snap-carousel";

export default function DetailsScreen({route, navigation}) {
    const {business, rating, user_id} = route.params;
    const {theme} = useTheme();
    const Color = theme === "light" ? ColorLight : ColorDark;
    const styles = theme === "light" ? stylesLight : stylesDark;
    const [isLiked, setIsLiked] = React.useState(false);
    const [showScheduleModal, setShowScheduleModal] = React.useState(false);
    const [showServicesModal, setShowServicesModal] = React.useState(false);
    const [activeSlide, setActiveSlide] = React.useState(0);
    const [starRating, setStarRating] = React.useState(null);
    const [review, setReview] = React.useState("");
    const [allReviews, setAllReviews] = React.useState([]);
    const [user, setUser] = React.useState(null);
    const [reviewsLoading, setReviewsLoading] = React.useState(false);
    const [averageRating, setAverageRating] = React.useState(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [numCommentsFetched, setNumCommentsFetched] = React.useState(3);
    const windowHeight = Dimensions.get("window").height;
    const [averageLoading, setAverageLoading] = React.useState(false);
    //console.log(business)

    React.useEffect(() => {
        const checkIfLiked = async () => {
            const {data} = await supabase
                .from("saved")
                .select("*")
                .eq("saved_id", business.id)
                .eq("user_id", user_id);

            if (data && data.length > 0) {
                setIsLiked(true);
            }
        };

        fetchAllReviews();
        //fetchAverageRating();
        checkIfLiked();
    }, [business.id, user_id]);

    const fetchAllReviews = async () => {
        setReviewsLoading(true);
        const {data, error} = await supabase
            .from("reviews")
            .select("*")
            .eq("business_id", business.id)
            .range(0, numCommentsFetched - 1);
        if (error) {
            Alert.alert("Error", error.message, [{text: "OK"}], {
                cancelable: false,
            });
        }
        if (data && data.length > 0) {
            setAllReviews(data);
        }
        setReviewsLoading(false);
    }

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
        getCurrentUser();
    },[]);

    React.useEffect(() => {
        fetchAllReviews();
    }, [numCommentsFetched]);

    const getCurrentUser = async () => {
        const {
            data: {user},
        } = await supabase.auth.getUser();
        setUser(user);
    };

    const renderItem = ({item, index}) => {
        return <Image source={{uri: item}} style={styles.frameDetailsImage}/>;
    };

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
                .insert([{saved_id: business.id, user_id: user_id}]);
        }

        // Toggle the state
        setIsLiked(!isLiked);
    };

    const convertToDate = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth() returns a zero-based month, so we add 1
        const day = date.getDate();

        let formattedDate = `${year}.${month < 10 ? '0' + month : month}.${day < 10 ? '0' + day : day}`;
        return formattedDate;
    }

    const submitReview = async () => {
        setIsSubmitting(true);
        const {data, error} = await supabase
            .from("reviews")
            .insert([{
                business_id: business.id,
                author_id: user_id,
                rating: starRating,
                text: review,
                author_name: user.user_metadata.full_name
            }]);
        if (error) {
            Alert.alert("Error", error.message, [{text: "OK"}], {
                cancelable: false,
            });
        } else {
            Alert.alert("Success", "Review submitted successfully", [{text: "OK"}], {
                cancelable: false,
            });
            setTimeout(() => {
                setIsSubmitting(false);
            }, 5000);
            await fetchAllReviews();
        }
    }

    const chooseStar = (currentStar) => {
        const integerPart = Math.floor(averageRating);
        const decimalPart = averageRating - integerPart;

        if (currentStar <= integerPart) {
            return 'star';
        } else if (currentStar === integerPart + 1 && decimalPart >= 0.5) {
            return 'star-half';
        } else {
            return 'star-outline';
        }
    }

    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            {showScheduleModal && (
                <ScheduleModal
                    show={showScheduleModal}
                    schedule={business.business_hours[0].schedule}
                    onToggleCancel={() => {
                        setShowScheduleModal(!showScheduleModal);
                    }}
                />
            )}

                <View style={{width: "100%", height: "100%"}}>
                    <TouchableOpacity
                        style={{position: "absolute", top: 24, left: 24, zIndex: 999}}
                        onPress={() => navigation.navigate("Home1")}
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
                            {business.name}
                        </Text>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.carouselContainer}>
                            <Carousel
                                data={business.image}
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
                                    {business.image.map((image, index) => (
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
                                {averageLoading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={Color.text}
                                        style={{alignContent: "center", top: "-50%"}}
                                    />
                                ) : (
                                    <Text style={styles.ratingText}>{averageRating}</Text>
                                )}
                            </View>
                        </View>
                        <View style={{width: "100%"}}>
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
                                <TouchableOpacity onPress={toggleLike}>
                                    <Ionicons
                                        name={isLiked ? "heart" : "heart-outline"}
                                        size={24}
                                        style={styles.iconHeart}
                                        contentFit="cover"
                                        //source={require("../assets/-icon-heart.png")}
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontFamily: FontFamily.regular,
                                    color: Color.text,
                                    paddingHorizontal: 16,
                                }}
                            >
                                {business.description}
                            </Text>
                            <View
                                style={{
                                    width: "100%",
                                    flex: 1,
                                    flexDirection: "row",
                                    borderBottomWidth: 2,
                                    borderColor: Color.darkslategray_100,
                                    marginTop: 16,
                                    paddingHorizontal: 16,
                                }}
                            >
                                <View
                                    style={{
                                        width: "50%",
                                        padding: 16,
                                        alignItems: "flex-start",
                                        justifyContent: "center",
                                        borderRightWidth: 1,
                                        borderColor: Color.darkslategray_100,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontFamily: FontFamily.regular,
                                            color: Color.text,
                                            width: 150,
                                            letterSpacing: 0.4,
                                        }}
                                    >
                                        {business.addresses.line_1}, {business.addresses.cities.name},{" "}
                                        {business.addresses.states.state_code},{" "}
                                        {business.addresses.states.country_code}
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        width: "50%",
                                        padding: 16,
                                        alignItems: "flex-end",
                                        justifyContent: "center",
                                        borderLeftWidth: 1,
                                        borderColor: Color.darkslategray_100,
                                    }}
                                >
                                    <Text
                                        style={{
                                            //textAlign: "right",
                                            fontSize: 18,
                                            fontFamily: FontFamily.regular,
                                            color: Color.text,
                                            letterSpacing: 0.4,
                                        }}
                                    >
                                        Working hours
                                    </Text>
                                    <TouchableOpacity
                                        style={
                                            business.business_hours.length === 0
                                                ? {
                                                    opacity: 0.5,
                                                    padding: 14,
                                                    backgroundColor: Color.darkslategray_100,
                                                    justifyContent: "center",
                                                    borderWidth: 0,
                                                    borderRadius: 8,
                                                    marginTop: 16,
                                                }
                                                : {
                                                    padding: 14,
                                                    backgroundColor: Color.darkslategray_100,
                                                    justifyContent: "center",
                                                    borderWidth: 0,
                                                    borderRadius: 8,
                                                    marginTop: 16,
                                                }
                                        }
                                        disabled={business.business_hours.length === 0}
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
                                            {business.business_hours.length === 0
                                                ? "Not set"
                                                : "Show schedule"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{padding: 16}}>
                                <Text
                                    style={{
                                        color: Color.text,
                                        fontSize: 21,
                                        fontFamily: FontFamily.medium,
                                    }}
                                >
                                    Barbers available
                                </Text>
                                <ScrollView
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    {business.workers.map((worker) => (
                                        <View
                                            style={{
                                                width: 150,
                                                backgroundColor: Color.darkslategray_100,
                                                borderWidth: 0,
                                                borderRadius: 8,
                                                marginTop: 16,
                                                marginRight: 16,
                                                shadowColor: "#000",
                                                shadowOffset: {width: 0, height: 4},
                                                shadowOpacity: 0.1,
                                                shadowRadius: 4,

                                                // Android elevation
                                                elevation: 5,
                                                padding: 8,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                            key={worker.id}
                                        >
                                            {showServicesModal && (
                                                <ServicesModal
                                                    show={showServicesModal}
                                                    services={worker.services}
                                                    onToggleCancel={() => {
                                                        setShowServicesModal(!showServicesModal);
                                                    }}
                                                />
                                            )}
                                            <View
                                                style={{
                                                    width: 84,
                                                    height: 84,
                                                    borderWidth: 0,
                                                    borderRadius: "50%",
                                                    backgroundColor: Color.background,
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <ImageBackground
                                                    resizeMode="cover"
                                                    source={{uri: worker.image}}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                    }}
                                                ></ImageBackground>
                                            </View>
                                            <Text
                                                style={{
                                                    fontSize: 18,
                                                    fontFamily: FontFamily.medium,
                                                    color: Color.text,
                                                    marginTop: 4,
                                                }}
                                            >
                                                {worker.name}
                                            </Text>
                                            <TouchableOpacity
                                                style={{marginTop: 8}}
                                                onPress={() => setShowServicesModal(true)}
                                            >
                                                <Text
                                                    style={{
                                                        textDecorationLine: "underline",
                                                        fontSize: 16,
                                                        fontFamily: FontFamily.light,
                                                        color: Color.text,
                                                    }}
                                                >
                                                    Services
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={{
                                                    width: "100%",
                                                    backgroundColor: Color.accentColor,
                                                    borderWidth: 0,
                                                    borderRadius: 8,
                                                    padding: 10,
                                                    justifyContent: "center",
                                                    marginTop: 16,
                                                }}
                                                onPress={() =>
                                                    navigation.navigate("ChooseService", {
                                                        worker: worker,
                                                        user_id: user_id,
                                                        business: business,
                                                        rating: rating,
                                                    })
                                                }
                                            >
                                                <Text
                                                    style={{
                                                        textAlign: "center",
                                                        fontSize: 16,
                                                        fontFamily: FontFamily.medium,
                                                        color: Color.white,
                                                    }}
                                                >
                                                    Book
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                        <View style={{paddingHorizontal: 16, marginBottom: 32}}>
                            <Text style={{
                                fontSize: 21,
                                fontFamily: FontFamily.medium,
                                color: Color.text,
                                marginTop: 16,
                                marginBottom: 4
                            }}>Rate the barbershop</Text>
                            <Text style={{
                                fontSize: 12,
                                fontFamily: FontFamily.light,
                                color: Color.text,
                                marginBottom: 16
                            }}>Share your experience</Text>
                            <View style={{
                                flex: 0,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                marginBottom: 16
                            }}>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <TouchableOpacity key={rating} onPress={() => setStarRating(rating)}>
                                        <Ionicons name={starRating >= rating ? "star" : "star-outline"} size={32}
                                                  style={starRating >= rating ? {color: Color.accentColor} : {color: Color.text}}/>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={[{
                                    backgroundColor: ColorDark.white,
                                    color: "black",
                                    borderWidth: 0,
                                    borderRadius: 8,
                                    //width: 296,
                                    height: 150,
                                    fontFamily: FontFamily.regular,
                                    fontSize: 16,
                                    paddingLeft: 16,
                                    marginBottom: 16
                                }, BoxShadow]}
                                multiline={true}
                                numberOfLines={4}
                                placeholder="Write a review"
                                placeholderTextColor={ColorDark.gray}
                                onChangeText={(text) => setReview(text)}
                                value={review}
                            />
                            <TouchableOpacity style={isSubmitting ? {
                                padding: 8,
                                backgroundColor: Color.accentColor,
                                borderWidth: 0,
                                borderRadius: 8,
                                disabled: true,
                                opacity: 0.5
                            } : {padding: 8, backgroundColor: Color.accentColor, borderWidth: 0, borderRadius: 8}}
                                              onPress={submitReview}>
                                <Text style={
                                    {
                                        fontSize: 16,
                                        fontFamily: FontFamily.medium,
                                        color: Color.white,
                                        textAlign: 'center'
                                    }
                                }>
                                    Submit
                                </Text>
                            </TouchableOpacity>

                            <>
                                <Text style={{
                                    fontSize: 21,
                                    fontFamily: FontFamily.medium,
                                    color: Color.text,
                                    marginTop: 16,
                                    marginBottom: 4
                                }}>Ratings and reviews</Text>
                                <View style={{
                                    flex: 0,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 16,
                                }}>
                                    {averageLoading ? (
                                        <ActivityIndicator
                                            size="large"
                                            color={Color.text}
                                            style={{alignContent: "center"}}
                                        />
                                    ) : (
                                        <View style={{
                                            flex: 0,
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginRight: 34
                                        }}>
                                            <Text style={{
                                                fontSize: 61,
                                                fontFamily: FontFamily.medium,
                                                color: Color.text,
                                                textAlign: 'center',
                                                marginBottom: 10
                                            }}>{averageRating}</Text>
                                            <View style={{
                                                flex: 0,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingHorizontal: 8,
                                                marginBottom: 16
                                            }}>
                                                {[1, 2, 3, 4, 5].map((currentStar) => (
                                                    <View key={currentStar}
                                                          style={currentStar === 5 ? {} : {marginRight: 12}}>
                                                        <Ionicons
                                                            name={chooseStar(currentStar)}
                                                            size={16}
                                                            style={chooseStar(currentStar) === "star" || chooseStar(currentStar) === "star-half" ? {color: Color.accentColor} : {color: Color.text}}/>
                                                    </View>
                                                ))}
                                            </View>
                                            <Text style={{
                                                fontSize: 14,
                                                fontFamily: FontFamily.light,
                                                color: Color.text,
                                            }}>{allReviews.length} reviews</Text>
                                        </View>
                                    )}
                                    {reviewsLoading ? (
                                        <ActivityIndicator
                                            size="large"
                                            color={Color.text}
                                            style={{alignContent: "center"}}
                                        />
                                    ) : (
                                    allReviews.length > 0 && (
                                        <View
                                            style={[{
                                                backgroundColor: Color.darkslategray_100,
                                                padding: 8,
                                                borderWidth: 0,
                                                borderRadius: 8,
                                                height: '100%',
                                                marginTop: 16,
                                                flex: 1,
                                            }, BoxShadow]}>
                                            <View style={{
                                                flex: 0,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: 8,
                                            }}>
                                                <Text style={{
                                                    fontSize: 16,
                                                    fontFamily: FontFamily.regular,
                                                    color: Color.text,
                                                }}>{allReviews[0].author_name}</Text>
                                                <Text style={{
                                                    fontSize: 10,
                                                    fontFamily: FontFamily.light,
                                                    color: Color.text,
                                                }}>{convertToDate(allReviews[0].created_at)}</Text>
                                            </View>
                                            <View style={{
                                                flex: 0,
                                                flexDirection: 'row',
                                                //justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: 8,
                                            }}>
                                                {[1, 2, 3, 4, 5].map((rating) => (
                                                    <View key={rating} style={rating === 5 ? {} : {marginRight: 8}}>
                                                        <Ionicons
                                                            name={allReviews[0].rating >= rating ? "star" : "star-outline"}
                                                            size={14}
                                                            style={allReviews[0].rating >= rating ? {color: Color.accentColor} : {color: Color.text}}/>
                                                    </View>
                                                ))}
                                            </View>
                                            <Text style={{
                                                fontSize: 12,
                                                fontFamily: FontFamily.regular,
                                                color: Color.text,
                                            }}>{allReviews[0].text}</Text>
                                        </View>
                                    ))}

                                </View>

                                <View>
                                    {reviewsLoading ? (
                                        <ActivityIndicator
                                            size="large"
                                            color={Color.text}
                                            style={{alignContent: "center"}}
                                        />
                                    ) : (
                                    allReviews.length > 1 && (
                                        allReviews.slice(1).map((item, index) => (
                                            <View
                                                style={[{
                                                    backgroundColor: Color.darkslategray_100,
                                                    padding: 8,
                                                    borderWidth: 0,
                                                    borderRadius: 8,
                                                    width: '100%',
                                                    marginTop: 16,
                                                }, BoxShadow]}
                                                key={index}>
                                                <View style={{
                                                    flex: 0,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 8,
                                                }}>
                                                    <Text style={{
                                                        fontSize: 16,
                                                        fontFamily: FontFamily.regular,
                                                        color: Color.text,
                                                    }}>{item.author_name}</Text>
                                                    <Text style={{
                                                        fontSize: 10,
                                                        fontFamily: FontFamily.light,
                                                        color: Color.text,
                                                    }}>{convertToDate(item.created_at)}</Text>
                                                </View>
                                                <View style={{
                                                    flex: 0,
                                                    flexDirection: 'row',
                                                    //justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: 8
                                                }}>
                                                    {[1, 2, 3, 4, 5].map((rating) => (
                                                        <View key={rating} style={rating === 5 ? {} : {marginRight: 8}}>
                                                            <Ionicons
                                                                name={item.rating >= rating ? "star" : "star-outline"}
                                                                size={14}
                                                                style={item.rating >= rating ? {color: Color.accentColor} : {color: Color.text}}/>
                                                        </View>
                                                    ))}
                                                </View>
                                                <Text style={{
                                                    fontSize: 12,
                                                    fontFamily: FontFamily.regular,
                                                    color: Color.text,
                                                }}>{item.text}</Text>
                                            </View>
                                        ))
                                    ))}
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: Color.accentColor,
                                            borderWidth: 0,
                                            borderRadius: 8,
                                            padding: 8,
                                            marginTop: 16,
                                        }}
                                        onPress={() => setNumCommentsFetched(numCommentsFetched + 3)}>
                                        <Text style={{
                                            fontSize: 16,
                                            fontFamily: FontFamily.medium,
                                            color: Color.text,
                                            textAlign: 'center'
                                        }}>More reviews</Text>
                                    </TouchableOpacity>
                                </View>
                            </>

                        </View>
                    </ScrollView>
                </View>
        </SafeAreaView>
    );
}
