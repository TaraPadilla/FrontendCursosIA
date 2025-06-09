import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { guardarPreguntasSeleccionadas } from '../apis/apiQuizz';
import { useAuth } from '../context/AuthContext';

type Pregunta = {
  texto: string;
  opciones: string[];
  respuesta_correcta: number;
  explicacion: string;
  tema: string;
  curso_id: number;
};

type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isLoading: boolean;
};

export default function VistaPreguntas() {
  const { preguntas, titulo, tema, cursoId } = useLocalSearchParams();
  const preguntasArray: Pregunta[] = Array.isArray(preguntas)
    ? preguntas
    : JSON.parse(preguntas || '[]');

  // Parsear los parámetros con valores por defecto
  const tituloQuiz = typeof titulo === 'string' ? titulo : 'Nuevo Quiz';
  const temaQuiz = typeof tema === 'string' ? tema : 'General';
  const cursoIdNum = typeof cursoId === 'string' ? parseInt(cursoId) : 1;

  // asegúrate que tienes acceso al token desde contexto
  const { token } = useAuth(); // ya tienes acceso al token
  const [insertedIds, setInsertedIds] = useState<string[]>([]);

  const handleCrearQuiz = async () => {
    if (!token) {
      Alert.alert('Error', 'No se ha iniciado sesión');
      return;
    }

    const quizData = {
      titulo: tituloQuiz,
      tema: temaQuiz,
      curso_id: cursoIdNum,
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora después
      estado: "programado",
      preguntas: insertedIds
    };

    try {
      const res = await axios.post("http://192.168.100.50:8002/quizzes", quizData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("✅ Quiz creado:", res.data);
      Alert.alert("Éxito", "Quiz creado correctamente");
    } catch (error) {
      console.error('Error al guardar preguntas:', error);
      Alert.alert('Error', 'No se pudieron guardar las preguntas');
    }
  };

  console.log("🧪 Token actual en VistaPreguntas:", token); // 👈 log para comprobar

  const handleGuardarPreguntas = async () => {
    if (!token) {
      Alert.alert('Error', 'No se ha iniciado sesión. Inicia sesión para guardar las preguntas.');
      return;
    }

    // Usamos el cursoId que recibimos como parámetro
    const preguntasConCurso = preguntasArray.map(p => ({
      ...p,
      curso_id: cursoIdNum,
    }));

    try {
      console.log("📦 Enviando preguntas:", preguntasConCurso); // debug opcional
      const response = await guardarPreguntasSeleccionadas(preguntasConCurso, token);
      Alert.alert('Éxito', 'Las preguntas fueron guardadas correctamente');
      console.log('IDs insertados:', response);
      setInsertedIds(response as string[]);

      // Reenviar al formulario con los datos e IDs insertados
      router.replace({
        pathname: '../CrearQuizz',
        params: {
          preguntasIds: JSON.stringify(response),
          preguntas: JSON.stringify(preguntasArray),
          cursoId: cursoIdNum.toString(),
          titulo: tituloQuiz,
          tema: temaQuiz,
          fechaInicio: new Date().toISOString(),
          fechaFin: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      });
    } catch (error: any) {
      console.error('Error al guardar preguntas:', error);
      Alert.alert('Error', 'No se pudieron guardar las preguntas');
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Preguntas Generadas
      </Text>
      {preguntasArray.map((pregunta, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.preguntaTexto}>{`Pregunta ${index + 1}`}</Text>
          <Text style={styles.preguntaContenido}>{pregunta.texto}</Text>

          {pregunta.opciones.map((opcion, i) => (
            <Text
              key={i}
              style={[
                styles.opcion,
                i === pregunta.respuesta_correcta && styles.opcionCorrecta,
              ]}
            >
              {`• ${opcion}`}
            </Text>
          ))}

          <Text style={styles.explicacionTitulo}>Explicación:</Text>
          <Text style={styles.explicacionTexto}>{pregunta.explicacion}</Text>
        </View>
      ))}


        <Button mode="contained"
        onPress={handleGuardarPreguntas}
        style={styles.botonGuardar}
      >
        Guardar preguntas
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f9f9f9',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  preguntaTexto: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  preguntaContenido: {
    fontSize: 14,
    marginBottom: 12,
    color: '#555',
  },
 opcion: {
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: '#f2f2f2',
    color: '#333',
  },
  opcionCorrecta: {
    backgroundColor: '#d1e7dd',
    color: '#0f5132',
    fontWeight: 'bold',
  },
  explicacionTitulo: {
    marginTop: 12,
    fontWeight: '600',
    color: '#555',
  },
  explicacionTexto: {
    fontSize: 13,
    color: '#444',
  },
    botonGuardar: {
    marginTop: 20,
    alignSelf: 'center',
  },
});