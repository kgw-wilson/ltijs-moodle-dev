#! /bin/bash

set -e

cd $(dirname $0)

data_dirs="postgresql mongodb_data moodle_data"
for dir in $dirs; do
    if [ ! -d $dir ]; then
	mkdir $dir
    fi
done

# docker-compose up --no-start
# docker-compose start treamariadb mongodb moodle

docker compose -f ./docker-compose.yml up --build
