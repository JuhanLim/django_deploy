docker build -t reactserver .
docker run -d -p 3000:3000 reactserver:latest
docker cp reactserver:/app/build /usr/share/nginx/html
echo "copy complete from reactserver" 