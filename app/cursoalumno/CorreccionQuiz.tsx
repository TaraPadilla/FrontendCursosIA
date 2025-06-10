import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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

import { useLocalSearchParams } from 'expo-router';

export default function CorreccionQuiz() {
  const { preguntas, respuestasUsuario } = useLocalSearchParams();
  const preguntasArr: Pregunta[] = preguntas ? JSON.parse(preguntas as string) : [];
  const respuestasArr: RespuestaUsuario[] = respuestasUsuario ? JSON.parse(respuestasUsuario as string) : [];
  const correctas = respuestasArr.filter(r => r.esCorrecta).length;
  const total = preguntasArr.length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.resultado}>Obtuviste {correctas}/{total}. ¡Buen trabajo!</Text>
      {preguntasArr.map((pregunta, idx) => (
        <View key={pregunta.id} style={styles.preguntaContainer}>
          <Text style={styles.preguntaTitulo}>{pregunta.texto}</Text>
          <Text>
            Tu respuesta: <Text style={{color: respuestasArr[idx]?.esCorrecta ? 'green' : 'red'}}>
            {respuestasArr[idx]?.seleccionada !== undefined && respuestasArr[idx]?.seleccionada !== null
            ? pregunta.opciones[respuestasArr[idx].seleccionada]
            : '-'}
            </Text>
          </Text>
          {!respuestasArr[idx]?.esCorrecta && (
            <Text>
              Respuesta correcta: <Text style={{color: 'green'}}>
                {pregunta.opciones[pregunta.respuesta_correcta]}
              </Text>
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  resultado: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, alignSelf: 'center' },
  preguntaContainer: { marginBottom: 18, padding: 12, backgroundColor: '#f8f8f8', borderRadius: 8 },
  preguntaTitulo: { fontWeight: 'bold', marginBottom: 6 },
});
