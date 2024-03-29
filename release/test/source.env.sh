
if [ -z "$APIM_SOLACE_PLATFORM_API_PROJECT_HOME" ]; then
  _scriptDir=$(pwd)
  projectHome=${_scriptDir%/platform-api/*}
  if [[ ! $projectHome =~ "platform-api" ]]; then
    projectHome=$projectHome/platform-api
  fi
else
  projectHome=$APIM_SOLACE_PLATFORM_API_PROJECT_HOME
fi

export APIM_SOLACE_PLATFORM_API_PROJECT_HOME="$projectHome"

export APIM_RELEASE_TEST_ENABLE_LOGGING="true"
export APIM_RELEASE_TEST_HOME="$APIM_SOLACE_PLATFORM_API_PROJECT_HOME/release/test"
export APIM_RELEASE_TEST_RESOURCES_HOME="$APIM_RELEASE_TEST_HOME/resources"
export APIM_RELEASE_TEST_WORKING_DIR="$APIM_RELEASE_TEST_HOME/tmp"; mkdir -p $APIM_RELEASE_TEST_WORKING_DIR;

nodeVersion=$(node --version)
export APIM_RELEASE_TEST_LOG_DIR="$APIM_RELEASE_TEST_WORKING_DIR/logs/node-$nodeVersion"; mkdir -p $APIM_RELEASE_TEST_LOG_DIR;
export APIM_RELEASE_TEST_MONGO_DATABASE=platform
export APIM_RELEASE_TEST_MONGO_PORT=27017

# platform-api server
export APIM_RELEASE_TEST_DOCKER_CONTAINER_NAME="release-platform-api-server"
export APIM_RELEASE_TEST_DB_URL="mongodb://localhost:$APIM_RELEASE_TEST_MONGO_PORT/$APIM_RELEASE_TEST_MONGO_DATABASE?retryWrites=true&w=majority"
export APIM_RELEASE_TEST_PLATFORM_PROTOCOL="http"
export APIM_RELEASE_TEST_PLATFORM_HOST="localhost"
export APIM_RELEASE_TEST_PLATFORM_PORT="9090"
export APIM_RELEASE_TEST_APP_ID="release-test"
# JWT token validation properties
export APIM_RELEASE_TEST_AUTH_EXTRACTION_USER_PRINCIPAL=$.upn
export APIM_RELEASE_TEST_AUTH_EXTRACTION_ORGS=$.groups
export APIM_RELEASE_TEST_AUTH_EXTRACTION_ROLES=$.resource_access['platform-api-server'].roles
export APIM_RELEASE_TEST_AUTH_VERIFICATION_KEY="$APIM_RELEASE_TEST_RESOURCES_HOME/jwt_integration_test.pem"
export APIM_RELEASE_TEST_AUTH_VERIFICATION_ISSUER=http://localhost:8180/auth/realms/default
export APIM_RELEASE_TEST_AUTH_VERIFICATION_AUD=platform-api-server
export APIM_RELEASE_TEST_AUTH_DISCOVERY_OIDC_URL=http://localhost:8180/auth/realms/default/.well-known/openid-configuration
# 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
export APIM_RELEASE_TEST_LOG_LEVEL="debug"
export APIM_RELEASE_TEST_FILE_USER_REGISTRY="$APIM_RELEASE_TEST_RESOURCES_HOME/organization_users.json"
# service ids
export APIM_RELEASE_TEST_SOLACE_CLOUD_DEV_SERVICE_ID="1i5g7tif6z8n"
# org
export APIM_RELEASE_TEST_ORG_API_USR="org_admin_user"
export APIM_RELEASE_TEST_ORG_API_PWD="org_admin_user_password"

env | grep APIM_RELEASE

###
