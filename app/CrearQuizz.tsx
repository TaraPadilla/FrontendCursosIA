import { crearQuizz, generarPreguntasConIA } from '@/apis/apiQuizz';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

const now = new Date();
const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

function formatDate(date: Date) {
  return date.toISOString().slice(0, 16);
}

export default function CrearQuizz() {
  const params = useLocalSearchParams();
  const [cursoId, setCursoId] = useState<number>(1);

  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [cantidad, setCantidad] = useState('5');
  const [fechaInicio, setFechaInicio] = useState(formatDate(now));
  const [fechaFin, setFechaFin] = useState(formatDate(oneHourLater));
  const [preguntas, setPreguntas] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState('');

  const [mostrarInicioIOS, setMostrarInicioIOS] = useState(false);
  const [mostrarFinIOS, setMostrarFinIOS] = useState(false);

  useEffect(() => {
    if (params.cursoId) setCursoId(parseInt(params.cursoId as string));
    if (params.preguntasIds) setPreguntas(JSON.parse(params.preguntasIds as string));
    if (params.preguntas) {
      try {
        const parsed = JSON.parse(params.preguntas as string);
        if (Array.isArray(parsed)) {
          const textos = parsed.map((p: any) => p.texto || p); 
          setPreguntas(textos);
        }
      } catch (err) {
        console.error("Error al parsear preguntas:", err);
      }
    }
    if (params.titulo) setTitulo(params.titulo as string);
    if (params.tema) setTema(params.tema as string);
    if (params.fechaInicio) setFechaInicio(params.fechaInicio as string);
    if (params.fechaFin) setFechaFin(params.fechaFin as string);
  }, []);
  

  const abrirPickerInicio = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: new Date(fechaInicio),
        mode: 'date',
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            setFechaInicio(selectedDate.toISOString());
          }
        },
      });
    } else {
      setMostrarInicioIOS(true);
    }
  };

  const abrirPickerFin = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: new Date(fechaFin),
        mode: 'date',
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            setFechaFin(selectedDate.toISOString());
          }
        },
      });
    } else {
      setMostrarFinIOS(true);
    }
  };

  const handleGenerarPreguntas = async () => {
    try {
      const data = await generarPreguntasConIA(tema, parseInt(cantidad));
      router.push({
        pathname: '/VistaPreguntas',
        params: {
          preguntas: JSON.stringify(data),
          titulo: titulo,
          tema: tema,
          cursoId: cursoId.toString(),
        },
      });
    } catch (error: any) {
      console.error(error);
      setMensaje('Error al generar preguntas con IA');
    }
  };

  const handleCrearQuizz = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) throw new Error('Token no encontrado');

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      if (inicio >= fin) {
        Alert.alert('Error', 'La fecha de inicio debe ser anterior a la fecha de fin');
        return;
      }

      const quiz = {
        titulo,
        tema,
        preguntas,
        curso_id: cursoId,
        fecha_inicio: inicio.toISOString(),
        fecha_fin: fin.toISOString(),
        estado: "programado"
      };

      console.log('Enviando quiz:', quiz);

      const res = await crearQuizz(quiz, token) as any;
      Alert.alert(`Quiz creado con ID: ${res.id}`);
      setTitulo('');
      setTema('');
      setCantidad('5');
      setFechaInicio('');
      setFechaFin('');
      setPreguntas([]);
    } catch (error: any) {
      console.error(error?.response?.data || error);
      setMensaje('Error al crear el quiz');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge">Crear Quizz</Text>

      <TextInput label="Título" value={titulo} onChangeText={setTitulo} style={styles.input} />

      <Button mode="outlined" onPress={abrirPickerInicio} style={styles.input}>
        {fechaInicio ? `Inicio: ${new Date(fechaInicio).toLocaleString()}` : 'Seleccionar Fecha de Inicio'}
      </Button>
      {Platform.OS === 'ios' && mostrarInicioIOS && (
        <DateTimePicker
          value={new Date(fechaInicio)}
          mode="datetime"
          display="spinner"
          onChange={(event, selectedDate?: Date) => {
            if (event.type === 'set' && selectedDate) {
              setFechaInicio(selectedDate.toISOString());
            }
            setMostrarInicioIOS(false);
          }}
        />
      )}

      <Button mode="outlined" onPress={abrirPickerFin} style={styles.input}>
        {fechaFin ? `Fin: ${new Date(fechaFin).toLocaleString()}` : 'Seleccionar Fecha de Fin'}
      </Button>
      {Platform.OS === 'ios' && mostrarFinIOS && (
        <DateTimePicker
          value={new Date(fechaFin)}
          mode="datetime"
          display="spinner"
          onChange={(event, selectedDate?: Date) => {
            if (event.type === 'set' && selectedDate) {
              setFechaFin(selectedDate.toISOString());
            }
            setMostrarFinIOS(false);
          }}
        />
      )}

      <Button 
        mode="contained" 
        onPress={handleCrearQuizz}
        disabled={preguntas.length === 0}
      >
        Crear Quiz
      </Button>
      {mensaje ? <Text style={{ marginTop: 20 }}>{mensaje}</Text> : null}

      <TextInput label="Tema" value={tema} onChangeText={setTema} style={styles.input} />
      <TextInput label="Cantidad de preguntas" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" style={styles.input} />
      <Button mode="outlined" onPress={handleGenerarPreguntas}>Generar preguntas con IA</Button>

      {preguntas.length > 0 && (
        <>  
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Preguntas generadas:</Text>
          {preguntas.map((pregunta, idx) => (
            <Text key={idx} style={{ marginVertical: 4 }}>
              • {pregunta}
            </Text>
          ))}
        </>

      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: 'white' },
  input: { marginBottom: 12 },
});
