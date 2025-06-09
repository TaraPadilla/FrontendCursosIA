// app.js o app.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext'; // ajusta la ruta si es necesario

export default function App() {
  return (
    <AuthProvider>
      <Slot />
      <Toast />
    </AuthProvider>
  );
}
