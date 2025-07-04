import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Edit, Calendar as CalendarIcon, Phone, User } from 'lucide-react';
import { BookingData, useBookings } from '@/hooks/useBookings';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MobileBookingsTableProps {
  providerId: string;
  isMobile: boolean;
}

const MobileBookingsTable = ({ providerId, isMobile }: MobileBookingsTableProps) => {
  const { bookings, loading, updateBookingStatus, addProviderNotes } = useBookings(providerId);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusBadge = (status: BookingData['status']) => {
    const variants = {
      pending: { variant: 'outline' as const, label: 'Pendiente', color: 'text-yellow-600' },
      confirmed: { variant: 'default' as const, label: 'Confirmada', color: 'text-blue-600' },
      completed: { variant: 'secondary' as const, label: 'Completada', color: 'text-green-600' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelada', color: 'text-red-600' }
    };
    
    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM yyyy', { locale: es });
  };

  const formatTime = (timeStr: string) => {
    return format(new Date(`2000-01-01T${timeStr}`), 'HH:mm');
  };

  const filteredBookings = bookings.filter(booking => 
    statusFilter === 'all' || booking.status === statusFilter
  );

  const handleNotesSubmit = async () => {
    if (selectedBooking) {
      await addProviderNotes(selectedBooking.id, notes);
      setSelectedBooking(null);
      setNotes('');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Citas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile Card Layout
  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Gestión de Citas
              </CardTitle>
              <CardDescription>
                Administra tus citas programadas
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full touch-manipulation">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {statusFilter === 'all' ? 'No tienes citas programadas' : `No hay citas ${statusFilter === 'pending' ? 'pendientes' : statusFilter}`}
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {filteredBookings.map((booking, index) => (
                <Card key={booking.id} className="border border-border/50 card-hover touch-manipulation">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header with Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{booking.client_info.name}</span>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      {/* Service Info */}
                      <div className="space-y-1">
                        <p className="font-medium text-primary">{booking.service.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.service.duration_minutes} min
                          </span>
                          <span className="font-medium text-foreground">${booking.total_price}</span>
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(booking.booking_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatTime(booking.booking_time)}
                        </span>
                      </div>

                      {/* Contact Info */}
                      {booking.client_info.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {booking.client_info.phone}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Select
                          value={booking.status}
                          onValueChange={(value) => updateBookingStatus(booking.id, value as BookingData['status'])}
                        >
                          <SelectTrigger className="flex-1 touch-manipulation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="confirmed">Confirmar</SelectItem>
                            <SelectItem value="completed">Completar</SelectItem>
                            <SelectItem value="cancelled">Cancelar</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="touch-manipulation"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setNotes(booking.provider_notes || '');
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-sm mx-4">
                            <DialogHeader>
                              <DialogTitle>Notas de la Cita</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium">Cliente: {booking.client_info.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(booking.booking_date)} a las {formatTime(booking.booking_time)}
                                </p>
                              </div>
                              
                              {booking.client_notes && (
                                <div>
                                  <Label>Notas del cliente:</Label>
                                  <p className="text-sm bg-muted p-2 rounded">{booking.client_notes}</p>
                                </div>
                              )}
                              
                              <div>
                                <Label htmlFor="provider-notes">Tus notas:</Label>
                                <Textarea
                                  id="provider-notes"
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Agregar notas sobre la cita..."
                                  className="mt-1 touch-manipulation"
                                />
                              </div>
                              
                              <Button onClick={handleNotesSubmit} className="w-full touch-manipulation">
                                Guardar Notas
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Desktop Table Layout (existing implementation)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Gestión de Citas
            </CardTitle>
            <CardDescription>
              Administra tus citas programadas
            </CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="confirmed">Confirmadas</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {statusFilter === 'all' ? 'No tienes citas programadas' : `No hay citas ${statusFilter === 'pending' ? 'pendientes' : statusFilter}`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.client_info.name}</p>
                        {booking.client_info.phone && (
                          <p className="text-sm text-muted-foreground">{booking.client_info.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.service.name}</p>
                        <p className="text-sm text-muted-foreground">{booking.service.duration_minutes} min</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(booking.booking_date)}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatTime(booking.booking_time)}
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="font-medium">${booking.total_price}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={booking.status}
                          onValueChange={(value) => updateBookingStatus(booking.id, value as BookingData['status'])}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="confirmed">Confirmar</SelectItem>
                            <SelectItem value="completed">Completar</SelectItem>
                            <SelectItem value="cancelled">Cancelar</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setNotes(booking.provider_notes || '');
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Notas de la Cita</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium">Cliente: {booking.client_info.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(booking.booking_date)} a las {formatTime(booking.booking_time)}
                                </p>
                              </div>
                              
                              {booking.client_notes && (
                                <div>
                                  <Label>Notas del cliente:</Label>
                                  <p className="text-sm bg-muted p-2 rounded">{booking.client_notes}</p>
                                </div>
                              )}
                              
                              <div>
                                <Label htmlFor="provider-notes">Tus notas:</Label>
                                <Textarea
                                  id="provider-notes"
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Agregar notas sobre la cita..."
                                  className="mt-1"
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button onClick={handleNotesSubmit} className="flex-1">
                                  Guardar Notas
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileBookingsTable;