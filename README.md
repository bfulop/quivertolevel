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
key: 'note:' + noteid, value: notedata -> to get a note contents by id
key: 'anotebook' + notebookid + ":" + timestamp + ":" + noteid, value: 'notebook title', -> to list the notes in a notebook
key: 'notebooks:' + timestamp of the latest note in the notebook + ":" + notebookid, value: 'notebookname' -> to list the notebooks (by date)
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

### To run

```
$ node src/run
```
