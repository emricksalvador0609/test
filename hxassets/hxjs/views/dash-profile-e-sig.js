let base64Signature  = "";
let blankValue = "";

$(document).ready( function(){

    var canvas = document.getElementById("signature-pad");
    var signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(250,250,250)'
    });

    window.onload = resizeCanvas;
    resizeCanvas();
    setTimeout(function(){
        resizeCanvas();
    }, 1000);


    is_logged_in(session_table, false).then((prof_data) => {

        if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){
            getCurrentEsig();
        }else{
            forceLogout();
        }
    });

    $("#show-e-signature").click(function(){
        clear();
        menu("menu-e-sig-view","show",250);

    });

    $("#e-sig-save").click(function(){
        $(this).attr("disabled", true).text("Processing...");
        requestSaveEsignature(base64Signature);
    });

    var canvas = document.getElementById("signature-pad");
    var sigImagePreview = document.getElementById("sig-image-preview");
    var previewBtn = document.getElementById("btn-e-sig-preview");


    document.getElementById("clear").addEventListener('click', function(){
        signaturePad.clear();
        var dataUrl = canvas.toDataURL();
        base64Signature = dataUrl;
        blankValue = dataUrl;
    })

     previewBtn.addEventListener("click", function(e) {
       var dataUrl = canvas.toDataURL();
       base64Signature = dataUrl;

       if(base64Signature == blankValue) {
       	   showToastNotification("Error!", "E-Signature is Empty","error");
       } else {
           console.log(dataUrl);
           sigImagePreview.setAttribute("src", dataUrl);
           menu("menu-e-sig-pad","close",250);
           menu("menu-e-sig-save","show",250);

        }

     }, false);

     function resizeCanvas() {
        var ratio = Math.max(window.devicePixelRatio || 2, 2);
        canvas.width = canvas.offsetWidth * ratio;
        //canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        var dataUrl = canvas.toDataURL();
        blankValue = dataUrl;
     }
});

function getCurrentEsig () {
    let data = {
        "keyword": "get-e-signature",
        "actokensec": actokensec,
        "platform": "web",
    };

    let jwt_data = jwt_encode(data);

    $.ajax({
		url: baseApiUrl + jwt_data,
		cache: true,
		type: "GET",
		beforeSend: function (xhr) {
			xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));

		},
		success : function (data) {

			let status = data.status;
			let message = data.message;
			let json = data.json;
			if(status == "success"){

                if( !$.isEmptyObject(json) &&  json.signature.length > 0){
                    $("#sig-image").attr("src",json.signature);
                    $("#sig-image-initial-display").attr("src",json.signature);
                }

			}else{
				showToastNotification("Error!", message,"error");
                if(typeof data.actokenerror && data.actokenerror){
                    //access token error, redirect to login
                    setTimeout(function(){
                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                    }, 3000);
                }
			}

		},
		error: function (error) {
			showToastNotification("Error!", error,"error");
		}
	});
}

function requestSaveEsignature(signature)  {
    let data = {
        "keyword": "save_e_signature",
        "signature": signature,
        "actokensec": actokensec,
        "platform": "web",
    };

    let jwt_data = jwt_encode(data);

    $.ajax({
        url: baseApiUrl,
        cache: true,
        type: "POST",
        data: jwt_data,
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));

        },
        success : function (data) {
            let status = data.status;
            let message = data.message;
            if(status=="success"){

                showToastNotification("Add Successful!", message);
                getCurrentEsig();
                menu("menu-e-sig-save","close",250);
                clear();

             } else {
                showToastNotification("Error!", message,"error");
             }

             if(typeof data.actokenerror && data.actokenerror){
                 setTimeout(function(){
                     window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                 }, 3000);
             }
             $("#e-sig-save").attr("disabled", false).text("Save");

        },
        error: function (error) {
            showToastNotification("Error!", error,"error");
             $("#e-sig-save").attr("disabled", false).text("Save");
        }
    });

}


function clear() {
    var canvas = document.getElementById("signature-pad");
    var signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(250,250,250)'
    });
    signaturePad.clear();
    var dataUrl = canvas.toDataURL();
    base64Signature = dataUrl;
    blankValue = dataUrl;
}
