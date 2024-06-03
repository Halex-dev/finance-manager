#!/bin/bash

# Naviga nella directory front-end e installa le dipendenze
cd front-end
npm install

# Torna alla directory principale
cd ..

# Naviga nella directory back-end e installa le dipendenze
cd back-end
npm install

# Torna alla directory principale
cd ..

# Naviga nella directory front-end e esegui il build
cd front-end
npm run build

# Torna alla directory principale
cd ..

# Naviga nella directory back-end e avvia l'applicazione
cd back-end
npm run start
