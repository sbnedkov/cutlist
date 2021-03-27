if [ -z "$1" ]; then
    echo "usage: $0 <MONGODB_URI>"
    exit
fi
docker run -d --network razkroi-network -v `pwd`:/app -e MONGODB_URI="$1" --link razkroi-mongo -p 31314:31314 --restart always --name razkroi-web razkroi-web
