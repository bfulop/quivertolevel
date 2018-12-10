const createkey = ndata =>
  Object.assign(
    {
      anotekey: `anote:${ndata.note.meta.uuid}`
    },
    {
      noteskey: `notes:${ndata.note.meta.created_at}:${ndata.note.meta.uuid}`
    },
    {
      anotebookkey: `anotebook:${ndata.nbook.uuid}:${
        ndata.note.meta.created_at
      }:${ndata.note.meta.uuid}`
    },
    {
      notebookkey: `notebooks:${ndata.note.meta.updated_at}:${ndata.nbook.uuid}`
    },
    { value: ndata }
  )

module.exports = createkey
