QUnit.module("Wallcounter");

QUnit.test("New object", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  assert.notEqual(wallcounter, undefined, 'new Object not undefined');
});

QUnit.test("Plugin set", function (assert) {
  "use strict";
  assert.strictEqual(window.plugins.wallcounter instanceof Wallcounter, true, 'window.plugins.wallcounter instanceof Wallcounter');
});

QUnit.test("ResetVariables", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.ownCounter = {};
  wallcounter.counter = {
    foo: 'bar'
  };
  wallcounter.resetVariables();
  assert.strictEqual(wallcounter.ownCounter, undefined, 'ownCounter reset');
  assert.strictEqual(wallcounter.counter.foo, undefined, 'counter reset');
});

QUnit.test("Key", function (assert) {
  "use strict";
  assert.strictEqual(window.plugins.wallcounter.key('ABC'), 'abc', 'Key to lower case');
});

QUnit.test("Increase", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.counter = {
    'abcde': defaultWallObject()
  };
  wallcounter.increase('abcde', {duration: 10});
  assert.strictEqual(wallcounter.counter.abcde.duration, 10, 'Duration incrased');
  assert.strictEqual(wallcounter.counter.abcde.videoCount, 1, 'VideoCount incrased');
});

QUnit.test("Increase key test", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.counter = {
    'abcde': defaultWallObject()
  };
  wallcounter.increase('ABCDE', {duration: 10});
  assert.strictEqual(wallcounter.counter.abcde.duration, 10, 'Duration incrased');
  assert.strictEqual(wallcounter.counter.abcde.videoCount, 1, 'VideoCount incrased');
});

QUnit.test("Decrease", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.counter = {
    'abcde': filledWallObject(1)
  };
  wallcounter.decrease('abcde', {duration: 10});
  assert.strictEqual(wallcounter.counter.abcde.duration, 0, 'Duration decreased');
  assert.strictEqual(wallcounter.counter.abcde.videoCount, 0, 'VideoCount decreased');
});

QUnit.test("Decrease key test", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.counter = {
    'abcde': filledWallObject(1)
  };
  wallcounter.decrease('ABCDE', {duration: 10});
  assert.strictEqual(wallcounter.counter.abcde.duration, 0, 'Duration decreased');
  assert.strictEqual(wallcounter.counter.abcde.videoCount, 0, 'VideoCount decreased');
});

QUnit.test("Create", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.create('abcde');
  assert.strictEqual(wallcounter.counter.abcde instanceof Wall, true, 'New Wall created');
});

QUnit.test("Create key test", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.create('ABCDE');
  assert.strictEqual(wallcounter.counter.abcde instanceof Wall, true, 'New Wall created');
});

QUnit.test("CreateIfNotExists", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.createIfNotExists('abcde');
  wallcounter.createIfNotExists('ABCDE');
  assert.strictEqual(wallcounter.counter.abcde.username, 'abcde', 'Wall not overwritten');
});

QUnit.test("CreateIfNotExists key test", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.createIfNotExists('ABCDE');
  wallcounter.createIfNotExists('abcde');
  assert.strictEqual(wallcounter.counter.abcde.username, 'ABCDE', 'Wall not overwritten');
});

QUnit.test("Create display", function (assert) {
  "use strict";
  window.plugins.wallcounter.preConnect();
  assert.strictEqual($('.playlist-stats')[0].innerHTML,'<div id="playlist_wallcounter">Wallcounter[00:00 - 0]</div>', 'Display created');
});

QUnit.test("Update display", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();

  wallcounter.ownCounter = filledWallObject(1);
  wallcounter.updateOwnDisplay();
  assert.strictEqual($('#playlist_wallcounter').text(), 'Wallcounter[00:10 - 1]', 'Div updated');
});

QUnit.test("GetWallsForUsernames", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.counter = {
    'foo': filledWallObject(1, 'foo'),
    'bar': filledWallObject(1, 'bar'),
    'baz': filledWallObject(1, 'baz')
  };
  var walls = wallcounter.getWallsForUsernames(['foo', 'baz']);
  assert.strictEqual(walls.length, 2, "Two element returned");
  assert.strictEqual(walls[0].username, 'foo', "First element equal");
  assert.strictEqual(walls[1].username, 'baz', "Second element equal");
});

QUnit.test("GetWallsForUsernames key test", function (assert) {
  "use strict";
  var wallcounter = new Wallcounter();
  wallcounter.counter = {
    'foo': filledWallObject(1, 'foo')
  };
  var walls = wallcounter.getWallsForUsernames(['FOO']);
  assert.strictEqual(walls[0].username, 'foo', "lowercase key");
});
