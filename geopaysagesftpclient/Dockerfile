FROM python:3.6-slim
RUN apt-get update && apt-get install --yes libpq-dev gcc
COPY . /geopaysagesftpclient
WORKDIR /geopaysagesftpclient
RUN pip install wheel
RUN pip install .