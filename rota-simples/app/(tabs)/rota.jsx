import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, Modal, Text} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import polyline from '@mapbox/polyline';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import dadosVeiculos from '../../data/veiculos.json';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Armazena todas as opções de veículos
let Veiculos = dadosVeiculos.veiculos.map(veiculo => veiculo.tipo).filter(tipo => tipo.toLowerCase().includes("carro"));
const equivalentes = {
  "driving": "Carro",
  "motorcycle": "Moto",
  "transit": "Ônibus",
};

// Extrai as emissões
const emissoes = dadosVeiculos.veiculos.flatMap(veiculo =>
  veiculo.combustiveis.map(combustivel => combustivel.emissoes)
);


// Define mínimo e máximo
const X_min = Math.min(...emissoes);
const X_max = Math.max(...emissoes);

// Função para normalizar a emissão entre 0 e 100
const normalizarEmissao = (X) => ((X - X_min) / (X_max - X_min)) * 95;

// Função para calcular a emissão formatada com no máximo uma casa decimal
const calcularEmissaoFormatada = (distancia, valorEmissao) => {
  if (!distancia || !valorEmissao) return 0;
  
  // Calculate emission and format to one decimal place
  const emissao = distancia * valorEmissao;
  return Number(emissao.toFixed(1)); // Convert back to number after formatting
};

// let Combustiveis = dadosVeiculos.veiculos.map(veiculo => veiculo.combustiveis).flat().map(combustivel => combustivel.tipo);

const Rota = () => {
  const [origem, setOrigem] = useState(null);
  const [destino, setDestino] = useState(null);
  const [rota, setRota] = useState(null);
  const [modoTransporte, setModoTransporte] = useState("driving");
  const [modalVisivel, setModalVisivel] = useState(false);
  const [veiculo, setVeiculo] = useState("Carro Compacto");
  const [combustivel, setCombustivel] = useState("Gasolina ou Etanol");
  const mapRef = useRef(null);
  const [Combustiveis, setCombustiveis] = useState(dadosVeiculos.veiculos.map(veiculo => veiculo.combustiveis).flat().map(combustivel => combustivel.tipo));
  const [valorEmissao, setValorEmissao] = useState(100);
  const [valorRealEmissao, setValorRealEmissao] = useState(null);
  const [distancia, setDistancia] = useState(null);
  // Adicione este estado para rastrear o último veículo selecionado
  const [ultimoVeiculoSelecionado, setUltimoVeiculoSelecionado] = useState(null);

  useEffect(() => {
    if (Veiculos.length > 0) {
      setVeiculo(Veiculos[0]); // Define o primeiro veículo da lista
      filtraCombustivel(Veiculos[0]); // Filtra os combustíveis para esse veículo
    }
  }, [modoTransporte]); // Dispara sempre que o modo de transporte mudar

  useEffect(() => {
    if (veiculo && combustivel) {
      escalaEmissao(veiculo, combustivel);
    }
  }, [combustivel, veiculo]);

  useEffect(() => {
    if (origem && destino) {
      buscarRota();
    }
  }, [origem, destino, modoTransporte]);

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

        console.log(distanciaMetros / 1000);

        if (["driving", "motorcycle", "transit"].includes(modoTransporte)) {
          setModalVisivel(true);
        }
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

  const filtraVeiculo = (veiculo) => {

    if (equivalentes.hasOwnProperty(veiculo)) {

      const tipoVeiculo = equivalentes[veiculo];

      Veiculos = dadosVeiculos.veiculos.filter(veiculo => veiculo.tipo.toLowerCase().includes(tipoVeiculo.toLowerCase())).map(veiculo => veiculo.tipo);

    } 
  };

  const filtraCombustivel = (TipoVeiculo) => {

    const veiculoSelecionado = dadosVeiculos.veiculos.find(veiculo => veiculo.tipo.toLowerCase() === TipoVeiculo.toLowerCase());
  
    if (veiculoSelecionado) {
      const novosCombustiveis = veiculoSelecionado.combustiveis.map(combustivel => combustivel.tipo);
      setCombustiveis(novosCombustiveis);
      setCombustivel(novosCombustiveis[0]);
    }
  };

  // Função que coloca o valor de emissão em uma escala de 0 a 100 para representar na barra com o gradiente.
  const escalaEmissao = (veiculo, combustivel) => {

    veiculo = veiculo.toLowerCase();
    combustivel = combustivel.toLowerCase();

    // console.log(veiculo);
    // console.log(combustivel);

    // Encontra o veículo correspondente
    const veiculoEncontrado = dadosVeiculos.veiculos.find(v => v.tipo.toLowerCase() === veiculo);

    // console.log(veiculoEncontrado);

    if (!veiculoEncontrado) return null; // Veículo não encontrado

    // Encontra o combustível correspondente dentro do veículo
    const combustivelEncontrado = veiculoEncontrado.combustiveis.find(c => c.tipo.toLowerCase() === combustivel);

    // console.log(combustivelEncontrado);

    if (!combustivelEncontrado) return null; // Combustível não encontrado

    setValorEmissao(normalizarEmissao(combustivelEncontrado.emissoes));

    // console.log(combustivelEncontrado.emissoes); // Retorna o valor da emissão
    // console.log(normalizarEmissao(combustivelEncontrado.emissoes)); // Retorna o valor da emissão

    // Calculo da emissao real
    setValorRealEmissao(combustivelEncontrado.emissoes);

  };

// Modifique a função de pressionar o botão
const handleVeiculoPress = (value) => {
  // Lista de modos de transporte que devem mostrar o modal
  const modosComModal = ["driving", "motorcycle", "transit"];
  
  // Se já temos origem e destino e clicamos no mesmo veículo motorizado novamente
  if (origem && destino && modoTransporte === value && modosComModal.includes(value)) {
    setModalVisivel(!modalVisivel); // Alterna o modal apenas para veículos motorizados
  } else {
    setModoTransporte(value);
    filtraVeiculo(value);
    setUltimoVeiculoSelecionado(value);
    // O modal será aberto pelo useEffect quando a rota for buscada
    // (apenas para veículos motorizados, conforme já implementado na função buscarRota)
  }
};

 // Salvar rota
  const salvarRota = async () => {
    console.log("Iniciando função salvarRota");
    console.log("Origem:", origem);
    console.log("Destino:", destino);
    console.log("Distância:", distancia);
    console.log("Valor Real Emissão:", valorRealEmissao);
    
    try {
      if (
        !origem || !destino || !distancia || !valorRealEmissao ||
        !origem.latitude || !origem.longitude || !origem.nome ||
        !destino.latitude || !destino.longitude || !destino.nome
      ) {
        console.warn("Dados incompletos, não foi possível salvar.");
        // Detalhe quais dados estão faltando:
        if (!origem) console.warn("Origem está ausente");
        if (!destino) console.warn("Destino está ausente");
        if (!distancia) console.warn("Distância está ausente");
        if (!valorRealEmissao) console.warn("Valor de emissão está ausente");
        if (origem && (!origem.latitude || !origem.longitude || !origem.nome)) 
          console.warn("Dados da origem estão incompletos");
        if (destino && (!destino.latitude || !destino.longitude || !destino.nome)) 
          console.warn("Dados do destino estão incompletos");
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
        data: dataFormatada, // Adiciona a data da viagem
        dataFormatadaLocal: `${dataAtual.getDate()}/${dataAtual.getMonth() + 1}/${dataAtual.getFullYear()}`, // Data em formato local
        timestamp: timestamp // Adiciona o timestamp para facilitar ordenação
      };

      console.log("Preparando para salvar dados:", dados);
      console.log("Usando chave única:", chaveUnica);
      
      // Salvar com chave única baseada em datetime
      await AsyncStorage.setItem(chaveUnica, JSON.stringify(dados));
      
      // Opcionalmente, ainda manter a última rota para acesso rápido
      await AsyncStorage.setItem('@ultimaRota', JSON.stringify(dados));
      
      console.log('Dados salvos com sucesso.');
    } catch (e) {
      console.error('Erro ao salvar os dados:', e);
    }
  };


  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Origem"
        onPress={(data, details = null) => setOrigem({
          nome: data.description,  // Adiciona o nome do local
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
          nome: data.description,  // Adiciona o nome do local
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
          // Então substitua o onPress dos botões de veículo
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

      {/* MODAL */}
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
            
            <Text>Escolha o veículo e o combustível</Text>

            <View style={styles.pickerContainer}>
              <Picker selectedValue={veiculo} onValueChange={(itemValue) => {
                setVeiculo(itemValue);
                filtraCombustivel(itemValue);
                }
              }>
                {Veiculos.map((veiculo, index) => (
                  <Picker.Item key={index} label={veiculo} value={veiculo.toLowerCase()} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Picker selectedValue={combustivel} onValueChange={(itemValue) => {setCombustivel(itemValue)}}>
                {Combustiveis.map((combustivel, index) => (
                  <Picker.Item key={index} label={combustivel} value={combustivel.toLowerCase()} />
                ))}
              </Picker>
            </View>

            <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
              <Text>Emissões de CO₂: {distancia ? ` ${calcularEmissaoFormatada(distancia, valorRealEmissao)} gCO₂` : ""}</Text>

              <View style={styles.gradientBarContainer}>
                <LinearGradient
                  colors={["green", "yellow", "orange", "red"]}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={styles.gradientBar}
                />
                <View style={[styles.indicator, { left: `${valorEmissao}%` }]} />
              </View>
            </View>

            <Pressable onPress={() => 
              {
                salvarRota();
                setModalVisivel(false);
              }} 
              style={styles.closeButton}>
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
    position: "relative" // Importante para posicionar o botão X
  },
  // Novo estilo para o botão X
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
  pickerContainer: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginVertical: 10
  },
  closeButton: { 
    marginTop: 20,
    padding: 10,
    backgroundColor: "#43B877",
    borderRadius: 5,
  },
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
  link: {
    color: '#1D959C',
    textDecorationLine: 'underline',
    marginTop: 20,
  },
});

export default Rota;