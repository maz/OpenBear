/*
This file is part of OpenBear.

	OpenBear is free software: you can redistribute it and/or modify
	it under the terms of the GNU Lesser General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	OpenBear is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Lesser General Public License for more details.

	You should have received a copy of the GNU Lesser General Public License
	along with OpenBear.  If not, see <http://www.gnu.org/licenses/>.

*/
window.OBDebug={
	init:function OBDebug_init(){
		window.OBDebugWin=window.open(ob.moduleUrl("ob","debugger.html"),"OBDebugWin","dependent,resizable,height=200,width=400");
		var win=OBDebugWin;
		if(win){
			setTimeout(function OBDebug_init_sub(){
				win.init(this);
			},100);
		}else{
			alert("Your pop-up blocker is preventing the debugger from being shown.\nPlease disable it then refresh the page.");
		}
	},
	closed:function OBDebug_closed(){
		setTimeout(function OBDebug_closed_sub(){
			if(confirm("Would you like to reopen the OpenBear Debugger?")){
				OBDebug.init();
			}
		},100);
	}
};

document.observe("dom:loaded",OBDebug.init);