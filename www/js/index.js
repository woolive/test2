document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Device Ready");
    var push = PushNotification.init(
        {
            "android": {"senderID": "160246723100"},
            "ios": {"alert": "true", "badge": "true", "sound": "true"},
            "windows": {}
        }
    );

    push.on('registration', function(data) {
        // The registration ID provided by the 3rd party remote push service.
        // registrationId is an unique for all device & all application
        console.log("registration "+data.registrationId);
        sessionStorage.gcmid=data.registrationId;
    });

    push.on('notification', function(data) {
        console.log("notification "+data.message);
        alert(data.title+" Message: " +data.message);
        // data.title,
        // data.count,
        // data.sound,
        // data.image,
        // data.additionalData
    });

    push.on('error', function(e) {
        console.log("error "+e.message);
    });
}

$(document).on("pageshow", function () {
    
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf("/")+1);
    console.log("pageshow "+filename);
    if(localStorage.login!="true" && filename != "login.html"){
        window.location.href = "login.html";
    } else {
        $.mobile.loading("hide");
        $("body").removeClass('ui-disabled');
        if ($("#findContact").length == 1) {
            bindFindContactEvents();
        } else if ($("#addContact").length == 1) {
            bindAddContactEvents();
        } else if ($("#login").length == 1) {
            bindLoginEvents();
        } else if ($("#logout").length == 1) {
            bindLogoutEvents();
        } else if ($("#updateRucher").length == 1) {
            var numero = sessionStorage.getItem("numero");
            if (numero && numero.length > 0) {
                $("#numero").val(numero);
                $.ajax({
                    type:"GET",
                    url: "http://apiculture.homelinux.com:8080/abeille/rest/getrucher.php",
                    data : ({
                    numero:numero
                    }),
                    dataType:"json",
                    beforeSend: function(){ 
                        $.mobile.loading("show");
                        $("body").addClass('ui-disabled').css("background", "#000");
                    },
                    success: function(data){
                        if (data) {
                            console.log("rucher "+numero+" has data "+data);
                            $("#colonies").val(data.colonie_prod);
                            bindUpdateRucherEvents();
                        } else {
                            console.log("rucher "+numero+" has no data");
                        }
                        $.mobile.loading("hide");
                        $("body").removeClass('ui-disabled');
                    },
                    error :function(){
                       generalError();
                    }
                });
            }
        }
    }
});

function bindFindContactEvents() {
    $("#findContact").on("click", function () {
        var name = $.trim($("#name").val()),
            immatriculation = $.trim($("#immatriculation").val());

        if (immatriculation.length == 0 && name.length == 0) {
            alert("Veuillez saisir une immatriculation ou un nom");
            return false;
        }

        $.ajax({
            type:"GET",
            url: "http://apiculture.homelinux.com:8080/abeille/rest/searchapi.php",
            data : ({
            nom:name,
            immatriculation:immatriculation
            }),
            dataType:"json",
            beforeSend: function(){ 
                $.mobile.loading("show");
                $("body").addClass('ui-disabled').css("background", "#000");
                //$("#contactsList").addClass("hide");
            },
            success: function(data){
                findSuccess(data);
            },
            error :function(){
               generalError();
            }
        });
    });
}

function findSuccess(contacts) {
    var html = "";
    if (!contacts.length || contacts.length == 0) {
        console.log("findSuccess pas de contact");
        html = '<li data-role="collapsible" data-iconpos="right" data-shadow="false" data-corners="false">';
        html += '<h2>Pas de contact</h2>';
        html += '<label>Pas de contact</label>';
        html += '</li>';
    } else {
        console.log("findSuccess "+contacts.length+" contact");
        for (var i=0;i<contacts.length;++i) {
            console.log("contact["+i+"]="+contacts[i].nom+" "+contacts[i].prenom);
            html += '<div class="intern-collapsible" data-role="collapsible" data-count-theme="b">';
            var nb_ruchers=0;
            if (contacts[i].ruchers) {
                nb_ruchers = contacts[i].ruchers.length;
            }
            html += '<h2>' + contacts[i].nom + ' ' + contacts[i].prenom + ' - ' + contacts[i].immatriculation + ' <span class="ui-li-count">'+nb_ruchers+'</span></h2>';
            if (nb_ruchers > 0) {
                html += '<ul class="intern-listview" data-role="listview">';
                    for (var j = 0; j < nb_ruchers; j++) {
                        html += '<li data-icon="edit"><a href="rucher.html" onclick="sessionStorage.setItem(\'numero\',\''+contacts[i].ruchers[j]+'\');">Rucher '+contacts[i].ruchers[j]+'</a></li>';
                    }
                html += '</ul>';
            }
            html += '</div>';
        }
        /*html += '<div class="intern-collapsible" data-role="collapsible">';
        html += '<h2>Acura <span class="ui-li-count">12</span></h2>';
        html += '<ul class="intern-listview" data-role="listview">';
        html += '<li><a href="index.html">Inbox <span class="ui-li-count">12</span></a></li>';
        html += '<li><a href="index.html">Outbox <span class="ui-li-count">0</span></a></li>';
        html += '</ul>';
        html += '</div>';*/
    }
    
    //$("#contactsList").removeClass("hide");
    $("#contactsList").html(html);
    $("#contactsList").collapsibleset().collapsibleset('refresh');
    $(".intern-collapsible").collapsible().collapsible('refresh');
    $(".intern-listview").listview().listview('refresh');
    
    //$("#contactsList").listview().listview('refresh');
    $.mobile.loading("hide");
    $("body").removeClass('ui-disabled');
}

function generalError() {
    alert("Un probleme est apparu, veuillez reessayer plus tard");
    $.mobile.loading("hide");
    $("body").removeClass('ui-disabled');
}

function bindAddContactEvents() {
    $("#addContact").on("click", function () {
        var name = $.trim($("#name").val()),
            surname = $.trim($("#surname").val()),
            tel = $.trim($("#tel").val()),
            mel = $.trim($("#mel").val()),
            immatriculation = $.trim($("#immatriculation").val());

        if (immatriculation.length == 0 && (name.length == 0 && surname.length == 0)) {
            alert("Veuillez saisir une immatriculation ou un nom / prenom");
            return false;
        }

        $.ajax({
            type:"POST",
            url: "http://apiculture.homelinux.com:8080/abeille/rest/test4.php",
            data : ({
            name:name,
            surname:surname,
            tel:tel,
            mel:mel,
            immatriculation:immatriculation,
            }),
            beforeSend: function(){ 
                $.mobile.loading("show");
                $("body").addClass('ui-disabled').css("background", "#000");
            },
            success: function(){
                addSuccess();
                addReset();
            },
            error :function(){
               generalError();
            }
        });
    });
}

function addSuccess() {
    alert("Le contact a ete ajoute avec succes");
    $.mobile.loading("hide");
    $("body").removeClass('ui-disabled');
}

function addReset() {
    $("#name").val("");
    $("#surname").val("");
    $("#tel").val("");
    $("#mel").val("");
    $("#immatriculation").val("");
}

function bindLoginEvents() {
    $("#login").on("click", function () {
        var username = $.trim($("#txt_username").val()),
            pwd = $.trim($("#txt_pwd").val());

        if (username.length == 0 || pwd.length == 0) {
            alert("Veuillez saisir un identifiant et un mot de passe");
            return false;
        }

        $.ajax({
            type:"POST",
            url: "http://apiculture.homelinux.com:8080/abeille/rest/login.php",
            data : ({
            login:username,
            passe:pwd,
            gcmid:sessionStorage.gcmid
            }),
            cache: false,
            dataType:"json",
            beforeSend: function(){ 
                $.mobile.loading("show");
                $("body").addClass('ui-disabled').css("background", "#000");
            },
            success: function(data){
                console.log("data="+data);
                if (data.status != "SUCCES") {
                    localStorage.login="false";
                    alert("Erreur d'identifiant et/ou de mot de passe ("+data.status+")");
                } else {
                    localStorage.login="true";
                    localStorage.username=username;
                    $.mobile.loading("hide");
                    $("body").removeClass('ui-disabled');
                }
            },
            error :function(){
                localStorage.login="false";
                generalError();
            }
        });
    });
}

function bindLogoutEvents() {
    $("#logout").on("click", function () {
        localStorage.login="false";
    });
}

function bindUpdateRucherEvents() {
    
    $("#updateRucher").on("click", function () {
        var numero = $.trim($("#numero").val());
        navigator.geolocation.getCurrentPosition(function(position){
            var lngLat = [position.coords.longitude , position.coords.latitude];
            $.ajax({
                type:"POST",
                url: "http://apiculture.homelinux.com:8080/abeille/rest/updaterucher.php",
                data : ({
                numero:numero,
                lngLat:lngLat
                }),
                beforeSend: function(){ 
                    $.mobile.loading("show");
                    $("body").addClass('ui-disabled').css("background", "#000");
                },
                success: function(){
                    alert("Le rucher a ete mis a jour avec succes");
                    $.mobile.loading("hide");
                    $("body").removeClass('ui-disabled');
                },
                error :function(){
                   generalError();
                }
            });
        } , function(error){
            console.log("code: "+ error.code+", message: "+error.message);
            generalError();
        });
    });
}