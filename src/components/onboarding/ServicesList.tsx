
import { Service, ServiceCategory } from '@/types/service';
import ServiceCard from './ServiceCard';

interface ServicesListProps {
  services: Service[];
  onUpdate: (index: number, field: keyof Service, value: any) => void;
  onRemove: (index: number) => void;
}

const ServicesList = ({ services, onUpdate, onRemove }: ServicesListProps) => {
  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <ServiceCard
          key={index}
          service={service}
          index={index}
          canRemove={services.length > 1}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default ServicesList;
