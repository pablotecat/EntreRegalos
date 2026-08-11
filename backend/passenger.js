/* eslint-disable @typescript-eslint/no-var-requires */
// Punto de entrada para Phusion Passenger en HelioHost Tommy.
// Passenger detecta este archivo en la raíz del dominio y lo ejecuta.

// Asegurar que los módulos compilados y node_modules se resuelvan correctamente.
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PASSENGER = 'true';

const { createApp } = require('./dist/main');

(async () => {
  const { app } = await createApp();

  // Passenger asigna el puerto automáticamente via process.env.PORT.
  // Si no está definido (desarrollo local), usamos 3001.
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend arrancado en el puerto ${port}`);
})();
