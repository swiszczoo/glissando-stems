FROM node:18-alpine3.18
ENV NODE_ENV=production

RUN apk update && \
    apk add sox && \
    mkdir -p /var/glissando/stems

WORKDIR /usr/src/app
COPY .env package.json package-lock.json typeorm-prod-datasource.cjs /usr/src/app/
RUN npm install --omit=dev
COPY dist /usr/src/app/dist

CMD [ "/bin/sh", "-c", "npm run migration:run:prod; npm run start:prod" ]
