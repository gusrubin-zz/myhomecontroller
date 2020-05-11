#!/bin/bash
# MyHome Controller deployer

echo "Deploy last version of MyHome Controller"

rm -rf /opt/myhomecontroller
mkdir /opt/myhomecontroller
tar -zcpvf /tmp/myhomecontroller-1.0.tgz *
tar -zxpvf /tmp/myhomecontroller-1.0.tgz --directory=/opt/myhomecontroller

echo "Deploy done."
