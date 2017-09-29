global.td = require('testdouble')
global.expect = require('chai').expect
global.insp = f => (f && f.inspect ? f.inspect() : f)