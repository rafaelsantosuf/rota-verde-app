import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DADOS_VEICULOS from '../../data/dados_final.json'; // Importando os dados

const Dados = () => {
  const [dados, setDados] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [marcaVeiculo, setMarcaVeiculo] = useState('');
  const [modeloVeiculo, setModeloVeiculo] = useState('');
  const [versaoVeiculo, setVersaoVeiculo] = useState('');
  const [motorVeiculo, setMotorVeiculo] = useState('');
  const [propulsaoVeiculo, setPropulsaoVeiculo] = useState('');
  const [veiculos, setVeiculos] = useState([]);
  const [totalEmissoes, setTotalEmissoes] = useState(0);
  // Adicionar estado para veículo selecionado
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState(null);

  // Opções filtradas para cada picker
  const [marcasDisponiveis, setMarcasDisponiveis] = useState([]);
  const [modelosDisponiveis, setModelosDisponiveis] = useState([]);
  const [versoesDisponiveis, setVersoesDisponiveis] = useState([]);
  const [motoresDisponiveis, setMotoresDisponiveis] = useState([]);
  const [propulsoesDisponiveis, setPropulsoesDisponiveis] = useState([]);

  useEffect(() => {
    carregarTodosDados();
    
    // Inicializar as marcas disponíveis
    const marcas = [...new Set(DADOS_VEICULOS.map(item => item.Marca))];
    setMarcasDisponiveis(marcas);
    if (marcas.length > 0) {
      setMarcaVeiculo(marcas[0]);
    }
  }, []);

  // Carregar veículo selecionado do AsyncStorage
  useEffect(() => {
    carregarVeiculoSelecionado();
  }, []);

  // Atualizar modelos quando a marca é alterada
  useEffect(() => {
    if (marcaVeiculo) {
      const modelos = [...new Set(DADOS_VEICULOS
        .filter(item => item.Marca === marcaVeiculo)
        .map(item => item.Modelo))];
      
      setModelosDisponiveis(modelos);
      
      if (modelos.length > 0) {
        setModeloVeiculo(modelos[0]);
      } else {
        setModeloVeiculo('');
      }
    }
  }, [marcaVeiculo]);

  // Atualizar versões quando o modelo é alterado
  useEffect(() => {
    if (modeloVeiculo) {
      const versoes = [...new Set(DADOS_VEICULOS
        .filter(item => item.Marca === marcaVeiculo && item.Modelo === modeloVeiculo)
        .map(item => item.Versao))];
      
      setVersoesDisponiveis(versoes);
      
      if (versoes.length > 0) {
        setVersaoVeiculo(versoes[0]);
      } else {
        setVersaoVeiculo('');
      }
    }
  }, [marcaVeiculo, modeloVeiculo]);

  // Atualizar motores quando a versão é alterada
  useEffect(() => {
    if (versaoVeiculo) {
      const motores = [...new Set(DADOS_VEICULOS
        .filter(item => 
          item.Marca === marcaVeiculo && 
          item.Modelo === modeloVeiculo && 
          item.Versao === versaoVeiculo
        )
        .map(item => item.Motor))];
      
      setMotoresDisponiveis(motores);
      
      if (motores.length > 0) {
        setMotorVeiculo(motores[0]);
      } else {
        setMotorVeiculo('');
      }
    }
  }, [marcaVeiculo, modeloVeiculo, versaoVeiculo]);

  // Atualizar propulsões quando o motor é alterado
  useEffect(() => {
    if (motorVeiculo) {
      const propulsoes = [...new Set(DADOS_VEICULOS
        .filter(item => 
          item.Marca === marcaVeiculo && 
          item.Modelo === modeloVeiculo && 
          item.Versao === versaoVeiculo && 
          item.Motor === motorVeiculo
        )
        .map(item => item["Tipo de Propulsao\nCombustão Hibrido Plug-in Eletrico"]))];
      
      setPropulsoesDisponiveis(propulsoes);
      
      if (propulsoes.length > 0) {
        setPropulsaoVeiculo(propulsoes[0]);
      } else {
        setPropulsaoVeiculo('');
      }
    }
  }, [marcaVeiculo, modeloVeiculo, versaoVeiculo, motorVeiculo]);

  const carregarTodosDados = async () => {
    try {
      setCarregando(true);
      await carregarRotas();
      await carregarVeiculos();
      await carregarVeiculoSelecionado();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Falha ao carregar os dados.');
    } finally {
      setCarregando(false);
    }
  };

  // Carregar rotas do AsyncStorage
  const carregarRotas = async () => {
    try {
      // Obter todas as chaves do AsyncStorage
      const chaves = await AsyncStorage.getAllKeys();
      
      // Filtrar apenas as chaves que começam com "@rota_"
      const chavesRota = chaves.filter(chave => chave.startsWith('@rota_'));
      
      // Obter os valores das chaves de rota
      const dadosArmazenados = await AsyncStorage.multiGet(chavesRota);
      
      // Converter o array de pares [chave, valor] em um objeto
      const dadosObj = {};
      let somaEmissoes = 0;
      
      dadosArmazenados.forEach(([chave, valor]) => {
        try {
          const rotaObj = JSON.parse(valor);
          dadosObj[chave] = rotaObj;
          
          // Somar as emissões
          if (rotaObj && rotaObj.emissao) {
            somaEmissoes += parseFloat(rotaObj.emissao) || 0;
          }
        } catch (e) {
          dadosObj[chave] = valor;
        }
      });
      
      setDados(dadosObj);
      setTotalEmissoes(somaEmissoes); // Atualizar o total de emissões
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
      throw error;
    }
  };

  // Função para carregar veículo selecionado
  const carregarVeiculoSelecionado = async () => {
    try {
      const veiculoSelecionadoStr = await AsyncStorage.getItem('@veiculo_selecionado');
      if (veiculoSelecionadoStr) {
        setVeiculoSelecionadoId(veiculoSelecionadoStr);
      }
    } catch (error) {
      console.error('Erro ao carregar veículo selecionado:', error);
    }
  };

  // Função para salvar veículo selecionado
  const salvarVeiculoSelecionado = async (id) => {
    try {
      await AsyncStorage.setItem('@veiculo_selecionado', id);
      setVeiculoSelecionadoId(id);
    } catch (error) {
      console.error('Erro ao salvar veículo selecionado:', error);
    }
  };

  // Function to handle new route additions
  const atualizarAposNovaRota = async () => {
    try {
      await carregarRotas();
    } catch (error) {
      console.error('Erro ao atualizar rotas:', error);
      Alert.alert("Erro", "Não foi possível atualizar os dados de rota.");
    }
  };

  // Carregar veículos do AsyncStorage
  const carregarVeiculos = async () => {
    try {
      const chaves = await AsyncStorage.getAllKeys();
      const chavesVeiculos = chaves.filter(chave => chave.startsWith('@veiculo_') && chave !== '@veiculo_selecionado');
      
      if (chavesVeiculos.length > 0) {
        const dadosVeiculos = await AsyncStorage.multiGet(chavesVeiculos);
        const veiculosObj = dadosVeiculos.map(([chave, valor]) => {
          return {
            id: chave,
            ...JSON.parse(valor)
          };
        });
        
        setVeiculos(veiculosObj);
      } else {
        setVeiculos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      throw error;
    }
  };

  // Apagar veículo
  const apagarVeiculo = async (id) => {
    Alert.alert(
      "Confirmação",
      "Tem certeza que deseja apagar este veículo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Apagar", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(id);
              
              // Se o veículo sendo apagado for o selecionado, remover seleção
              if (id === veiculoSelecionadoId) {
                await AsyncStorage.removeItem('@veiculo_selecionado');
                setVeiculoSelecionadoId(null);
              }
              
              setVeiculos(veiculos.filter(veiculo => veiculo.id !== id));
            } catch (error) {
              console.error('Erro ao apagar veículo:', error);
              Alert.alert("Erro", "Não foi possível apagar o veículo.");
            }
          }
        }
      ]
    );
  };

  // Função para manipular o pressionar e segurar em um veículo
  const handleLongPress = (id) => {
    Alert.alert(
      "Selecionar Veículo",
      "Deseja selecionar este veículo para cálculos de emissão?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Selecionar", 
          onPress: () => salvarVeiculoSelecionado(id)
        }
      ]
    );
  };

  // Apagar rota
  const apagarRota = async (chave) => {
    Alert.alert(
      "Confirmação",
      "Tem certeza que deseja apagar esta rota?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Apagar", 
          style: "destructive",
          onPress: async () => {
            try {
              // Obter o valor da rota antes de apagá-la para subtrair da soma
              const rotaParaApagar = dados[chave];
              await AsyncStorage.removeItem(chave);
              
              // Atualizar o estado removendo a rota apagada
              const novosDados = {...dados};
              delete novosDados[chave];
              setDados(novosDados);
              
              // Atualizar o total de emissões
              if (rotaParaApagar && rotaParaApagar.emissao) {
                setTotalEmissoes(prevTotal => prevTotal - parseFloat(rotaParaApagar.emissao));
              }
            } catch (error) {
              console.error('Erro ao apagar rota:', error);
              Alert.alert("Erro", "Não foi possível apagar a rota.");
            }
          }
        }
      ]
    );
  };

  // Formatar a data no formato dd/mm/yyyy
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
  };

  // Formatar números substituindo ponto por vírgula
  const formatarNumero = (numero) => {
    return String(numero).replace('.', ',');
  };

  // Função para abrir o modal
  const abrirModal = () => {
    setModalVisivel(true);
  };

  // Função para fechar o modal
  const fecharModal = () => {
    setModalVisivel(false);
  };

  // Função para salvar o veículo
  const salvarVeiculo = async () => {
    try {
      // Encontrar o veículo correspondente no JSON com base nas seleções
      const veiculoSelecionado = DADOS_VEICULOS.find(item => 
        item.Marca === marcaVeiculo && 
        item.Modelo === modeloVeiculo && 
        item.Versao === versaoVeiculo && 
        item.Motor === motorVeiculo && 
        item["Tipo de Propulsao\nCombustão Hibrido Plug-in Eletrico"] === propulsaoVeiculo
      );
      
      // Se não encontrar o veículo, lançar erro
      if (!veiculoSelecionado) {
        throw new Error('Veículo não encontrado nos dados');
      }
      
      const novoVeiculo = {
        marca: marcaVeiculo,
        modelo: modeloVeiculo,
        versao: versaoVeiculo,
        motor: motorVeiculo,
        propulsao: propulsaoVeiculo,
        // Adicionando os novos campos do JSON
        etanol: veiculoSelecionado.Etanol || 0,
        gasolinaDiesel: veiculoSelecionado.GasolinaDiesel || 0,
        vehp: veiculoSelecionado.VEHP || 0,
        dataCadastro: new Date().toISOString(),
      };
      
      const id = `@veiculo_${Date.now()}`;
      await AsyncStorage.setItem(id, JSON.stringify(novoVeiculo));
      
      // Adicionar o novo veículo à lista local
      const novoVeiculoComId = { id, ...novoVeiculo };
      setVeiculos([...veiculos, novoVeiculoComId]);
      
      // Resetar seleção para valores padrão
      const marcas = [...new Set(DADOS_VEICULOS.map(item => item.Marca))];
      if (marcas.length > 0) {
        setMarcaVeiculo(marcas[0]);
      }
      
      // Se não houver veículo selecionado ainda, selecionar automaticamente este
      if (!veiculoSelecionadoId) {
        await salvarVeiculoSelecionado(id);
      }
      
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      Alert.alert("Erro", "Não foi possível salvar o veículo.");
    }
    
    fecharModal();
  };

  // Renderizar a lista de veículos
  const renderizarVeiculos = () => {
    if (veiculos.length === 0) {
      return <Text style={styles.mensagem}>Nenhum veículo cadastrado.</Text>;
    }

    return veiculos.map((veiculo) => {
      // Determinar se este é o veículo selecionado
      const isSelected = veiculo.id === veiculoSelecionadoId;
      
      // Estilo condicional baseado na seleção
      const veiculoEstilo = isSelected ? 
        {...styles.veiculoItem, ...styles.veiculoItemSelecionado} : 
        styles.veiculoItem;
      
      return (
        <Pressable 
          key={veiculo.id} 
          style={veiculoEstilo}
          onLongPress={() => handleLongPress(veiculo.id)}
          delayLongPress={500} // Meio segundo para acionar o long press
        >
          <View style={styles.veiculoConteudo}>
            <Text style={styles.veiculoInfo}>
              Marca: {veiculo.marca}
            </Text>
            <Text style={styles.veiculoInfo}>
              Modelo: {veiculo.modelo}
            </Text>
            {isSelected && (
              <Text style={styles.veiculoSelecionadoTexto}>✓ Selecionado</Text>
            )}
          </View>
          <Pressable 
            style={styles.deleteButton} 
            onPress={() => apagarVeiculo(veiculo.id)}
          >
            <Text style={styles.deleteButtonText}>X</Text>
          </Pressable>
        </Pressable>
      );
    });
  };

  // Renderiza cada item de dados no formato solicitado
  const renderizarDados = () => {
    const chaves = Object.keys(dados);
    
    if (chaves.length === 0) {
      return <Text style={styles.mensagem}>Nenhum dado encontrado no armazenamento.</Text>;
    }

    return chaves.map((chave) => {
      const rota = dados[chave];
      
      // Verifica se os dados têm a estrutura esperada
      if (!rota || !rota.origem || !rota.destino) {
        return (
          <View key={chave} style={styles.item}>
            <Text style={styles.erro}>Formato de dados inválido para {chave}</Text>
          </View>
        );
      }
      
      // Formata a data ou usa a data formatada local se disponível
      const dataFormatada = rota.data ? formatarData(rota.data) : rota.dataFormatadaLocal || 'Data não disponível';
      
      // Formata os valores numéricos trocando . por ,
      const distanciaFormatada = formatarNumero(rota.distancia);
      const emissaoFormatada = formatarNumero(rota.emissao);
      
      return (
        <View key={chave} style={styles.item}>
          <View style={styles.itemHeader}>
            <Text style={styles.data}>{dataFormatada}</Text>
            <Pressable 
              style={styles.deleteButton} 
              onPress={() => apagarRota(chave)}
            >
              <Text style={styles.deleteButtonText}>X</Text>
            </Pressable>
          </View>
          <Text style={styles.info}>Origem: {rota.origem.nome}</Text>
          <Text style={styles.info}>Destino: {rota.destino.nome}</Text>
          <Text style={styles.info}>Distância: {distanciaFormatada} km</Text>
          <Text style={styles.info}>Emissão: {emissaoFormatada} g CO₂</Text>
        </View>
      );
    });
  };

  // Renderizar os pickers no modal
  const renderizarPickers = () => {
    return (
      <>
        <Text style={styles.label}>Marca</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={marcaVeiculo}
            onValueChange={(itemValue) => setMarcaVeiculo(itemValue)}
            style={styles.picker}
          >
            {marcasDisponiveis.map((marca) => (
              <Picker.Item key={marca} label={marca} value={marca} />
            ))}
          </Picker>
        </View>
        
        <Text style={styles.label}>Modelo</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={modeloVeiculo}
            onValueChange={(itemValue) => setModeloVeiculo(itemValue)}
            style={styles.picker}
            enabled={modelosDisponiveis.length > 0}
          >
            {modelosDisponiveis.map((modelo) => (
              <Picker.Item key={modelo} label={modelo} value={modelo} />
            ))}
          </Picker>
        </View>
        
        <Text style={styles.label}>Versão</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={versaoVeiculo}
            onValueChange={(itemValue) => setVersaoVeiculo(itemValue)}
            style={styles.picker}
            enabled={versoesDisponiveis.length > 0}
          >
            {versoesDisponiveis.map((versao) => (
              <Picker.Item key={versao} label={versao} value={versao} />
            ))}
          </Picker>
        </View>
        
        <Text style={styles.label}>Motor</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={motorVeiculo}
            onValueChange={(itemValue) => setMotorVeiculo(itemValue)}
            style={styles.picker}
            enabled={motoresDisponiveis.length > 0}
          >
            {motoresDisponiveis.map((motor) => (
              <Picker.Item key={motor} label={motor} value={motor} />
            ))}
          </Picker>
        </View>
        
        <Text style={styles.label}>Tipo de Propulsão</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={propulsaoVeiculo}
            onValueChange={(itemValue) => setPropulsaoVeiculo(itemValue)}
            style={styles.picker}
            enabled={propulsoesDisponiveis.length > 0}
          >
            {propulsoesDisponiveis.map((propulsao) => (
              <Picker.Item key={propulsao} label={propulsao} value={propulsao} />
            ))}
          </Picker>
        </View>
      </>
    );
  };

  // Conteúdo do modal para adicionar veículo
  const renderizarModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={fecharModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Veículo</Text>
            
            <Pressable style={styles.closeIconButton} onPress={fecharModal}>
              <Text>X</Text>
            </Pressable>
            
            {renderizarPickers()}
            
            <View style={styles.botoesContainer}>
              <Pressable style={styles.closeButton} onPress={fecharModal}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.closeButton, styles.saveButton]} 
                onPress={salvarVeiculo}
                disabled={!marcaVeiculo || !modeloVeiculo || !versaoVeiculo || !motorVeiculo || !propulsaoVeiculo}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </Pressable>
            </View>
            
          </View>
        </View>
      </Modal>
    );
  };

  // Botão de atualização manual
  const renderizarBotaoAtualizar = () => {
    return (
      <Pressable 
        style={styles.refreshButton}
        onPress={carregarTodosDados}
      >
        <Text style={styles.refreshButtonText}>Atualizar</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.titulo}>Meus Veículos:</Text>
        <Pressable onPress={abrirModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>
      
      <ScrollView style={styles.veiculosScroll} contentContainerStyle={styles.veiculosContent}>
        {renderizarVeiculos()}
      </ScrollView>

      <View style={styles.headerContainer}>
        <Text style={styles.titulo}>Minhas Emissões:</Text>
      </View>

      <View style={styles.emissaoContainer}>
        <View style={styles.pegadaContainer}>
          <Text style={styles.pegadaIcon}>👣</Text>
          <Text style={styles.pegadaValor}>{formatarNumero(totalEmissoes.toFixed(2))} g CO₂</Text>
        </View>
      </View>
      
      <View style={styles.headerContainer}>
        <Text style={styles.titulo}>Histórico de Rotas</Text>
        {renderizarBotaoAtualizar()}
      </View>
      
      {carregando ? (
        <ActivityIndicator size="large" color="#0066cc" />
      ) : erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {renderizarDados()}
        </ScrollView>
      )}

      {renderizarModal()}
    </View>
  );
};

export default Dados;

// Exportar a função para adicionar rota para uso em outros componentes
export const adicionarNovaRota = async (novaRota) => {
  try {
    const id = `@rota_${Date.now()}`;
    await AsyncStorage.setItem(id, JSON.stringify(novaRota));
    return true;
  } catch (error) {
    console.error('Erro ao adicionar nova rota:', error);
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  tituloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  emissaoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 40,
  },
  pegadaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#43b877',
  },
  pegadaIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  pegadaValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#43b877',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#43b877',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 5,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  refreshButton: {
    backgroundColor: '#43b877',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginBottom: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  veiculosScroll: {
    maxHeight: 102, // Aumentado para acomodar o texto "Selecionado"
    marginBottom: 20,
  },
  veiculosContent: {
    paddingBottom: 10,
  },
  veiculoItem: {
    backgroundColor: '#f0f8f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#43b877',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Estilo para veículo selecionado
  veiculoItemSelecionado: {
    backgroundColor: '#d4f5e2',
    borderLeftColor: '#2b9d5f',
    borderWidth: 1,
    borderColor: '#43b877',
  },
  veiculoSelecionadoTexto: {
    color: '#2b9d5f',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 4,
  },
  veiculoConteudo: {
    flex: 1,
  },
  veiculoInfo: {
    fontSize: 15,
    color: '#444',
    marginBottom: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#43b877',
  },
  data: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  info: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
  },
  mensagem: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  erro: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  // Estilos para o modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
    maxHeight: '80%',
  },
  closeIconButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    marginTop: 10,
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 5,
    marginTop: 10,
    marginBottom: 5,
    fontSize: 16,
    color: '#555',
  },
  pickerContainer: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginVertical: 5,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    width: '100%',
  },
  closeButton: { 
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#43B877',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});