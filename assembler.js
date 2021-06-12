var eax = 1
var ebx = 0
var ecx = 0
var edx = 0

while(ecx != 21){
eax = eax + ebx;
ebx = edx;
edx = eax;
ecx = ecx +1;
}

console.log(eax)