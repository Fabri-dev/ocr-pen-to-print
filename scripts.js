"use strict"
const $userForm= document.getElementById("userForm");
const $userFile= document.getElementById("userFile");
const $clearButton= document.getElementById("clearButton");
const $inputSection= document.getElementById("inputSection");
const $dropHere= document.getElementById("dropHere");
const $outputText= document.getElementById("outputText");

const apiUrl = 'https://pen-to-print-handwriting-ocr.p.rapidapi.com/recognize/';



$userForm.addEventListener("submit", async (event)=>{
    event.preventDefault(); //cancela que intente utilizar el metodo action
    submitButton.setAttribute("disabled",''); // Deshabilita el botón mientras carga asi no se pueden hacer multiples llamados

    //cargamos la informacion que utilizaremos para hacer el llamado al API

    const file = $userFile.files[0]; //leemos y retornamos el archivo recibido

    const options= loadOptionsForApi(file);

    callToApi(options);
});

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
                'x-rapidapi-key': 'APIKEY',
                'x-rapidapi-host': 'pen-to-print-handwriting-ocr.p.rapidapi.com'
            },
            body: data
        };
    }
    
    return options;
}

let lastSelectedFile= null;

$userFile.addEventListener("change",()=>{
    if ($userFile.files.length > 0) {
        lastSelectedFile = $userFile.files[0]; // Guarda el archivo seleccionado
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

$inputSection.addEventListener("dragover",(event)=>{
    event.preventDefault();
    $inputSection.style.backgroundColor= "lightgray";


});

$inputSection.addEventListener("dragleave",(event)=>{
    event.preventDefault();
    $inputSection.style.backgroundColor= "";
});

$inputSection.addEventListener("drop",(event)=>{
    event.preventDefault();

    const files= event.dataTransfer.files;

    //console.log(files);

    //no se puede enviar mas de un archivo
    if(files.length === 1)
    {
        const dataTransfer = new DataTransfer(); //sirve para transferir datos/bytes

        const oneFile= files.item(0);

        dataTransfer.items.add(oneFile);//agrego un archivo al objeto dataTransfer
        $userFile.files = dataTransfer.files; //transfiero el archivo al input desde javascript
        
        const fileImage=document.createElement("img"); //creo una etiqueta de img 

        fileImage.src=returnUrlImage(oneFile); //retorno el archivo como url
        fileImage.id="fileImage";
        fileImage.alt=oneFile.name; 

        //fileImage.classList.addd("INGRESAR ESTILo");

        $inputSection.append(fileImage); //agrego la etiqueta creada al final


        $inputSection.style.backgroundColor= "yellow";
        
    }else{
        $outputText.textContent="You can not upload more than 1 file";
    }

});

const returnUrlImage= (oneFile)=>{
    return URL.createObjectURL(oneFile); // creo el archivo como una URL 
};
