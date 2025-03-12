import { View, Text, StyleSheet} from 'react-native';
import Button from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';

const PlaceholderImage = require("../../assets/images/tabela.jpeg")

export default function DadosScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <ImageViewer imgSource={PlaceholderImage}/>
            </View>
            
            <View style={styles.footerContainer}>
                <Button label="Relatório Semanal" />
                <Button label="Relatório Mensal" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    image: {
        width: 300,
        height: 420,
        borderRadius: 50,
    },
    imageContainer: {
        flex: 1,
    },
    footerContainer:{
        flex: 1/3,
    },

})