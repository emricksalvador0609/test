
var baseApiUrl = "http://localhost/wbxhxense/sccapi/v1/Hx_Doctor_Rest_Api?token=";
//var baseApiUrl = "https://healthxenseapi.healthxense.com/sccapi/v1/Hx_Doctor_Rest_Api?token=";
var baseAppUrl = "http://localhost/doctor_page/";
var secret = "Gtg6HQXEFcjLysvxbJkgMjJmTYZhEzMD";
var basicAuthUsername = "spcapi";
var basicAuthPass = "N76aFnRBvbh6DEt2Dnqw7672wYEe4tYf";

var toastNotification = document.getElementById('toast-notification');
var toastNotificationError = document.getElementById('toast-notification-error');

var actokensec = "";

var myDropzone = "";
var global_dropzone_files = {};
var dz_is_sending = false;

var active_clinic_id = "0";

var limitPageAccessList = ["dash-patient-queue","dash-prescription","dash-patient","dash-patient-info"];


function getUrlParameter(sParam) {

	var sPageURL = window.location.search.substring(1),
    	sURLVariables = sPageURL.split('&'),
    	sParameterName,
    	i;

	for (i = 0; i < sURLVariables.length; i++) {

    	sParameterName = sURLVariables[i].split('=');

    	if (sParameterName[0] === sParam) {
        	return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    	}
	}

	return false;
};

function createSplideSlide(_elem_id, perPage = 1){

	if( $("#" + _elem_id).length <= 0 ){
		return false;
	}

	new Splide('#' + _elem_id, {
        autoplay: true,
        interval: 3000,
        perPage: perPage,
        clones: 1,
    }).mount();

}

function createDatePicker(_elem_id){

	if( $(_elem_id).length <= 0 ){
		return false;
	}

	$(_elem_id).datepicker({
        //uiLibrary: 'bootstrap5'
	});

};

function validate_clean_hxdata(data){
	return typeof data != "undefined" ? data : "";
}

function format_to_currency(amount){

    var i = parseFloat(amount);
    if(isNaN(i)) { i = 0.00; }
    var minus = '';
    if(i < 0) { minus = '-'; }
    i = Math.abs(i);
    i = parseInt((i + .005) * 100);
    i = i / 100;
    s = new String(i);
    if(s.indexOf('.') < 0) { s += '.00'; }
    if(s.indexOf('.') == (s.length - 2)) { s += '0'; }
    s = minus + s;
    return replace_number_with_commas(s);

}

function replace_number_with_commas(i_number) {

	//Seperates the components of the number
	var n= i_number.toString().split(".");
	//Comma-fies the first part
	n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	//Combines the two sections
	return n.join(".");
}

function check_if_email(email) {

  var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if(!regex.test(email)) {
	return false;
  }else{
	return true;
  }

}

function validateEmail(email){

	return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

function check_if_contact_number(contact_number){

	var phoneno = /^\d{11}$/;
	if(contact_number.match(phoneno)){
		return true;
	}else{
		return false;
	}

}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {

    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function read_cookie(search_key = '') {

	   var allcookies = document.cookie;
	   var cookiearray = allcookies.split(';');
	   for(var i=0; i<cookiearray.length; i++) {
	      var name = cookiearray[i].split('=')[0];
	      var value = cookiearray[i].split('=')[1];
			if(search_key == name.trim()){
				return value;
			}
	   }

	return false;

}

function make_base_auth(tok) {
  	var hash = Base64.encode(tok);
  	return "Basic " + hash;
}

function jwt_encode(data){

	var header = {
	  "alg": "HS256",
	  "typ": "JWT"
	};


	var stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
	var encodedHeader = base64url(stringifiedHeader);

	var stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
	var encodedData = base64url(stringifiedData);
	var token = encodedHeader + "." + encodedData;

	var signature = CryptoJS.HmacSHA256(token, secret);
	signature = base64url(signature);
	var signedToken = token + "." + signature;

	return signedToken;
}


function parseJwt (token) {
   var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    

    return jsonPayload;
}


function base64url(source) {

// Encode in classical base64
  encodedSource = CryptoJS.enc.Base64.stringify(source);

  // Remove padding equal characters
  encodedSource = encodedSource.replace(/=+$/, '');

  // Replace characters according to base64url specifications
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');

  return encodedSource;
}

function isJson(str) {
    try {
		JSON.parse(str);
		return true;
    } catch (e) {
        return false;
    }
}

function show_swal_message(message, icon = 'error'){

	Swal.fire({
		  title: '',
		  text: message,
		  icon: icon,
	});

    //sweetAlert("", message, icon);
}

function nl2br(str, is_xhtml) {

	if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function showToastNotification(title, message, type = "success") {

	if( type == "error") {

		$("#error-toast-notification-title").text(title);
		$("#error-toast-notification-message").text(message);

	    toastID = new bootstrap.Toast(toastNotificationError);
		toastID.show();

	} else {
		$("#toast-notification-title").text(title);
		$("#toast-notification-message").text(message);

	    toastID = new bootstrap.Toast(toastNotification);
		toastID.show();
	}


}



function showModalNotification(modalId, modalTimeOut = 0, modalTitle, modalMessage) {

	if(modalTitle.length > 0){
		$("#" + modalId).find("#menu-confirm-title").html(modalTitle);
	}

	if(modalMessage.length > 0){
		$("#" + modalId).find("#menu-confirm-text").html(modalMessage);
	}

    menu(modalId, "show", modalTimeOut);
}

function hideModalNotification(modalId) {
    menu(modalId, "hide");
}

function showMessage(modalId,modalMessage,modalTitle,timeOut){

	var modal  = $("#"+modalId);

	if(modal.length >= 1){

		 $("#"+modalId +" .modal-message").html("");
 		 $("#"+modalId +" .modal-message").html("");

		 $("#"+modalId +" .modal-message").html(modalMessage);
 		 $("#"+modalId +" .modal-title").html(modalTitle);

		menu(modalId,"show",timeOut);

	} else {

	}
}

//Extending Menu Functions
function menu(menuName, menuFunction, menuTimeout){

    setTimeout(function(){

		$(".page-content").css({"transform":"inherit"});

        if(menuFunction === "show"){
            return document.getElementById(menuName).classList.add('menu-active'),
            document.querySelectorAll('.menu-hider')[0].classList.add('menu-active')
        } else {
            return document.getElementById(menuName).classList.remove('menu-active'),
            document.querySelectorAll('.menu-hider')[0].classList.remove('menu-active')
        }

    }, menuTimeout)

}

function showLoader(_elem_id){
	$(_elem_id).html( $("#global-loader-div").html() );
}

function hideKeyboard(){
    document.activeElement.blur();
    $("input").blur();
};

function forceLogout(){

	//show modal
	showModalNotification("menu-confirm", 0, "You will be logged-out in 5 secs.", "We cannot determine the access token being used, please re-login.");

	//always clear session data on login
	jsstoresqlite_clear_table(session_table);

	setTimeout(function(){
		window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
	}, 5000);
}


function insertClinicIndexDb(data) {

	jsstoresqlite_insert_data("health_xense_clinic_schedule_table", data).then((insert) => {

		if(insert >= 1) {
			//window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=dash-home");
			//console.log("successfully save clinic schedule");
		} else {
			//console.log("error on saving clinic schedule");
		}
	});
}

function getBMI(weight_kg,height_in_meters) {

	let result = {};

	let meters_sq = parseFloat(height_in_meters) * parseFloat(height_in_meters)
	let weight = parseFloat(weight_kg);

	let bmi = Math.round(weight / meters_sq);

	let classification = "";

	if(bmi <= 18.4){
		classification = "Underweight";
	} else if(bmi >= 18.5 && bmi <= 22.9 ) {
		classification = "Normal";

	} else if(bmi >= 23 && bmi <= 24.9 ) {
		classification = "Overweight";

	} else {
		classification = "Obese";
	}

	result["bmi"] = bmi;
	result["classification"] = classification;

	return result;
}

function init_dropzone(dropzone_id, url, elem_module_id, elem_to_append, max_number_of_file, acceptedFiles = "image/*", file_max_size = 1){

	window[dropzone_id] = {};

	if( !$.isEmptyObject(elem_to_append.val()) && isJson(elem_to_append.val()) && $("#pk").val() > 0 ){

		global_dropzone_files = JSON.parse(elem_to_append.val());
		window[dropzone_id] = JSON.parse(elem_to_append.val());

		if(global_dropzone_files.length <= 0){
			global_dropzone_files = {};
			window[dropzone_id] = {};
		}
	}

	// If you use jQuery, you can use the jQuery plugin Dropzone ships with:
	myDropzone = new Dropzone(dropzone_id, {
				url: url,
				addRemoveLinks: true,
				dictDefaultMessage: "<img src='../hxassets/hximages/upload.png'>",
				acceptedFiles: acceptedFiles,
				maxFiles: max_number_of_file,
				maxFilesize: file_max_size, //half MB only
				dictRemoveFile: "Delete",
				dictCancelUploadConfirmation: "Are you sure to cancel upload?",
				init : function(file) {

					/* uploading the file to the server */
					this.on("sending", function(file, xhr, formData){

						/* setting the file id */
						var file_id = new Date().getTime();
						/*adding some data */
						formData.append('file', file);
						formData.append('action', "upload");
						formData.append('module', elem_module_id);
						formData.append('id', file_id);
						formData.append('count', this.files.length);


					});
				},
				error: function (file, response) {

					var node, _i, _len, _ref, _results;
					var message = response //error message
					file.previewElement.classList.add("dz-error");
					_ref = file.previewElement.querySelectorAll("[data-dz-errormessage]");
					_results = [];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					  node = _ref[_i];
					  _results.push(node.textContent = message);
					}
					return _results;

				}
			});

	/* if succesfully uploaded the file on frontend */
	myDropzone.on('success', function(file) {

		var response = file.xhr.response;
		response = $.parseJSON(response);
		var id = $.trim(response.msg);

		if( $.trim(response.status) == "success" ){ // succeeded

			var files_arr = new Array();

			var dt = new Date();
			var dGetTime = dt.getTime();
			var _indexDate = dGetTime; //dt.getFullYear() + "" + dt.getDate() + "" + (dt.getMonth()+1) + "" + dt.getHours() + "" + dt.getMinutes() + "" + dt.getSeconds();

			//add id and preview button
			$(file.previewElement).attr('id', _indexDate);

			if(max_number_of_file == 1){
				if($(dropzone_id).find('.dz-image-preview').length){
					$(dropzone_id).find('.dz-image-preview').each(function(){

						let _prevDropzoneId = $(this).attr("id");

						if(_indexDate != _prevDropzoneId){
							$(this).remove();
							delete window[dropzone_id][_prevDropzoneId];
						}

					});
				}
			}

			//add the newly uploaded image to array
			global_dropzone_files[_indexDate] = id;
			window[dropzone_id][_indexDate] = id;

			//append to element the values

			elem_to_append.attr("value", JSON.stringify(window[dropzone_id]) );

			//customized funtion
			if( $("#saveDocumentsDiv").length ){
				$("#saveDocumentsDiv").fadeIn();
			}

			return file.previewElement.classList.add("dz-success");


		}else if ( $.trim(response.status) == "error" ){  //  error

			var node, _i, _len, _ref, _results;
			var message = response.msg //error message
			file.previewElement.classList.add("dz-error");
			_ref = file.previewElement.querySelectorAll("[data-dz-errormessage]");
			_results = [];

			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			  node = _ref[_i];
			  _results.push(node.textContent = message);
			}

			return _results;
		}

	});

	/* check if succesfully uploaded the file on frontend */
	myDropzone.on('removedfile', function(file, xhr) {

		var _init_url;
		//get the id if the file
		if( typeof $(file.previewTemplate).attr("id") !== "undefined"){

			var file_id = $(file.previewTemplate).attr("id");
			var _dropzone_id = dropzone_id.split("#")[1];

			var _dropzone_default_files = $('input[name='+_dropzone_id+']').val();
            //var _dropzone_default_files = $('input[name='+dropzone_id+']').val();

			var _dropzone_files = {};

			//not object
			if( !isJson(_dropzone_default_files) ){

				show_ui_toast_notification('Something went wrong removing the image. Please refresh the page and try again.', 'error');

				//just to remove dropzone icon
				if($(dropzone_id).find('.dz-image-preview').length){
					$(dropzone_id).find(".dz-message").hide();
				}

				return false;
			}

			//loop thru the dropzone images in VIEW
			$.each(window[dropzone_id], function(index, value){

				//if not same file id
				if(index != file_id){
					_dropzone_files[index] = value;
				}else{
					_init_url = value;
					delete global_dropzone_files[index];
					delete window[dropzone_id][index]
				}
			});

			//replace old images value in VIEW
			elem_to_append.attr("value", JSON.stringify(_dropzone_files) );

			// $.ajax({
			// 	url: baseAppUrl + "/Delete_File/delete_file/",
			// 	type: "POST",
			// 	data: {id: file_id, _init_url: _init_url}
			// });//end ajax

		}// end if
		if($(dropzone_id).find('.dz-image-preview').length){
			$(dropzone_id).find(".dz-message").hide();
		}

	});

    myDropzone.on("maxfilesexceeded", function (file) {
               this.removeFile(file);
               //console.log("max numbef of file exceeded");
               showToastNotification("Error!", "Max number of file exceeded","error");
           });


}

function showMedicalForm(id) {

    if(id == "emedical-certificate-content"){

        $(".medical-form").hide();
        $("#"+id).show();

        $(".medical-buttons").hide();
        $("#dash-preview-buttons").show();

        //needed to go back
        $("#btn-medical-edit-preview").attr("previous-menu","dash-medical-record-medical-certificate-form");
        //need to deterime type of for to save
        $("#dash-medical-form-save").attr("medical-form-type","med-cert");

    } else if (id == "emedical-lab-request-content") {

        $(".medical-form").hide();
        $("#"+id).show();

        $(".medical-buttons").hide();
        $("#dash-preview-buttons").show();

        //needed to go back
        $("#btn-medical-edit-preview").attr("previous-menu","dash-medical-record-laboratory-request-form");
        //need to deterime type of for to save
        $("#dash-medical-form-save").attr("medical-form-type","lab-request");

    } else if (id == "ereferral-request-content") {
        $(".medical-form").hide();
        $("#"+id).show();

        $(".medical-buttons").hide();
        $("#dash-preview-buttons").show();

        //needed to go back
        $("#btn-medical-edit-preview").attr("previous-menu","dash-medical-record-referral-letter-form");
        //need to deterime type of for to save
        $("#dash-medical-form-save").attr("medical-form-type","referral-letter");

    }  else {

    }
    showModalNotification("eprescription-menu-wizard-rx", 0, "", "");

}

function beforePrint() {
    $("#printable-form").addClass("printcss");
    $("#form-footer").addClass("printFooter");
}

function afterPrint() {
    setTimeout(function() {
        $("#printable-form").removeClass("printcss");
        $("#form-footer").removeClass("printFooter");
    }, 5000);
}

function formatDate(date)  {

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var currentDate  =  new Date();
    if(date != ""){
        currentDate = new Date(date);
    }

    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    var stringDate = months[month] +" "+day+", "+year;

    return stringDate;
}

function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
   // Directly return the joined string
   return splitStr.join(' ');
}

function get_verification_status() {
    let data = {
        "keyword": "get-verfication-status",
        "actokensec": actokensec,
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
            let resJson = data.json;
            //resJson.registraion_status = "";
            if(resJson.registraion_status == "Active"){
                $("#dash-patient-queue").attr("href","?hxcurrentpage=dash-patient-queue").removeClass("disabled-nav");
                $("#dash-prescription").attr("href","?hxcurrentpage=dash-prescription").removeClass("disabled-nav");
                $("#dash-customer").attr("href","?hxcurrentpage=dash-patient").removeClass("disabled-nav");
            } else {
                let current_page = getUrlParameter('hxcurrentpage');
                if(limitPageAccessList.includes(current_page)){
                    window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=dash-home");

                }
            }


        },
        error: function (error) {
            console.log(error);
        }
    });

}

//update by emrick 8/14/2024
function checkSchedule(user_id,secretary_acc,sec_clinic_id,secretary_fname,secretary_lname) {

    let data = {
        "keyword": "check-doctor-schedule",
        "actokensec": actokensec,
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
            let schedule = data.json;
            let patient_html = "";
            //console.log(data);
            if(status == "success"){

                let html = '';
                great_fname = doctorData.first_name;
                great_title = "Doctor";
                great_clinic_id=schedule.id;
                if(secretary_acc==1){
                	great_title = "";
                	great_clinic_id = sec_clinic_id;
                	great_fname = secretary_fname;
                }

                html += schedule.greetings_label +" "+great_title+" "+great_fname;
                html += "<br/>You have schedule at "+schedule.name;
                html += "<br/>From: "+schedule.start_time+" - "+schedule.end_time;
                html += "<br>Would you like to Sign in?"
                $("#schedule-text").html(html);
                $("#accept-clinic-popup").attr("clinic-id",great_clinic_id);
                //console.log(html);
                menu("schedule-notif","show",2000);

            }else{
                //showToastNotification("Error!", message);
            }

        },
        error: function (error) {
            showToastNotification("Error!", error);
        }
    });
}

function setActiveClinic(clinic_id,show_notif,element) {
    if(element != null){
        element.text("Processing...").attr("disabled", true);
    }

    let data = {
        "keyword" : "set-active-clinic",
        "clinic_id": clinic_id,
        "actokensec": actokensec
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

            if(element != null){
                element.text("YES").attr("disabled", false);
            }

            if (status == "success") {

                if(show_notif){
                    showToastNotification("Clock in Successful","You have now clock in to clinic.");
                }

                if(typeof clinic_id == "number") {
                    clinic_id = clinic_id.toString()
                }
                let dataObj = {
                    active_clinic: clinic_id
                }

                let whereObj = {user_access_token: actokensec};
                jsstoresqlite_update_data(session_table, dataObj, whereObj).then((sqliteres) => {


                });

                active_clinic_id = clinic_id;

            } else {
                showToastNotification("Error!", message,"error");
            }
        },
        error: function (error) {
            if(element != null){
                element.text("YES").attr("disabled", false);
            }
            showToastNotification("Error!", error,"error");
        }
    });
}

function mapTime(time) {
     switch(time) {
        case "12:00 AM":
            return 0;
            break;
        case "01:00 AM":
            return 1;
            break;
        case "02:00 AM":
            return 2;
            break;
        case "03:00 AM":
            return 3;
            break;
        case "04:00 AM":
            return 4;
            break;
        case "05:00 AM":
            return 5;
            break;

        case "06:00 AM":
            return 6;
            break;

        case "07:00 AM":
            return 7;
            break;
        case "08:00 AM":
            return 8;
            break;

        case "09:00 AM":
            return 9;
            break;

        case "10:00 AM":
            return 10;
            break;

        case "10:00 AM":
            return 10;
            break;

        case "11:00 AM":
            return 11;
            break;
        case "12:00 PM":
            return 12;
            break;
        case "01:00 PM":
            return 13;
            break;
        case "02:00 PM":
            return 14;
            break;
        case "03:00 PM":
            return 15;
            break;
        case "04:00 PM":
            return 16;
            break;
        case "05:00 PM":
            return 17;
            break;

        case "06:00 PM":
            return 18;
            break;

        case "07:00 PM":
            return 19;
            break;
        case "08:00 PM":
            return 20;
            break;

        case "09:00 PM":
            return 21;
            break;

        case "10:00 PM":
            return 22;
            break;

        case "10:00 PM":
            return 21;
            break;

        case "11:00 PM":
            return 23;
            break;
        case "11:59 PM":
            return 24;
            break;
        default:
            return 0;
    }
}


