f=open("colors.txt")
lines=f.readlines()
f.close()
code=""
for line in lines:
	line=line.replace("\n","")
	if line!="":
		parts=line.split(" ")
		code=code+"OBColor.%s=new OBColor(%s,%s,%s)\n"%(parts[0],parts[1],parts[2],parts[3])

print code