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