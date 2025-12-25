#! /bin/bash

set -e
dirs="postgresql_data mongodb_data moodle_data"

for dir in ${dirs}; do
    rm -rf local-dev/$dir
done
