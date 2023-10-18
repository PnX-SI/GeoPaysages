FROM node:12.22.12-slim as build-stage
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --base-href /admin/

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist/admin /app/admin
COPY ./install_resources/nginx.conf /etc/nginx/conf.d/default.conf