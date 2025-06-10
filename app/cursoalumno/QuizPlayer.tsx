// src/components/QuizPlayer.tsx (ajusta la ruta si es necesario)

import { obtenerPreguntasPorQuiz } from '@/apis/apiQuizz';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Pregunta {
  id: string;
  texto: string;
  opciones: string[];
  respuesta_correcta: number; // ahora es un índice numérico
  tema: string;
  explicacion: string;
}

import { useRouter } from 'expo-router';

export default function QuizPlayer() {
  const { quizId } = useLocalSearchParams();
  const router = useRouter();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respuestasUsuario, setRespuestasUsuario] = useState<{seleccionada: number, esCorrecta: boolean}[]>([]);

  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (!token) {
          setError('Token no encontrado');
          setCargando(false);
          return;
        }
        const data = await obtenerPreguntasPorQuiz(quizId as string, token);
        setPreguntas(data);
        setCargando(false);
      } catch (err) {
        setError('Error al cargar las preguntas');
        setCargando(false);
      }
    };

    fetchPreguntas();
  }, [quizId]);

  const handleSeleccionarRespuesta = (indice: number) => {
    setRespuestaSeleccionada(indice);
  };

  const handleEnviarRespuesta = () => {
    if (respuestaSeleccionada !== null) {
      const pregunta = preguntas[preguntaActual];
      const esCorrecta = respuestaSeleccionada === pregunta.respuesta_correcta;
      setRespuestasUsuario(prev => [...prev, { seleccionada: respuestaSeleccionada, esCorrecta }]);
      if (preguntaActual < preguntas.length - 1) {
        setPreguntaActual(preguntaActual + 1);
        setRespuestaSeleccionada(null);
      } else {
        // Navegar a CorreccionQuiz pasando preguntas y respuestasUsuario
        router.replace({ pathname: '/cursoalumno/CorreccionQuiz', params: { preguntas: JSON.stringify(preguntas), respuestasUsuario: JSON.stringify([...respuestasUsuario, { seleccionada: respuestaSeleccionada, esCorrecta }]) } });
      }
    }
  };

  if (cargando) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>{error}</Text>;
  if (preguntas.length === 0) return <Text>No hay preguntas disponibles.</Text>;
  if (preguntaActual >= preguntas.length) return <Text>¡Has completado el quiz!</Text>;

  const pregunta = preguntas[preguntaActual];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{pregunta.texto}</Text>
      {pregunta.opciones.map((opcion, idx) => (
        <TouchableOpacity
          key={idx}
          style={[
            styles.botonOpcion,
            respuestaSeleccionada === idx && styles.botonSeleccionado,
          ]}
          onPress={() => handleSeleccionarRespuesta(idx)}
        >
          <Text>{opcion}</Text>
        </TouchableOpacity>
      ))}
      <Button title="Enviar" onPress={handleEnviarRespuesta} disabled={respuestaSeleccionada === null} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  titulo: { fontSize: 20, marginBottom: 12 },
  botonOpcion: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginVertical: 5,
  },
  botonSeleccionado: {
    backgroundColor: '#cce5ff',
  },
});
