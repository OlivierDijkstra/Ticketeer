/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

interface HandleFieldUpdateParams<T, U extends (...args: any) => any> {
  updateAction: U;
  data: Parameters<U>[0];
  setLoading: (loading: boolean) => void;
  setData: Dispatch<SetStateAction<T>> | ((data: T) => void);
  successMessage: string;
  errorMessage: string;
}

export async function handleFieldUpdate<T, U extends (...args: any) => any>({
  updateAction,
  data,
  setLoading,
  setData,
  successMessage,
  errorMessage,
}: HandleFieldUpdateParams<T, U>) {
  setLoading(true);
  try {
    const updatedData = await updateAction(data);
    setData(updatedData as T);
    toast.success(successMessage);
  } catch (error) {
    toast.error(errorMessage, { description: 'Please try again later' });
  }
  setLoading(false);
}
