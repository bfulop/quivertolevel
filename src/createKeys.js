const createkey = ndata => 
  Object.assign(
    {
      key: `${ndata.nbook.uuid}:${ndata.note.meta.created_at}:${ndata.note.meta
        .uuid}`
    },
    { value: ndata }
  )

module.exports = createkey
