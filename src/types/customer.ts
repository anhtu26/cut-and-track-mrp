
export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  address?: string;
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
}
