import React from 'react';
import styled from 'styled-components/native';
import { ViewStyle, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar } from 'react-native-elements';
import theme from '../styles/theme';

// Define a interface para as propriedades do componente.
interface AppointmentCardProps {
  doctorName: string;
  date: string;
  time: string;
  specialty: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  onPress?: () => void;
  style?: ViewStyle;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  doctorName,
  date,
  time,
  specialty,
  status,
  onPress,
  style,
}) => {
  // Retorna uma cor baseada no status da consulta.
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <CardContainer onPress={onPress} disabled={!onPress} style={style}>
      <Card containerStyle={styles.card}>
        <CardContent>
          <DoctorInfo>
            <Avatar
              size="medium"
              rounded
              source={{ uri: `https://randomuser.me/api/portraits/men/4.jpg` }}
              containerStyle={styles.avatar}
            />
            <TextContainer>
              <DoctorName>{doctorName}</DoctorName>
              <Specialty>{specialty}</Specialty>
            </TextContainer>
          </DoctorInfo>

          <AppointmentInfo>
            <InfoRow>
              <InfoLabel>Data:</InfoLabel>
              <InfoValue>{date}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Horário:</InfoLabel>
              <InfoValue>{time}</InfoValue>
            </InfoRow>
          </AppointmentInfo>

          <StatusContainer>
            <StatusDot color={getStatusColor()} />
            <StatusText color={getStatusColor()}>
              {status === 'confirmed' ? 'Confirmada' : status === 'cancelled' ? 'Cancelada' : 'Pendente'}
            </StatusText>
          </StatusContainer>
        </CardContent>
      </Card>
    </CardContainer>
  );
};

// Objeto de estilo para componentes nativos.
const styles = {
  card: {
    borderRadius: 10,
    marginHorizontal: 0,
    marginVertical: 0, // Removido para controlar o espaçamento no componente principal
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
};

// Componentes estilizados com `styled-components`.
const CardContainer = styled(TouchableOpacity)`
  margin-horizontal: 0;
  margin-vertical: 8px; /* Espaçamento entre os cartões */
`;

const CardContent = styled.View`
  padding: 10px;
`;

const DoctorInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const TextContainer = styled.View`
  margin-left: 15px;
`;

const DoctorName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.text};
`;

const Specialty = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text};
  opacity: 0.7;
`;

const AppointmentInfo = styled.View`
  margin-bottom: 15px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const InfoLabel = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text};
  opacity: 0.7;
`;

const InfoValue = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text};
  font-weight: 500;
`;

const StatusContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
`;

const StatusDot = styled.View<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.color};
  margin-right: 8px;
`;

const StatusText = styled.Text<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
  font-weight: 500;
`;

export default AppointmentCard;