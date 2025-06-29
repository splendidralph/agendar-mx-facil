
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Service, ServiceCategory } from '@/types/service';
import { categories, categoryLabels } from '@/utils/serviceCategories';

interface ServiceCardProps {
  service: Service;
  index: number;
  canRemove: boolean;
  onUpdate: (index: number, field: keyof Service, value: any) => void;
  onRemove: (index: number) => void;
}

const ServiceCard = ({ service, index, canRemove, onUpdate, onRemove }: ServiceCardProps) => {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">Servicio {index + 1}</CardTitle>
          {canRemove && (
            <Button
              onClick={() => onRemove(index)}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`service-name-${index}`}>Nombre del Servicio *</Label>
            <Input
              id={`service-name-${index}`}
              value={service.name}
              onChange={(e) => onUpdate(index, 'name', e.target.value)}
              placeholder="Ej: Corte de cabello clásico"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`service-category-${index}`}>Categoría</Label>
            <Select
              value={service.category}
              onValueChange={(value: ServiceCategory) => onUpdate(index, 'category', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryLabels[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`service-price-${index}`}>Precio (MXN) *</Label>
            <Input
              id={`service-price-${index}`}
              type="number"
              min="1"
              value={service.price || ''}
              onChange={(e) => onUpdate(index, 'price', parseInt(e.target.value) || 0)}
              placeholder="150"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`service-duration-${index}`}>Duración (minutos)</Label>
            <Select
              value={service.duration.toString()}
              onValueChange={(value) => onUpdate(index, 'duration', parseInt(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1.5 horas</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor={`service-description-${index}`}>Descripción</Label>
          <Textarea
            id={`service-description-${index}`}
            value={service.description}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            placeholder="Describe el servicio y qué incluye..."
            className="mt-1"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
