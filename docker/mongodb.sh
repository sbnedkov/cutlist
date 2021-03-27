if [ -z "$1" -o -z "$2" ]; then
    echo "usage: $0 <username> <password>"
    exit
fi

docker run -d --network razkroi-network --restart always --name razkroi-mongo \
    -e MONGO_INITDB_ROOT_USERNAME=$1 \
    -e MONGO_INITDB_ROOT_PASSWORD=$2 \
    mongo
