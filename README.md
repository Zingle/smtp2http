# smtp2http
SMTP to HTTP gateway

Usage
-----
Begin listening for incoming SMTP messages, parse them, and post them to the
specified HTTP endpoint.
```sh
smtp2http https://dev-services.zingle.me/inbound-communication/email
```

Enable TLS using separate certificate and key files with signing CA cert.
```sh
CERT=/etc/private/ssl/zingle.crt
KEY=/etc/private/ssl/zingle.key
CA=/etc/private/ssl/zingle-ca.crt
smtp2http -T$CERT:$KEY:$CA https://dev-services.zingle.me/foo
```

Install
-------
```sh
git clone git@github.com:Zingle/smtp2http.git
cd smtp2http
npm install -g
```
