if [ -z "$1" -o -z "$2" ]; then
    echo "usage: $0 <username> <password>"
    exit
fi

./razkroi.sh mongodb://$1:$2@razkroi-mongo/razkroi
