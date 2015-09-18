# smtp2http
SMTP to HTTP gateway

Usage
-----
Begin listening for incoming SMTP messages, parse them, and post them to the
specified HTTP endpoint.
```sh
smtp2http https://example.com/foo
```

### TLS Support
Enable TLS using separate certificate and key files with signing CA cert.
```sh
CERT=/etc/private/ssl/example.com.crt
KEY=/etc/private/ssl/example.com.key
CA=/etc/private/ssl/example.com-ca.crt
smtp2http -T$CERT:$KEY:$CA https://example.com/foo
```

Enable TLS using cert and key files only.
```sh
CERT=/etc/private/ssl/example.com.crt
KEY=/etc/private/ssh/example.com.key
smtp2http -T$CERT:$KEY https://example.com/foo
```

Enable TLS using single PFX combined cert file.
```sh
CERT=/etc/private/ssl/example.com.pfx
smtp2http -T$CERT https://example.com/foo
```

Install
-------
```sh
git clone git@github.com:Zingle/smtp2http.git
cd smtp2http
npm install -g
```

Development
-----------
The SMTP protocol does not provide any way to set thc TCP port used for
communication.  Because of this, development can be difficult if trying to
use public mail providers because you must have an internet facing server
listening on port 25.

You can run something like the following to set up a reverse tunnel using
a public server to which you have SSH access.

```sh
ssh -fNR 25:localhost:2025 root@example.com
SMTP_PORT=2025 smtp2http
```

In this example, `example.com` is the public server to which you have access,
`root` is a user with access to open low-numbered ports on that host, `25` is
the port this host will listen on (standard SMTP port), and `2025` is the port
`smtp2http` will listen on.
