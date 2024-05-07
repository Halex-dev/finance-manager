# Usa l'immagine di Node.js come base
FROM node:latest

# Imposta la directory di lavoro
WORKDIR /app

# Copia il file package.json dalla cartella back-end e installa le dipendenze
COPY ./back-end/package.json ./back-end/package-lock.json ./back-end/
RUN cd ./back-end && npm install

# Copia il file package.json dalla cartella front-end e installa le dipendenze
COPY ./front-end/package.json ./front-end/package-lock.json ./front-end/
RUN cd ./front-end && npm install

# Copia il codice sorgente back-end nella directory di lavoro
COPY ./back-end ./back-end

# Copia il codice sorgente front-end nella directory di lavoro
COPY ./front-end ./front-end

# Esegui il comando npm run build nella cartella front-end
RUN cd ./front-end && npm run build

# Espone la porta 3000 per il server back-end
EXPOSE 3000

# Avvia il server back-end
CMD ["npm", "run", "start", "--prefix", "back-end"]
