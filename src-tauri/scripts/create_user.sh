#!/usr/bin/env bash
# creates a user for manifold to use
set -e

HOSTNAME="$1"
USERNAME="$2"
FOLDER="$3"

useradd -m -d "$FOLDER" -s /bin/bash -k /etc/skel "$USERNAME"
setfacl -R -m u:"$HOSTNAME":rwx "$FOLDER"
setfacl -d -m u:"$HOSTNAME":rwx "$FOLDER"
setfacl -R -m u:"$USERNAME":rwx "$FOLDER"
setfacl -d -m u:"$USERNAME":rwx "$FOLDER"