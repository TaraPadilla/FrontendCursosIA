import { obtenerPreguntasPorTema, Pregunta } from '@/apis/apiQuizz';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Checkbox, Text } from 'react-native-paper';

export default function SeleccionarPreguntas() {
  const params = useLocalSearchParams();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tema, setTema] = useState(params.tema as string || '');

  useEffect(() => {
    const cargarPreguntas = async () => {
      try {
        setLoading(true);
        const token = await SecureStore.getItemAsync('token');
        if (!token) throw new Error('Token no encontrado');
        const preguntasTema = await obtenerPreguntasPorTema(tema, token);
        setPreguntas(preguntasTema);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar las preguntas.');
      } finally {
        setLoading(false);
      }
    };
    cargarPreguntas();
  }, [tema]);

  const toggleSeleccion = (id: string) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirmar = () => {
    if (seleccionadas.length < 5) {
      Alert.alert('Selecciona al menos 5 preguntas.');
      return;
    }
    const preguntasSeleccionadas = preguntas.filter(p => seleccionadas.includes(p.id));
    const preguntasIds = preguntasSeleccionadas.map(p => p.id);
    const preguntasTextos = preguntasSeleccionadas.map(p => p.texto);
    router.replace({
      pathname: '/CrearQuizz',
      params: {
        ...params,
        preguntasIds: JSON.stringify(preguntasIds),
        preguntas: JSON.stringify(preguntasSeleccionadas),
      },
    });
  };

  if (loading) {
    return <ActivityIndicator animating style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Selecciona preguntas para el tema: {tema}</Text>
      {preguntas.map((pregunta, idx) => (
        <View key={pregunta.id} style={styles.preguntaBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Checkbox
              status={seleccionadas.includes(pregunta.id) ? 'checked' : 'unchecked'}
              onPress={() => toggleSeleccion(pregunta.id)}
            />
            <Text style={styles.preguntaTexto}>{idx + 1}. {pregunta.texto}</Text>
          </View>
          <View style={styles.opcionesBox}>
            {pregunta.opciones.map((op, i) => (
              <Text key={i} style={styles.opcion}>• {op}</Text>
            ))}
          </View>
        </View>
      ))}
      <Button
        mode="contained"
        onPress={handleConfirmar}
        disabled={seleccionadas.length < 5}
        style={{ marginTop: 24 }}
      >
        Confirmar selección ({seleccionadas.length})
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  preguntaBox: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  preguntaTexto: {
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
  },
  opcionesBox: {
    marginLeft: 36,
    marginTop: 6,
  },
  opcion: {
    fontSize: 14, 
  },
});
