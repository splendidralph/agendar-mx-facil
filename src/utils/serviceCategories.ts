
import { ServiceCategory } from '@/types/service';

export const categories: ServiceCategory[] = [
  'corte_barberia',
  'unas',
  'maquillaje_cejas',
  'cuidado_facial',
  'masajes_relajacion',
  'color_alisado'
];

export const categoryLabels: Record<ServiceCategory, string> = {
  corte_barberia: 'Corte y Barbería',
  unas: 'Uñas y Manicure',
  maquillaje_cejas: 'Maquillaje y Cejas',
  cuidado_facial: 'Cuidado Facial',
  masajes_relajacion: 'Masajes y Relajación',
  color_alisado: 'Color y Alisado',
  haircut: 'Corte de Cabello',
  beard: 'Barbería',
  nails: 'Uñas',
  eyebrows: 'Cejas',
  massage: 'Masajes',
  other: 'Otros'
};
