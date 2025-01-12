import * as React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";
import stylesLight from "../components/stylesLight";
import stylesDark from "../components/stylesDark";
import {
  ColorLight,
  ColorDark,
  FontSize,
  FontFamily,
  Padding,
  Border,
} from "../../GlobalStyles";

const Button = ({ item, onPress, styleText, styleButton }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={styleButton}>
    <Text style={styleText}>{item}</Text>
  </TouchableOpacity>
);

export default function Pagination({
  data,
  RenderComponent,
  dataLimit,
  userId,
  navigation,
}) {
  const [pages] = React.useState(Math.round(data.length / dataLimit));
  const [currentPage, setCurrentPage] = React.useState(1);
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;

  const goToNextPage = () => {
    setCurrentPage((page) => page + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => page - 1);
  };

  const changePage = (item) => {
    const pageNumber = Number(item);
    setCurrentPage(pageNumber);
  };

  const getPaginatedData = () => {
    const startIndex = currentPage * dataLimit - dataLimit;
    const endIndex = startIndex + dataLimit;
    return data.slice(startIndex, endIndex);
  };

  /*const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
    return new Array(pageLimit).fill().map((_, idx) => start + idx + 1);
  };*/
  const getPaginationGroup = () => {
    if (pages <= 1) {
      return [1];
    } else if (pages <= 5) {
      return new Array(pages).fill().map((_, idx) => idx + 1);
    } else {
      // Always display the first 2 and the last 2 pages
      const staticPages = [1, 2, pages - 1, pages];

      // Get the current page and two pages on either side
      let middlePages = [
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2,
      ].filter((page) => page > 2 && page < pages - 1);

      // Combine staticPages and middlePages
      let combinedPages = [...new Set([...staticPages, ...middlePages])];
      combinedPages.sort((a, b) => a - b);

      // Add ... where there's a gap of more than 1 between page numbers
      let finalPages = [];
      for (let i = 0; i < combinedPages.length; i++) {
        finalPages.push(combinedPages[i]);
        if (
          i !== combinedPages.length - 1 &&
          combinedPages[i + 1] - combinedPages[i] > 1
        ) {
          finalPages.push("...");
        }
      }

      return finalPages;
    }
  };

  return (
    <View>
      {/* show the posts, 10 posts at a time */}
      <View style={{ paddingBottom: 32 }}>
        {getPaginatedData().map((business) => (
          <RenderComponent
            key={business.id}
            business={business}
            user_id={userId}
            navigation={navigation}
          />
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 32,
          paddingLeft: 32,
          paddingRight: 32,
        }}
      >
        {/* previous button */}
        <TouchableOpacity
          onPress={goToPreviousPage}
          disabled={currentPage === 1 || pages <= 1}
          //className={`prev ${currentPage === 1 ? "disabled" : ""}`}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={22}
            color={
              currentPage === 1 || pages <= 1
                ? Color.darkslategray_100
                : Color.text
            }
          />
        </TouchableOpacity>

        {/* show page numbers */}
        {getPaginationGroup().map((item, index) =>
          item === "..." ? (
            <Text
              key={index}
              style={{
                fontSize: 16,
                fontFamily: FontFamily.regular,
                color: Color.text,
              }}
            >
              ...
            </Text>
          ) : (
            <Button
              item={item}
              onPress={changePage}
              key={index}
              styleButton={
                currentPage === item
                  ? {
                      backgroundColor: Color.accentColor,
                      width: 28,
                      height: 28,
                      borderWidth: 0,
                      borderRadius: 4,
                      justifyContent: "center",
                      alignItems: "center",
                    }
                  : {
                      width: 28,
                      height: 28,
                      justifyContent: "center",
                      alignItems: "center",
                    }
              }
              styleText={{
                color: Color.white,
                fontSize: 16,
                fontFamily: FontFamily.regular,
                textAlign: "center",
              }}
            />
          )
        )}
        {/*getPaginationGroup().map((item, index) => (
          <Button
            item={item}
            onPress={changePage}
            key={index}
            styleText={{
              color: Color.text,
              fontSize: 16,
              fontFamily: FontFamily.regular,
            }}
          />
        ))*/}

        {/* next button */}
        <TouchableOpacity
          onPress={goToNextPage}
          disabled={currentPage === pages || pages <= 1}
          //className={`next ${currentPage === pages ? "disabled" : ""}`}
        >
          <MaterialIcons
            name="arrow-forward-ios"
            size={22}
            color={
              currentPage === pages || pages <= 1
                ? Color.darkslategray_100
                : Color.text
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
