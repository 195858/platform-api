
#  usage:
# source source.env.sh

scriptDir=$(pwd)
projectHome=${scriptDir%/platform-api/*}
if [[ ! $projectHome =~ "platform-api" ]]; then
  projectHome=$projectHome/platform-api
fi

export APIM_SOLACE_PLATFORM_API_PROJECT_HOME="$projectHome"
export APIM_INTEGRATION_TEST_HOME="$APIM_SOLACE_PLATFORM_API_PROJECT_HOME/api-implementation/test/integration"
export APIM_INTEGRATION_TEST_RESOURCES_HOME="$APIM_INTEGRATION_TEST_HOME/resources"
export APIM_INTEGRATION_TEST_WORKING_DIR="$APIM_SOLACE_PLATFORM_API_PROJECT_HOME/tmp"; mkdir -p $APIM_INTEGRATION_TEST_WORKING_DIR;
export APIM_INTEGRATION_TEST_LOG_DIR="$APIM_INTEGRATION_TEST_WORKING_DIR/logs"; mkdir -p $APIM_INTEGRATION_TEST_LOG_DIR;
export APIM_INTEGRATION_TEST_MONGO_ROOT_USERNAME=mongo-root
export APIM_INTEGRATION_TEST_MONGO_ROOT_PASSWORD=mongo-root-pass
export APIM_INTEGRATION_TEST_MONGO_INITDB_PORT=27017
export APIM_INTEGRATION_TEST_DB_URL="mongodb://localhost:$MONGO_INITDB_PORT/solace-platform?retryWrites=true&w=majority"
export APIM_INTEGRATION_TEST_PLATFORM_PORT="3000"
export APIM_INTEGRATION_TEST_APP_ID="integration-test"
# 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
export APIM_INTEGRATION_TEST_LOG_LEVEL="debug"
export APIM_INTEGRATION_TEST_FILE_USER_REGISTRY="$APIM_INTEGRATION_TEST_RESOURCES_HOME/organization_users.json"

env | grep APIM
