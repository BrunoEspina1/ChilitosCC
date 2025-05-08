import React from 'react';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import { Loader, ThemeProvider } from '@aws-amplify/ui-react';
import { get, post } from 'aws-amplify/api';

export default function LivenessQuickStart({ onSuccess }) {
  const [loading, setLoading] = React.useState(true);
  const [sessionInfo, setSessionInfo] = React.useState(null);

  // 1. Petición a la API usando Amplify API (confiamos que el endpoint está configurado correctamente)
  React.useEffect(() => {
    const fetchCreateLiveness = async () => {
      try {

        console.log('Hola')
        const data = post({
            apiName: 'CCApi',
            path: '/liveness/session',
            options: {
                body: {
                  message: 'Nada'
                }
              }
        })
        
        const { body } = await data.response;
        const response = await body.json();

        console.log('ciao')
        console.log(response)

        setSessionInfo(response);  // { sessionId, region }
        setLoading(false);
      } catch (error) {
        console.error('Error al crear sesión de prueba de vida:', error);
      }
    };
    fetchCreateLiveness();
  }, []);

  // 2. Cuando la prueba de vida se complete
  const handleAnalysisComplete = async () => {
    try {

        const res = get({
            apiName: 'CCApi',
            path:  `/liveness/result?sessionId=${sessionInfo.sessionId}`
        })

        const { body } = await res.response;
        const response = await body.json();
        console.log(response);
        console.log(response.isLive)

      if (response.isLive) {
        onSuccess?.(); // Llamada exitosa
      } else {
        alert('No se validó la prueba de vida');
      }
    } catch (e) {
        console.log('GET call failed: ', JSON.parse(e.response.body));
      }
  };

  return (
    <ThemeProvider>
      {loading ? (
        <Loader />
      ) : (
        <FaceLivenessDetector
          sessionId={sessionInfo.sessionId}
          region={sessionInfo.region}
          onAnalysisComplete={handleAnalysisComplete}
          onError={console.error}
        />
      )}
    </ThemeProvider>
  );
}
