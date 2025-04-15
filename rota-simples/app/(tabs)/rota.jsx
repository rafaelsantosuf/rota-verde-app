import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, Modal, Text} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import polyline from '@mapbox/polyline';
import Icon from 'react-native-vector-icons/FontAwesome5';
// import { LinearGradient } from 'expo-linear-gradient'; // Comentado
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Equivalentes para os diferentes modos de transporte
const equivalentes = {
  "driving": "Carro",
  "motorcycle": "Moto",
  "transit": "Ônibus",
  "walking": "A pé",
  "bicycle": "Bicicleta"
};

// Valores fixos de emissão para modos de transporte diferentes de carro
const emissoesPorModo = {
  "walking": 0,      // A pé
  "bicycle": 0,      // Bicicleta
  "transit": 1,      // Ônibus
  "motorcycle": 1,   // Moto
};

// Define mínimo e máximo (mantido para escala visual)
// const X_min = 0;
// const X_max = 200;

// Função para normalizar a emissão entre 0 e 100
// const normalizarEmissao = (X) => ((X - X_min) / (X_max - X_min)) * 95;

// Função para calcular a emissão formatada com no máximo uma casa decimal
const calcularEmissaoFormatada = (distancia, valorEmissao) => {
  if (!distancia || valorEmissao === null) return 0;
  
  // Calculate emission and format to one decimal place
  const emissao = distancia * valorEmissao;
  return Number(emissao.toFixed(1)); // Convert back to number after formatting
};

const Rota = () => {
  const [origem, setOrigem] = useState(null);
  const [destino, setDestino] = useState(null);
  const [rota, setRota] = useState(null);
  const [modoTransporte, setModoTransporte] = useState("driving");
  const [modalVisivel, setModalVisivel] = useState(false);
  const mapRef = useRef(null);
  // const [valorEmissao, setValorEmissao] = useState(0); // Comentado - usado para o gráfico
  const [valorRealEmissao, setValorRealEmissao] = useState(null);
  const [distancia, setDistancia] = useState(null);
  const [ultimoVeiculoSelecionado, setUltimoVeiculoSelecionado] = useState(null);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);

  // Adicione isto logo após as declarações de useState
  useFocusEffect(
    React.useCallback(() => {
      if (modoTransporte === "driving") {
        carregarVeiculoCadastrado();
      }
      return () => {}; // Cleanup, se necessário
    }, [modoTransporte])
  );

  useEffect(() => {
    if (modoTransporte === "driving") {
      carregarVeiculoCadastrado();
    } else {
      // Para outros modos de transporte, usar valores fixos
      setValorRealEmissao(emissoesPorModo[modoTransporte] || 0);
      // setValorEmissao(normalizarEmissao(emissoesPorModo[modoTransporte] || 0)); // Comentado
    }
  }, [modoTransporte]);

  useEffect(() => {
    if (origem && destino) {
      buscarRota();
    }
  }, [origem, destino, modoTransporte]);

  // Lê veeículo selecionado
  const carregarVeiculoCadastrado = async () => {
    try {
      // Obter o identificador do veículo selecionado
      const veiculoId = await AsyncStorage.getItem('@veiculo_selecionado');
      
      if (veiculoId) {
        // Buscar os dados do veículo usando o ID armazenado
        const veiculoData = await AsyncStorage.getItem(veiculoId);
        
        if (veiculoData) {
          const veiculo = JSON.parse(veiculoData);
          
          // Calcular a emissão como a soma dos três campos
          const emissaoTotal = 
            (parseFloat(veiculo.etanol) || 0) + 
            (parseFloat(veiculo.gasolinaDiesel) || 0) + 
            (parseFloat(veiculo.vehp) || 0);
          
          setValorRealEmissao(emissaoTotal);
          setVeiculoSelecionado(veiculo);
        } else {
          // ID existe mas o veículo não foi encontrado
          console.warn('Veículo não encontrado com o ID:', veiculoId);
          setValorRealEmissao(1);
          setVeiculoSelecionado(null);
        }
      } else {
        // Não existe veículo selecionado
        setValorRealEmissao(1);
        setVeiculoSelecionado(null);
      }
    } catch (error) {
      console.error('Erro ao carregar veículo selecionado:', error);
      // Fallback para um valor padrão em caso de erro
      setValorRealEmissao(1);
      setVeiculoSelecionado(null);
    }
  };

  const buscarRota = async () => {
    if (!origem || !destino) return;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origem.latitude},${origem.longitude}&destination=${destino.latitude},${destino.longitude}&mode=${modoTransporte}&departure_time=now&alternatives=false&key=AIzaSyDHJ80nB7ohZ_rKVGfKBYCPdQWUDG76qrA`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length) {
        const pontos = data.routes[0].overview_polyline.points;
        const decodedRoute = decodePolyline(pontos);
        setRota(decodedRoute);
        ajustarZoom(decodedRoute);

        // Captura a distância total da rota em km
        const distanciaMetros = data.routes[0].legs.reduce((acc, leg) => acc + leg.distance.value, 0);
        setDistancia(distanciaMetros / 1000); // Convertendo para km

        // Agora mostra o modal para todos os modos de transporte
        setModalVisivel(true);
      }
    } catch (error) {
      console.error('Erro ao buscar rota:', error);
    }
  };

  const decodePolyline = (encoded) => {
    const points = polyline.decode(encoded);
    return points.map(([latitude, longitude]) => ({ latitude, longitude }));
  };

  const ajustarZoom = (coords) => {
    if (mapRef.current && coords.length) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  // Função para lidar com o clique no botão de veículo
  const handleVeiculoPress = (value) => {
    if (origem && destino && modoTransporte === value) {
      // Se já temos origem e destino e clicamos no mesmo veículo novamente
      setModalVisivel(!modalVisivel); // Alterna o modal
    } else {
      // Mudamos o modo de transporte
      setModoTransporte(value);
      setUltimoVeiculoSelecionado(value);
      // O modal será aberto pelo useEffect quando a rota for buscada
    }
  };

  // Salvar rota (mantida a mesma lógica)
  const salvarRota = async () => {
    try {
      if (
        !origem || !destino || !distancia || valorRealEmissao === null ||
        !origem.latitude || !origem.longitude || !origem.nome ||
        !destino.latitude || !destino.longitude || !destino.nome
      ) {
        console.warn("Dados incompletos, não foi possível salvar.");
        return;
      }

      // Obter a data atual
      const dataAtual = new Date();
      const dataFormatada = dataAtual.toISOString();
      
      // Criar uma chave única usando o timestamp
      const timestamp = dataAtual.getTime();
      const chaveUnica = `@rota_${timestamp}`;

      // Calculando a emissão formatada com no máximo uma casa decimal
      const emissaoFormatada = calcularEmissaoFormatada(distancia, valorRealEmissao);

      const dados = {
        origem: {
          nome: origem.nome,
          latitude: origem.latitude,
          longitude: origem.longitude,
        },
        destino: {
          nome: destino.nome,
          latitude: destino.latitude,
          longitude: destino.longitude,
        },
        distancia: distancia, // em km
        emissao: emissaoFormatada, // gCO₂ formatado com no máximo uma casa decimal
        data: dataFormatada,
        dataFormatadaLocal: `${dataAtual.getDate()}/${dataAtual.getMonth() + 1}/${dataAtual.getFullYear()}`,
        timestamp: timestamp
      };
      
      // Salvar com chave única baseada em datetime
      await AsyncStorage.setItem(chaveUnica, JSON.stringify(dados));
      
      // Opcionalmente, ainda manter a última rota para acesso rápido
      await AsyncStorage.setItem('@ultimaRota', JSON.stringify(dados));
      
      console.log('Dados salvos com sucesso.');
    } catch (e) {
      console.error('Erro ao salvar os dados:', e);
    }
  };

  // Renderizar informações do veículo no modal
  const renderizarInfoVeiculo = () => {
    if (modoTransporte === "driving" && veiculoSelecionado) {
      return (
        <View style={styles.infoVeiculoContainer}>
          <Text style={styles.infoVeiculoTitulo}>Veículo Selecionado:</Text>
          <Text style={styles.infoVeiculoItem}>
            {veiculoSelecionado.marca} {veiculoSelecionado.modelo}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Origem"
        onPress={(data, details = null) => setOrigem({
          nome: data.description,
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng
        })}
        query={{ key: 'AIzaSyDHJ80nB7ohZ_rKVGfKBYCPdQWUDG76qrA', language: 'pt-BR' }}
        fetchDetails
        styles={styles.autocomplete}
      />

      <GooglePlacesAutocomplete
        placeholder="Destino"
        onPress={(data, details = null) => setDestino({
          nome: data.description,
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng
        })}
        query={{ key: 'AIzaSyDHJ80nB7ohZ_rKVGfKBYCPdQWUDG76qrA', language: 'pt-BR' }}
        fetchDetails
        styles={styles.autocomplete}
      />

      <View style={styles.botoesContainer}>
        {[{ value: "driving", icon: "car" },
          { value: "walking", icon: "walking" },
          { value: "bicycle", icon: "bicycle" },
          { value: "transit", icon: "bus" },
          { value: "motorcycle", icon: "motorcycle" }].map(({ value, icon }) => (
        <Pressable
          key={value}
          onPress={() => handleVeiculoPress(value)}
          style={styles.button}
        >
          <Icon 
            name={icon} 
            size={24} 
            color={modoTransporte === value ? "#43B877" : "white"} 
          />
        </Pressable>
        ))}
      </View>
      
      <MapView ref={mapRef} style={styles.map}>
        {origem && <Marker coordinate={origem} title="Origem" />}
        {destino && <Marker coordinate={destino} title="Destino" />}
        {rota && <Polyline coordinates={rota} strokeWidth={4} strokeColor="blue" />}
      </MapView>

      {/* MODAL SIMPLIFICADO */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Botão X no canto superior direito */}
            <Pressable 
              onPress={() => setModalVisivel(false)} 
              style={styles.closeIconButton}
            >
              <Icon name="times" size={20} color="#666" />
            </Pressable>
            
            <Text style={styles.modalTitle}>Confirmar Viagem?</Text>
            
            <Text style={styles.modalSubtitle}>
              {equivalentes[modoTransporte] || "Transporte"}
            </Text>
            
            {renderizarInfoVeiculo()}

            <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
              <Text style={styles.emissaoText}>
                Emissões de CO₂: {distancia ? ` ${calcularEmissaoFormatada(distancia, valorRealEmissao)} gCO₂` : ""}
              </Text>

              {/* Gráfico Linear Comentado 
              <View style={styles.gradientBarContainer}>
                <LinearGradient
                  colors={["green", "yellow", "orange", "red"]}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={styles.gradientBar}
                />
                <View style={[styles.indicator, { left: `${valorEmissao}%` }]} />
              </View>
              */}
            </View>

            <Pressable 
              onPress={() => {
                salvarRota();
                setModalVisivel(false);
              }} 
              style={styles.confirmButton}
            >
              <Text style={{ color: "white" }}>Confirmar</Text>
            </Pressable>

            <Link href="/saibamais" asChild>
              <Pressable onPress={() => setModalVisivel(false)}>
                <Text style={styles.link}>Saiba Mais</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  autocomplete: {
    container: { flex: 0 },
    textInput: { height: 40, borderWidth: 1, borderColor: '#E5E5E5' }
  },
  map: {
    flex: 1
  },
  botoesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    position: "relative"
  },
  closeIconButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333"
  },
  modalSubtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 15
  },
  infoVeiculoContainer: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8
  },
  infoVeiculoTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#444"
  },
  infoVeiculoItem: {
    fontSize: 15,
    color: "#555"
  },
  emissaoText: {
    fontSize: 16,
    color: "#444",
    marginBottom: 10
  },
  /* Estilos do gráfico comentados
  gradientBarContainer: {
    width: "80%",
    height: 20,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
  },
  gradientBar: {
    width: "100%",
    height: "100%",
  },
  indicator: {
    position: "absolute",
    width: 10,
    height: 30,
    backgroundColor: "black",
    borderRadius: 5,
    top: -5,
  },
  */
  confirmButton: { 
    marginTop: 20,
    padding: 10,
    backgroundColor: "#43B877",
    borderRadius: 5,
    minWidth: 120,
    alignItems: "center"
  },
  link: {
    color: '#1D959C',
    textDecorationLine: 'underline',
    marginTop: 20,
  },
});

export default Rota;