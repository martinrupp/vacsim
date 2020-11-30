const VS_WALL = 1;
const VS_FREE = 0;
const VS_UP = 0, VS_RIGHT = 1, VS_DOWN = 2, VS_LEFT = 3;
const VS_NO_MOVE = -1;
// return element of the map at position x, y
// if outside bounds, return 1 (WALL)
function get_map(m, pos)
{
	if(pos.y < 0 || pos.y > m.length) return VS_WALL;
	if(pos.x < 0 || pos.x > m[pos.y].length) return VS_WALL;
	else return m[pos.y][pos.x];
}

// get the sensor reading for all N,E,S,W directions. 0 = free, 1 = wall
function get_sensor_reading(m, pos)
{
	var sensor_in = []
	for(var direction=0; direction<4; direction++) {
		sensor_in[direction] = get_map(m, get_pos(direction, pos) )
	}
	return sensor_in;
}

function get_pos(direction, pos)
{
	if(direction == VS_UP) return {x:pos.x, y:pos.y-1};
	if(direction == VS_RIGHT) return {x:pos.x+1, y:pos.y};
	if(direction == VS_DOWN) return {x:pos.x, y:pos.y+1};
	if(direction == VS_LEFT) return {x:pos.x-1, y:pos.y};
}

// move the robot one step by calling the robot.step function
function move(robot, m, pos)
{
	var sensor_in = get_sensor_reading(m, pos);
	var dir = robot.step(sensor_in, {})
	if( dir == -1) // robot doesn't want to move
		return;

	if( sensor_in[dir] == 1 ) console.log("can't go there!");
	else
	{
		robot_pos = get_pos(dir, pos);
	}
}

// read a map as string, return a 2-dimenstional array of the map where
// 0 is free, 1 is wall. in string, # is wall, space is free
function stringToMap(str)
{
	var s = str.split('\n');
	// get longest line
	var longest = s.reduce( (acc, item) => {
		             	return Math.max(acc, item.lastIndexOf('#')); }, 0 );
	matrix = []
	for( var i = 0; i < s.length; i++ )
	{
		if( s[i].length == 0 ) continue;
		var p = new Array(longest).fill(VS_FREE)
		for( var j = 0; j < s[i].length; j++ )
		{
			var c = s[i].charAt(j);
			if( c == '#')
				p[j] = VS_WALL;
		}
		matrix.push(p);
	}
	return matrix;
}

function drawBlock(ctx, x, y, value)
{
	const colors = { I:'cyan', O:'yellow', T:'purple', S:'green', Z:'red', J:'blue', L:'orange'};
	ctx.fillStyle = colors[value];
	ctx.fillRect( x*scale, y*scale, scale, scale);
	ctx.beginPath()
	ctx.rect( x*scale, y*scale, scale, scale);
	ctx.stroke();
}

function drawFirst(ctx, map)
{
	ctx.fillStyle = 'grey'
	ctx.fillRect(0, 0, 400, 400)

	for( var y = 0 ; y < map.length; y++ )
	{
		for( var x = 0 ; x < map[y].length; x++ )
		{
			if( map[y][x] == VS_WALL)
				drawBlock( ctx, x, y, 'Z')
		}
	}
}

// count the number of to clean squares starting from pos startpos
function count(map, startpos)
{
  var tovisit = [{x:startpos.x, y:startpos.y}];
  var visited = [{x:startpos.x, y:startpos.y}]
  while(tovisit.length > 0)
  {
    el = tovisit.pop();
    for( var i=0; i<4; i++) {
      var newpos = get_pos(i, el);
      if( get_map(map, newpos) == VS_WALL ) continue;
      if( visited.find( p => p.x == newpos.x && p.y == newpos.y) === undefined )
      {        
        visited.push( {x:newpos.x, y:newpos.y} );
        tovisit.push( {x:newpos.x, y:newpos.y} );
      }
    }
  }
  return visited.length
}
