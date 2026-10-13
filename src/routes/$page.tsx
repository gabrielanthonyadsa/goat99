import { createFileRoute, notFound, Link } from '@tanstack/react-router';
import { pages, metadata } from '@/lib/goat/content';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import tailoring from '@/assets/tailoring-editorial.jpg';
import leather from '@/assets/leather-editorial.jpg';
import jewelry from '@/assets/jewelry-editorial.jpg';
export const Route=createFileRoute('/$page')({loader:({params})=>{const page=pages[params.page];if(!page)throw notFound();return {page,slug:params.page}},head:({loaderData})=>metadata(loaderData?.page.title??'Page indisponible',loaderData?.page.description??'GOAT’99'),component:Editorial});
function Editorial(){const {page,slug}=Route.useLoaderData();const visual=['maison','collections','joaillerie'].includes(slug);return <><section className="page-intro"><div className="eyebrow">{page.eyebrow}</div><h1>{page.title}</h1><p>{page.description}</p></section>{visual?<section className="section"><div className="universe-grid">{[tailoring,leather,jewelry].map((image,i)=><div key={image} className="universe-image"><img src={image} width={1024} height={1280} loading="lazy" alt={`Vision éditoriale de la Maison ${i+1}`}/></div>)}</div><p className="notice">Images de direction artistique générées pour la présentation de la Maison, non représentatives d’un catalogue commercial validé.</p></section>:<div className="empty-state"><Button variant="outline" asChild><Link to="/">Retour à la Maison <ArrowRight/></Link></Button></div>}</>}
