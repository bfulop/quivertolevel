# Quiver to LevelDB

A library to export your Quiver notes to a LevelDB database

Needs a `config.json` file to get the path to your Quiver library.

```json
{
  "quiverpath": "/Users/[path to]/Quiver.qvlibrary"
}
```

The format of the LevelDB records is the following:

```
key: 'anote:' + noteid, value: notedata -> to get a note contents by id
key: 'notes:' + timestamp + ":" + noteid, value: {title: 'note title'} -> list all the notes
key: 'anotebook' + notebookid + ":" + timestamp + ":" + noteid, value: {title: 'note title'}, -> to list the notes in a notebook
key: 'notebooks:' + timestamp of the latest note in the notebook + ":" + notebookid, value: {name: 'notebook name', uuid: 'notebookid'} -> to list the notebooks (by date)
```
The note contents will be (see `processNote.js`):

```
{
  nbook: [meta.json] // of the folder
  note: {
    meta: [meta.json],
    content: [content.json]
  }
}
```

### More config options

The `config.json` file has more options to process the notes and notebooks when importing.

```json
  "titlereplacements": [
    {
      "from": "foo",
      "to": "bar"
    },
    {
      "from": "baz",
      "to": "pants"
    }
  ]
```

These will replace texts in the notebooks titles.


### To run

```shell
$ node src/run
```
