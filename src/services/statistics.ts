import AsyncStorage from '@react-native-async-storage/async-storage';

// interface para um agendamento
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

// interface para o objeto de estatísticas
export interface Statistics {
   totalAppointments: number;
   confirmedAppointments: number;
   pendingAppointments: number;
   cancelledAppointments: number;
   totalPatients: number;
   totalDoctors: number;
   specialties: { [key: string]: number };
   appointmentsByMonth: { [key: string]: number };
   statusPercentages: {
     confirmed: number;
     pending: number;
     cancelled: number;
   };
}

export const statisticsService = {
   // calcula estatísticas gerais da aplicação
   async getGeneralStatistics(): Promise<Statistics> {
     try {
        // busca todos os agendamentos e usuários
        const appointmentsData = await AsyncStorage.getItem('@MedicalApp:appointments');
        const appointments: Appointment[] = appointmentsData ? JSON.parse(appointmentsData) : [];
    
        const registeredUsersData = await AsyncStorage.getItem('@MedicalApp:registeredUsers');
        const registeredUsers = registeredUsersData ? JSON.parse(registeredUsersData) : [];

    
        // conta o total de agendamentos e por status
        const totalAppointments = appointments.length;
        const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
        const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
        const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

    
        // conta o número de pacientes únicos
        const uniquePatients = new Set(appointments.map(a => a.patientId));
        const totalPatients = uniquePatients.size;

    
        // conta o número de médicos únicos
        const uniqueDoctors = new Set(appointments.map(a => a.doctorId));
        const totalDoctors = uniqueDoctors.size;

    
        // conta agendamentos por especialidade
        const specialties: { [key: string]: number } = {};
        appointments.forEach(appointment => {
          if (specialties[appointment.specialty]) {
             specialties[appointment.specialty]++;
          } else {
             specialties[appointment.specialty] = 1;
          }
        });

        
        // agrupa agendamentos por mês e ano
        const appointmentsByMonth: { [key: string]: number } = {};
        appointments.forEach(appointment => {
          try {
             const [day, month, year] = appointment.date.split('/');
             const monthKey = `${month}/${year}`;
             if (appointmentsByMonth[monthKey]) {
               appointmentsByMonth[monthKey]++;
             } else {
               appointmentsByMonth[monthKey] = 1;
             }
          } catch (error) {
             console.warn('Data inválida encontrada:', appointment.date);
          }
        });

        
        // calcula a porcentagem de cada status
        const statusPercentages = {
          confirmed: totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0,
          pending: totalAppointments > 0 ? (pendingAppointments / totalAppointments) * 100 : 0,
          cancelled: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
        };

        // retorna todas as estatísticas
        return {
          totalAppointments,
          confirmedAppointments,
          pendingAppointments,
          cancelledAppointments,
          totalPatients,
          totalDoctors,
          specialties,
          appointmentsByMonth,
          statusPercentages,
        };
     } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
        throw error;
     }
   },

   // calcula estatísticas específicas para um médico
   async getDoctorStatistics(doctorId: string): Promise<Partial<Statistics>> {
     try {
        const appointmentsData = await AsyncStorage.getItem('@MedicalApp:appointments');
        const allAppointments: Appointment[] = appointmentsData ? JSON.parse(appointmentsData) : [];
    
        // filtra os agendamentos pelo id do médico
        const doctorAppointments = allAppointments.filter(a => a.doctorId === doctorId);

        const totalAppointments = doctorAppointments.length;
        const confirmedAppointments = doctorAppointments.filter(a => a.status === 'confirmed').length;
        const pendingAppointments = doctorAppointments.filter(a => a.status === 'pending').length;
        const cancelledAppointments = doctorAppointments.filter(a => a.status === 'cancelled').length;

        const uniquePatients = new Set(doctorAppointments.map(a => a.patientId));
        const totalPatients = uniquePatients.size;

        const statusPercentages = {
          confirmed: totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0,
          pending: totalAppointments > 0 ? (pendingAppointments / totalAppointments) * 100 : 0,
          cancelled: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
        };

        return {
          totalAppointments,
          confirmedAppointments,
          pendingAppointments,
          cancelledAppointments,
          totalPatients,
          statusPercentages,
        };
     } catch (error) {
        console.error('Erro ao calcular estatísticas do médico:', error);
        throw error;
     }
   },

   // calcula estatísticas específicas para um paciente
   async getPatientStatistics(patientId: string): Promise<Partial<Statistics>> {
     try {
        const appointmentsData = await AsyncStorage.getItem('@MedicalApp:appointments');
        const allAppointments: Appointment[] = appointmentsData ? JSON.parse(appointmentsData) : [];
    
        // filtra os agendamentos pelo id do paciente
        const patientAppointments = allAppointments.filter(a => a.patientId === patientId);

        const totalAppointments = patientAppointments.length;
        const confirmedAppointments = patientAppointments.filter(a => a.status === 'confirmed').length;
        const pendingAppointments = patientAppointments.filter(a => a.status === 'pending').length;
        const cancelledAppointments = patientAppointments.filter(a => a.status === 'cancelled').length;

        const specialties: { [key: string]: number } = {};
        patientAppointments.forEach(appointment => {
          if (specialties[appointment.specialty]) {
             specialties[appointment.specialty]++;
          } else {
             specialties[appointment.specialty] = 1;
          }
        });

        const uniqueDoctors = new Set(patientAppointments.map(a => a.doctorId));
        const totalDoctors = uniqueDoctors.size;

        const statusPercentages = {
          confirmed: totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0,
          pending: totalAppointments > 0 ? (pendingAppointments / totalAppointments) * 100 : 0,
          cancelled: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
        };

        return {
          totalAppointments,
          confirmedAppointments,
          pendingAppointments,
          cancelledAppointments,
          totalDoctors,
          specialties,
          statusPercentages,
        };
     } catch (error) {
        console.error('Erro ao calcular estatísticas do paciente:', error);
        throw error;
     }
   },
};