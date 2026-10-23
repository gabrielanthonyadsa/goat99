import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCatalog } from './data.functions';
import { convertPrice, hasPublishedPrices, type Currency } from './presentation';

const CurrencyContext = createContext<{currency:Currency;setCurrency:(c:Currency)=>void;hasPrices:boolean;usdRate:number|null;formatPrice:(minor:number,currency:string)=>string}>({currency:'XAF',setCurrency:()=>{},hasPrices:false,usdRate:null,formatPrice:(minor,currency)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency}).format(minor/100)});
export const useCurrency = () => useContext(CurrencyContext);
export function CurrencyProvider({children}:{children:ReactNode}) {
 const [currency,setCurrency]=useState<Currency>('XAF');
 const [usdRate,setUsdRate]=useState<number|null>(null);
 const {data=[]}=useQuery({queryKey:['catalog'],queryFn:()=>getCatalog(),staleTime:60_000});
 const hasPrices=hasPublishedPrices(data);
 useEffect(()=>{if(!hasPrices)return;let active=true;fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD').then(r=>{if(!r.ok)throw new Error();return r.json()}).then(data=>{if(active&&typeof data.rates?.USD==='number'&&data.rates.USD>0)setUsdRate(data.rates.USD)}).catch(()=>{});return()=>{active=false}},[hasPrices]);
 const formatPrice=(minor:number,original:string)=>{
  const converted=convertPrice(minor,original,currency,usdRate);
  const selected=converted===null?original:currency;
  return new Intl.NumberFormat('fr-FR',{style:'currency',currency:selected}).format(converted??minor/100);
 };
 return <CurrencyContext.Provider value={{currency,setCurrency,hasPrices,usdRate,formatPrice}}>{children}</CurrencyContext.Provider>;
}