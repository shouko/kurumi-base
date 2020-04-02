# Kurumi-Base

Kurumi Base is an API server managing particular types of multimedia resources and its metadata.

## Requirements

 - Node 12.x
 - MongoDB

## Getting Started

 - Install dependencies
```bash
$ yarn install
```
 - Setup config variables
```bash
$ cp example.env .env
$ vim .env
```
 - Setup GCP credentials (for object storage)
```bash
$ echo '{"type": "service_account",  .....}' > gcp_key.json
```
  - Run
```bash
$ yarn start
```

## License
MIT License