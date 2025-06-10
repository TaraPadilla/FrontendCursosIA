import axios from 'axios';

//const API_URL = 'http://192.168.1.42:8002';
const API_URL = 'http://192.168.1.2:8002';

export const crearQuizz = async (quiz: any, token: string) => {
  const response = await axios.post(`${API_URL}/quizzes/`, quiz, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export async function generarPreguntasConIA(tema: string, cantidad: number) {
  const res = await axios.post(`${API_URL}/preguntas/generar-con-ia/`, null, {
    params: {
      tema,
      cantidad,
    },    
  });
  return res.data;
}

export const guardarPreguntasSeleccionadas = async (preguntas: any[], token: string) => {
  const response = await axios.post(`${API_URL}/preguntas/guardar-seleccionadas/`, preguntas, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export async function obtenerPreguntasPorTemaYCurso(
  tema: string,
  curso_id: number,
  token: string
): Promise<any[]> {
  const res = await axios.get<any[]>(`${API_URL}/preguntas/listar`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { tema, curso_id },
  });
  return res.data;
}

export async function obtenerQuizzesActivosProgramados(curso_id: number, token: string): Promise<any[]> {
  console.log(curso_id);
  console.log(token);
  const res = await axios.get<any[]>(`${API_URL}/quizzes/activos-programados/${curso_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(res.data);
  return res.data;
}

export const obtenerPreguntasPorQuiz = async (quiz_id: string, token: string): Promise<any[]> => {
  console.log(quiz_id);
  console.log(token);
  const response = await axios.get<any[]>(`${API_URL}/quizzes/${quiz_id}/preguntas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response.data);
  return response.data;
};
