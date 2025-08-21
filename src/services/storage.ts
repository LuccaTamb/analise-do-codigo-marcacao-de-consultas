import AsyncStorage from '@react-native-async-storage/async-storage';

// interface para dados genéricos do storage
export interface StorageData {
   [key: string]: any;
}

// interface para item do cache, incluindo dados, tempo e validade
interface CacheItem<T> {
   data: T;
   timestamp: number;
   expiry?: number;
}

// mapa para o cache em memória
const cache = new Map<string, CacheItem<any>>();

// chaves para o AsyncStorage
export const STORAGE_KEYS = {
   USER: '@MedicalApp:user',
   TOKEN: '@MedicalApp:token',
   APPOINTMENTS: '@MedicalApp:appointments',
   NOTIFICATIONS: '@MedicalApp:notifications',
   REGISTERED_USERS: '@MedicalApp:registeredUsers',
   APP_SETTINGS: '@MedicalApp:settings',
   STATISTICS_CACHE: '@MedicalApp:statisticsCache',
} as const;

export const storageService = {
  
   // salva um item no AsyncStorage e no cache, com validade opcional
   async setItem<T>(key: string, value: T, expiryMinutes?: number): Promise<void> {
     try {
        const serializedValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, serializedValue);
    
    
        const cacheItem: CacheItem<T> = {
          data: value,
          timestamp: Date.now(),
          expiry: expiryMinutes ? Date.now() + (expiryMinutes * 60 * 1000) : undefined,
        };
        cache.set(key, cacheItem);
     } catch (error) {
        console.error(`Erro ao salvar ${key}:`, error);
        throw error;
     }
   },

   // busca um item, primeiro no cache e depois no AsyncStorage
   async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
     try {
    
        const cached = cache.get(key);
        if (cached) {
          if (!cached.expiry || cached.expiry > Date.now()) {
             return cached.data as T;
          } else {
      
             cache.delete(key);
          }
        }

        
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored) as T;
          
          
          cache.set(key, {
             data: parsed,
             timestamp: Date.now(),
          });
          
          return parsed;
        }
        
        return defaultValue || null;
     } catch (error) {
        console.error(`Erro ao carregar ${key}:`, error);
        return defaultValue || null;
     }
   },

   // remove um item do AsyncStorage e do cache
   async removeItem(key: string): Promise<void> {
     try {
        await AsyncStorage.removeItem(key);
        cache.delete(key);
     } catch (error) {
        console.error(`Erro ao remover ${key}:`, error);
        throw error;
     }
   },

   // limpa todo o armazenamento e o cache
   async clearAll(): Promise<void> {
     try {
        await AsyncStorage.clear();
        cache.clear();
     } catch (error) {
        console.error('Erro ao limpar armazenamento:', error);
        throw error;
     }
   },

   // métodos específicos para agendamentos
   async getAppointments(): Promise<any[]> {
     return await this.getItem(STORAGE_KEYS.APPOINTMENTS, []);
   },

   async saveAppointments(appointments: any[]): Promise<void> {
     await this.setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
   },

   async addAppointment(appointment: any): Promise<void> {
     const appointments = await this.getAppointments();
     appointments.push(appointment);
     await this.saveAppointments(appointments);
   },

   async updateAppointment(appointmentId: string, updates: Partial<any>): Promise<void> {
     const appointments = await this.getAppointments();
     const updatedAppointments = appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, ...updates } : apt
     );
     await this.saveAppointments(updatedAppointments);
   },

   async deleteAppointment(appointmentId: string): Promise<void> {
     const appointments = await this.getAppointments();
     const filteredAppointments = appointments.filter(apt => apt.id !== appointmentId);
     await this.saveAppointments(filteredAppointments);
   },

   // métodos específicos para usuários registrados
   async getRegisteredUsers(): Promise<any[]> {
     return await this.getItem(STORAGE_KEYS.REGISTERED_USERS, []);
   },

   async saveRegisteredUsers(users: any[]): Promise<void> {
     await this.setItem(STORAGE_KEYS.REGISTERED_USERS, users);
   },

   async addUser(user: any): Promise<void> {
     const users = await this.getRegisteredUsers();
     users.push(user);
     await this.saveRegisteredUsers(users);
   },

   // métodos específicos para notificações
   async getNotifications(): Promise<any[]> {
     return await this.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
   },

   async saveNotifications(notifications: any[]): Promise<void> {
     await this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
   },

   async addNotification(notification: any): Promise<void> {
     const notifications = await this.getNotifications();
     notifications.push(notification);
     await this.saveNotifications(notifications);
   },

   // métodos para backup e restauração
   async createBackup(): Promise<string> {
     try {
        const backup = {
          timestamp: new Date().toISOString(),
          data: {
             appointments: await this.getItem(STORAGE_KEYS.APPOINTMENTS, []),
             notifications: await this.getItem(STORAGE_KEYS.NOTIFICATIONS, []),
             registeredUsers: await this.getItem(STORAGE_KEYS.REGISTERED_USERS, []),
             settings: await this.getItem(STORAGE_KEYS.APP_SETTINGS, {}),
          },
        };
        return JSON.stringify(backup);
     } catch (error) {
        console.error('Erro ao criar backup:', error);
        throw error;
     }
   },

   async restoreFromBackup(backupString: string): Promise<void> {
     try {
        const backup = JSON.parse(backupString);
    
        if (backup.data) {
          await this.setItem(STORAGE_KEYS.APPOINTMENTS, backup.data.appointments || []);
          await this.setItem(STORAGE_KEYS.NOTIFICATIONS, backup.data.notifications || []);
          await this.setItem(STORAGE_KEYS.REGISTERED_USERS, backup.data.registeredUsers || []);
          await this.setItem(STORAGE_KEYS.APP_SETTINGS, backup.data.settings || {});
        }
     } catch (error) {
        console.error('Erro ao restaurar backup:', error);
        throw error;
     }
   },

   // métodos de validação de dados
   validateAppointment(appointment: any): boolean {
     return (
        appointment &&
        typeof appointment.id === 'string' &&
        typeof appointment.patientId === 'string' &&
        typeof appointment.doctorId === 'string' &&
        typeof appointment.date === 'string' &&
        typeof appointment.time === 'string' &&
        ['pending', 'confirmed', 'cancelled'].includes(appointment.status)
     );
   },

   validateUser(user: any): boolean {
     return (
        user &&
        typeof user.id === 'string' &&
        typeof user.name === 'string' &&
        typeof user.email === 'string' &&
        ['admin', 'doctor', 'patient'].includes(user.role)
     );
   },

   // método para limpar o cache em memória
   clearCache(): void {
     cache.clear();
   },

   // método para obter informações sobre o armazenamento
   async getStorageInfo(): Promise<{
     cacheSize: number;
     totalKeys: number;
     lastAccess: { [key: string]: number };
   }> {
     const allKeys = await AsyncStorage.getAllKeys();
     const lastAccess: { [key: string]: number } = {};
     
     cache.forEach((value, key) => {
        lastAccess[key] = value.timestamp;
     });

     return {
        cacheSize: cache.size,
        totalKeys: allKeys.length,
        lastAccess,
     };
   },

   // métodos para configurações do aplicativo
   async getAppSettings(): Promise<any> {
     return await this.getItem(STORAGE_KEYS.APP_SETTINGS, {
        theme: 'light',
        notifications: true,
        language: 'pt-BR',
        autoBackup: true,
     });
   },

   async updateAppSettings(settings: Partial<any>): Promise<void> {
     const currentSettings = await this.getAppSettings();
     const updatedSettings = { ...currentSettings, ...settings };
     await this.setItem(STORAGE_KEYS.APP_SETTINGS, updatedSettings);
   },
};