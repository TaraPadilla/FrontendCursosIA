import { obtenerQuizzesActivosProgramados } from '@/apis/apiQuizz';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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

export default function QuizActivos() {
  const { id } = useLocalSearchParams(); // curso_id
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const cursoId = parseInt(id as string);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        if (!storedToken) {
          console.warn('Token no encontrado');
          return;
        }
  
        const quizzes = await obtenerQuizzesActivosProgramados(cursoId, storedToken);
        setQuizzes(quizzes);
      } catch (error) {
        console.error('Error al obtener quizzes activos:', error);
      }
    };
  
    console.log('cursoId en quizActivos', cursoId);
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
            <Text style={styles.subTitle}>{item.id}</Text> 
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
  subTitle: { fontSize: 14, color: '#666' },
});