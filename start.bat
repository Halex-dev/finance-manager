@echo off

echo Compiling front-end...
cd frontend
npm run build
cd ..

echo Starting backend...
cd backend
npm run start
cd ..