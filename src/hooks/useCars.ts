// src/hooks/useCars.ts
import { useState, useEffect } from 'react';
import type { Car } from '../types/car';
import { supabase } from '../lib/supabase';
import { mockCars } from '../data/mockCars';

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL;

export function useCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCars() {
      if (USE_MOCK) {
        setCars(mockCars);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setCars(data as Car[]);
      }
      setLoading(false);
    }

    fetchCars();
  }, []);

  return { cars, loading, error };
}

export function useCarById(id: string) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    if (USE_MOCK) {
      const found = mockCars.find((c) => c.id === id) ?? null;
      setCar(found);
      setLoading(false);
      return;
    }

    async function fetchCar() {
      const { data } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      setCar(data as Car);
      setLoading(false);
    }

    fetchCar();
  }, [id]);

  return { car, loading };
}