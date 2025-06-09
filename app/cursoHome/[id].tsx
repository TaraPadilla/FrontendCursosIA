// app/cursohome/[id].tsx
import { getCursos } from '@/apis/apiCursoYCodigo';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CrearQuiz from '../CrearQuizz'; // Asegúrate de tener este componente


interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
  profesor_id: number;
  codigo_acceso: string;
}


export default function CursoHome() {
  const { id } = useLocalSearchParams();
  const [curso, setCurso] = useState<Curso | null>(null);


  useEffect(() => {
    const fetchCurso = async () => {
      const cursos = await getCursos();
      const cursoSeleccionado = cursos.find((c: Curso) => c.id.toString() === id);
      setCurso(cursoSeleccionado);
    };
    fetchCurso();
  }, []);       

  if (!curso) return <Text>Cargando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{curso.nombre}</Text>
      <Text style={styles.subtitle}>Código de acceso: {curso.codigo_acceso}</Text>

      <View style={{ marginTop: 30 }}>
        <CrearQuiz cursoId={curso.id} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: 'gray' },
});
