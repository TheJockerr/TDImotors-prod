export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;       // en CLP
  mileage: number;     // en km
  fuel: string;
  transmission: string;
  plate: string;
  owner_count: number;
  features: string[];
  images: string[];    // URLs
  badge: 'RECIÉN LLEGADO' | 'OFERTA' | null;
  status: 'active' | 'sold';
  created_at: string;
}
 
export type CarBrand = 'Todos' | 'MG' | 'Kia' | 'Suzuki' | 'Hyundai' | 'Volkswagen';
 