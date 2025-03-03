import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, Pressable} from 'react-native';
import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { Link } from 'expo-router';

const app = () => {
  return (
    <View style={{ flex: 1 }}>

    <View style={{ position: 'absolute', top: 0, left: -10, zIndex: 1 }}>
      <Svg height="200" width="200" style={{ position: 'absolute', top: 10, left: -50 }}>
        <Circle cx="80" cy="80" r="90" fill="lightgreen" fillOpacity={0.5} />
      </Svg>

      <Svg height="200" width="200" style={{ position: 'absolute', top:-60, left: 20 }}>
        <Circle cx="80" cy="80" r="90" fill="lightgreen" fillOpacity={0.5} />
      </Svg>
    </View>

    <View style={styles.container}>
      <Image source={require('../assets/images/logo-rota-verde.png')} style={styles.img} />

      <Text style={styles.title}>Rota Verde</Text>

      <Text style={styles.text}>
        Seja bem-vindo (a) ao nosso app! Além de descobrir a melhor rota, 
        te mostramos a emissão de carbono que a viagem causará.
      </Text>

      <Link href="/login" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Iniciar</Text>
        </Pressable>
      </Link>

    </View>
  </View>
  );
};

export default app;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    alignItems: 'center', // Centraliza os textos horizontalmente
    justifyContent: 'center', // Centraliza tudo na tela
    paddingHorizontal: 20,
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  title: {
    color: 'black',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 13, // Espaçamento entre título e texto
  },
  text: {
    color: 'black',
    fontSize: 17,
    textAlign: 'center',
  },
  img: {
    width: 250,
    height: 250,
    marginTop: 40,
    marginBottom: 40,

  },
  button: {
    backgroundColor: '#43B877', // Cor verde
    paddingVertical: 20,
    paddingHorizontal: 120,
    borderRadius: 0,
    marginTop: 13,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
