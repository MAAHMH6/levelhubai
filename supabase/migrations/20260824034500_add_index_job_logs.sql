CREATE TABLE IF NOT EXISTS public.index_job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.curriculum_documents(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.index_job_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view index_job_logs" 
    ON public.index_job_logs 
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Admins can manage index_job_logs" 
    ON public.index_job_logs 
    FOR ALL 
    TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.index_job_logs;
