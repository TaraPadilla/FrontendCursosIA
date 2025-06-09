// app/AlumnoHome.tsx
import { getMisInscripciones, inscribirseCurso } from '@/apis/apiCursoYCodigo';
import { useRouter } from 'expo-router'; // 👈 NUEVO
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';

interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
  profesor_id: number;
  codigo_acceso: string;
}

interface Inscripcion {
  id: number;
  user_id: number;
  curso_id: number;
  curso: Curso;
}

export default function AlumnoHome() {
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const router = useRouter(); // 👈 NUEVO

  const fetchInscripciones = async () => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) return;

    const data = await getMisInscripciones(token);
    setInscripciones(data as Inscripcion[]);
  };

  const handleInscribirse = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) throw new Error('No se encontró token');

      await inscribirseCurso(codigo, token);
      setMensaje('Inscripción exitosa');
      setCodigo('');
      fetchInscripciones();
    } catch (error) {
      console.error(error);
      setMensaje('Error al inscribirse');
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge">Ingresar código de curso</Text>
      <TextInput label="Código" value={codigo} onChangeText={setCodigo} style={styles.input} />
      <Button mode="contained" onPress={handleInscribirse}>Inscribirse</Button>
      {mensaje ? <Text style={{ marginTop: 20 }}>{mensaje}</Text> : null}

      <Text variant="titleMedium" style={{ marginTop: 20 }}>Mis cursos:</Text>
      {inscripciones.map((ins) => (
        <Card
          key={ins.id}
          style={{ marginTop: 10 }}
          onPress={() =>
            router.push({
              pathname: '/cursoalumno/quizActivos',
              params: { id: ins.curso.id },
            })
          }
        >
          <Card.Title title={ins.curso.id + " - " + ins.curso.nombre} subtitle={`Código: ${ins.curso.codigo_acceso}`} />
          <Card.Content>
            <Text>{ins.curso.descripcion}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 12 },
});