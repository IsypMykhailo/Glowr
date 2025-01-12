import React from "react";
import {View, TouchableOpacity, Alert} from "react-native";
import {
  ActionSheetProvider,
  connectActionSheet,
} from "@expo/react-native-action-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ColorLight,
  ColorDark,
  FontSize,
  FontFamily,
  Padding,
  Border,
} from "../../GlobalStyles";
import { useTheme } from "../ThemeContext";
import stylesLight from "./stylesLight";
import stylesDark from "./stylesDark";
import { supabase } from "../config/supabaseClient";

export default function BookingDetailsMenu({
  showActionSheetWithOptions,
  appointment,
    user_id,
    business_id,
  onDelete,
}) {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const start_time = appointment.start_time;
  const end_time = appointment.end_time;
  const date = appointment.date;
  const worker = appointment.workers;

  const timeDifferenceInMinutes = (timeStr1, timeStr2) => {
    // Remove the timezone offset if it exists
    const cleanTimeStr1 = timeStr1.split("-")[0];
    const cleanTimeStr2 = timeStr2.split("-")[0];

    const [hours1, minutes1] = cleanTimeStr1.split(":").map(Number);
    const [hours2, minutes2] = cleanTimeStr2.split(":").map(Number);

    const time1InMinutes = hours1 * 60 + minutes1;
    const time2InMinutes = hours2 * 60 + minutes2;

    return Math.abs(time2InMinutes - time1InMinutes);
  };

  const onOpenActionSheet = () => {
    // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
    const options = ["Delete", "Cancel"];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      async (buttonIndex) => {
        // Do something here depending on the button index selected
        if (buttonIndex == 0) {
          const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("id", appointment.id);
          onDelete(appointment.id);
          if (timeDifferenceInMinutes(start_time, end_time) >= 60) {
            const { data, error } = await supabase
              .from("workerAvailability")
              .insert([
                { worker_id: worker.id, date: date, start_time: start_time },
              ])
              .select();
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
                .update({amount: points[0].amount - appointment.price_final*10})
                .eq('user_id', user_id)
            if (errorPoints2) {
              Alert.alert("Error Points Update", errorPoints.message, [{text: "OK"}], {cancelable: false});
            }


            const {data, errorHistory} = await supabase
                .from('point_history')
                .insert([
                  {business_id: business_id, user_id: user_id, amount: -1*appointment.price_final*10},
                ])
                .select()
            if (errorHistory) {
              Alert.alert("Error Points History", errorHistory.message, [{text: "OK"}], {cancelable: false});
            }
          } else {
            let {data: points2, errorPoints2} = await supabase
                .from('points')
                .insert([
                  {user_id: user_id, amount: -1*appointment.price_final*10},
                ])
                .select('*')
            if (errorPoints2) {
              Alert.alert("Error Points Insert", errorPoints2.message, [{text: "OK"}], {cancelable: false});
            }

            const {data, errorHistory} = await supabase
                .from('point_history')
                .insert([
                  {business_id: business_id, user_id: user_id, amount: appointment.price_final*1000 - appointment.price_final*10},
                ])
                .select()
            if (errorHistory) {
              Alert.alert("Error Points History", errorHistory.message, [{text: "OK"}], {cancelable: false});
            }
          }
        }
      }
    );
  };

  return (
    <TouchableOpacity onPress={onOpenActionSheet}>
      <Ionicons
        name="ellipsis-vertical"
        size={21}
        style={{ color: Color.text }}
      />
    </TouchableOpacity>
  );
}
