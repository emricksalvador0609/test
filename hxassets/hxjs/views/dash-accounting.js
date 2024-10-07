
$(document).ready(function(){
	is_logged_in(session_table, false).then((prof_data) => {

		if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){

		 	getexpensetable();
		 	getincometable();
		 	getexpensecategory();
		 	 getpaymentmethod();
		 	 getexpensecategoryoption();
		 	 getpaymentmethodoption();
		 	 getexpenseincomereport();
		}else{
			forceLogout();
		}
	});

	 $(document).on('click','button[id="expense_save_btn"]', function() {
	 	var btn_element = $(this);
	 	var particulars = $('#expense_name').val();
	 	var expense_amount = $('#expense_amount').val();
	 	var expense_date = $('#expense_date').val();
	 	var expense_category = $('#expense_category_sel').val();

	 	if(particulars.length <= 0 ){
            showToastNotification("Error", "Particulars is required","error");
            return false;
        }
        if(expense_amount.length <= 0 ){
            showToastNotification("Error", "Expense Amount is required","error");
            return false;
        }
        if(expense_date.length <= 0 ){
            showToastNotification("Error", "Expense Date is required","error");
            return false;
        }
        if(expense_category.length <= 0 ){
            showToastNotification("Error", "Expense Category is required","error");
            return false;
        }

	 	savingexpense(btn_element,particulars, expense_amount, expense_date, expense_category);
	});

	 $(document).on('click','button[id="payment_save_btn"]', function() {
	 	var btn_element = $(this);
	 	var particulars = $('#payment_name').val();
	 	var payment_amount = $('#payment_amount').val();
	 	var payment_date = $('#payment_date').val();
	 	var payment_method = $('#payment_method_sel').val();

	 	if(particulars.length <= 0 ){
            showToastNotification("Error", "Particulars is required","error");
            return false;
        }
        if(payment_amount.length <= 0 ){
            showToastNotification("Error", "Payment Amount is required","error");
            return false;
        }
        if(payment_date.length <= 0 ){
            showToastNotification("Error", "Payment Date is required","error");
            return false;
        }
        if(payment_method.length <= 0 ){
            showToastNotification("Error", "Payment Method is required","error");
            return false;
        }

	 	savingpayment(btn_element,particulars, payment_amount, payment_date, payment_method);
	});

	$(document).on('click','a[id="dash-accounting-expense-cat"]', function() {
	 	var btn_element = $(this);
	 	var category_name = $('#category_name').val();

	 	if(category_name.length <= 0 ){
            showToastNotification("Error", "Category Name is required","error");
            return false;
        }


	 	savingcategoryname(btn_element,category_name);
	});

	$(document).on('click','a[id="dash-accounting-payment-method"]', function() {
	 	var btn_element = $(this);
	 	var payment_method = $('#paymentmethod_name').val();

	 	if(category_name.length <= 0 ){
            showToastNotification("Error", "Payment Method is required","error");
            return false;
        }


	 	 savingpaymentmethod(btn_element,payment_method);
	});

	


	function savingexpense(btn_element,particulars, expense_amount, expense_date, expense_category) {

	    btn_element.attr("disabled", true).text("Processing...");

	    let data = {
	        "keyword": "add-doctor-expense",
	        "particulars": particulars,
	        "expense_amount":expense_amount,
	        "expense_date":expense_date,
	        "expense_category":expense_category,
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

	            if(status == "success"){
	                showToastNotification("Success!", message);
	                //hide modal
	                hideModalNotification("expenseModal");
	                 $('#expense_name').val('');
					 	 $('#expense_amount').val('');
					 	 $('#expense_date').val('');
					 	 $('#expense_category_sel').val('');

	                $('#expenseModal').modal('hide');
	                getexpensetable();
	                getexpenseincomereport();
	            }else{	
	                showToastNotification("Error!", message,"error");

	                //access token error, redirect to login
	                if(typeof data.actokenerror && data.actokenerror){
	                    setTimeout(function(){
	                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
	                    }, 3000);
	                }
	            }
	            btn_element.attr("disabled", false).text("Add");


	        },
	        error: function (error) {
	        	btn_element.attr("disabled", false).text("Add");
	            showToastNotification("Error!", error.responseText);
	        }
	    });

	}

	function savingcategoryname(btn_element,category_name) {

	    btn_element.attr("disabled", true).text("Processing...");

	    let data = {
	        "keyword": "add-expense-category-name",
	        "category_name": category_name,
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

	            if(status == "success"){
	                showToastNotification("Success!", message);
	                //hide modal
	                hideModalNotification("expenseModal");
	                 $('#expense_name').val('');
					 	 $('#expense_amount').val('');
					 	 $('#expense_date').val('');
					 	 $('#expense_category_sel').val('');

	                $('#expenseModal').modal('hide');
	                getexpensecategory();
	                getexpensecategoryoption();
	            }else{	
	                showToastNotification("Error!", message,"error");

	                //access token error, redirect to login
	                if(typeof data.actokenerror && data.actokenerror){
	                    setTimeout(function(){
	                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
	                    }, 3000);
	                }
	            }
	            btn_element.attr("disabled", false).text("Add");


	        },
	        error: function (error) {
	        	btn_element.attr("disabled", false).text("Add");
	            showToastNotification("Error!", error.responseText);
	        }
	    });

	}


	function savingpayment(btn_element,particulars, payment_amount, payment_date, payment_method) {

	    btn_element.attr("disabled", true).text("Processing...");

	    let data = {
	        "keyword": "add-doctor-income",
	        "particulars": particulars,
	        "payment_amount":payment_amount,
	        "payment_date":payment_date,
	        "payment_method":payment_method,
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

	            if(status == "success"){
	                showToastNotification("Success!", message);
	                //hide modal
	                hideModalNotification("paymentModal");
	                 $('#payment_name').val('');
					 	 $('#payment_amount').val('');
					 	 $('#payment_date').val('');
					 	 $('#payment_method_sel').val('');

	                $('#paymentModal').modal('hide');
	                getincometable();
	                getexpenseincomereport();
	            }else{
	                showToastNotification("Error!", message,"error");

	                //access token error, redirect to login
	                if(typeof data.actokenerror && data.actokenerror){
	                    setTimeout(function(){
	                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
	                    }, 3000);
	                }
	            }
	            btn_element.attr("disabled", false).text("Add");


	        },
	        error: function (error) {
	        	btn_element.attr("disabled", false).text("Add");
	            showToastNotification("Error!", error.responseText);
	        }
	    });

	}


	function savingpaymentmethod(btn_element,payment_method) {

	    btn_element.attr("disabled", true).text("Processing...");

	    let data = {
	        "keyword": "add-payment-method",
	        "payment_method": payment_method,
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

	            if(status == "success"){
	                showToastNotification("Success!", message);
	                //hide modal
	                hideModalNotification("expenseModal");
	                 $('#expense_name').val('');
					 	 $('#expense_amount').val('');
					 	 $('#expense_date').val('');
					 	 $('#expense_category_sel').val('');

	                $('#expenseModal').modal('hide');
	                getpaymentmethod();
	                getpaymentmethodoption();
	            }else{	
	                showToastNotification("Error!", message,"error");

	                //access token error, redirect to login
	                if(typeof data.actokenerror && data.actokenerror){
	                    setTimeout(function(){
	                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
	                    }, 3000);
	                }
	            }
	            btn_element.attr("disabled", false).text("Add");


	        },
	        error: function (error) {
	        	btn_element.attr("disabled", false).text("Add");
	            showToastNotification("Error!", error.responseText);
	        }
	    });

	}



	function getexpensetable(){

        let data = {
            "keyword": "get-doctor-expense-list",
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
                let patients = data.json;
                let patient_html = "";

                if(status == "success"){
                    if( !$.isEmptyObject(patients) ){
                        $.each(patients, function(key, value){ 

                           
                        	//let patient_info = value['patient_info'];
                            key++;
  

                            patient_html += '<tr>';
                            patient_html += ' <td>'+key+'</td>';
                            patient_html += ' <td>'+value['expense_date']+'</td>';
                            patient_html += ' <td>'+value['particulars']+'</td>';
                            patient_html += ' <td>'+value['expense_amount']+'</td>';
                            patient_html += ' <td>'+value['expense_category']+'</td>';
                            patient_html += ' <td>'+value['user_username']+'</td>';
                            patient_html += ' <td>'+value['createdDate']+'</td>';
                            patient_html += '</tr>';
                        });

                    }else{
                        patient_html += '<tr>';
                        patient_html += ' <td colspan="6">';
                        patient_html += '   <div class="text-center">';
                        patient_html += '     <p class="text-muted mb-0">No Expense Yet.';
                        patient_html += '   </p>';
                        patient_html += '   </div>';
                        patient_html += ' </td>';
                        patient_html += '</tr>';

                    }   

                      
           	 	$('#expense_datatbl').DataTable().destroy();
             	$("#expense_tbl").html(patient_html);
             	// reinitiate 	
           	 	$('#expense_datatbl').DataTable( {
           		 	"destroy": true,
                    "order": [[ 0, "asc" ]], 
                    dom: "Bfrtip",
                    "bDestroy": true,
                    orderCellsTop: true,
                     buttons: [{
                        extend: "excel",
                        title: "Expense Sheet"

                      },
                      {
                        extend: "csv",
                        title: "Expense Sheet"
                      }
                      ],
                          
                });



                }else{
                    showToastNotification("Error!", message);
                    
                    //access token error, redirect to login
                    if(typeof data.actokenerror && data.actokenerror){
                        setTimeout(function(){
                            window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                        }, 3000);
                    }
                }  

            },
            error: function (error) {
                showToastNotification("Error!", error);
            }
        });

    }

    function getexpensecategory(){

        let data = {
            "keyword": "get-doctor-expense-category",
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
                let patients = data.json;
                let patient_html = "";

                if(status == "success"){
                    if( !$.isEmptyObject(patients) ){
                        $.each(patients, function(key, value){ 

                           
                        	//let patient_info = value['patient_info'];
                            key++;
  

                            patient_html += '<tr>';
                            patient_html += ' <td>'+key+'</td>';
                            patient_html += ' <td>'+value['category_name']+'</td>';
                            patient_html += '</tr>';
                        });

                    }else{
                        patient_html += '<tr>';
                        patient_html += ' <td colspan="2">';
                        patient_html += '   <div class="text-center">';
                        patient_html += '     <p class="text-muted mb-0">No Expense Category Yet.';
                        patient_html += '   </p>';
                        patient_html += '   </div>';
                        patient_html += ' </td>';
                        patient_html += '</tr>';

                    }   

               
                 $("#expense_category_tbl").html(patient_html);

                }else{
                    showToastNotification("Error!", message);
                    
                    //access token error, redirect to login
                    if(typeof data.actokenerror && data.actokenerror){
                        setTimeout(function(){
                            window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                        }, 3000);
                    }
                }  

            },
            error: function (error) {
                showToastNotification("Error!", error);
            }
        });

    }

    function getincometable(){

        let data = {
            "keyword": "get-doctor-income-list",
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
                let patients = data.json;
                let patient_html = "";

                if(status == "success"){
                    if( !$.isEmptyObject(patients) ){
                        $.each(patients, function(key, value){ 

                           
                        	//let patient_info = value['patient_info'];
                            key++;
  

                            patient_html += '<tr>';
                            patient_html += ' <td>'+key+'</td>';
                            patient_html += ' <td>'+value['payment_date']+'</td>';
                            patient_html += ' <td>'+value['particulars']+'</td>';
                            patient_html += ' <td>'+value['payment_amount']+'</td>';
                         	patient_html += ' <td>'+value['payment_method']+'</td>';
                            patient_html += ' <td>'+value['user_username']+'</td>';
                            patient_html += ' <td>'+value['createdDate']+'</td>';
                            patient_html += '</tr>';
                        });

                    }else{
                        patient_html += '<tr>';
                        patient_html += ' <td colspan="6">';
                        patient_html += '   <div class="text-center">';
                        patient_html += '     <p class="text-muted mb-0">No Expense Yet.';
                        patient_html += '   </p>';
                        patient_html += '   </div>';
                        patient_html += ' </td>';
                        patient_html += '</tr>';

                    }   


          
                 

                 $('#income_datatbl').DataTable().destroy();
                 $("#payment_tbl").html(patient_html);
				// reinitiate 	
           	 	$('#income_datatbl').DataTable( {
           		 	"destroy": true,
                    "order": [[ 0, "asc" ]], 
                    dom: "Bfrtip",
                    "bDestroy": true,
                    orderCellsTop: true,
                     buttons: [{
                        extend: "excel",
                        title: "Income Sheet"

                      },
                      {
                        extend: "csv",
                        title: "Income Sheet"
                      }
                      ],
                          
                });


                }else{
                    showToastNotification("Error!", message);
                    
                    //access token error, redirect to login
                    if(typeof data.actokenerror && data.actokenerror){
                        setTimeout(function(){
                            window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                        }, 3000);
                    }
                }  

            },
            error: function (error) {
                showToastNotification("Error!", error);
            }
        });

    }

    function getpaymentmethod(){

        let data = {
            "keyword": "get-doctor-payment-method",
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
                let patients = data.json;
                let patient_html = "";

                if(status == "success"){
                    if( !$.isEmptyObject(patients) ){
                        $.each(patients, function(key, value){ 

                           
                        	//let patient_info = value['patient_info'];
                            key++;
  

                            patient_html += '<tr>';
                            patient_html += ' <td>'+key+'</td>';
                            patient_html += ' <td>'+value['payment_method']+'</td>';
                            patient_html += '</tr>';
                        });

                    }else{
                        patient_html += '<tr>';
                        patient_html += ' <td colspan="2">';
                        patient_html += '   <div class="text-center">';
                        patient_html += '     <p class="text-muted mb-0">No Payment Method Yet.';
                        patient_html += '   </p>';
                        patient_html += '   </div>';
                        patient_html += ' </td>';
                        patient_html += '</tr>';

                    }   

               
                 $("#payment_method_tbl").html(patient_html);

                }else{
                    showToastNotification("Error!", message);
                    
                    //access token error, redirect to login
                    if(typeof data.actokenerror && data.actokenerror){
                        setTimeout(function(){
                            window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                        }, 3000);
                    }
                }  

            },
            error: function (error) {
                showToastNotification("Error!", error);
            }
        });

    }

    function getexpensecategoryoption(){

        let data = {
            "keyword": "get-select-expense-cat",
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
                let categoryexpense = data.json;
                let categoryexpense_html = "";

                if(status == "success"){
                $('#expense_category_sel').html('');	
                $('#expense_category_sel').append('<option value="" selected>Select Expense Category</option>'); 
               $.each(categoryexpense,function(key, value)
                {
                    $("#expense_category_sel").append('<option value=' + value['category_name'] + '>' + value['category_name'] + '</option>');
                });



                }else{
                    showToastNotification("Error!", message);
                    
                    //access token error, redirect to login
                    if(typeof data.actokenerror && data.actokenerror){
                        setTimeout(function(){
                            window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                        }, 3000);
                    }
                }  

            },
            error: function (error) {
                showToastNotification("Error!", error);
            }
        });

    }

    function getpaymentmethodoption(){

        let data = {
            "keyword": "get-select-payment-mthd",
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
                let categoryexpense = data.json;
                let categoryexpense_html = "";

                if(status == "success"){
                $('#payment_method_sel').html('');	
                $('#payment_method_sel').append('<option value="" selected>Select Payment Method</option>'); 
               $.each(categoryexpense,function(key, value)
                {
                    $("#payment_method_sel").append('<option value=' + value['payment_method'] + '>' + value['payment_method'] + '</option>');
                });



                }else{
                    showToastNotification("Error!", message);
                    
                    //access token error, redirect to login
                    if(typeof data.actokenerror && data.actokenerror){
                        setTimeout(function(){
                            window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                        }, 3000);
                    }
                }  

            },
            error: function (error) {
                showToastNotification("Error!", error);
            }
        });

    }

    function getexpenseincomereport(){

        let data = {
            "keyword": "get-income-expense-report",
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
                let incomeexpense = data.json;
                let incomeexpense_html = "";

                if(status == "success"){
               	
               	if( !$.isEmptyObject(incomeexpense) ){
                    $.each(incomeexpense, function(key, value){ 
                		//let patient_info = value['patient_info'];
                   	 	key++;

                        incomeexpense_html += '<tr>';
                        incomeexpense_html += ' <td>'+key+'</td>';
                        incomeexpense_html += ' <td>'+value['month_year']+'</td>';
                        incomeexpense_html += ' <td>'+value['total_payment']+'</td>';
                        incomeexpense_html += ' <td>'+value['total_expense']+'</td>';
                        incomeexpense_html += ' <td>'+value['gross']+'</td>';
                        incomeexpense_html += '</tr>';
                    });

                }else{
	                    incomeexpense_html += '<tr>';
	                    incomeexpense_html += ' <td colspan="5">';
	                    incomeexpense_html += '   <div class="text-center">';
	                    incomeexpense_html += '     <p class="text-muted mb-0">No Income & Expense Yet.';
	                    incomeexpense_html += '   </p>';
	                    incomeexpense_html += '   </div>';
	                    incomeexpense_html += ' </td>';
	                    incomeexpense_html += '</tr>';

                }   

             
                  	$('#incomeexpense_datatbl').DataTable().destroy();
                  	$("#income_expense_tbl").html(incomeexpense_html);
					// reinitiate 	
           	 		$('#incomeexpense_datatbl').DataTable( {
	           		 	"destroy": true,
	                    "order": [[ 0, "asc" ]], 
	                    dom: "Bfrtip",
	                    "bDestroy": true,
	                    orderCellsTop: true,
	                     buttons: [{
	                        extend: "excel",
	                        title: "Finance Report Sheet"

	                      },
	                      {
	                        extend: "csv",
	                        title: "Finance Report Sheet"
	                      }
	                      ],
	                          
	                });

             
                }else{
                    showToastNotification("Error!", message);
                    
                    //access token error, redirect to login
                    if(typeof data.actokenerror && data.actokenerror){
                        setTimeout(function(){
                            window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                        }, 3000);
                    }
                }  

            },
            error: function (error) {
                showToastNotification("Error!", error);
            }
        });

    }

});