import { crearQuizz, generarPreguntasConIA, obtenerTemasDePreguntas } from '@/apis/apiQuizz';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

const now = new Date();
const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

function formatDate(date: Date) {
  return date.toISOString().slice(0, 16);
}

export default function CrearQuizz() {
  const params = useLocalSearchParams();
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [cantidad, setCantidad] = useState('5');
  const [fechaInicio, setFechaInicio] = useState(formatDate(now));
  const [fechaFin, setFechaFin] = useState(formatDate(oneHourLater));
  const [mensaje, setMensaje] = useState('');

  const [mostrarInicioIOS, setMostrarInicioIOS] = useState(false);
  const [mostrarFinIOS, setMostrarFinIOS] = useState(false);

  const [preguntas, setPreguntas] = useState<string[]>([]);
  const [preguntasIds, setPreguntasIds] = useState<string[]>([]);
  const [preguntasTextos, setPreguntasTextos] = useState<string[]>([]);
  const [temasDisponibles, setTemasDisponibles] = useState<string[]>([]);


  const [menuVisible, setMenuVisible] = useState(false);
  const abrirMenu = () => setMenuVisible(true);
  const cerrarMenu = () => setMenuVisible(false);
  const [mostrarTemas, setMostrarTemas] = useState(false);

  

  useEffect(() => {
    const cargarTemas = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (!token) throw new Error('Token no encontrado');
        const temas = await obtenerTemasDePreguntas(token);
        setTemasDisponibles(temas);
      } catch (error) {
        console.error("Error al cargar temas:", error);
      }
    };
  
    cargarTemas();
  }, []);
  

  useEffect(() => {
    console.log("params", params);
    if (params.id) {
      setCursoId(parseInt(params.id as string));
    } else if (params.cursoId) {
      setCursoId(parseInt(params.cursoId as string));
    }
    
    if (params.preguntasIds) {
      setPreguntasIds(JSON.parse(params.preguntasIds as string));
    }
    if (params.preguntas) {
      try {
        const parsed = JSON.parse(params.preguntas as string);
        if (Array.isArray(parsed)) {
          const textos = parsed.map((p: any) => p.texto || p);
          setPreguntasTextos(textos);
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
          cursoId: cursoId!,
        },
      });
    } catch (error: any) {
      console.error(error);
      setMensaje('Error al generar preguntas con IA');
    }
  };

  const handleCrearQuizz = async () => {
    if (!cursoId) {
      Alert.alert('Error', 'No se seleccionó un curso');
      return;
    }

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
        preguntas: preguntasIds,
        curso_id: cursoId,
        fecha_inicio: inicio.toISOString(),
        fecha_fin: fin.toISOString(),
        estado: "programado"
      };

      console.log('Enviando quiz:', quiz);

      const res = await crearQuizz(quiz, token) as any;
      Alert.alert(
        'Éxito',
        `Quiz creado con ID: ${res.id}`,
        [
          {
            text: 'Aceptar',
            onPress: () => router.replace('/ProfesorHome'),
          },
        ]
      );
      
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
      <Text variant="titleLarge" style={styles.title}>Crear Nuevo Quiz</Text>
      
      {/* Sección de información básica */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Información del Quiz</Text>
      <TextInput 
        label="Título" 
        value={titulo} 
        onChangeText={setTitulo} 
        style={styles.input} 
        mode="outlined"
      />
      
      <TextInput
          label="Tema"
          value={tema}
          onChangeText={setTema}
          style={styles.input}
          mode="outlined"
          right={
            <TextInput.Icon
              icon="menu-down"
              onPress={() => setMostrarTemas(!mostrarTemas)}
            />
          }
        />

        {mostrarTemas && temasDisponibles.map((t, idx) => (
          <Button
            key={idx}
            mode="text"
            onPress={() => {
              setTema(t);
              setMostrarTemas(false);
            }}
            style={{ alignSelf: 'flex-start', marginBottom: 4 }}
          >
            {t}
          </Button>
        ))}

      
      <TextInput 
        label="Cantidad de preguntas" 
        value={cantidad} 
        onChangeText={setCantidad} 
        keyboardType="numeric" 
        style={styles.input}
        mode="outlined"
      />
      
      {/* Sección de fechas */}
      <Text variant="titleMedium" style={[styles.sectionTitle, {marginTop: 16}]}>Fechas del Quiz</Text>
      <View style={styles.dateContainer}>
        <Button 
          mode="outlined" 
          onPress={abrirPickerInicio} 
          style={[styles.button, styles.dateButton]}
          icon="calendar"
        >
          {fechaInicio ? `Inicio: ${new Date(fechaInicio).toLocaleString()}` : 'Seleccionar Fecha de Inicio'}
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={abrirPickerFin} 
          style={[styles.button, styles.dateButton, {marginTop: 8}]}
          icon="calendar"
        >
          {fechaFin ? `Fin: ${new Date(fechaFin).toLocaleString()}` : 'Seleccionar Fecha de Fin'}
        </Button>
      </View>
      
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
      
      {/* Sección de acciones */}
      <View style={styles.actionsContainer}>
        <Button 
          mode="outlined" 
          onPress={handleGenerarPreguntas} 
          style={[styles.button, {marginBottom: 8}]}
          icon="robot"
        >
          Generar preguntas con IA
        </Button>

        <Button
          mode="outlined"
          onPress={() => {
            if (!tema) {
              setMensaje('Selecciona o escribe un tema antes de seleccionar preguntas');
              return;
            }
            router.push({
              pathname: '/SeleccionarPreguntas',
              params: {
                tema,
                cursoId: cursoId!.toString(),
                titulo,
                cantidad,
              },
            });
          }}
          style={[styles.button, {marginBottom: 16}]}
          icon="playlist-plus"
        >
          Seleccionar preguntas
        </Button>
        
        <Button 
          mode="contained" 
          onPress={handleCrearQuizz}
          disabled={preguntasTextos.length === 0}
          style={styles.button}
          icon="check"
        >
          Crear Quiz
        </Button>
        
        {mensaje ? <Text style={styles.message}>{mensaje}</Text> : null}
      </View>
      
      {/* Sección de preguntas generadas */}
      {preguntasTextos.length > 0 && (
        <View style={styles.questionsContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Preguntas Generadas</Text>
          {preguntasTextos.map((pregunta, idx) => (
            <View key={idx} style={styles.questionItem}>
              <Text style={styles.questionText}>• {pregunta}</Text>
            </View>
          ))}
        </View>
      )}
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
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 16,
    fontWeight: '600',
    color: 'white',
  },
  input: { 
    marginBottom: 20,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateButton: {
    width: '100%',
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  button: {
    marginTop: 8,
    borderRadius: 4,
  },
  actionsContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    color: 'white',
  },
  questionsContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'white',
  },
  questionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
