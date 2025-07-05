-- Create reviews table for customer feedback
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  client_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_booking_id_fkey 
FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view public reviews" 
ON public.reviews 
FOR SELECT 
USING (is_public = true AND is_verified = true);

CREATE POLICY "Clients can create reviews for their completed bookings" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  client_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = booking_id 
    AND client_id = auth.uid() 
    AND status = 'completed'
  )
);

CREATE POLICY "Clients can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (client_id = auth.uid());

CREATE POLICY "Providers can view reviews for their services" 
ON public.reviews 
FOR SELECT 
USING (provider_id IN (
  SELECT id FROM public.providers WHERE user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_reviews_provider_id ON public.reviews(provider_id);
CREATE INDEX idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- Add customer favorites table
CREATE TABLE public.customer_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  service_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, provider_id, service_id)
);

-- Add foreign keys for favorites
ALTER TABLE public.customer_favorites 
ADD CONSTRAINT customer_favorites_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.customer_favorites 
ADD CONSTRAINT customer_favorites_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;

ALTER TABLE public.customer_favorites 
ADD CONSTRAINT customer_favorites_service_id_fkey 
FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

-- Enable RLS on favorites
ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites
CREATE POLICY "Users can manage their own favorites" 
ON public.customer_favorites 
FOR ALL 
USING (client_id = auth.uid());

-- Update providers table to include calculated rating
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Function to update provider ratings
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the provider's rating and review count
  UPDATE public.providers 
  SET 
    avg_rating = (
      SELECT ROUND(AVG(rating), 2) 
      FROM public.reviews 
      WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id) 
      AND is_public = true 
      AND is_verified = true
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id) 
      AND is_public = true 
      AND is_verified = true
    )
  WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update provider ratings automatically
CREATE TRIGGER update_provider_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_provider_rating();