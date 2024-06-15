document.getElementById("asigGrado").style.display="none";
document.getElementById("asigMaster").style.display="none"
document.getElementById("asigDoctorado").style.display="none"



function cambiarValores() {
    
    var selectBox2 = document.getElementById("planEstudios");
    var selectedValue2 = selectBox2.options[selectBox2.selectedIndex].value;

   
        if(selectedValue2 == "grado"){
            document.getElementById("asigGrado").style.display="block";
            document.getElementById("asigMaster").style.display="none"
            document.getElementById("asigDoctorado").style.display="none"

        }else if(selectedValue2 == "master"){
            document.getElementById("asigGrado").style.display="none"
            document.getElementById("asigMaster").style.display="block";
            document.getElementById("asigDoctorado").style.display="none"

        }else if(selectedValue2 == "doctorado"){
            document.getElementById("asigGrado").style.display="none"
            document.getElementById("asigMaster").style.display="none"
            document.getElementById("asigDoctorado").style.display="block";
        } 
}
