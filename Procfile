release: python manage.py migrate --noinput && python manage.py collectstatic --noinput
web: gunicorn finance_tracker.wsgi:application --bind 0.0.0.0:$PORT
