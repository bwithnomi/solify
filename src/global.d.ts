// src/global.d.ts
export {};

declare global {
  interface Window {
    phantom: any; // Replace 'any' with the appropriate type if known
  }
}