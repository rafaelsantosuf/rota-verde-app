import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SaibaMais = () => {
  const abrirInstagram = () => {
    const instagramURL = 'https://www.instagram.com/eletromobility/';
    const instagramAppURL = 'instagram://user?username=eletromobility';
    
    // Tenta abrir o app do Instagram primeiro
    Linking.canOpenURL(instagramAppURL)
      .then(supported => {
        if (supported) {
          return Linking.openURL(instagramAppURL);
        } else {
          // Se não tiver o app instalado, abre no navegador
          return Linking.openURL(instagramURL);
        }
      })
      .catch(err => console.error('Erro ao abrir link:', err));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.titulo}>Como calculamos suas emissões de CO₂?</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.contentJustified}>
          Nosso aplicativo utiliza dados oficiais do INMETRO sobre as emissões de dióxido de carbono (CO₂) por quilômetro rodado, 
          considerando o modelo do veículo informado por você. A partir disso, estimamos a quantidade de CO₂ emitida em cada trajeto.
        </Text>
        
        <View style={styles.formulaContainer}>
          <Text style={styles.formulaTitle}>O cálculo é feito com base na seguinte fórmula:</Text>
          <View style={styles.formulaBox}>
            <Text style={styles.formula}>Emissões = (Distância x Emissões por km) / Número de ocupantes</Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="map-outline" size={24} color="#43b877" style={styles.icon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Distância (Dis)</Text>
              <Text style={styles.detailText}>
                É calculada automaticamente por meio da rota definida no app, usando a API do Google Maps.
              </Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="car-outline" size={24} color="#43b877" style={styles.icon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Emissões por km (Ekm)</Text>
              <Text style={styles.detailText}>
                É a quantidade de CO₂ emitida pelo veículo a cada quilômetro, com base nas informações do INMETRO.
              </Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={24} color="#43b877" style={styles.icon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Número de ocupantes (N)</Text>
              <Text style={styles.detailText}>
                Representa quantas pessoas estão no veículo. Como essa funcionalidade ainda não está disponível nesta versão do app, 
                consideramos apenas 1 ocupante por padrão.
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.tipContainer}>
          <Ionicons name="bulb-outline" size={24} color="#43b877" style={styles.tipIcon} />
          <Text style={styles.tipText}>
            Isso significa que, se você dividir o trajeto com outras pessoas (como em caronas), 
            suas emissões individuais podem ser menores! Em versões futuras, pretendemos incluir 
            essa funcionalidade para tornar o cálculo ainda mais preciso.
          </Text>
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Nosso objetivo é ajudar você a entender e refletir sobre o impacto ambiental dos seus 
            deslocamentos e incentivar escolhas mais sustentáveis. 🌱
          </Text>
        </View>
        
        {/* Nova seção para Instagram */}
        <View style={styles.instagramContainer}>
          <Text style={styles.instagramTitle}>Quer aprender mais sobre mobilidade elétrica?</Text>
          <Text style={styles.instagramText}>
            Se você tem interesse em aprofundar seus conhecimentos sobre mobilidade elétrica, 
            entender as vantagens acerca da utilização de carros elétricos e muito mais, 
            siga o perfil @eletronmobilidade no Instagram:
          </Text>
          
          <TouchableOpacity style={styles.instagramButton} onPress={abrirInstagram}>
            <Ionicons name="logo-instagram" size={28} color="white" />
            <Text style={styles.instagramButtonText}>@eletromobility</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    lineHeight: 22,
  },
  contentJustified: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    lineHeight: 22,
    textAlign: 'justify',
  },
  formulaContainer: {
    marginVertical: 15,
    alignItems: 'center',
  },
  formulaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
    textAlign: 'center',
  },
  formulaBox: {
    backgroundColor: '#f0f8f2',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#43b877',
    width: '100%',
    alignItems: 'center',
  },
  formula: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b9d5f',
    textAlign: 'center',
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 10,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 20,
  },
  tipContainer: {
    backgroundColor: '#f0f8f2',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#43b877',
  },
  tipIcon: {
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 20,
  },
  footerContainer: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
    marginBottom: 25,
  },
  footerText: {
    fontSize: 16,
    color: '#43b877',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Estilos para a nova seção do Instagram
  instagramContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  instagramTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  instagramText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 20,
    textAlign: 'justify',
    marginBottom: 15,
  },
  instagramButton: {
    flexDirection: 'row',
    backgroundColor: '#E1306C', // Cor do Instagram
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  instagramButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default SaibaMais;