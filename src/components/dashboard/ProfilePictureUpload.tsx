import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProfilePictureUploadProps {
  providerId: string;
  currentImageUrl?: string | null;
  businessName: string;
  onImageUpdate: (url: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  showUploadButton?: boolean;
}

const ProfilePictureUpload = ({ 
  providerId, 
  currentImageUrl, 
  businessName, 
  onImageUpdate,
  size = 'md',
  showUploadButton = false
}: ProfilePictureUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-24 w-24'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 512;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      // Debug: Check authentication context
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Upload Debug - Current user:', user?.id);
      console.log('Upload Debug - Provider ID:', providerId);
      console.log('Upload Debug - File name will be:', `${providerId}/profile.jpg`);
      
      // Compress the image
      const compressedFile = await compressImage(file);
      
      // Remove existing image first
      if (currentImageUrl) {
        await removeImage(false);
      }

      const fileExt = 'jpg'; // Always save as JPG after compression
      const fileName = `${providerId}/profile.${fileExt}`;
      
      console.log('Upload Debug - Final file path:', fileName);
      console.log('Upload Debug - File size after compression:', compressedFile.size);

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, compressedFile, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      console.log('Upload Debug - Upload error:', uploadError);
      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const newImageUrl = `${data.publicUrl}?t=${Date.now()}`;

      // Update provider profile
      const { error: updateError } = await supabase
        .from('providers')
        .update({ profile_image_url: newImageUrl })
        .eq('id', providerId);

      if (updateError) throw updateError;

      onImageUpdate(newImageUrl);
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (showToast = true) => {
    if (!currentImageUrl) return;
    
    setRemoving(true);
    try {
      const fileName = `${providerId}/profile.jpg`;
      
      await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      const { error } = await supabase
        .from('providers')
        .update({ profile_image_url: null })
        .eq('id', providerId);

      if (error) throw error;

      onImageUpdate(null);
      if (showToast) {
        toast.success('Foto de perfil eliminada');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      if (showToast) {
        toast.error('Error al eliminar la imagen');
      }
    } finally {
      setRemoving(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (showUploadButton) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <Avatar className={sizeClasses[size]}>
            <AvatarImage src={currentImageUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(businessName)}
            </AvatarFallback>
          </Avatar>
          
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Subiendo...' : 'Cambiar Foto'}
          </Button>
          
          {currentImageUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeImage()}
              disabled={removing}
            >
              <X className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={currentImageUrl || undefined} />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getInitials(businessName)}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfilePictureUpload;