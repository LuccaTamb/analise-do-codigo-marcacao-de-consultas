import React from 'react';
import styled from 'styled-components/native';
import { Avatar } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import theme from '../styles/theme';

const Header: React.FC = () => {
  // Obtém o usuário do contexto de autenticação.
  const { user } = useAuth();

  // Se não houver usuário logado, não renderiza o cabeçalho.
  if (!user) return null;

  return (
    <Container>
      <UserInfo>
        <Avatar
          size="medium"
          rounded
          source={{ uri: user.image }}
          containerStyle={styles.avatar}
        />
        <TextContainer>
          <WelcomeText>Bem-vindo(a),</WelcomeText>
          <UserName>{user.name}</UserName>
        </TextContainer>
      </UserInfo>
      {/* Renderiza o componente do sino de notificação. */}
      <NotificationBell />
    </Container>
  );
};

// Objetos de estilo para componentes nativos.
const styles = {
  avatar: {
    backgroundColor: theme.colors.primary,
  },
};

// Componentes estilizados com `styled-components`.
const Container = styled.View`
  background-color: ${theme.colors.primary};
  padding: 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border};
`;

const UserInfo = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const TextContainer = styled.View`
  margin-left: 12px;
`;

const WelcomeText = styled.Text`
  font-size: 14px;
  color: ${theme.colors.white};
  opacity: 0.9;
`;

const UserName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.white};
`;

export default Header;