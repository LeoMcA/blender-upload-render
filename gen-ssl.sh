#!/bin/sh -x
mkdir ssl
openssl genrsa -out ssl/key.pem
openssl req -new -key ssl/key.pem -out ssl/csr.pem -subj "/CN=example.com"
openssl x509 -req -days 9999 -in ssl/csr.pem -signkey ssl/key.pem -out ssl/cert.pem
rm ssl/csr.pem
