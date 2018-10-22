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
key: notebookid + ":" + timestamp + ":" + noteid, value: 0, -> to list the notes in a notebook
key: 'notebook:' + timestamp of the latest note in the notebook + ":" + notebookid -> to list the notebooks (by date)
```

### To run

```
$ node src/run
```
