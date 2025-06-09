// app/resolver/[quizId].tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

interface Pregunta {
  id: string;
  enunciado: string;
  opciones: string[]; // Ajusta si es más compleja
}

export default function ResolverPreguntasScreen() {
  const { quizId } = useLocalSearchParams();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchPreguntas = async () => {
      const token = await getToken();
      const res = await fetch(`http://localhost:8002/quizzes/${quizId}/pregunta`, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setPreguntas(data);
    };

    fetchPreguntas();
  }, []);

  const toggleOpcion = (preguntaId: string, opcion: string) => {
    setRespuestas((prev) => {
      const prevOpciones = prev[preguntaId] || [];
      const nueva = prevOpciones.includes(opcion)
        ? prevOpciones.filter((o) => o !== opcion)
        : [...prevOpciones, opcion];
      return { ...prev, [preguntaId]: nueva };
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Resolver Preguntas</Text>
      {preguntas.map((p) => (
        <View key={p.id} style={styles.pregunta}>
          <Text style={styles.enunciado}>{p.enunciado}</Text>
          {p.opciones.map((op, idx) => (
            <View key={idx} style={styles.opcion}>
              <Switch
                value={respuestas[p.id]?.includes(op) || false}
                onValueChange={() => toggleOpcion(p.id, op)}
              />
              <Text>{op}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const getToken = async () => {
  return 'Bearer TU_TOKEN_AQUI';
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  pregunta: { marginBottom: 20 },
  enunciado: { fontSize: 16, fontWeight: '600' },
  opcion: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
});