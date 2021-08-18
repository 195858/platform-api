# Simple Docker Compose Template

Sets up all  components of the API-Management Connector using docker-compose:

* Connector Services
* Database Backend - Mongodb
* Sample/Demo Portal Application

This folder contains 
* a docker-compose file, 
* a sample .env that you can adjust to your environment
* a dummy key for JWT verification
* a sample ufile user registry

## Files on Host Systems

Some configuration files and data directories are mounted from the host system:

* MongoDB Data Folder - please identify a suitable location in your local file system, configured via the variable `MONGODB_DATA_MOUNT_PATH`
* APIM Connector - please identify a suitable location for configuration files, configured via the variable `PLATFORM_DATA_MOUNT_PATH`

For information on how to set these environment variables please see below.


## Preparing the APIM Connector Configuration Files

The Connector requires access to two configuration files:
* Key file used for JWT verification: this MUST be provided even if only using Basic Auth. A ``dummy.pem` file is provided.
* A file user registry in JSON format, a sample called `organization_users.json` is provided. 

Both of these files must be copied into the directory you intend to mount into the APIM Connector container (environment variable `PLATFORM_DATA_MOUNT_PATH`)

## Configuring the file user registry

At a minimum please adjust the passwords in the `organization_users.json`. It contains examples of entries for a connector admin (platform-admin) and an organization admin (org-admin).
Users can have one or both roles.

Take note of both a user/password with `platform-admin` and `org-admin` role as you need these to configure the credentials the sample portal uses to connect.

You can add users to the array of users in the `organization_users.json`. It contains an example:

```json
	"example": {
    "password": "changeme",
    "roles": [
      "org-admin"
    ]
  }

```

The user registry is reloaded periodically so you can add more users as required.

## Configuring the Environment Variables

The `.env` file contains an example configuration of environment variables.

Environment variables are documented in the file.

You can duplicate this file and adjust it for your environment.

## Running docker-compose

By default docker-compose picks up the `.env` file. Alternatively you can point docker-compose to the env file you want to use (e.g. if you cloned the original file and made your adjustments in the copy)

Here's an exmaple command using a custom `env.local` environment file.
 
```shell
docker-compose -f docker.compose.yml --env-file ./env.local up -d
```