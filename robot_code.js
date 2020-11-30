// initial demo code
var code =
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