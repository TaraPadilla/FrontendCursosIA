import { obtenerQuizzesActivosProgramados } from '@/apis/apiQuizz';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

interface Quiz {
  id: string;
  titulo: string;
  tema: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export default function QuizActivos() {
  const theme = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Quizzes Activos</Text>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Card.Content>
              <Text style={[styles.quizTitle, { color: theme.colors.onSurface }]}>{item.titulo}</Text>
              <Text style={[styles.subTitle, { color: theme.colors.onSurface + '99', fontSize: 13, marginBottom: 2 }]}>{item.id}</Text>
              <Text style={{ color: theme.colors.onSurface }}>{item.tema}</Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => router.push({ pathname: "./QuizPlayer", params: { quizId: item.id } })}
                style={{ marginTop: 8 }}
              >
                Resolver quiz
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    borderRadius: 10,
    marginBottom: 14,
    elevation: 2,
  },
  quizTitle: { fontWeight: 'bold', fontSize: 20, marginBottom: 4 },
  subTitle: { fontSize: 16, marginBottom: 2 },
});