QUnit.module('Wallcounter');

QUnit.test('New object', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  assert.notEqual(wallcounter, undefined, 'new Object not undefined');
});

QUnit.test('Plugin set', function (assert) {
  'use strict';
  assert.strictEqual(window.plugins.wallcounter instanceof Wallcounter,
    true, 'window.plugins.wallcounter instanceof Wallcounter');
});

QUnit.test('ResetVariables', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.userWall = {};
  wallcounter.walls = {
    foo: 'bar'
  };
  wallcounter.resetVariables();
  assert.strictEqual(wallcounter.userWall, undefined, 'userWall reset');
  assert.strictEqual(wallcounter.walls.foo, undefined, 'counter reset');
});

QUnit.test('Key', function (assert) {
  'use strict';
  assert.strictEqual(window.plugins.wallcounter.key('ABC'), 'abc',
    'Key to lower case');
});

QUnit.test('Increase', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.walls = {
    'abcde': defaultWallObject()
  };
  wallcounter.increase('abcde', {
    duration: 10
  });
  assert.strictEqual(wallcounter.walls.abcde.duration, 10,
    'Duration incrased');
  assert.strictEqual(wallcounter.walls.abcde.videoCount, 1,
    'VideoCount incrased');
});

QUnit.test('Increase key test', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.walls = {
    'abcde': defaultWallObject()
  };
  wallcounter.increase('ABCDE', {
    duration: 10
  });
  assert.strictEqual(wallcounter.walls.abcde.duration, 10,
    'Duration incrased');
  assert.strictEqual(wallcounter.walls.abcde.videoCount, 1,
    'VideoCount incrased');
});

QUnit.test('Decrease', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.walls = {
    'abcde': filledWallObject(1)
  };
  wallcounter.decrease('abcde', {
    duration: 10
  });
  assert.strictEqual(wallcounter.walls.abcde.duration, 0,
    'Duration decreased');
  assert.strictEqual(wallcounter.walls.abcde.videoCount, 0,
    'VideoCount decreased');
});

QUnit.test('Decrease key test', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.walls = {
    'abcde': filledWallObject(1)
  };
  wallcounter.decrease('ABCDE', {
    duration: 10
  });
  assert.strictEqual(wallcounter.walls.abcde.duration, 0,
    'Duration decreased');
  assert.strictEqual(wallcounter.walls.abcde.videoCount, 0,
    'VideoCount decreased');
});

QUnit.test('Create', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.create('abcde');
  assert.strictEqual(wallcounter.walls.abcde instanceof Wall, true,
    'New Wall created');
});

QUnit.test('Create key test', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.create('ABCDE');
  assert.strictEqual(wallcounter.walls.abcde instanceof Wall, true,
    'New Wall created');
});

QUnit.test('CreateIfNotExists', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.createIfNotExists('abcde');
  wallcounter.createIfNotExists('ABCDE');
  assert.strictEqual(wallcounter.walls.abcde.username, 'abcde',
    'Wall not overwritten');
});

QUnit.test('CreateIfNotExists key test', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.createIfNotExists('ABCDE');
  wallcounter.createIfNotExists('abcde');
  assert.strictEqual(wallcounter.walls.abcde.username, 'ABCDE',
    'Wall not overwritten');
});

QUnit.test('Create display', function (assert) {
  'use strict';
  window.plugins.wallcounter.preConnect();
  assert.strictEqual($('.playlist-stats')[0].innerHTML,
    '<div id="playlist_wallcounter">Wallcounter[00:00 - 0]</div>',
    'Display created');
});

QUnit.test('Update display', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();

  wallcounter.userWall = filledWallObject(1);
  wallcounter.updateOwnDisplay();
  assert.strictEqual($('#playlist_wallcounter').text(),
    'Wallcounter[00:10 - 1]', 'Div updated');
});

QUnit.test('GetWallsForUsernames', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.walls = {
    'foo': filledWallObject(1, 'foo'),
    'bar': filledWallObject(1, 'bar'),
    'baz': filledWallObject(1, 'baz')
  };
  var walls = wallcounter.getWallsForUsernames(['foo', 'baz']);
  assert.strictEqual(walls.length, 2, 'Two element returned');
  assert.strictEqual(walls[0].username, 'foo', 'First element equal');
  assert.strictEqual(walls[1].username, 'baz', 'Second element equal');
});

QUnit.test('GetWallsForUsernames key test', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.walls = {
    'foo': filledWallObject(1, 'foo')
  };
  var walls = wallcounter.getWallsForUsernames(['FOO']);
  assert.strictEqual(walls[0].username, 'foo', 'lowercase key');
});

QUnit.test('Init own counter', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  window.thisUser = function () {
    return {
      username: 'abcde'
    };
  };
  wallcounter.initUserWall();
  assert.strictEqual(wallcounter.userWall, wallcounter.walls.abcde,
    'OwnCounter is in the counter object');
});

QUnit.test('Init own counter key test', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  window.thisUser = function () {
    return {
      username: 'ABCDE'
    };
  };
  wallcounter.initUserWall();
  assert.strictEqual(wallcounter.userWall, wallcounter.walls.abcde,
    'To lower case key');
});

QUnit.test('IsAddVideoMessage', function (assert) {
  'use strict';
  assert.strictEqual(window.plugins.wallcounter.isAddVideoMessage({
    username: 'abcde'
  }, 'Video added successfully.'), false, 'is normal message');
  assert.strictEqual(window.plugins.wallcounter.isAddVideoMessage({
    username: ''
  }, 'Video added successfully.'), true, 'is add video message');
});

QUnit.test('GetAddVideoMessage', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  wallcounter.userWall = filledWallObject(1);

  assert.strictEqual(wallcounter.getAddVideoMessage(),
    'Video added successfully [00:10 - 1]', 'get message');
});

QUnit.test('WriteAddVideoMessage', function (assert) {
  'use strict';
  var wallcounter = new Wallcounter();
  var message = '';
  window.addSystemMessage = function (m) {
    message = m;
  };

  wallcounter.userWall = filledWallObject(1);
  wallcounter.writeAddVideoMessage({
    username: ''
  }, 'Video added successfully.');

  assert.strictEqual(message, wallcounter.getAddVideoMessage(),
    'Write message');
});

QUnit.test('HideLastMessage', function (assert) {
  'use strict';
  window.plugins.wallcounter.hideLastMessage();
  assert.strictEqual($('#first_message').attr('style'), undefined,
    'First Message is not hidden');
  assert.strictEqual($('#second_message').attr('style').trim(),
    'display: none;', 'Last Message is hidden');
});

QUnit.test('Format output', function (assert) {
  'use strict';
  var walls = [];
  assert.strictEqual(window.plugins.wallcounter.formatOutput(walls),
    'Wallcounter<br>', 'Empty array');

  walls.push(filledWallObject(1, 'foo'));
  assert.strictEqual(window.plugins.wallcounter.formatOutput(walls),
    'Wallcounter<br>foo[<b>00:10</b> - 1]', '1 parameter');

  walls.push(filledWallObject(2, 'bar'));
  assert.strictEqual(window.plugins.wallcounter.formatOutput(walls),
    'Wallcounter<br>foo[<b>00:10</b> - 1] - bar[<b>00:20</b> - 2]',
    '2 parameters');

  walls.push(filledWallObject(3, 'baz'));
  assert.strictEqual(window.plugins.wallcounter.formatOutput(walls),
    'Wallcounter<br>foo[<b>00:10</b> - 1] - bar\
[<b>00:20</b> - 2]<br>baz[<b>00:30</b> - 3]',
    '3 parameters');
});

QUnit.test('Postfix for index', function (assert) {
  'use strict';
  assert.strictEqual(window.plugins.wallcounter.postfixForIndex(9, 10), '',
    'Last element');
  assert.strictEqual(window.plugins.wallcounter.postfixForIndex(0, 10),
    ' - ', 'Even element');
  assert.strictEqual(window.plugins.wallcounter.postfixForIndex(1, 10),
    '<br>', 'Odd element');
});
