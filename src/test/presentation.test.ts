import { describe, expect, it } from 'vitest';
import { convertPrice, hasPublishedPrices, hasPublishedCollection } from '@/lib/goat/presentation';

describe('GOAT’99 publication rules',()=>{
 it('hides currencies without published prices',()=>{
  expect(hasPublishedPrices([])).toBe(false);
  expect(hasPublishedPrices([{price_minor:null}])).toBe(false);
  expect(hasPublishedPrices([{price_minor:2500000}])).toBe(true);
 });
 it('shows the new collection badge only for published collections',()=>{
  expect(hasPublishedCollection([])).toBe(false);
  expect(hasPublishedCollection([{status:'draft'},{status:'archived'}])).toBe(false);
  expect(hasPublishedCollection([{status:'published'}])).toBe(true);
 });
 it('converts actual prices to FCFA, EUR and USD without inventing a USD rate',()=>{
  expect(convertPrice(10000,'EUR','XAF',null)).toBeCloseTo(65595.7);
  expect(convertPrice(65595700,'XAF','EUR',null)).toBeCloseTo(1000);
  expect(convertPrice(10000,'EUR','USD',1.12)).toBeCloseTo(112);
  expect(convertPrice(10000,'EUR','USD',null)).toBeNull();
 });
});