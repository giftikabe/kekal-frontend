import type { ComponentType } from 'react';

export interface SectionComponentProps<T = unknown> {
  data: T;
  styleOverrides?: Record<string, string>;
}

export interface RegistryEntry<T = unknown> {
  component: ComponentType<SectionComponentProps<T>>;
  label: string;
  previewProps: T;
}