// initial demo code
var code_js =
`const VS_WALL = 1;
const VS_FREE = 0;
const VS_UP = 0, VS_RIGHT = 1, VS_DOWN = 2, VS_LEFT = 3;
const VS_NO_MOVE = -1;

class Robot {
    
    constructor()
    {
    }
    
    step(sensor_in, debug)
    {
      // up = 0, right = 1, down = 2, left = 3
      var dir = 0;
      while(1)
      {
        dir = Math.random()*4 | 0;
        if( sensor_in[dir] === 0 ) // can move here
          break;
      }
      return dir;
    }
}
`;

var code_python =
`import random
import sys

VS_WALL = 1
VS_FREE = 0

class Robot:
  def __init__(self):
    pass

  def step(self, sensor_in, debug):
    # up = 0, right = 1, down = 2, left = 3
    dir = 0
    while True:
      dir = random.randint(0, 3)
      if sensor_in[dir] == VS_FREE:
        break
    return dir;
`;

class PyRobot {
    constructor()
    {      
      pyodide.runPython(`pyrobot = Robot()`)
    }

    step(sensor_in, debug)
    {
      return pyodide.runPython('pyrobot.step([' + sensor_in + '], None)');
    }
}
