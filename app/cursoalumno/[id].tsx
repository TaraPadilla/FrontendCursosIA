import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';

interface Quiz {
  id: string;
  titulo: string;
  tema: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export default function CursoAlumnoScreen() {
  const { id } = useLocalSearchParams(); // curso_id
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = await getToken(); // Reemplaza por tu método real
      const res = await fetch(`http://localhost:8002/quizzes/activos-programados/${id}`, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setQuizzes(data);
    };

    fetchQuizzes();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quizzes Activos</Text>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.quizTitle}>{item.titulo}</Text>
            <Text>{item.tema}</Text>
            <Button
              title="Resolver quiz"
              onPress={() => router.push({ pathname: "./resolver/[quizId]", params: { quizId: item.id } })}
            />
          </View>
        )}
      />
    </View>
  );
}

const getToken = async () => {
  // Simulación: deberías obtenerlo de contexto o async storage
  return 'Bearer TU_TOKEN_AQUI';
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  quizTitle: { fontWeight: 'bold', fontSize: 18 },
});