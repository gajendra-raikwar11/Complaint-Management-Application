
import { User, UserRole } from '../types';
import { storageService } from './storageService';

/**
 * MERN BACKEND ENDPOINT DOCUMENTATION
 * 
 * 1. AUTH & ROLE-BASED ACCESS
 * - POST /api/auth/register : { ..., role: 'STUDENT' } (ADMIN role restricted)
 * - POST /api/auth/login    : Validates credentials + role check
 */

export const apiService = {
  delay: (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms)),

  // REGISTER - Now restricted to Students only
  register: async (userData: User): Promise<{ success: boolean; message: string; user?: User }> => {
    await apiService.delay();
    
    // Server-side security check: Block Admin creation
    if (userData.role === UserRole.ADMIN) {
      return { success: false, message: "Security Violation: Admin accounts must be created by System Superuser" };
    }

    const success = storageService.addUser(userData);
    if (success) return { success: true, message: "Student account created in Database", user: userData };
    return { success: false, message: "Email already exists" };
  },

  // LOGIN (With Role Validation)
  login: async (email: string, password: string, role: UserRole): Promise<{ success: boolean; user?: User; message: string }> => {
    await apiService.delay();
    const users = storageService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      if (user.role !== role) {
        return { success: false, message: `Role Mismatch: This account is registered as a ${user.role}, not an ${role}` };
      }
      return { success: true, user, message: "Authentication Successful" };
    }
    return { success: false, message: "Invalid email or password" };
  },

  // RESET STEP 1: Request
  requestReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    await apiService.delay(1000);
    const users = storageService.getUsers();
    if (users.find(u => u.email === email)) {
      return { success: true, message: "Recovery link dispatched to Gmail" };
    }
    return { success: false, message: "Email not found in our records" };
  },

  // RESET STEP 2: Verify (Simulating clicking a link in Gmail)
  verifyResetLink: async (email: string): Promise<{ success: boolean }> => {
    await apiService.delay(1200);
    return { success: true };
  },

  // RESET STEP 3: Final Update
  resetPassword: async (email: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    await apiService.delay();
    const success = storageService.updateUserPassword(email, newPass);
    return success ? 
      { success: true, message: "Database record updated successfully" } : 
      { success: false, message: "Update failed" };
  }
};
