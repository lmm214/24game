var game_type1  = "点击 开始";

var canvasID      = "canvasID";
var canvas_ele;
var canvas_cts;
var game_type_txt = "game_type";
var mainbodyID    = "page_body";
var status1       = 0;  // 0 : init screen 1: in game 3: quit or not, 4: showing solution
var width,  		height ;
var percent_w_init = 0.4, percent_h_init  = 0.4;
var xywh_init ,  xywh_init1;
var solved = 0, unsolved = 1362, totalQ = 1362;
var this_quad;
var time_now = 0, time_left = 0, time_tick = 0, game_tick = 0;  // time_tick is .01 second
var pause_tick = 0, pause_total = 400, pause_total1;
var coffee_tick = 0, coffee_total = 60001, coffee_num = 100, coffee_waiting = 0; 
var now, before;
var score_all = 0;  // the score 
var game_type = -1;
var id_array = new Array();
var time_array = new Array();
var show_sol = 1;

var quad, quad_c, quad_pos;  // the four numbers now and their positions
var quad_all, quad_prev, quad_all_prev;
var op_array = new Array('+', '-', '\u00D7', '\u00F7');
var op_focus, num_focus;
var past_steps, future_steps;
var this_order;

var num_rect, op_rect;
var rect_clock, rect_solved, rect_unsolved, rect_score;
var rect_quit, rect_skip, rect_undo, rect_redo;
var rect_all, rect_QUIT_array; // rect_all is for game,  rect_QUIT_array is for quitting
var rect_sol, rect_no_sol;
var ep = 0.000001;


function arraytostring(array1){
	var str1 = " ";
	for (ii = 0; ii < array1.length; ii ++)
	{
		str1 =  str1 + " " + array1[ii];
	}
	return str1;
}


function gameover(){// quit or finished all
	document.getElementById("gamesub").game_type.value = game_type;
	document.getElementById("gamesub").time_now.value =  time_now;
	document.getElementById("gamesub").solved.value =  solved;
	document.getElementById("gamesub").unsolved.value =  unsolved;
	document.getElementById("gamesub").score_all.value =  Math.round(score_all);
	document.getElementById("gamesub").id_array.value = arraytostring(id_array);
	document.getElementById("gamesub").time_array.value =  arraytostring(time_array);
	document.getElementById("gamesub").submit();
}

function new_quad(){
//	this_order[this_quad * 0 ] = 0;
	var this_game = this_order[this_quad];  // first, grab the index of the game where  this_quad is (0,1,....) linearly
	quad_all = grab_quad_sol(this_game); 
	var quad1 = quad_all[0].split(",");
	quad = new Array();
	quad_c = new Array();
	for (ii = 3; ii >= 0; ii--) {
		thisone = Math.floor(Math.random()* (ii+1) );
		quad.push( Number(quad1[thisone]));
		quad_c.push( Number(quad1[thisone]));
		quad1.splice(thisone, 1);
	}
	time_tick = 0;
	quad_pos = new Array(0,1,2,3);
	op_focus = -1; // nothing on focus
	num_focus = -1; // nothing on focus
	past_steps = new Array();  //  no past yet
	future_steps = new Array(); // no future yet
}

function solved1(solvedone){ // just solved one quad, move on to the next one
	id_array.push(this_order[this_quad]); // save the quad
	this_quad++;
	quad_all_prev = quad_all; quad_prev = quad_c;  
	var a = quad_all_prev[1].split(" ");  
	pause_total1 = pause_total + a.length * 100;

	if (solvedone){
		solved ++;
		time_array.push(time_tick);
		//score_all += 10 * ( 1 + 2 / a.length);
	}
	else {time_array.push(-time_tick);}
	unsolved --;
	if (show_sol == 1)
	{	pause_tick =0; status1 = 4; // showing solutions
	}
	if (unsolved >0){ new_quad();  }
	else{ 
		status1 = 6;// game over 
		gameover();
		}
	if (unsolved >0 && solvedone && solved%coffee_num ==0){
		if (show_sol ==0)
		{	coffee_tick = 0;status1 = 5;}
		else{ coffee_tick = 0;coffee_waiting = 1;}
	}
	game_draw(0);
}

function calc(num1, op1, num2){	// caucluate num1 (op1) num2
	var num3 = 0.0;
	switch(op1){
		case 0: num3= num1 + num2; break;
		case 1: num3= num1 - num2;break;			 
		case 2: num3= num1 * num2;break;
		case 3: num3= num1 / num2;break;
	}
	if (Math.abs(num3 - Math.round (num3)) < ep) // num1 is integer
		return (Math.round(num3));
	else return (num3);
}

function game_order(){ // pick up the order of games
	var TOTAL_GAME = 1362;
	var final_order = new Array();
	var listall = new Array();
	for (ii = 0; ii < TOTAL_GAME; ii++){
		listall.push(ii);
	}
	var thisone; 
	for (ii = TOTAL_GAME -1; ii >=0; ii--){
		thisone = Math.floor(Math.random()* (ii + 1) );
		final_order.push(listall[thisone]);
		listall.splice(thisone, 1);
	}
	return final_order;
} 
function grab_quad_sol(this_id){
	var res = new Array();
	var pos = the_location[this_id];
	var ii = pos;
	while(the_string[ii] != "[") {ii--;}
	ii ++;
	res.push(the_string.substring(ii, pos));
	var jj = pos;
	while(the_string[jj] != "[") {jj++;}
	res.push(the_string.substring(pos + 2, jj-1));
	return res;
}


function ongame(regionID){
	if (regionID == -1) {return; } // clicked outside of the region
	if (regionID <4) { // click on one of the numbers
		var numrect_id = -1;
		var numfocus_id ;
		for (ii = 0; ii < quad.length; ii ++){
			if (regionID == quad_pos[ii]){ numrect_id = ii; }
			if (num_focus == quad_pos[ii]) {numfocus_id = ii;}
		}
		if (numrect_id < 0  || num_focus == regionID ){ return; }  // the region is gone already, or clicking on the already focused num
		else{
			if (op_focus < 0) {num_focus = regionID;}  // no op is chosen yet, change num_focus
			else{ // op is chosen, we'll do the calculation and do the logistics
				if (op_focus == 3 && Math.abs( quad[numrect_id])< ep) { return; }  // divided by 0
				else{
					past_steps.push(Array(quad.slice(0), quad_pos.slice(0), num_focus));
					quad[numrect_id] = calc( quad[numfocus_id], op_focus, quad[numrect_id]);
					num_focus = quad_pos[numrect_id];
					op_focus = -1;
					quad.splice(numfocus_id,1); 
					quad_pos.splice(numfocus_id,1);
					future_steps = new Array(); // nothing left to redo
				}
			}
		}
	}
	else if (regionID <8){ 
		var op_ID = regionID - 4;
		if (num_focus >=0 && quad.length > 1) {op_focus = op_ID;} // if some number is chosen and there are more than 2 nums left, then highlight the op
		else{return;} // no num is chosen, do nothing here
	}
	else if (regionID ==8){//undo
		if (past_steps.length>0 || op_focus >=0){ // there is something to undo
			if (op_focus >=0) {op_focus = -1;}  // change the choice of op
			else{
				future_steps.push(Array(quad.slice(0), quad_pos.slice(0),num_focus));
				var last_quads = past_steps.pop();
				quad = last_quads[0]; 
				quad_pos = last_quads[1];
				num_focus = last_quads[2];
			}
		}		
	}
	else if (regionID ==9){//redo
		if (future_steps.length >0){
			past_steps.push(Array(quad.slice(0), quad_pos.slice(0),num_focus));
			var next_quads = future_steps.pop();
			quad = next_quads[0]; 
			quad_pos = next_quads[1];
			num_focus = next_quads[2];
		}
	}
	else if (regionID ==10){//skip
		solved1(0); // didn't solve one.
	}
	else if (regionID ==11){//quit
		status1 = 3;
		game_draw(0);
	}
}

function init_game(){
	canvas_ele   =  document.getElementById(canvasID) ;
	canvas_ele.addEventListener("click", onclick1, false);
	canvas_ele.setAttribute('tabindex','0');
	canvas_ele.focus();
	width  = canvas_ele.width;
	height = canvas_ele.height;
	status1   = 0;
    xywh_init1 = new Array( width * percent_w_init / 2,   height * (percent_h_init / 1.2 ), 	  width * ( 1- percent_w_init),    height * ( 1- percent_h_init) / 2);
	canvas_cts = canvas_ele.getContext( "2d");
	game_draw(0);
}
function click_ID(x,y, rect_array){
	var total = rect_array.length;
	var ii ;
	for ( ii = 0; ii < total ; ii ++){
		if (x >= rect_array[ii][0] && x <= rect_array[ii][0] + rect_array[ii][2] && y >= rect_array[ii][1] && y <= rect_array[ii][1] + rect_array[ii][3]){
			return ii;
		}
	}
	return -1 ;
}

//选中边框
function draw_rect(rect1, color1, border_wid1, color2 ){
	canvas_cts.fillStyle = color1;   // button color
	canvas_cts.fillRect (rect1[0], rect1[1], rect1[2], rect1[3]);	
	canvas_cts.lineWidth   = border_wid1;
	canvas_cts.strokeStyle  = color2;   // button color
	if (border_wid1>0)
		canvas_cts.strokeRect(rect1[0] + border_wid1/ 2, rect1[1] + border_wid1/2, rect1[2] - border_wid1, rect1[3] - border_wid1);
}

function draw_text (xy_array, text1, fillstyle1, font1){
	canvas_cts.fillStyle = fillstyle1; // font color
	canvas_cts.font = font1; 
	canvas_cts.fillText(text1, xy_array[0], xy_array[1]);
}

// given text string and the rect, return the ideal x,y and fontsize
function text_in_rect(rect1, text_string){
	var fontsize = rect1[2] /Math.max(5, text_string.length + 2) * 2;
	var y = rect1[1] + rect1[3]/1.9 + 0.2 *  fontsize ;
	var x = rect1[0] + rect1[2]/2 - fontsize * text_string.length /4;
	return (Array(x,y, fontsize));	
}

function num_to_string (num1){
	var  result = "";
	if (Math.abs(num1 - Math.round (num1)) < ep) // num1 is integer
		return (result + num1);
	var ii = 2;
	var ii_mul_num1;
	while (1) {
		ii_mul_num1 = ii * num1;
		if (Math.abs(ii_mul_num1 - Math.round (ii_mul_num1)) < ep){
			return (result + Math.round(ii_mul_num1) + "/" + ii);
		}
		else 
			ii ++;
	}
	return result;
}

function num_to_string1 (num1){
	var  result = "";
	if (num1 - Math.ceil (num1) > -ep) // num1 is integer
		return (result + num1);
	var ii = 2;
	var ii_mul_num1;
	while (1) {
		ii_mul_num1 = ii * num1;
		if (ii_mul_num1 - Math.ceil (ii_mul_num1) > -ep){
			return (result + Math.round(ii_mul_num1) + "/" + ii);
		}
		else 
			ii ++;
	}
	return result;
}


function start_game(){
	status1 = 1;
	time_now = 0;
	solved   = 0;
//	totalQ = 1;
	unsolved = totalQ;
	score_all = 0;
	this_quad = 0;  // start from the first game
	this_order = game_order();
	new_quad ();
	now, before = new Date()
	show_sol = 1;
	pause_total = 501;
	coffee_total = 60001; coffee_waiting = 0;

	var rect1 = new Array( 0,0, 2*width/5, 2*height/5);
	var rect2 = new Array( 3*width/5,0, 2*width/5, 2*height/5);
	var rect3 = new Array( 0,3*height/5, 2*width/5, 2*height/5);
	var rect4 = new Array( 3*width/5,3*height/5, 2*width/5, 2*height/5);
	num_rect  = new Array(rect1, rect2, rect3, rect4);  // the rects for the numbers
	rect_all  = new Array(rect1, rect2, rect3, rect4);   	

	rect1 = new Array( 2*width/5,height/5,width/5, height/5 );//+-*/
	rect2 = new Array( 3*width/5,2*height/5,width/5, height/5 );
	rect3 = new Array( 2*width/5,3*height/5,width/5, height/5 );
	rect4 = new Array( width/5,2*height/5,width/5, height/5 );
	op_rect = new Array(rect1, rect2, rect3, rect4);  // the rects for the numbers
	rect_all.push(rect1, rect2, rect3, rect4);	

	rect_undo = new Array( 0,2*height/5,width/5, height/5 );
	rect_redo = new Array( 4*width/5,2*height/5,width/5, height/5 );
	rect_skip = new Array( 2*width/5,4*height/5,width/5, height/5 );
	rect_all.push(rect_undo, rect_redo, rect_skip); // rect 8,9,10,11

	//rect_QUIT_array = new Array(rect1, rect2); 
	rect_sol = new Array( width/10, height/10, 8*width/10, 8*height/10);
	rect_no_sol = new Array( width/5, 8*height/10, 6*height/10,  1.6*height/10);
							//x,不再出现x，宽度，
 
	game_draw(0);
	//setInterval(function(){tickclock()},10);
//	tickclock();
}

function game_draw(isclock){ // 0) status1, 1) game_type, 2) time, time_left, 3) solved, unsolved, 4) this game history
	if (status1 == 0){
		draw_rect(Array(0,0, width, height), "#fff", 0, "#000"); // clean the whole region
		draw_rect(xywh_init1, "#fff", 3, "#0f0");
		draw_text (Array(xywh_init1[0] + xywh_init1[2] /8, xywh_init1[1] + xywh_init1[3] /1.8),game_type1,"#0a0",Math.round(xywh_init1[2]/6) +"px sans-serifs");
		return;
	}
	draw_rect(Array(0,0, width, height), "#fff", 0, "#000"); // clean the whole region

	draw_rect(rect_skip ,  "#fff", 1, "#999");
	draw_text(Array(rect_skip[0], rect_skip[1] + rect_skip[3]/1.6), "    提 示", "#999", Math.round(rect_skip[2]/5) +"px sans-serif");
	
	var colorredo = "#666";
	if (future_steps.length ==0){ colorredo = "#aaa";}
	draw_rect(rect_redo ,  "#fff", 1 , colorredo );
	var redo = " \u2192";
	draw_text(Array(rect_redo[0], rect_redo[1] + rect_redo[3]/1.4), redo, colorredo ,Math.round(rect_redo[2]/2) +"px sans-serif");

	var colorundo = "#666";
	if (past_steps.length ==0 && op_focus < 0 ){ colorundo = "#aaa";}
	draw_rect(rect_undo ,  "#fff", 1,colorundo);
	var undo = " \u2190";
	draw_text(Array(rect_undo[0], rect_undo[1] + rect_undo[3]/1.4), undo ,colorundo,Math.round(rect_undo[2]/2) +"px sans-serif");

	var raty = new Array(1.2,1.2,1.2,1.2);
	var ratx = new Array(4.5,4.5,9,9);
	for (ii = 0; ii < 4; ii ++)
	{// draw ops
		var op_rect1 = op_rect[ii];
		if (ii == op_focus){
			draw_rect(op_rect1,  "#fff", 6, "#333");
			draw_text(Array(op_rect1[0]+ op_rect1[3]/ratx[ii], op_rect1[1] + op_rect1[3]/raty[ii]), op_array[ii] , "#333", Math.round(op_rect1[2]/1) +"px sans-serif");
		}
		else{
			draw_rect(op_rect1,  "#fff", 1, "#666");
			draw_text(Array(op_rect1[0]+ op_rect1[3]/ratx[ii], op_rect1[1] + op_rect1[3]/raty[ii]), op_array[ii] , "#666", Math.round(op_rect1[2]/1) +"px sans-serif");
		}			
	} 
	for (ii = 0; ii < quad.length; ii ++){ 
		var num_rect1 = num_rect[quad_pos[ii]];
		var text_string =  num_to_string (quad[ii]); 
  		var xy_fontsize = text_in_rect(num_rect1, text_string);
		if (quad_pos[ii] == num_focus){
			if (quad.length == 1){
				if (Math.abs(quad[0] - 24) < ep){
					if (status1 == 1) solved1(1);
				}
				else{
					draw_rect(num_rect1,  "#fff", 6, "#FF0000"); 
					draw_text(Array(xy_fontsize[0], xy_fontsize[1]), text_string, "#FF0000", "bold " + xy_fontsize[2] + "px sans-serif");
				}
			}
			else{
				draw_rect(num_rect1,  "#fff", 6, "#0F7100"); 
				draw_text(Array(xy_fontsize[0], xy_fontsize[1]), text_string, "#0F7100", "bold " + xy_fontsize[2] + "px sans-serif");		
			}
		}
		else{
			draw_rect(num_rect1,  "#fff", 1, "#55B72B"); //#0F7100 darker
			draw_text(Array(xy_fontsize[0], xy_fontsize[1]), text_string, "#55B72B", "bold " + xy_fontsize[2] + "px sans-serif");
		}
	}	

	//rect_sol = new Array( width/10, height/10, 8*width/10, 8*height/10);
	//rect_no_sol = new Array( width/5, 8*height/10, 6*height/10,  1.6*height/10);

	if (status1 == 4 && show_sol){ // show the solutions waiting for the esc
		draw_rect(rect_sol, "#fff", 2, "#bbb");
		//draw_rect(rect_no_sol, "#fff", 4, "#bbb");
		draw_text(Array(rect_no_sol[0] * 2, rect_sol[3] ), "  点我 关闭", "#888", Math.round(rect_no_sol[3]/5) +"px sans-serif");
		draw_text(Array(rect_no_sol[0]* 2, rect_sol[1] * 0.5  + rect_sol[3] * 0.05 * 2.5 ),  quad_prev[0] + "  "+ quad_prev[1] + "  "+ quad_prev[2] + "  "+ quad_prev[3] , "#0F7100", "bold " + Math.round(rect_no_sol[3]/4) +"px sans-serif");

		//draw_text(Array(rect_no_sol[0] * 0.5, rect_sol[1]  + rect_sol[3] * 0.05 * 3 ), "Solutions for   "  + quad_prev[0] + " "+ quad_prev[1] + " "+ quad_prev[2] + " "+ quad_prev[3] , "#000", "bold " + Math.round(rect_no_sol[3]/4) +"px sans-serif");

		var sol_vec = quad_all_prev[1].split(" ");
		if (sol_vec.length > 6){
			for (ii = 0; ii < sol_vec.length; ii +=2)
				 draw_text(Array(rect_no_sol[0] , rect_sol[1] * 0.5  + rect_sol[3] * (0.05 *4.0+ ii/2 * 0.09) ), "["+ (ii +1) +"] " +sol_vec[ii], "#008", Math.round(rect_no_sol[3]/4) +"px sans-serif");
			for (ii = 1; ii < sol_vec.length; ii +=2)
				 draw_text(Array(rect_no_sol[0] * 2.5, rect_sol[1] * 0.5  + rect_sol[3] * (0.05 *4.0+ (ii-1)/2 * 0.09) ), "["+ (ii +1) +"] " +sol_vec[ii], "#008", Math.round(rect_no_sol[3]/4) +"px sans-serif");
		}
		else{
			for (ii = 0; ii < sol_vec.length; ii ++)
			 draw_text(Array(rect_no_sol[0]* 2, rect_sol[1]  + rect_sol[3] * (0.05 *4.0+ ii * 0.09) ),sol_vec[ii], "#008", Math.round(rect_no_sol[3]/4) +"px sans-serif");
		}
		// quad_all_prev[1]
		//draw_text(Array(rect_no_sol[0] * 2.1, rect_no_sol[1] * 1.15), "不再看到此页", "#888", "bold " + Math.round(rect_no_sol[3]/4) +"px sans-serif");

	}

}

function onclick1 (e){
	var canvas = document.getElementById(canvasID);
    var x, y;
	var mainbody = document.getElementById(mainbodyID);
       if (e.pageX != undefined && e.pageY != undefined) {
  		x = e.pageX;
		y = e.pageY;
       }
       else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop  + document.documentElement.scrollTop;
       }
       x -= (canvas.offsetLeft + mainbody.offsetLeft);
       y -= (canvas.offsetTop + mainbody.offsetTop);  
	switch (status1){
		case  0: // on the init-game screen
			start_game ();
		break;
		case 1:
			var regionID = click_ID(x,y,rect_all);
			ongame(regionID);
			game_draw(0);
		break; 
		case 4: //show solutions
			status1=1; game_draw(0);
		break;
		default : 
	}
}
 
