-- Add foreign key from overtime_records to profiles
ALTER TABLE public.overtime_records 
DROP CONSTRAINT overtime_records_user_id_fkey;

ALTER TABLE public.overtime_records
ADD CONSTRAINT overtime_records_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;