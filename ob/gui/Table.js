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
	initialize:function(identifier,name,editable,cell){
		this.identifier=identifier;
		this.name=name?name:identififer;
		this.editable=!!editable;
		if(cell){
			this.cell=cell;
		}else{
			this.cell=OBTableColumn.BasicTextCell;
		}
	}
});

OBTableColumn.BasicTextCell=function OBTableColumn_BasicTextCell(x,y,w,h){
	return new OBTextView(x,y,w,h);
};

window.OBTable=Class.create(OBView,{
	data:null,
	setup:function OBTable_setup(columns){
		this.columns=columns;
		
	}
});