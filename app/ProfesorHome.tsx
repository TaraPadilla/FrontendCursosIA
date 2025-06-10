import { crearCurso, getCursos } from '@/apis/apiCursoYCodigo';
import { useRouter } from 'expo-router';
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



export default function ProfesorHome() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cursos, setCursos] = useState<Curso[]>([]);

    const router = useRouter();


  const fetchCursos = async () => {
    const data: any = await getCursos();
    setCursos(data);
  };

  const handleCrearCurso = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) throw new Error('No se encontró token');

      await crearCurso({ nombre, descripcion }, token);
      //const curso = await crearCurso({ nombre, descripcion }, token);
      //setMensaje(`Curso creado con código: ${curso.codigo}`);
      setNombre('');
      setDescripcion('');
      fetchCursos(); // actualizar lista


    } catch (error) {
      console.error(error);
      setMensaje('Error al crear el curso');
    }
  };

    useEffect(() => {
    fetchCursos();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge">Crear Curso</Text>
      <TextInput label="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput label="Descripción" value={descripcion} onChangeText={setDescripcion} style={styles.input} />
      <Button mode="contained" onPress={handleCrearCurso}>Crear Curso</Button>
      {mensaje ? <Text style={{ marginTop: 20 }}>{mensaje}</Text> : null}


      <Text variant="titleMedium" style={{ marginTop: 20, color: 'white' }}>Cursos existentes:</Text>
      {cursos.map((curso) => (


        <Card 
          key={curso.id} 
          style={{ marginTop: 10 }}
          onPress={() => router.push({ pathname: '../cursoHome/[id]', params: { id: curso.id.toString() } })}

          >

          <Card.Title title={curso.id + " - " + curso.nombre} subtitle={`Código: ${curso.codigo_acceso}`} />
          <Card.Content>
            <Text>{curso.descripcion}</Text>
            <Text style={{ color: 'blue', marginTop: 5 }}>Ver curso</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 12 }
});