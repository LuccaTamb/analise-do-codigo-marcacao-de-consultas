import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Input, Button, Text } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';
import { ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// define o tipo das propriedades de navegação para a tela
type RegisterScreenProps = {
   navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC = () => {
   // obtém a função `register` do contexto de autenticação
   const { register } = useAuth();
   const navigation = useNavigation<RegisterScreenProps['navigation']>();
  
   // estados para os campos do formulário e feedback
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   // função para lidar com o envio do formulário de registro
   const handleRegister = async () => {
     try {
        setLoading(true);
        setError('');

        // validação básica dos campos
        if (!name || !email || !password) {
          setError('Por favor, preencha todos os campos');
          return;
        }

        // chama a função de registro do serviço de autenticação
        await register({
          name,
          email,
          password,
        });

        
        // navega para a tela de login após o sucesso do registro
        navigation.navigate('Login');
     } catch (err) {
        // exibe uma mensagem de erro em caso de falha
        setError('Erro ao criar conta. Tente novamente.');
     } finally {
        setLoading(false);
     }
   };

   return (
     <Container>
        <Title>Cadastro de Paciente</Title>
        
        <Input
          placeholder="Nome completo"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          containerStyle={styles.input}
        />

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={styles.input}
        />

        <Input
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={styles.input}
        />

        {error ? <ErrorText>{error}</ErrorText> : null}

        <Button
          title="Cadastrar"
          onPress={handleRegister}
          loading={loading}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        <Button
          title="Voltar para Login"
          onPress={() => navigation.navigate('Login')}
          containerStyle={styles.backButton as ViewStyle}
          buttonStyle={styles.backButtonStyle}
        />
     </Container>
   );
};

// objetos de estilo
const styles = {
   input: {
     marginBottom: 15,
   },
   button: {
     marginTop: 10,
     width: '100%',
   },
   buttonStyle: {
     backgroundColor: theme.colors.primary,
     paddingVertical: 12,
   },
   backButton: {
     marginTop: 10,
     width: '100%',
   },
   backButtonStyle: {
     backgroundColor: theme.colors.secondary,
     paddingVertical: 12,
   },
};

// componentes estilizados usando styled-components
const Container = styled.View`
   flex: 1;
   padding: 20px;
   justify-content: center;
   background-color: ${theme.colors.background};
`;

const Title = styled.Text`
   font-size: 24px;
   font-weight: bold;
   text-align: center;
   margin-bottom: 30px;
   color: ${theme.colors.text};
`;

const ErrorText = styled.Text`
   color: ${theme.colors.error};
   text-align: center;
   margin-bottom: 10px;
`;

export default RegisterScreen;