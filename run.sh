#!/bin/bash
gcp_key_fn=gcp_key.json
if [ ! -f "$gcp_key_fn" ]; then
  echo "Writing key to file."
  echo "$GCP_KEY" > $gcp_key_fn
fi
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
  export GOOGLE_APPLICATION_CREDENTIALS=`realpath $gcp_key_fn`
fi
node app.js