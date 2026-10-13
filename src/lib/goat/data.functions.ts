import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const getCatalog=createServerFn({method:'GET'}).handler(async()=>{
 const key=process.env['SUPABASE_PUBLISHABLE_KEY'];const url=process.env['SUPABASE_URL'];if(!key||!url)throw new Error('Catalogue indisponible');
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h})}}});
 const {data,error}=await client.from('products').select('id,name,category,description,price_minor,currency,image_url,slug').eq('status','published');if(error)throw new Error('Catalogue indisponible');return data;
});
export const getWorkspace=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:admin,error}=await context.supabase.rpc('is_admin');if(error||!admin)throw new Error('Accès réservé à l’équipe autorisée.');
 const [products,events,members]=await Promise.all([context.supabase.from('products').select('*'),context.supabase.from('events').select('*'),context.supabase.from('membership_applications').select('*')]);
 if(products.error||events.error||members.error)throw new Error('Données indisponibles');return {products:products.data,events:events.data,members:members.data};
});
