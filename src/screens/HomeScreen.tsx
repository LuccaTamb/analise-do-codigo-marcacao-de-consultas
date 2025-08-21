import React, { useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { FontAwesome } from '@expo/vector-icons';
import { HeaderContainer, HeaderTitle } from '../components/Header';
import theme from '../styles/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment } from '../types/appointments';
import { Doctor } from '../types/doctors';
import { RootStackParamList } from '../types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { ViewStyle } from 'react-native';

// define o tipo das propriedades de navegação para a tela
type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

// dados de exemplo para médicos
const doctors: Doctor[] = [
  {
   id: '1',
   name: 'Dr. João Silva',
   specialty: 'Cardiologista',
   image: 'https://images.unsplash.com/photo-1612348316139-445a4a5b4f2a?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max'
  },
  {
   id: '2',
   name: 'Dra. Maria Santos',
   specialty: 'Dermatologista',
   image: 'https://images.unsplash.com/photo-1559839734-2b716b1fd82f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max'
  },
  {
   id: '3',
   name: 'Dr. Pedro Oliveira',
   specialty: 'Oftalmologista',
   image: 'https://images.unsplash.com/photo-1576091160550-21731631d87e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max'
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // função para carregar as consultas do AsyncStorage
  const loadAppointments = async () => {
   try {
     const storedAppointments = await AsyncStorage.getItem('appointments');
     if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
     }
   } catch (error) {
     console.error('Erro ao carregar consultas:', error);
   }
  };

  // recarrega as consultas sempre que a tela ganha foco
  useFocusEffect(
   React.useCallback(() => {
     loadAppointments();
   }, [])
  );

  // lida com a ação de "pull to refresh"
  const onRefresh = async () => {
   setRefreshing(true);
   await loadAppointments();
   setRefreshing(false);
  };

  // obtém os dados do médico a partir do ID
  const getDoctorInfo = (doctorId: string): Doctor | undefined => {
   return doctors.find(doctor => doctor.id === doctorId);
  };

  // renderiza um item da lista de consultas
  const renderAppointment = ({ item }: { item: Appointment }) => {
   const doctor = getDoctorInfo(item.doctorId);
   
   return (
     <AppointmentCard>
      <DoctorImage source={{ uri: doctor?.image || 'https://via.placeholder.com/150' }} />
      <InfoContainer>
        <DoctorName>{doctor?.name || 'Médico não encontrado'}</DoctorName>
        <DoctorSpecialty>{doctor?.specialty || 'Especialidade não encontrada'}</DoctorSpecialty>
        <DateTime>{new Date(item.date).toLocaleDateString()} - {item.time}</DateTime>
        <Description>{item.description}</Description>
        <Status status={item.status}>
         {item.status === 'pending' ? 'Pendente' : 'Confirmado'}
        </Status>
        <ActionButtons>
         <ActionButton>
           <Icon name="edit" type="material" size={20} color={theme.colors.primary} />
         </ActionButton>
         <ActionButton>
           <Icon name="delete" type="material" size={20} color={theme.colors.error} />
         </ActionButton>
        </ActionButtons>
      </InfoContainer>
     </AppointmentCard>
   );
  };

  return (
   <Container>
     <HeaderContainer>
      <HeaderTitle>Minhas Consultas</HeaderTitle>
     </HeaderContainer>

     <Content>
      <Button
        title="Agendar Nova Consulta"
        icon={
         <FontAwesome
           name="calendar-plus-o"
           size={20}
           color="white"
           style={{ marginRight: 8 }}
         />
        }
        buttonStyle={{
         backgroundColor: theme.colors.primary,
         borderRadius: 8,
         padding: 12,
         marginBottom: theme.spacing.medium
        }}
        onPress={() => navigation.navigate('CreateAppointment')}
      />

      <AppointmentList
        data={appointments}
        keyExtractor={(item: Appointment) => item.id}
        renderItem={renderAppointment}
        refreshControl={
         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
         <EmptyText>Nenhuma consulta agendada</EmptyText>
        }
      />
     </Content>
   </Container>
  );
};

// componentes estilizados
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Content = styled.View`
  flex: 1;
  padding: ${theme.spacing.medium}px;
`;

const AppointmentList = styled(FlatList)`
  flex: 1;
`;

const AppointmentCard = styled.View`
  background-color: ${theme.colors.white};
  border-radius: 8px;
  padding: ${theme.spacing.medium}px;
  margin-bottom: ${theme.spacing.medium}px;
  flex-direction: row;
  align-items: center;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
`;

const DoctorImage = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  margin-right: ${theme.spacing.medium}px;
`;

const InfoContainer = styled.View`
  flex: 1;
`;

const DoctorName = styled.Text`
  font-size: ${theme.typography.subtitle.fontSize}px;
  font-weight: ${theme.typography.subtitle.fontWeight};
  color: ${theme.colors.text};
`;

const DoctorSpecialty = styled.Text`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${theme.colors.text};
  opacity: 0.8;
  margin-bottom: 4px;
`;

const DateTime = styled.Text`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${theme.colors.primary};
  margin-top: 4px;
`;

const Description = styled.Text`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${theme.colors.text};
  opacity: 0.8;
  margin-top: 4px;
`;

const Status = styled.Text<{ status: string }>`
  font-size: ${theme.typography.body.fontSize}px;
  color: ${(props: { status: string }) => props.status === 'pending' ? theme.colors.error : theme.colors.success};
  margin-top: 4px;
  font-weight: bold;
`;

const ActionButtons = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-top: ${theme.spacing.small}px;
`;

const ActionButton = styled(TouchableOpacity)`
  padding: ${theme.spacing.small}px;
  margin-left: ${theme.spacing.small}px;
`;

const EmptyText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  opacity: 0.6;
  margin-top: ${theme.spacing.large}px;
`;

export default HomeScreen;