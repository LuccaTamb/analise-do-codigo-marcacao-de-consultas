import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { Badge } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { notificationService } from '../services/notifications';
import theme from '../styles/theme';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Função para carregar o número de notificações não lidas.
  const loadUnreadCount = async () => {
    // Interrompe se não houver um usuário logado.
    if (!user?.id) return;

    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao carregar contador de notificações:', error);
    }
  };

  // Carrega a contagem inicial e configura a atualização a cada 30 segundos.
  useEffect(() => {
    loadUnreadCount();

    // Configura um intervalo para buscar novas notificações.
    const interval = setInterval(loadUnreadCount, 30000);

    // Limpa o intervalo quando o componente é desmontado.
    return () => clearInterval(interval);
  }, [user?.id]); // Re-executa o efeito se o ID do usuário mudar.

  // Recarrega a contagem de notificações sempre que a tela está em foco.
  useFocusEffect(
    React.useCallback(() => {
      loadUnreadCount();
      // O useCallback impede que o efeito seja recriado a cada renderização.
    }, [user?.id]) // Depende apenas do ID do usuário.
  );

  // Lida com o evento de pressionar o sino.
  const handlePress = () => {
    navigation.navigate('Notifications' as never);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <BellContainer>
        <BellIcon>🔔</BellIcon>
        {/* Renderiza a insígnia (badge) apenas se houver notificações não lidas. */}
        {unreadCount > 0 && (
          <Badge
            value={unreadCount > 99 ? '99+' : unreadCount.toString()}
            status="error"
            containerStyle={styles.badge}
            textStyle={styles.badgeText}
          />
        )}
      </BellContainer>
    </TouchableOpacity>
  );
};

// Objetos de estilo para componentes nativos.
const styles = {
  badge: {
    position: 'absolute' as const,
    top: -8,
    right: -8,
  },
  badgeText: {
    fontSize: 10,
  },
};

// Componentes estilizados com `styled-components`.
const BellContainer = styled.View`
  position: relative;
  padding: 8px;
`;

const BellIcon = styled.Text`
  font-size: 24px;
  color: ${theme.colors.white};
`;

export default NotificationBell;