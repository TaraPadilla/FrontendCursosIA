import { crearQuizz, generarPreguntasConIA } from '@/apis/apiQuizz';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

const now = new Date();
const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

// Formato tipo: '2025-05-27T15:00'
function formatDate(date: Date) {
  return date.toISOString().slice(0, 16); // formato YYYY-MM-DDTHH:mm
}

interface CrearQuizzProps {
  cursoId: number;
}

export default function CrearQuizz() {
  const params = useLocalSearchParams();
  const [cursoId, setCursoId] = useState<number>(1); // ← nuevo estado para cursoId

  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [cantidad, setCantidad] = useState('5');
  const [fechaInicio, setFechaInicio] = useState(formatDate(now));
  const [fechaFin, setFechaFin] = useState(formatDate(oneHourLater));
  const [preguntas, setPreguntas] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (params.cursoId) setCursoId(parseInt(params.cursoId as string));
    if (params.preguntasIds) setPreguntas(JSON.parse(params.preguntasIds as string));
    if (params.titulo) setTitulo(params.titulo as string);
    if (params.tema) setTema(params.tema as string);
    if (params.fechaInicio) setFechaInicio(params.fechaInicio as string);
    if (params.fechaFin) setFechaFin(params.fechaFin as string);
  }, []);


  const handleGenerarPreguntas = async () => {
    try {
      const data = await generarPreguntasConIA(tema, parseInt(cantidad));
      //const textos = data.map((p: any) => p.texto); // Ajusta según tu modelo
      //setPreguntas(textos);
      router.push({
        pathname: '/VistaPreguntas',
        params: {
          preguntas: JSON.stringify(data),
        },
      });
    } catch (error: any) {
      console.error(error);
      setMensaje('Error al generar preguntas con IA');
    }
  };

const handleCrearQuizz = async () => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (!token) throw new Error('Token no encontrado');

    // Si no hay fechas, crea por defecto: ahora + 1 hora
    const defaultInicio = fechaInicio ? new Date(fechaInicio).toISOString() : new Date().toISOString();
    const defaultFin = fechaFin ? new Date(fechaFin).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const quiz = {
      titulo,
      tema,
      preguntas,
      curso_id: cursoId,
      fecha_inicio: defaultInicio,
      fecha_fin: defaultFin,
      estado: "programado"
    };

    console.log('Enviando quiz:', quiz);

    const res = await crearQuizz(quiz, token) as any;
    Alert.alert(`Quiz creado con ID: ${res.id}`);
    setTitulo('');
    setTema('');
    setCantidad('5');
    setFechaInicio('');
    setFechaFin('');
    setPreguntas([]);
  } catch (error: any) {
    console.error(error?.response?.data || error);
    setMensaje('Error al crear el quiz');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge">Crear Quizz</Text>

      <TextInput label="Título" value={titulo} onChangeText={setTitulo} style={styles.input} />
      <TextInput label="Fecha Inicio (YYYY-MM-DDTHH:mm)" value={fechaInicio} onChangeText={setFechaInicio} style={styles.input} />
      <TextInput label="Fecha Fin (YYYY-MM-DDTHH:mm)" value={fechaFin} onChangeText={setFechaFin} style={styles.input} />

      <Button mode="contained" onPress={handleCrearQuizz}>Crear Quiz</Button>
      {mensaje ? <Text style={{ marginTop: 20 }}>{mensaje}</Text> : null}

      <TextInput label="Tema" value={tema} onChangeText={setTema} style={styles.input} />
      <TextInput label="Cantidad de preguntas" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" style={styles.input} />
      <Button mode="outlined" onPress={handleGenerarPreguntas}>Generar preguntas con IA</Button>

      {preguntas.length > 0 && (
        <>
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Preguntas generadas:</Text>
          {preguntas.map((p, i) => (
            <Text key={i} style={{ marginVertical: 4 }}>• {p}</Text>
          ))}
        </>
      )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 12 }
});