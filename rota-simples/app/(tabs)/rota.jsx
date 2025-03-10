import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, Modal, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import polyline from '@mapbox/polyline';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import dadosVeiculos from '../../data/veiculos.json';

// Armazena todas as opções de veículos
let Veiculos = dadosVeiculos.veiculos.map(veiculo => veiculo.tipo).filter(tipo => tipo.toLowerCase().includes("carro"));
const equivalentes = {
  "driving": "Carro",
  "motorcycle": "Moto",
  "transit": "Ônibus",
};

let Combustiveis = dadosVeiculos.veiculos.map(veiculo => veiculo.combustiveis).flat().map(combustivel => combustivel.tipo);

const Rota = () => {
  const [origem, setOrigem] = useState(null);
  const [destino, setDestino] = useState(null);
  const [rota, setRota] = useState(null);
  const [modoTransporte, setModoTransporte] = useState("driving");
  const [modalVisivel, setModalVisivel] = useState(false);
  const [veiculo, setVeiculo] = useState("Carro Compacto");
  const [combustivel, setCombustivel] = useState("Gasolina ou Etanol");
  const mapRef = useRef(null);

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
      Combustiveis = veiculoSelecionado.combustiveis.map(combustivel => combustivel.tipo);
    }
  };


  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Origem"
        onPress={(data, details = null) => setOrigem({
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
            onPress={() => {
              setModoTransporte(value);
              filtraVeiculo(value);
            }}
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
            <Text>Escolha o veículo e o combustível</Text>

            <View style={styles.pickerContainer}>
              <Picker selectedValue={veiculo} onValueChange={(itemValue) => {
                setVeiculo(itemValue);
                filtraCombustivel(itemValue);
                }
              }>
                {Veiculos.map((veiculo, index) => (
                  <Picker.Item key={index} label={veiculo} value={veiculo} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
            <Picker selectedValue={veiculo} onValueChange={(itemValue) => setVeiculo(itemValue)}>
                {Combustiveis.map((veiculo, index) => (
                  <Picker.Item key={index} label={veiculo} value={veiculo.toLowerCase()} />
                ))}
              </Picker>
            </View>

            <Pressable onPress={() => setModalVisivel(false)} style={styles.closeButton}>
              <Text style={{ color: "white" }}>Confirmar</Text>
            </Pressable>

          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  autocomplete: { container: { flex: 0 }, textInput: { height: 40, borderWidth: 1, borderColor: '#E5E5E5' } },
  map: { flex: 1 },
  botoesContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  button: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#444", justifyContent: "center", alignItems: "center" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { width: 300, padding: 20, backgroundColor: "white", borderRadius: 10, alignItems: "center" },
  pickerContainer: { width: '100%', height: 50, justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: 5, marginVertical: 10 },
  closeButton: { marginTop: 20, padding: 10, backgroundColor: "#43B877", borderRadius: 5 },
});

export default Rota;