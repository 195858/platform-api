#!/usr/bin/env bash
scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

############################################################################################################################
# Environment Variables

  if [ -z "$APIM_INTEGRATION_TEST_LOG_DIR" ]; then echo ">>> ERROR: - $scriptName - missing env var: APIM_INTEGRATION_TEST_LOG_DIR"; exit 1; fi

############################################################################################################################
# Run

IS_BACKGROUND=$1
MY_LOG_DIR="$APIM_INTEGRATION_TEST_LOG_DIR/test-integration"; rm -rf $MY_LOG_DIR/*.out
runScript="npm run test:integration"

echo ">>> Starting integration tests ..."
  if [ -z "$IS_BACKGROUND" ]; then
    $runScript
  else
    logFile="$MY_LOG_DIR/$scriptName.out"; mkdir -p "$(dirname "$logFile")";
    $runScript > $logFile 2>&1
  fi
  code=$?;
  if [[ $code != 0 ]]; then echo " >>> ERROR - code=$code - runScript='$runScript' - $scriptName"; exit 1;
  else
    echo ">>> Success";
  fi

###
# The End.
