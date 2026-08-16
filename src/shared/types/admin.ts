export type AdminRole = 'super_admin' | 'editor';

export interface Admin {
  id: string;
  email: string;
  role: AdminRole;
}