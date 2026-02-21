
import { Complaint, User, UserRole, ComplaintStatus } from '../types';

const COMPLAINTS_KEY = 'eduresolve_complaints';
const USER_KEY = 'eduresolve_current_user';
const USERS_LIST_KEY = 'eduresolve_registered_users';

// Pre-defined Admin accounts
const DEFAULT_ADMINS: User[] = [
  {
    id: 'admin_001',
    name: 'Dr. Sarah Wilson',
    email: 'admin1@college.edu',
    password: 'admin123',
    role: UserRole.ADMIN,
    department: 'Administration'
  },
  {
    id: 'admin_002',
    name: 'Prof. David Miller',
    email: 'admin2@college.edu',
    password: 'admin456',
    role: UserRole.ADMIN,
    department: 'Student Affairs'
  }
];

export const storageService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_LIST_KEY);
    let users: User[] = data ? JSON.parse(data) : [];
    
    // Ensure default admins exist
    let updated = false;
    DEFAULT_ADMINS.forEach(admin => {
      if (!users.find(u => u.email === admin.email)) {
        users.push(admin);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    }
    
    return users;
  },

  addUser: (user: User) => {
    const users = storageService.getUsers();
    if (users.find(u => u.email === user.email)) return false;
    users.push(user);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    return true;
  },

  updateUserPassword: (email: string, newPassword: string) => {
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users[index].password = newPassword;
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
      return true;
    }
    return false;
  },

  getComplaints: (): Complaint[] => {
    const data = localStorage.getItem(COMPLAINTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveComplaints: (complaints: Complaint[]) => {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  },

  addComplaint: (complaint: Complaint) => {
    const complaints = storageService.getComplaints();
    storageService.saveComplaints([complaint, ...complaints]);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  clearData: () => {
    localStorage.removeItem(COMPLAINTS_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
