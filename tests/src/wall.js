function defaultWallObject(username) {
  "use strict";
  return new Wall(username || 'abcde');
}

function filledWallObject(count, username){
  "use strict";
  var wall = defaultWallObject(username);
  for(var i = 0; i < count; i++){
    wall.add({
      duration: 10
    });
  }
  return wall;
}
QUnit.module( "Wall" );
QUnit.test("Create", function (assert) {
  "use strict";
  var username = 'abcde',
    wall = new Wall(username);
  assert.notEqual(wall, undefined, 'new Object not undefined');
  assert.strictEqual(wall.duration, 0, 'duration zero default');
  assert.strictEqual(wall.videoCount, 0, 'videoCount zero default');
  assert.strictEqual(wall.username, username, 'username set');
});

QUnit.test("Add", function (assert) {
  "use strict";
  var wall = defaultWallObject();
  wall.add({
    duration: 10
  });
  assert.strictEqual(wall.duration, 10, 'duration increased');
  assert.strictEqual(wall.videoCount, 1, 'videoCount increased');
});

QUnit.test("Add several", function (assert) {
  "use strict";
  var wall = defaultWallObject();
  wall.add({
    duration: 10
  });
  wall.add({
    duration: 10
  });
  assert.strictEqual(wall.duration, 20, 'duration increased');
  assert.strictEqual(wall.videoCount, 2, 'videoCount increased');
});

QUnit.test("Remove", function (assert) {
  "use strict";
  var wall = filledWallObject(1);
  wall.remove({
    duration: 10
  });
  assert.strictEqual(wall.duration, 0, 'video removed');
  assert.strictEqual(wall.videoCount, 0, 'videoCount decreased');
});

QUnit.test("Remove several", function (assert) {
  "use strict";
  var wall = filledWallObject(2);
  wall.remove({
    duration: 10
  });
  wall.remove({
    duration: 10
  });
  assert.strictEqual(wall.duration, 0, 'video removed');
  assert.strictEqual(wall.videoCount, 0, 'videoCount decreased');
});

QUnit.test("Format", function (assert) {
  "use strict";
  var wall = filledWallObject(2);
  assert.strictEqual(wall.format('{0} {1} {2}'), 'abcde 00:20 2', 'abcde 00:20 2');
});
