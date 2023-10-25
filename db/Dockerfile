FROM alpine:latest AS builder

RUN apk add wget
WORKDIR /docker-entrypoint-initdb.d
RUN wget https://raw.githubusercontent.com/PnX-SI/UsersHub/2.1.3/data/usershub.sql -O 12_usershub.sql
RUN wget https://raw.githubusercontent.com/PnX-SI/UsersHub/2.1.3/data/usershub-data.sql -O 13_usershub-data.sql
RUN wget https://raw.githubusercontent.com/PnX-SI/UsersHub/2.1.3/data/usershub-dataset.sql -O 14_usershub-dataset.sql

FROM postgis/postgis:13-3.4

WORKDIR /docker-entrypoint-initdb.d
RUN echo 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"' > 11_ext_uuid_ossp.sql
COPY --from=builder /docker-entrypoint-initdb.d/* ./
COPY ./install_resources/sql/usershub_adds.sql 15_usershub_adds.sql
COPY ./install_resources/sql/oppdb.sql 16_oppdb.sql