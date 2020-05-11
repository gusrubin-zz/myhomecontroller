#!/bin/bash
# MyHome Controller installation

echo "Installing MyHome Controller"

tar -zcpvf /tmp/myhomecontroller-1.0.tgz *
mkdir /opt/myhomecontroller
tar -zxpvf /tmp/myhomecontroller-1.0.tgz --directory=/opt/myhomecontroller

touch /opt/myhomecontroller/states.json

cp /opt/myhomecontroller/service/myhomecontroller.service /etc/systemd/system
systemctl daemon-reload
systemctl enable myhomecontroller.service

echo "Install done."
