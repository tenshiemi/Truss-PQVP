FROM golang:1.8.0

# add yarn repo
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# add repo for Node.js
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -

# install the following packages
# PostGres with GIS extension
# yarn
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    postgis \
    yarn

# install glide for vendoring go libs
RUN go get github.com/Masterminds/glide
# install postgres migrations tool
RUN go get github.com/mattes/migrate

RUN mkdir -p /go/src/app
WORKDIR /go/src/app
ADD . /go/src/app

# build backend binary
RUN make server_build

# package frontend files
WORKDIR /go/src/app/client
RUN yarn install
RUN npm run-script prod

# generate swagger docs
RUN ./node_modules/bootprint/bin/bootprint.js openapi ../server/docs/swagger.yaml dist/docs

ENTRYPOINT /go/src/app/server/entrypoint.sh

EXPOSE 80
