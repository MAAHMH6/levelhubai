import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
s.from('curriculum_documents').select('id, source_name, structured_index, doc_type').ilike('source_name', '%math%').then(({data}) => console.log(JSON.stringify(data, null, 2)));
