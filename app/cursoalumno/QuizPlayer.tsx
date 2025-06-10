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
  tema: string;
  explicacion: string;
}

export default function QuizPlayer() {
  const { quizId } = useLocalSearchParams();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleSeleccionarRespuesta = (opcion: string) => {
    setRespuestaSeleccionada(opcion);
  };

  const handleEnviarRespuesta = () => {
    if (respuestaSeleccionada) {
      console.log(`Respuesta enviada: ${respuestaSeleccionada}`);
      if (preguntaActual < preguntas.length - 1) {
        setPreguntaActual(preguntaActual + 1);
        setRespuestaSeleccionada(null);
      } else {
        setPreguntaActual(preguntas.length);
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
            respuestaSeleccionada === opcion && styles.botonSeleccionado,
          ]}
          onPress={() => handleSeleccionarRespuesta(opcion)}
        >
          <Text>{opcion}</Text>
        </TouchableOpacity>
      ))}
      <Button title="Enviar" onPress={handleEnviarRespuesta} disabled={!respuestaSeleccionada} />
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
