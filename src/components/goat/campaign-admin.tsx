import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { saveCampaign, saveCollection } from '@/lib/goat/data.functions';
import { defaultCampaign } from '@/lib/goat/content';

type Collection = {id:string;title:string;status:string};
export function CampaignAdmin({initial,collections,onSaved}:{initial:typeof defaultCampaign;collections:Collection[];onSaved:()=>void}) {
 const save=useServerFn(saveCampaign);const collectionSave=useServerFn(saveCollection);
 const [form,setForm]=useState(initial);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 const [title,setTitle]=useState('');const [status,setStatus]=useState<'draft'|'published'|'archived'>('draft');
 return <div className="campaign-admin">
  <h2>La campagne d’accueil</h2>
  <form className="admin-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');try{await save({data:form});onSaved();setMessage('La campagne a été enregistrée.')}catch{setMessage('La campagne n’a pas pu être enregistrée.')}finally{setBusy(false)}}}>
   <label>Titre<textarea required maxLength={100} rows={3} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
   <label>Texte de présentation<textarea required maxLength={400} rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
   <label>Bouton principal<input required maxLength={60} value={form.primary_label} onChange={e=>setForm({...form,primary_label:e.target.value})}/></label>
   <label>Bouton secondaire<input required maxLength={60} value={form.secondary_label} onChange={e=>setForm({...form,secondary_label:e.target.value})}/></label>
   <Button type="submit" disabled={busy}>{busy?'Enregistrement…':'Enregistrer la campagne'}</Button>
  </form>
  <h2>Collections</h2>
  <form className="admin-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');try{await collectionSave({data:{title,status}});setTitle('');setStatus('draft');onSaved();setMessage('La collection a été enregistrée.')}catch{setMessage('La collection n’a pas pu être enregistrée.')}finally{setBusy(false)}}}>
   <label>Nom de la collection<input required maxLength={120} value={title} onChange={e=>setTitle(e.target.value)}/></label>
   <label>Statut<select value={status} onChange={e=>{const v=e.target.value;if(v==='draft'||v==='published'||v==='archived')setStatus(v)}}><option value="draft">Brouillon</option><option value="published">Publié</option><option value="archived">Archivé</option></select></label>
   <Button type="submit" disabled={busy}>Ajouter la collection</Button>
  </form>
  {collections.map(c=><div className="admin-list" key={c.id}><span>{c.title}</span><select aria-label={`Statut de ${c.title}`} value={c.status} disabled={busy} onChange={async e=>{const status=e.target.value;if(status!=='draft'&&status!=='published'&&status!=='archived')return;setBusy(true);try{await collectionSave({data:{id:c.id,title:c.title,status}});onSaved()}catch{setMessage('Le statut n’a pas pu être enregistré.')}finally{setBusy(false)}}}><option value="draft">Brouillon</option><option value="published">Publié</option><option value="archived">Archivé</option></select></div>)}
  {message&&<p role="status">{message}</p>}
 </div>;
}