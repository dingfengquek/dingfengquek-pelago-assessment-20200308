ARGS_HELP_TEXT="Arguments required, try one of build, db-up, db-down, data-init-10, data-init-50, serve, or cleanup."

NAME_PREFIX="dingfengquek-pelago-codingassessment-20200208"

DOCKER_NETWORK="$NAME_PREFIX-network"

POSTGRES_CONTAINER_NAME="$NAME_PREFIX-postgres"
DB_PORT=13000

IMAGE_NAME="$NAME_PREFIX-image"

# ---

echo "Remember to run \"yarn install\" before running this script."

if [ -z $1 ]
then
    echo $ARGS_HELP_TEXT
    exit 1
fi


network_exists() {
    echo $(docker network ls -q --filter NAME=$DOCKER_NETWORK)
}

network_require() {
    local NETWORK_EXISTS=$(network_exists)
    if [ -z $NETWORK_EXISTS ]
    then
        echo "[network_require] Creating network $DOCKER_NETWORK ..."
        docker network create $DOCKER_NETWORK
    else
        echo "[network_require] Network $DOCKER_NETWORK already exists, not creating."
    fi
}

network_cleanup() {
    local NETWORK_EXISTS=$(network_exists)
    if [ -z $NETWORK_EXISTS ]
    then echo "[network_cleanup] Network $DOCKER_NETWORK does not exist, no network clean up required."
    else
        echo "Removing network $DOCKER_NETWORK"
        docker network rm $DOCKER_NETWORK
    fi
}

db_exists() {
    echo $(docker container ls -q -f NAME=$POSTGRES_CONTAINER_NAME)
}

db_require() {
    local CONTAINER_EXISTS=$(db_exists)
    if [ -z $CONTAINER_EXISTS ]
    then
        echo "[db_require] Starting database..."
        docker run \
            --rm \
            --network $DOCKER_NETWORK \
            -p $DB_PORT:5432 \
            --name $POSTGRES_CONTAINER_NAME \
            -e POSTGRES_PASSWORD=password \
            -d \
            postgres:12.2
    else
        echo "[db_require] Database already started."
    fi
}

db_cleanup() {
    local CONTAINER_EXISTS=$(docker container ls -q -f NAME=$POSTGRES_CONTAINER_NAME)
    if [ -z $CONTAINER_EXISTS ]
    then
        echo "[db_cleanup] Database not running, no cleanup required."
    else
        echo "[db_cleanup] Stopping database..."
        docker stop $POSTGRES_CONTAINER_NAME
    fi
}

image_require() {
    local IMAGE_EXISTS=$(docker images -q $IMAGE_NAME)
    if [ -z "$IMAGE_EXISTS" ]
    then
        echo "[image_require] Building image $IMAGE_NAME ..."
        docker build -t $IMAGE_NAME .
    else echo "[image_require] Image $IMAGE_NAME already exists, not building. Use arg cleanup to remove image before building."
    fi
}

image_cleanup() {
    local IMAGE_EXISTS=$(docker images -q $IMAGE_NAME)
    if [ -z "$IMAGE_EXISTS" ]
    then echo "[image_cleanup] Image $IMAGE_NAME does not exist, no image clean up required."
    else 
        echo "[image_cleanup] Removing image $IMAGE_NAME ..."
        docker image rm $IMAGE_NAME
    fi
}

if [ $1 = "cleanup" ]
then
    image_cleanup
    db_cleanup
    network_cleanup
elif [ $1 = "build" ]
then
    image_cleanup
    image_require
elif [ $1 = "db-up" ]
then
    echo Starting database...
    image_require
    network_require
    db_require
    echo "Initializing database schema, creating tables and indexes..."
    docker run \
        --name ${NAME_PREFIX}-db-init \
        --rm \
        -it \
        --network $DOCKER_NETWORK \
        -e DB_HOST=$POSTGRES_CONTAINER_NAME \
        -e DB_PORT=5432 \
        $IMAGE_NAME \
        yarn run db-init
elif [ $1 = "db-down" ]
then
    db_cleanup
elif [ $1 = "data-init-50" ]
then
    image_require
    network_require
    echo "Downloading data for 50 packages from CRAN and uploading it to the database..."
    docker run \
        --name ${NAME_PREFIX}-data-init \
        --rm \
        -it \
        --network $DOCKER_NETWORK \
        -e DB_HOST=$POSTGRES_CONTAINER_NAME \
        -e DB_PORT=5432 \
        -e DATA_COUNT_LIMIT=50 \
        $IMAGE_NAME \
        yarn run data-init
elif [ $1 = "data-init-10" ]
then
    image_require
    network_require
    echo "Downloading data for 10 packages from CRAN and uploading it to the database..."
    set -x
    docker run \
        --name ${NAME_PREFIX}-data-init \
        --rm \
        -it \
        --network $DOCKER_NETWORK \
        -e DB_HOST=$POSTGRES_CONTAINER_NAME \
        -e DB_PORT=5432 \
        -e PACKAGE_COUNT_LIMIT=10 \
        $IMAGE_NAME \
        yarn run data-init
elif [ $1 = "serve" ]
then
    image_require
    network_require
    set -x
    docker run \
        --name ${NAME_PREFIX}-server \
        --rm \
        -it \
        --network $DOCKER_NETWORK \
        -e DB_HOST=$POSTGRES_CONTAINER_NAME \
        -e DB_PORT=5432 \
        -e SERVER_HOST=0.0.0.0 \
        -p 4000:4000 \
        $IMAGE_NAME \
        yarn run serve
else
    echo Unknown command "$1". $ARGS_HELP_TEXT
fi