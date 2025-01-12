import React, { useState } from "react";
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
  ImageBackground,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import stylesLight from "./stylesLight";
import stylesDark from "./stylesDark";
import {
  ColorLight,
  ColorDark,
  FontSize,
  FontFamily,
  Padding,
  Border,
  BoxShadow,
} from "../../GlobalStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { supabase } from "../config/supabaseClient";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Toast from "react-native-toast-message";

const Accordion = ({ title, price, description, duration, children }) => {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
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
            {title}
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
            {duration} min
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: FontFamily.regular,
              color: Color.text,
            }}
          >
            ${price}
          </Text>
        </View>
        <View>
          <Ionicons name="chevron-down" size={32} color={Color.text} />
        </View>
      </TouchableOpacity>
      {isOpen && children}
    </View>
  );
};

const AddServiceModal = ({
  services,
  setServices,
  addServiceModalVisible,
  setAddServiceModalVisible,
}) => {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;

  const [forms, setForms] = useState([]);

  React.useEffect(() => {
    const initialForms = services.map((service, index) => (
      <Accordion
        key={index}
        title={service.name}
        price={service.price}
        description={service.description}
        duration={service.duration}
      >
        <ServiceForm
          initialService={service}
          onSave={(newService) => saveService(index, newService)}
          onDelete={() => deleteService(index)}
        />
      </Accordion>
    ));
    setForms(initialForms);
  }, [services]);

  const saveService = (index, service) => {
    services[index] = service;
    setServices([...services]);
    updateForm(index, service);
  };

  const deleteService = (index) => {
    setServices(services.filter((_, i) => i !== index));
    setForms(forms.filter((_, i) => i !== index));
  };

  const addServiceForm = () => {
    const newService = {
      name: "New Service",
      price: 0,
      description: "",
      duration: 0,
    };
    const newForm = (
      <Accordion
        key={forms.length}
        title={newService.name}
        price={newService.price}
        description={newService.description}
        duration={newService.duration}
      >
        <ServiceForm
          initialService={newService}
          onSave={(service) => saveService(forms.length, service)}
          onDelete={() => deleteService(forms.length)}
        />
      </Accordion>
    );
    setForms([...forms, newForm]);
  };
  const updateForm = (index, service) => {
    const updatedForm = (
      <Accordion
        key={index}
        title={service.name}
        price={service.price}
        description={service.description}
        duration={service.duration}
      >
        <ServiceForm
          initialService={service}
          onSave={(newService) => saveService(index, newService)}
          onDelete={() => deleteService(index)}
        />
      </Accordion>
    );
    forms[index] = updatedForm;
    setForms([...forms]);
  };

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={addServiceModalVisible}
      onRequestClose={() => {
        setAddServiceModalVisible(false);
      }}
    >
      <View
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: Color.background,
        }}
      >
        <View
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: Color.background,
            top: 44,
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 24, left: 24, zIndex: 999 }}
            onPress={() => setAddServiceModalVisible(false)}
          >
            <FontAwesome5
              name="arrow-left"
              size={26}
              style={styles.arrowBack}
            />
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
              Manage Services
            </Text>
          </View>
          <ScrollView
            style={{ paddingHorizontal: 24, width: "100%" }}
            showsVerticalScrollIndicator={false}
          >
            {forms}
            <TouchableOpacity
              onPress={addServiceForm}
              style={{
                flex: 0,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="add" size={32} color={Color.text} />
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: FontFamily.regular,
                  color: Color.text,
                  marginLeft: 4,
                }}
              >
                Add Service
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ServiceForm = ({ initialService, onSave, onDelete }) => {
  const { theme } = useTheme();
  const Color = theme === "light" ? ColorLight : ColorDark;
  const styles = theme === "light" ? stylesLight : stylesDark;
  const [name, setName] = useState(initialService.name);
  const [price, setPrice] = useState(initialService.price.toString());
  const [description, setDescription] = useState(initialService.description);
  const [duration, setDuration] = useState(initialService.duration.toString());

  const handleSave = () => {
    onSave({
      name,
      price: parseFloat(price),
      description,
      duration: parseInt(duration),
    });
  };

  return (
    <View
      style={[
        {
          backgroundColor: Color.darkslategray_100,
          borderWidth: 0,
          borderRadius: 8,
          marginTop: 16,
          padding: 16,
        },
        BoxShadow,
      ]}
    >
      <Text
        style={{
          fontSize: 18,
          fontFamily: FontFamily.medium,
          color: Color.text,
        }}
      >
        Title
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
          marginBottom: 24,
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
        Price
      </Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
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
          marginBottom: 24,
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
        Duration
      </Text>
      <TextInput
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
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
          marginBottom: 24,
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
        Description
      </Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
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
          marginBottom: 24,
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
          width: "100%",
          flex: 0,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          style={{
            flex: 0,
            flexDirection: "row",
            alignItems: "center",
            marginRight: 48,
          }}
        >
          <Ionicons name="save-outline" size={24} color={Color.accentColor} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: FontFamily.medium,
              color: Color.accentColor,
              marginLeft: 4,
            }}
          >
            Save
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={{ flex: 0, flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="trash-outline" size={24} color={"#F45E5E"} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: FontFamily.medium,
              color: "#F45E5E",
              marginLeft: 4,
            }}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddServiceModal;
