var Task = require('data.task')

// convert an either to a task
const eitherToTask = e => e.fold(Task.rejected, Task.of)

module.exports = {eitherToTask}
