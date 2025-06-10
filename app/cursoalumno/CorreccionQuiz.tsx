import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface Pregunta {
  id: string;
  texto: string;
  opciones: string[];
  respuesta_correcta: number;
  tema: string;
  explicacion: string;
}

interface RespuestaUsuario {
  seleccionada: number;
  esCorrecta: boolean;
}

interface CorreccionQuizProps {
  route: {
    params: {
      preguntas: Pregunta[];
      respuestasUsuario: RespuestaUsuario[];
    };
  };
}

export default function CorreccionQuiz() {
  const theme = useTheme();
  const { preguntas, respuestasUsuario } = useLocalSearchParams();
  const preguntasArr: Pregunta[] = preguntas ? JSON.parse(preguntas as string) : [];
  const respuestasArr: RespuestaUsuario[] = respuestasUsuario ? JSON.parse(respuestasUsuario as string) : [];
  const correctas = respuestasArr.filter(r => r.esCorrecta).length;
  const total = preguntasArr.length;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text style={[styles.resultado, { color: theme.colors.primary }]}>{`Obtuviste ${correctas}/${total}. ¡Buen trabajo!`}</Text>
      {preguntasArr.map((pregunta, idx) => {
        const esCorrecta = respuestasArr[idx]?.esCorrecta;
        const seleccionada = respuestasArr[idx]?.seleccionada;
        return (
          <Card key={pregunta.id || idx} style={[styles.preguntaContainer, { backgroundColor: theme.colors.elevation.level1 }]}> 
            <Card.Content>
              <Text style={[styles.preguntaTitulo, { color: theme.colors.onSurface }]}>{pregunta.texto}</Text>
              <Text>
                Tu respuesta: <Text style={{ color: esCorrecta ? theme.colors.primary || '#388e3c' : theme.colors.error }}>
                  {seleccionada !== undefined && seleccionada !== null
                    ? pregunta.opciones[seleccionada]
                    : '-'}
                </Text>
              </Text>
              {!esCorrecta && (
                <Text>
                  Respuesta correcta: <Text style={{ color: theme.colors.primary }}>
                    {pregunta.opciones[pregunta.respuesta_correcta]}
                  </Text>
                </Text>
              )}
            </Card.Content>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  resultado: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, alignSelf: 'center', textAlign: 'center' },
  preguntaContainer: { marginBottom: 18, borderRadius: 10, elevation: 2 },
  preguntaTitulo: { fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
});
