import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  ColorLight,
  ColorDark,
  FontSize,
  FontFamily,
  Padding,
  Border,
} from "../../GlobalStyles";
import { useTheme } from "../ThemeContext";
import stylesLight from "../components/stylesLight";
import stylesDark from "../components/stylesDark";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function Calendar({ selectedDate, setSelectedDate }) {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Get the number of days in a month
  const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

  // Generate an array for the days in the current month
  const generateDays = (month, year) => {
    const numberOfDays = daysInMonth(month, year);
    const days = [];
    for (let i = 1; i <= numberOfDays; i++) {
      days.push(new Date(year, month - 1, i));
    }
    return days;
  };

  // Format date as "YYYY-MM-DD"
  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = generateDays(currentMonth + 1, currentYear);

  return (
    <View style={styles.calendar}>
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity
          disabled={isMonthBeforeToday(currentMonth, currentYear)}
          onPress={() => handleMonthChange(-1)}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={15}
            style={[
              styles.selectorText,
              isMonthBeforeToday(currentMonth, currentYear) &&
                styles.disabledText,
            ]}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: Color.text,
            fontSize: 14,
            fontFamily: FontFamily.regular,
          }}
        >
          {months[currentMonth]} {currentYear}
        </Text>

        <TouchableOpacity onPress={() => handleMonthChange(1)}>
          <MaterialIcons
            name="arrow-forward-ios"
            size={15}
            style={styles.selectorText}
          />
        </TouchableOpacity>
      </View>

      {/* Days */}
      <View style={styles.calendarHeader}>
        {daysOfWeek.map((day) => (
          <Text key={day} style={styles.dayOfWeek}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysContainer}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={day}
            disabled={isBeforeToday(day)}
            style={[
              styles.day,
              formatDate(day) ===
                (selectedDate ? formatDate(selectedDate) : "") &&
                styles.selectedDay,
              isBeforeToday(day) && styles.disabledDay,
              (index === 0 || index % 7 === 0) && {
                marginRight: 10,
                marginLeft: 0,
              },
              (index + 1) % 7 === 0 &&
                index !== 0 && { marginLeft: 10, marginRight: 0 },
            ]}
            onPress={() => setSelectedDate(day)}
          >
            <Text
              style={isBeforeToday(day) ? styles.disabledText : styles.dayText}
            >
              {day.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  function isMonthBeforeToday(month, year) {
    return year === today.getFullYear() && month <= today.getMonth();
  }

  function handleMonthChange(direction) {
    if (direction === -1) {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    }
  }

  function isBeforeToday(date) {
    if (date.getFullYear() < today.getFullYear()) {
      return true;
    }

    if (date.getFullYear() === today.getFullYear()) {
      if (date.getMonth() < today.getMonth()) {
        return true;
      }

      if (
        date.getMonth() === today.getMonth() &&
        date.getDate() < today.getDate()
      ) {
        return true;
      }
    }

    return false;
  }
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
