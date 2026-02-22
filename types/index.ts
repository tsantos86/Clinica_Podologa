export interface Service {
  id: string;
  name: string;
  description: string;
  details?: string[];
  duration?: string;         // Human-readable: "1h20m", "20min"
  durationMinutes: number;   // Duration in minutes for scheduling calculations
  price: number;
  icon: string;
  badge?: 'popular' | 'premium';
  category: string;
  active?: boolean;          // Whether the service is active and bookable
  photoUrl?: string | null;  // Optional photo for the service
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  icon?: string;
  active: boolean;
  created_at?: string;
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
  paymentType: 'signal' | 'full' | 'onsite';
  paymentAmount: number;
  products?: { id: string; name: string; price: number }[];
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
  servicoId?: string;
  nome: string;
  telefone: string;
  email: string;
  observacoes?: string;
  data: string;
  hora: string;
  preco: number;
  duracaoMinutos?: number;
  valorPagamento?: number;
  tipoPagamento?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  criadoEm?: string;
  reminder_sent?: boolean;
  produtos?: { id: string; name: string; price: number }[];
}

export interface BoardColumn {
  id: string;
  title: string;
  date?: string;
  appointments: Appointment[];
}
