import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, ViewStyle } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import theme from '../styles/theme';
import Header from '../components/Header';
import DoctorList from '../components/DoctorList';
import TimeSlotList from '../components/TimeSlotList';
import { notificationService } from '../services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define o tipo das propriedades de navegação para a tela.
type CreateAppointmentScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateAppointment'>;
};

// Interface para a estrutura de uma consulta.
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  specialty: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Interface para a estrutura de um médico.
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

// Dados de exemplo para médicos disponíveis.
const availableDoctors: Doctor[] = [
  {
   id: '1',
   name: 'Dr. João Silva',
   specialty: 'Cardiologia',
   image: 'https://images.unsplash.com/photo-1612348316139-445a4a5b4f2a?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max'
  },
  {
   id: '2',
   name: 'Dra. Maria Santos',
   specialty: 'Pediatria',
   image: 'https://images.unsplash.com/photo-1559839734-2b716b1fd82f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max'
  },
  {
   id: '3',
   name: 'Dr. Pedro Oliveira',
   specialty: 'Ortopedia',
   image: 'https://images.unsplash.com/photo-1576091160550-21731631d87e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max'
  },
  {
   id: '4',
   name: 'Dra. Ana Costa',
   specialty: 'Dermatologia',
   image: 'https://images.unsplash.com/photo-1582750433449-648fd1413dc9?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max'
  },
  {
   id: '5',
   name: 'Dr. Carlos Mendes',
   specialty: 'Oftalmologia',
   image: 'https://images.unsplash.com/photo-1633526543265-538d381c19b6?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max'
  },
];

const CreateAppointmentScreen: React.FC = () => {
  // Obtém o usuário do contexto de autenticação.
  const { user } = useAuth();
  const navigation = useNavigation<CreateAppointmentScreenProps['navigation']>();

  // Estados para armazenar as seleções do usuário e o estado da UI.
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lida com o agendamento da consulta.
  const handleCreateAppointment = async () => {
   try {
     setLoading(true);
     setError('');

     // Valida os campos do formulário.
     if (!date || !selectedTime || !selectedDoctor) {
      setError('Por favor, preencha a data e selecione um médico e horário');
      return;
     }

     // Carrega as consultas existentes do AsyncStorage.
     const storedAppointments = await AsyncStorage.getItem('@MedicalApp:appointments');
     const appointments: Appointment[] = storedAppointments ? JSON.parse(storedAppointments) : [];

     // Cria o objeto da nova consulta.
     const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientId: user?.id || '',
      patientName: user?.name || '',
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date,
      time: selectedTime,
      specialty: selectedDoctor.specialty,
      status: 'pending',
     };

     // Adiciona a nova consulta à lista.
     appointments.push(newAppointment);

     // Salva a lista atualizada no AsyncStorage.
     await AsyncStorage.setItem('@MedicalApp:appointments', JSON.stringify(appointments));

     // Envia uma notificação para o médico.
     await notificationService.notifyNewAppointment(selectedDoctor.id, newAppointment);

     // Exibe uma mensagem de sucesso e volta para a tela anterior.
     alert('Consulta agendada com sucesso!');
     navigation.goBack();
   } catch (err) {
     setError('Erro ao agendar consulta. Tente novamente.');
   } finally {
     setLoading(false);
   }
  };

  return (
   <Container>
     <Header />
     <ScrollView contentContainerStyle={styles.scrollContent}>
      <Title>Agendar Consulta</Title>

      <Input
        placeholder="Data (DD/MM/AAAA)"
        value={date}
        onChangeText={setDate}
        containerStyle={styles.input}
        keyboardType="numeric"
      />

      <SectionTitle>Selecione um Horário</SectionTitle>
      <TimeSlotList
        onSelectTime={setSelectedTime}
        selectedTime={selectedTime}
      />

      <SectionTitle>Selecione um Médico</SectionTitle>
      <DoctorList
        doctors={availableDoctors}
        onSelectDoctor={setSelectedDoctor}
        selectedDoctorId={selectedDoctor?.id}
      />

      {error ? <ErrorText>{error}</ErrorText> : null}

      <Button
        title="Agendar"
        onPress={handleCreateAppointment}
        loading={loading}
        containerStyle={styles.button as ViewStyle}
        buttonStyle={styles.buttonStyle}
      />

      <Button
        title="Cancelar"
        onPress={() => navigation.goBack()}
        containerStyle={styles.button as ViewStyle}
        buttonStyle={styles.cancelButton}
      />
     </ScrollView>
   </Container>
  );
};

// Objetos de estilo para componentes nativos.
const styles = {
  scrollContent: {
   padding: 20,
  },
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
  cancelButton: {
   backgroundColor: theme.colors.secondary,
   paddingVertical: 12,
  },
};

// Componentes estilizados com `styled-components`.
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 10px;
  margin-top: 10px;
`;

const ErrorText = styled.Text`
  color: ${theme.colors.error};
  text-align: center;
  margin-bottom: 10px;
`;

export default CreateAppointmentScreen;