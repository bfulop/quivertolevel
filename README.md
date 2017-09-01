# Quiver to MongoDB

A library to export your Quiver notes to a MongoDB database

Needs a `config.json` file to get the path to your Quiver library and connection details to the MongoDB server.

```json
{
  "quiverpath": "/Users/[path to]/Quiver.qvlibrary",
  "mongodb": {
    "user": "example-user",
    "password": "password",
    "authMechanism": "DEFAULT",
    "url": "[ip of MongoDB server]"
  }
}
```