import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native';

export default function WIPScreen() {
  return (

    <View style={styles.container}>
      <Image source={require('../../assets/images/grafico.png')} style={styles.img} />
      <Text style={styles.title}>WORK IN PROGRESS</Text>
      <ActivityIndicator size="large" color="#43B877" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa toda a tela
    justifyContent: 'center', // Centraliza os elementos verticalmente
    alignItems: 'center', // Centraliza os elementos horizontalmente
    backgroundColor: '#E5E5E5',
  },
  title: {
    color: '#43B877',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 13, // Espaçamento entre título e indicador de carregamento
  },
  img: {
    width: 250,
    height: 250,
    marginTop: 40,
    marginBottom: 40,
  },
});
