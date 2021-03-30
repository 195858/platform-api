#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Environment Variables

  if [ -z "$APIM_SOLACE_PLATFORM_API_PROJECT_HOME" ]; then echo ">>> ERROR: - $scriptName - missing env var: APIM_SOLACE_PLATFORM_API_PROJECT_HOME"; exit 1; fi
  if [ -z "$APIM_RELEASE_TEST_LOG_DIR" ]; then echo ">>> ERROR: - $scriptName - missing env var: APIM_RELEASE_TEST_LOG_DIR"; exit 1; fi

############################################################################################################################
# Prepare

  # LOG_DIR=$APIM_RELEASE_TEST_LOG_DIR; mkdir -p $LOG_DIR; rm -rf $LOG_DIR/*;
  integrationDir="$APIM_SOLACE_PLATFORM_API_PROJECT_HOME/api-implementation/test/integration"
  # map release test secrets env to integration test env
  export APIM_INTEGRATION_TEST_SOLACE_CLOUD_TOKEN=$APIM_RELEASE_TEST_SOLACE_CLOUD_TOKEN
  export APIM_INTEGRATION_TEST_PLATFORM_ADMIN_USER=$APIM_RELEASE_TEST_PLATFORM_ADMIN_USER
  export APIM_INTEGRATION_TEST_PLATFORM_ADMIN_PASSWORD=$APIM_RELEASE_TEST_PLATFORM_ADMIN_PASSWORD

############################################################################################################################
# Run

echo ">>> Run integration test ..."
  cd $integrationDir
  source source.env.sh
  export APIM_INTEGRATION_TEST_LOG_DIR=$APIM_RELEASE_TEST_LOG_DIR
  runScript="./run.npm.integration-tests.logfile.sh"
  $runScript
  code=$?; if [[ $code != 0 ]]; then echo " >>> ERROR - code=$code - runScript='$runScript' - $scriptName"; exit 1; fi
echo ">>> Success";

###
# The End.
