FROM node:8.14.0

COPY package.json /tmp/package.json
COPY .npmrc /root/.npmrc
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
COPY . /opt/app

ARG BUILD_SHA=default_value
ENV __BUILD_SHA=$BUILD_SHA

CMD ["npm","start"]

