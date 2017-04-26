#!/bin/bash
# MyHome Controller installation

echo "Installing MyHome Controller"

tar -zcpvf /tmp/myhome-1.0.tgz *
tar -zxpvf /tmp/myhome-1.0.tgz --directory=/opt

cp service/myhome.service /etc/systemd/system
systemctl daemon-reload
systemctl enable myhome.service

echo "Install done."
