#!/bin/bash
# MyHome Controller deployer

echo "Deploy last version of MyHome Controller"

rm -rf /opt/myhome
mkdir /opt/myhome
tar -zcpvf /tmp/myhome-1.0.tgz *
tar -zxpvf /tmp/myhome-1.0.tgz --directory=/opt/myhome

echo "Deploy done."