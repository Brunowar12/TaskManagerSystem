// src/components/ui/use-toast.tsx
export function useToast() {
  return {
    toast: (message: string) => {
      alert(message) // Простая замена для тостов
    },
  }
}
