#!/bin/bash
# MyHome Controller installation

echo "Starting MyHome Controller"

cd /opt/myhomecontroller
node index.js > controller-console-log.txt
