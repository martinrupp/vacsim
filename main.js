
var used_code = undefined; // this is the "compiled" to reset robot
var annotations = {} // empty annotations for now

// config
var mapID = "1"
map = stringToMap(getMapStr(mapID));
numToClean = getMapSize(mapID)

function onChangeMap()
{
  var mapID = document.getElementById("map").value;
  map = stringToMap(getMapStr(mapID));
  numToClean = getMapSize(mapID)
  reset();
  drawFirst(context, map);

}
var scale = 5
var timeStep = 10
var numTime = 0; // robot time

var code;
if( is_python )
  code = code_python
else
  code = code_js

// state
var cleaned_blocks = []
var robot;
var robot_pos = {x:1, y:1}
// UI state
let is_pause = true;
var mapDrawn = false;

class Position
{
  constructor(other) {
    this.x = other.x;
    this.y = other.y;
  }
  equals(other) {
    return this.x == other.x && this.y == other.y;
  }
  
}


function resetMap(){
  numTime = 0;
  robot_pos = {x:1, y:1};
  cleaned_blocks = [];
  mapDrawn = false;
  lastpos = undefined;
  draw(context);
  setInfo("(resetted)")
}
function reset(){
  resetMap();
  if(used_code !== undefined)
  {
    // might still fail, check for errors.
    try {
      eval( used_code );
      if( is_python )
        robot = new PyRobot();
      else
        robot = create();
    } catch(error) {
      process_error(error)
      return false;
    }
  }
}

function setInfo(str)
{
  document.querySelector('#info').innerText = str;
}

function setCodeInfo(str)
{
  document.querySelector('#codeinfo').innerText = str;
}

// called when code is changed in text editor
function codeChanged(str)
{
  if( code === str )
    return;
  code = str;
  setCodeInfo('code changed. click "recompile" to compile your code')
  document.querySelector('#compile').innerText = 'recompile';
}

function process_error(error)
{
  var s = error.stack;
  if( is_python )
  {
    var start = s.search('File "<unknown')
    if(start == -1)
      start = Math.max(0, s.search('File "<exec'))
    var stop = s.search("at _hiwire_throw_error")
    if(stop == -1) stop = s.length
    s = s.substr(start, stop-start)
  }
  else
  {
    var start = 0;
    var stop = s.search("at create \\(my_robot_script")
    if(stop == -1) stop = s.length
    s = s.substr(start, stop-start)
  }
  s = "can't run because you have errors:\n\n" + s
  console.log(s)
  alert(s);
}

// try to compile the code
function compile()
{
  resetMap();
  // check for error annotations form the editor
  annotations = editor.getSession().getAnnotations();

  hasError = false;
  text = "";
  annotations.forEach( p => 
    {
      if( p.type === "error" )
        hasError = true;
      text = text + "-- line " + p.row + ": " + p.text + "\n";
    });

  if( hasError )
  {
    alert("can't run because you have syntax errors:\n" + text)
    return false;
  }

  // check if we should validate code
  // maybe check https://github.com/AlexNisnevich/untrusted/blob/a6ed68657afdb1b8ca47d601ffb425b2c84dd4f6/scripts/validate.js 
  // might still fail, check for errors.
  try {
    if( is_python )
    {
      pyodide.runPython(code);
      robot = new PyRobot();
      used_code = code;
    }
    else
    {
      annotated_code = code + `
//-----------------------------------------
// auto generated code. do not modify
function create()
{
    return new Robot();
}
//# sourceURL=my_robot_script.js
`
       eval( annotated_code );
       robot = create();
       used_code = annotated_code;
    }

  } catch(error) {
    process_error(error)
    return false;
  }  
  setCodeInfo('code compiled!');
  return true;
}

var lastpos;

function draw(ctx)
{  
  {
    var text ="";
    if( cleaned_blocks.length == numToClean ) 
      text = "FINISHED!"
    var text = text + " cleaned " + cleaned_blocks.length + "/" + numToClean
      + " (" + Math.round((cleaned_blocks.length*100)/numToClean) + "%), time = " + numTime;
    setInfo(text)

    if( cleaned_blocks.length == numToClean )
    {
      run(); // set pause
      return;
    }
  }
  if( !mapDrawn )
  {
    mapDrawn = true;
    drawFirst(ctx, map);
  }
  //cleaned_blocks.forEach( p => { drawBlock( p.x, p.y, 'L') })
  if(lastpos !== undefined )
  {
    if(lastpos.x == robot_pos.x && lastpos.y == robot_pos.y) return;
    drawBlock( ctx, lastpos.x, lastpos.y, 'L');        
  }

  drawBlock( ctx, robot_pos.x, robot_pos.y, 'S')
  if( cleaned_blocks.find( el => el.equals(robot_pos) ) === undefined )
  {
    cleaned_blocks.push( new Position(robot_pos) );
  }
  else
  {
    //console.log("same pos " + robot_pos)
  }
  lastpos = new Position(robot_pos);
}

var deltaTimeMS = 0;
var lastTimeMS = 0;
function update(timeMS = 0) {
  if(is_pause) return;
  
  deltaTimeMS = timeMS - lastTimeMS;
  
  if( deltaTimeMS > timeStep )
  {
    try {
      numTime = numTime+1;
      move(robot, map, robot_pos);
    } catch(error) {
      process_error(error)
      run(); // pause
      return;
    }  
    
    lastTimeMS = timeMS;
  }
  draw(context);
  requestAnimationFrame(update);
}

function run()
{
  if(is_pause)
  {
    if( !robot )
    {
      if(compile() == false)
        return;
    }
    is_pause = false;
    document.querySelector('#run').innerText = '⏸️'; 
    update();
  }
  else
  {
    is_pause = true;
    document.querySelector('#run').innerText = '▶️';
  }
}

createLayout(code);
