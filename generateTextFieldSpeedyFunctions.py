arr=['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '\t', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\x07', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';\n', "'", 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', ' ', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?']
import cjson
def thingy(i):
	flag=""
	if i!=len(arr)-1:
		flag="setTimeout(%s,100);\n"%thingy(i+1)
	
	return "function ch_measurer_%d(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;\nif(!OBTextField.CharacterSizeHash[%s]){OBTextField.CharacterSizeHash[%s]=ob.body.measureText(%s);\n}%s}"%(i,cjson.encode(arr[i]),cjson.encode(arr[i]),cjson.encode(arr[i]),flag)

print thingy(0)