import { StyleSheet, View, Pressable, Text } from "react-native";

type Props = {
    label: string;
};

export default function Button({label}: Props) {
    return (
        <View style={styles.buttonContainer}>
            <Pressable
                style={styles.button}
                onPress={() => alert("You pressed a button.")}
            >
                <Text
                    style={styles.buttonLabel}>{label}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 320,
        height: 68,
        marginHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        padding: 3,
    },
    button: {
        backgroundColor: '#43B877', // Cor verde
        width: "100%",
        height: "100%",
        borderRadius: 0,
        marginTop: 13,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",

    },
    buttonIcon: {
        paddingRight: 8,
    },
    buttonLabel: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});