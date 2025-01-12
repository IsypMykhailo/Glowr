import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";

const Dropdown = ({ data, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleSelect = (item) => {
        setSelectedItem(item);
        setIsOpen(false);
        onSelect(item);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setIsOpen(!isOpen)}
            >
                <Text style={styles.headerTitle}>{selectedItem || "am/pm"}</Text>
                <Ionicons name={"chevron-down"} color={"black"} size={20}/>
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.listContainer}>
                    {data.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.listItem}
                            onPress={() => handleSelect(item)}
                        >
                            <Text style={styles.itemText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {

    },
    header: {
        padding: 10,
        //backgroundColor: '#ddd',
        flexDirection: 'row',
        flex:0
    },
    headerTitle: {
        fontSize: 16,
    },
    listContainer: {
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        position:'absolute',
        top:'100%',
        right:0,
        width:'100%',
        zIndex:1000
    },
    listItem: {
        padding: 10,
    },
    itemText: {
        fontSize: 16,
    },
});

export default Dropdown;
