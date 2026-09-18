-- Create the trigger function to automatically assign commissions on payment
CREATE OR REPLACE FUNCTION public.handle_teacher_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_referral_id UUID;
  v_teacher_id UUID;
  v_commission_percent TEXT;
  v_commission_amount INT;
BEGIN
  -- Only process successful payments that are not already handled
  IF NEW.status = 'succeeded' AND (OLD IS NULL OR OLD.status != 'succeeded') THEN
    
    -- Check if student was referred by a teacher and the referral is active
    SELECT id, teacher_id INTO v_referral_id, v_teacher_id
    FROM public.referrals
    WHERE student_id = NEW.user_id
    LIMIT 1;
    
    IF v_referral_id IS NOT NULL THEN
      -- Get commission percentage from settings
      SELECT value#>>'{}' INTO v_commission_percent
      FROM public.app_settings
      WHERE key = 'teacher_commission_percent';
      
      -- Default to 10% if not found
      IF v_commission_percent IS NULL THEN
        v_commission_percent := '10';
      END IF;
      
      -- Calculate commission (amount_cents / 100 * percent / 100)
      v_commission_amount := (NEW.amount_cents / 100) * (v_commission_percent::numeric / 100.0);
      
      -- Insert commission (ignore if payment_id already exists due to unique constraint)
      INSERT INTO public.commissions (teacher_id, referral_id, payment_id, amount, status)
      VALUES (v_teacher_id, v_referral_id, NEW.id, v_commission_amount, 'pending')
      ON CONFLICT (payment_id) DO NOTHING;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_teacher_commission_on_payment ON public.payments;
CREATE TRIGGER trigger_teacher_commission_on_payment
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_teacher_commission();
