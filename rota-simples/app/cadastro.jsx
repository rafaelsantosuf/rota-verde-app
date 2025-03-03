import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Pressable } from 'react-native';
import { Link } from 'expo-router';

const Cadastro = () => {

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleCadastro = () => {
        console.log(`Email: ${email}, Senha: ${password}`);
    };

    const handlePress = () => {
        console.log("Link pressionado!"); // Aqui você adiciona a navegação depois
    };

    return (
    <View style={styles.container}>

        <Image source={require('../assets/images/logo-rota-verde.png')} style={styles.img} />

        <TextInput
                style={styles.input}
                placeholder="Nome Completo"
                value={nome}
                onChangeText={setNome} // Agora altera apenas o nome
        />

        <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail} // Agora altera apenas o email
        keyboardType="email-address"
        />

        <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword} // Agora altera apenas a senha
        />

        <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword} // Agora altera apenas a confirmação de senha
        />

        <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Cadastrar-se</Text>
        </Pressable>
{/* 
      <Text style={styles.text}>
        <Pressable onPress={handlePress}>
          <Text style={styles.link}>Esqueci a senha</Text>
        </Pressable>
      </Text>

      <Text style={styles.text}>
        Ainda não tem conta?{' '}
        <Pressable onPress={handlePress}>
          <Text style={styles.link}>Cadastre-se</Text>
        </Pressable>
      </Text> */}

    </View>
  );
};

export default Cadastro;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    alignItems: 'center', // Centraliza os textos horizontalmente
    justifyContent: 'center', // Centraliza tudo na tela
    paddingHorizontal: 20,
  },
  img: {
    width: 150,
    height: 150,
    marginTop: 0,
    marginBottom: 30,

  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 71,
    width: 290,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 100,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#43B877', // Cor verde
    paddingVertical: 20,
    paddingHorizontal: 100,
    borderRadius: 0,
    marginTop: 13,
  },
  link: {
    color: '#1D959C',
    textDecorationLine: 'underline',
    marginTop: 20,
  },
});
