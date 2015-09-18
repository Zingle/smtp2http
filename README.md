# smtp2http
SMTP to HTTP gateway

Usage
-----
```sh
Usage: smtp2http [-v|--verbose] [-s|--silent|-q|--quiet]
    [-T|--tls=<tls_opt>] [[-H|--header=<header>], ...] ENDPOINT

 -H --header=<header>   HTTP header to send with requests
 -q --quiet             Do not log to STDERR
 -s --silent            Alias for --quiet
 -T --tls=<tls_opt>     colon-delimited list of cert files
                        q.v. TLS Option below
 -v --verbose           Log information to STDOUT

TLS Option
The --tls option accepts a colon-delimited list of certificate file.
You can specify a single combined PFX file, a cert file followed by a
key file, or a cert file followed by a key file followed by a signing
authority certificate.
```


Examples
--------
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
The SMTP protocol does not provide any way to set the TCP port used for
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

Appendix - Generating a PFX cert
--------------------------------
If you have a typical PEM cert with separate key and cert files, you may wish
to generate a PFX cert which is simple to specify.

```sh
openssl pkcs12 -export \
    -out example.com.pfx \
    -in example.com.crt -inkey example.com.key \
    -certfile example.com-ca.crt
```
