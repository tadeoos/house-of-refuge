#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -U pip
pip install -r requirements/production.txt

npm i --prefix house_of_refuge/frontend
npm run build --prefix house_of_refuge/frontend


python manage.py collectstatic --no-input
python manage.py migrate
python manage.py compilemessages
