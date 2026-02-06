export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  badge?: 'popular' | 'premium';
  category: string;
}

export interface BookingData {
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  photo?: File | null;
  photoBase64?: string;
  paymentType: 'signal' | 'full';
  paymentAmount: number;
}

export interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
}

export interface PaymentResponse {
  success: boolean;
  referencia?: string;
  gateway?: string;
  mensagem?: string;
  paymentUrl?: string;
  erro?: string;
}

export interface Appointment {
  id: string;
  servico: string;
  nome: string;
  telefone: string;
  email: string;
  data: string;
  hora: string;
  preco: number;
  valorPagamento?: number;
  tipoPagamento?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  criadoEm?: string;
}

export interface BoardColumn {
  id: string;
  title: string;
  date?: string;
  appointments: Appointment[];
}
