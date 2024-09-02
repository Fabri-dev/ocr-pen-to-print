"use strict"
const $userForm= document.getElementById("userForm");
const $userFile= document.getElementById("userFile");
const $clearButton= document.getElementById("clearButton");
const $inputSection= document.getElementById("inputSection");
const $dropHere= document.getElementById("dropHere");
const $outputText= document.getElementById("outputText");
const $buttons= document.getElementById("buttons");
const $main = document.querySelector("main");
const $inputAndImage= document.getElementById("inputAndImage");
const apiUrl = 'https://pen-to-print-handwriting-ocr.p.rapidapi.com/recognize/';




const callToApi= async options =>{
    try {
        const response = await fetch(apiUrl, options); 
        const result = await response.json();
        $outputText.textContent = result.value;
    } catch (error) {
        $outputText.textContent = "Error al procesar la imagen.";
        console.error(error);
    }finally{
        submitButton.removeAttribute("disabled",'');
    }
}

const loadOptionsForApi= file =>{
    let options= null;
    if(file instanceof File){
        const data = new FormData();
        data.append('Session', file.name);
        data.append('srcImg', file); 
        options = {
            method: 'POST', // por default si no escribimos explicitamente method, se hara GET.
            headers: {
                'x-rapidapi-key': '594c5b388amshaaee958da1dcb18p1093f9jsn8ed63e3fd285',
                'x-rapidapi-host': 'pen-to-print-handwriting-ocr.p.rapidapi.com'
            },
            body: data
        };
    }
    
    return options;
}

$userForm.addEventListener("submit", async (event)=>{
    event.preventDefault(); //cancela que intente utilizar el metodo action
    submitButton.setAttribute("disabled",''); // Deshabilita el botón mientras carga asi no se pueden hacer multiples llamados

    //cargamos la informacion que utilizaremos para hacer el llamado al API

    const file = $userFile.files[0]; //leemos y retornamos el archivo recibido

    const options= loadOptionsForApi(file);

    callToApi(options);
});

let lastSelectedFile= null;

$userFile.addEventListener("change",()=>{
    if ($userFile.files.length > 0) {
        lastSelectedFile = $userFile.files[0]; // Guarda el archivo seleccionado
        createImage(lastSelectedFile);

    }else{
        // Si el input file está vacío pero hay un archivo guardado, restaurarlo, esto sucede cuando cierro el selector de archivos sin haber seleccionado nada, me retorna null y me borra el archivo que habia seleccionado anteriormente
        if(lastSelectedFile){
            //si anteriormente habia un archivo lo restauro
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(lastSelectedFile);
            $userFile.files = dataTransfer.files;
        }
    }
});

$clearButton.addEventListener("click",()=>{
    //este metodo limpia la imagen seleccionada
    if($userFile){
        lastSelectedFile=null;
        $userFile.value="";
        $outputText.textContent="Text will be displayed here...";

        if(document.getElementById("fileImage")){
            //si existe una imagen del archivo
            document.getElementById("fileImage").remove();
        }
    }

});

let dragCounter = 0; // Contador de eventos drag

$main.addEventListener("dragenter",(event)=>{
    event.preventDefault();
    //verifico si lo arrastrado es un archivo
    if(event.dataTransfer.types.includes('Files')){
        dragCounter++;
        $dropHere.classList.replace('inactive','active');
    }
});

// Manejador para cuando un archivo está sobre el área de drop
$main.addEventListener('dragover', (event) => {
    event.preventDefault(); // Previene la acción predeterminada
});

$main.addEventListener("dragleave",(event)=>{
    event.preventDefault();
    dragCounter--;
    if(dragCounter ===0){
        $dropHere.classList.replace('active','inactive');
    }
});



$main.addEventListener("drop",(event)=>{
    event.preventDefault();

    const files= event.dataTransfer.files;

    //console.log(files);
    
    //verifico que sea un dato drageado de tipo file, asi me activo
    if(event.dataTransfer.types.includes('Files')){
        
        //no se puede enviar mas de un archivo
        if(files.length === 1)
        {
            const dataTransfer = new DataTransfer(); //sirve para transferir datos/bytes
            const oneFile= files.item(0);

            dragCounter = 0; // Reiniciamos el contador
            $dropHere.classList.replace('active','inactive');//desactivo el drophere!
            
            //$main.style.backgroundColor= ""; //cambio el fondo

            dataTransfer.items.add(oneFile);//agrego un archivo al objeto dataTransfer
            $userFile.files = dataTransfer.files; //transfiero el archivo al input desde javascript
            
            createImage(oneFile); //muestro la imagen             
        }else{
            $outputText.textContent="You can not upload more than 1 file";
        }
    }


});

const returnUrlImage= (oneFile)=>{
    return URL.createObjectURL(oneFile); // creo el archivo como una URL 
};

const createImage= (oneFile) =>{
    
    //si hay una imagen la elimino y creo la otra
    if(document.getElementById("fileImage")){
        document.getElementById("fileImage").remove();
    }

    let fileImage=document.createElement("img"); //creo una etiqueta de img 
    
    fileImage.src=returnUrlImage(oneFile); //retorno el archivo como url
    fileImage.id="fileImage";
    fileImage.alt=oneFile.name; 
    $inputAndImage.append(fileImage); //agrego la etiqueta creada al final
}




