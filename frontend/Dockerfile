FROM node:20-slim AS build

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV VITE_API_URL=http://localhost:8000
ENV VITE_API_KEY=changeme
EXPOSE 80