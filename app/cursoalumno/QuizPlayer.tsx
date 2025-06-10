// src/components/QuizPlayer.tsx (ajusta la ruta si es necesario)

import { obtenerPreguntasPorQuiz } from '@/apis/apiQuizz';
import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Button, Text, useTheme, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';

interface Pregunta {
  id: string;
  texto: string;
  opciones: string[];
  respuesta_correcta: number; // ahora es un índice numérico
  tema: string;
  explicacion: string;
}

export default function QuizPlayer() {
  const theme = useTheme();
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

  if (cargando) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (error) {
    return <Text style={{ color: theme.colors.error, margin: 20 }}>{error}</Text>;
  }

  if (!preguntas.length) {
    return <Text style={{ margin: 20, color: theme.colors.onSurface }}>No hay preguntas disponibles.</Text>;
  }

  const pregunta = preguntas[preguntaActual];

  return (
    <ScrollView contentContainerStyle={[styles.container, {backgroundColor: theme.colors.background}]}> 
      <Card style={{ marginBottom: 20, backgroundColor: theme.colors.elevation.level1 }}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.titulo, {color: theme.colors.onSurface}]}>{pregunta.texto}</Text>
        </Card.Content>
      </Card>
      {pregunta.opciones.map((opcion: string, i: number) => {
        const isSelected = respuestaSeleccionada === i;
        return (
          <TouchableOpacity
            key={i}
            style={[
              styles.botonOpcion,
              {
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.elevation.level2,
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.outlineVariant,
              }
            ]}
            onPress={() => handleSeleccionarRespuesta(i)}
            disabled={respuestaSeleccionada !== null}
            activeOpacity={0.85}
          >
            <Text style={{
              color: isSelected
                ? theme.colors.onPrimary
                : theme.colors.onSurface,
              fontWeight: isSelected ? 'bold' : 'normal',
              fontSize: 16,
            }}>{opcion}</Text>
          </TouchableOpacity>
        );
      })}
      <Button
        mode="contained"
        onPress={handleEnviarRespuesta}
        disabled={respuestaSeleccionada === null}
        style={{ marginTop: 24 }}
      >
        Enviar
      </Button>
      <Text style={{ marginTop: 20, color: theme.colors.onSurface, textAlign: 'center' }}>
        Pregunta {preguntaActual + 1} de {preguntas.length}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  titulo: { fontSize: 20, marginBottom: 12 },
  botonOpcion: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  botonSeleccionado: {
    
  },
});
