#!/bin/bash
# MyHome Controller deployer

echo "Deploy last version of MyHome Controller"

tar -zcpvf /tmp/myhome-1.0.tgz *
tar -zxpvf /tmp/myhome-1.0.tgz --directory=/opt

echo "Deploy done."