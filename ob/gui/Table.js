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

ob.load("ob.gui.ScrollBar");
ob.load("ob.TextView");

window.OBTableColumn=Class.create(OBAttr,{
	initialize:function OBTableColumn_constructor(identifier,name,width,editable,cell){
		this.identifier=identifier;
		this.name=name?name:identififer;
		this.editable=!!editable;
		if(cell){
			this.cell=cell;
		}else{
			this.cell=OBTableColumn.BasicTextCell;
		}
		this._cells=[];
		this.width=width?width:0;
	},
	draw:function OBTableColumn_draw(table,verticalDelta,x,y,rows){
		table.buffer();
		var i=0;
		for(i=0;i<rows.length;i++){
			var row=rows[i];
			if(!this._cells[i]){
				this._cells[i]=this.cell(table,0,0,5,5);
			}
			this._cells[i].buffer();
			this._cells[i].attr("x",x).attr("y",y).attr("width",this.width).attr("height",table.rowHeight).setData(row);
			this._cells[i].commit();
			y+=verticalDelta;
		}
		table.commit();
	}
});

OBTableColumn.BasicTextCell=function OBTableColumn_BasicTextCell(v,x,y,w,h){
	var cell=new OBTextView(v,new OBRect(x,y,w,h));
	cell.setData=function OBTableColumn_BasicTextCell_setData(z){
		cell.attr("text",z);
	};
	return cell;
};

window.OBTable=Class.create(OBView,{
	acceptsFocus:false,
	data:null,//[{with <columnIdentifier>:<value>}]
	setup:function OBTable_setup(columns){
		this.columns=columns;
		this.vbar=new OBScrollBar(this,new OBRect(0,0,this.attr("height")-34/*(17*2)*/,17));
		this.vbar.attr("center",new OBPoint(this.attr("width")-8.5,this.attr("center").y-17));
		this.vbar.attr("autoresize",OBView.Autoresize.Width);
		this.vbar.attr("rotation",(90).toRadians());
		this.hbar=new OBScrollBar(this,new OBRect(0,this.attr("height")-17,this.attr("width"),17));
		this.hbar.attr("autoresize",OBView.Autoresize.Width);
	},
	rowHeight:25,
	update:function OBTable_update(){
		if(this._buffer){
			return;
		}
		this.columns.each(function OBTable_update_sub(col){
			
		},this);
		this.updateBig();
	}
});