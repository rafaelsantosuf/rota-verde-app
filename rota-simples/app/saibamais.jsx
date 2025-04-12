import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SaibaMais = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações Adicionais</Text>
      <Text style={styles.content}>Aqui você pode adicionar mais detalhes sobre as emissões, veículos, etc.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  content: { fontSize: 16, textAlign: 'center' },
});

export default SaibaMais;