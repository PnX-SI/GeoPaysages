FROM tiangolo/uwsgi-nginx-flask:python3.9

COPY ./requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY . .