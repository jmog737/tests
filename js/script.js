///Ahora las variables se toman de un único lugar que es el archivo config.php
///Las mismas, para que estén accesibles, se agregan a unos input "invisibles" que están en el HEAD (antes de incluir script.js para que estén disponibles).
var limiteSeleccion = parseInt($("#limiteSeleccion").val(), 10);
var tamPagina = parseInt($("#tamPagina").val(), 10);
var limiteHistorialProducto = parseInt($("#limiteHistorialProducto").val(), 10);
var limiteHistorialGeneral = parseInt($("#limiteHistorialGeneral").val(), 10);
var limiteSelects = parseInt($("#limiteSelects").val(), 10);
var duracionSesion = parseInt($("#duracionSesion").val(), 10);

/**
///  \file script.js
///  \brief Archivo que contiene todas las funciones de Javascript.
///  \author Juan Martín Ortega
///  \version 1.0
///  \date Setiembre 2017
*/

/***********************************************************************************************************************
/// ************************************************** FUNCIONES GENÉRICAS *********************************************
************************************************************************************************************************
*/

/**
 * \brief Función que valida los datos de ingreso (por ahora, solo que se haya ingresado el usuario).
 */
function validarIngreso () {
  var usuario = $("#nombreUsuario").val();
  if ((usuario === ' ')||(usuario === "null")){ 
    alert('¡Debe ingresar el nombre de usuario!');
    
    $("#nombreUsuario").focus();
  }
  else {
    $("#frmLogin").submit();
  }
}
/********** fin validarIngreso **********/


/**
 * \brief Función que chequea las variables de sesión para saber si la misma aún está activa o si ya expiró el tiempo.
 * @param mensaje {String} String con un mensaje opcional usado para debug.
 * @param cookie {String} String que indica si se debe o no actualizar la expiración de la cookie.
 */
function verificarSesion(mensaje, cookie) {
  var xmlhttp = new XMLHttpRequest();
  if (mensaje !== ''){ 
    const dateTime = Date.now();
    const tiempo = Math.floor(dateTime / 1000);
    //alert(mensaje+': '+tiempo);
  }
  else {
    mensaje = 'XXX';
  }
  /*
  onreadystatechange: Defines a function to be called when the readyState property changes.
  readyState property:
    Holds the status of the XMLHttpRequest.
      0: request not initialized 
      1: server connection established
      2: request received 
      3: processing request 
      4: request finished and response is ready
  */
  xmlhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      var myObj1 = JSON && JSON.parse(this.responseText) || $.parseJSON(this.responseText);
      var user = '';
      var user_id = '';
      var sesion = '';
      var timestamp = '';
      var oldTime = '';
      var usuarioViejo = 'ERROR';
      var duracionSesion = myObj1.duracion;
      if ($.isEmptyObject(myObj1)){
        user = 'ERROR';
        user_id = 0;
        sesion = 'expirada';
        timestamp = 0;
        oldTime = 0;
        usuarioViejo = 'ERROR';
      }
      else {
        user = myObj1.user;
        user_id = myObj1.user_id;
        sesion = myObj1.sesion;
        timestamp = myObj1.time;
        oldTime = myObj1.oldTime;
        usuarioViejo = myObj1.oldUser;
      };
      var temp = String(timestamp).substr(-3);

      if (sesion === 'expirada'){
        var mostrarSesion = '';
        ///Se comenta siguiente línea usada para las pruebas:
        //var tempSesion = prompt('Ingrese el tiempo deseado para la sesión: \n');   
        var horas = Math.floor( duracionSesion / 3600 );  
        var minutos = Math.floor( (duracionSesion % 3600) / 60 );
        var segs = duracionSesion % 60;
        //Anteponiendo un 0 a los minutos si son menos de 10 
        //minutos = minutos < 10 ? '0' + minutos : minutos;
        //Anteponiendo un 0 a los segundos si son menos de 10 
        //segs = segs < 10 ? '0' + segs : segs;
        if (horas === 0){
          if (minutos === 0){
            mostrarSesion = segs+' segs';
          }
          else {
            if (segs === 0){
              mostrarSesion = minutos+'min';
            }
            else {
              mostrarSesion = minutos+'min '+segs+'segs';
            }
          }
        }
        else {
          if ((minutos === 0)&&(segs === 0)){
            mostrarSesion = horas+'h';
          }
          else {
            if (segs === 0){
              mostrarSesion = horas+'h '+minutos+'min';
            }
            else {
              mostrarSesion = horas+'h '+minutos+'min '+segs+'segs';
            }
          }  
        }
        //alert('Motivo: '+user+'\n'+usuarioViejo.toUpperCase()+":\nTú sesión ha estado inactiva por más de "+mostrarSesion+"\nPor favor, por seguridad, ¡vuelve a loguearte!.\n\ntiempo seteado: "+oldTime+'\nactual: '+temp+'\n\nDuración Sesión: '+duracionSesion+'s\nmensaje: '+mensaje);
        alert(usuarioViejo.toUpperCase()+":\nTú sesión ha estado inactiva por más de "+mostrarSesion+"\nPor favor, por seguridad, ¡vuelve a loguearte!.\n\n"+'Motivo: '+user+"\nTiempo seteado: "+oldTime+'\nTiempo actual: '+temp+'\n\nDuración Sesión: '+duracionSesion+'seg');
        window.location.assign("logout.php");
      }
      else {
        $("#usuarioSesion").val(user);
        $("#userID").val(user_id);
        $("#timestampSesion").val(timestamp);
        $("#main-content").focus();
        //alert('¡Actualicé!\n\nTiempo viejo: '+oldTime+'\nNuevo tiempo: '+temp+'\n\nDuración Sesión: '+duracionSesion+'\nmensaje: '+mensaje+'\n\nsesion: '+sesion+'\nDesde: '+window.location.href);
      }
    }
  };

  xmlhttp.open("GET", "data/estadoSesion.php?c="+cookie+"", true);
  xmlhttp.send();
}
/********** fin verificarSesion(mensaje, cookie) **********/

/**
 * \brief Función que vacía el contenido del div cuyo Id se pasa como parámetro.
 * @param id {String} String del Id del DIV que se quiere vaciar.
 */
function vaciarContent (id) {
  $(id).empty();
}
/********** fin vaciarContent(id) **********/

/**
  \brief Función que valida que el parámetro pasado sea un entero.
  @param numero Dato a validar.                  
*/
function validarEntero(numero) {//alert(valor);
  if (isNaN(numero)){
    //alert ("Ups... " + numero + " no es un número.");
    return false;
  } 
  else {
    if (numero % 1 == 0) {
      //alert ("Es un numero entero");
      return true;
    } 
    else {
      //alert ("Es un numero decimal");
      return false;
    }
  }
}
/********** fin validarEntero(valor) **********/

/**
  \brief Función que detecta si el archivo pasado en la url existe.
  @param url String Dirección del archivo a comprobar.                  
*/
function existeUrl(url) {
   var http = new XMLHttpRequest();
   http.open('HEAD', url, false);
   http.send();
   return http.status!=404;
}

/**
 * 
 * @param {String} str String con la cadena de texto a buscar como parte del producto.
 * @param {String} id String con el id del campo luego del cual se tienen que agregar los datos.
 * @param {String} seleccionado String que indica, si es que es disitinto de nulo, el producto seleccionado.
 * \brief Función que muestra las sugerencias de los productos disponibles.
 */
function showHint(str, id, seleccionado) {
  if (str.length === 0) { 
    $("#hint").remove();
    $("#snapshot").remove();
    $("#stock").remove();
    $("#promedio1").remove();
    $("#promedio2").remove();
    $("#ultimoMov").remove();
    $("#historial").remove();
    $("#producto").val("");
    return;
  } 
  else {
    var url = "data/selectQuery.php";
    var query = "select idprod, entidad, nombre_plastico, codigo_emsa, codigo_origen, bin, snapshot, stock, alarma1, alarma2, comentarios, ultimoMovimiento from productos where (productos.nombre_plastico like '%"+str+"%' or productos.codigo_emsa like '%"+str+"%' or productos.codigo_origen like '%"+str+"%' or productos.bin like '%"+str+"%' or productos.entidad like '%"+str+"%' or productos.idprod like '%"+str+"%') and estado='activo' order by productos.entidad asc, productos.nombre_plastico asc";
    if (seleccionado !== ''){
      var produsTemp = seleccionado.split(',');
    }
    $.getJSON(url, {query: ""+query+""}).done(function(request) {
      var sugerencias = request.resultado;
      var totalSugerencias = parseInt(request.rows, 10);
      $("[name='hint']").remove();
      $("#ultimoMov").remove();
      $("#historial").remove();
      
      var mostrar = '';
      var unico = '';
      if (totalSugerencias >= 1) {
        if ((parseInt($("#productoGrafica").length, 10) > 0)||(parseInt($("#producto").length, 10) > 0)){
          mostrar = '<select name="hint" id="hint" class="hint" size="15">';
        }
        else {
          mostrar = '<select name="hint" id="hint" class="hint" multiple size="15">';
        }
        if (totalSugerencias > 1) {
          mostrar += '<option value="NADA" name="NADA">--Seleccionar--</option>';
        }
        for (var i in sugerencias) {
          if (totalSugerencias === 1){
            unico = parseInt(sugerencias[i]["idprod"], 10);
          }
          var bin = sugerencias[i]["bin"];
          if ((bin === null)||(bin === '')) {
            bin = 'SIN BIN';
          }
          var snapshot = sugerencias[i]["snapshot"];
          if ((snapshot === null)||(snapshot === '')) {
            snapshot = 'noDisponible1.png';
          }
          var codigo_emsa = sugerencias[i]["codigo_emsa"];
          if ((codigo_emsa === null) || (codigo_emsa === "")) {
            codigo_emsa = 'SIN CODIGO AÚN';
          }
          
          if (seleccionado !== ''){
            var sel = "";
            for (var k in produsTemp){
              var selEntero = parseInt(produsTemp[k], 10);
              if (parseInt(sugerencias[i]["idprod"], 10) === selEntero) {
                sel = 'selected="yes"';
              }
            }
          }
          
          var comentario = '';
          comentario = sugerencias[i]["comentarios"];
          var resaltarOption = '';
          if ((comentario !== '')&&(comentario !== null)){
            /// Resaltado en AMARILLO del comentario que tiene el patrón: DIF
            if (comentario.indexOf("dif") > -1){
              resaltarOption = 'class="resaltarDiferencia"';
            }
            else {
              /// Resaltado en VERDE del comentario que tiene el patrón: STOCK
              if (comentario.indexOf("stock") > -1){
                resaltarOption = 'class="resaltarStock"';
              }
              else {
                /// Resaltado en ROJO SUAVE del comentario que tiene el patrón: PLASTICO con o sin tilde
                if ((comentario.indexOf("plastico") > -1)||(comentario.indexOf("plástico") > -1)){
                  resaltarOption = 'class="resaltarPlastico"';
                }
                else {
                  /// Resaltado general en caso de tener un comentario que no cumpla con ninguno de los patrones anteriores
                  resaltarOption = 'class="resaltarComentario"';
                }
              }            
            }  
          }
          else  {
            resaltarOption = 'class="fondoSelect"';
          }
          //mostrar += '<option value="'+sugerencias[i]["idprod"]+'" name="'+snapshot+'" stock='+sugerencias[i]["stock"]+' alarma='+sugerencias[i]["alarma"]+' '+sel+ '>[' + sugerencias[i]["entidad"]+'] '+sugerencias[i]["nombre_plastico"] + ' {' +bin+'} --'+ codigo_emsa +'--</option>';
          mostrar += '<option value="'+sugerencias[i]["idprod"]+'" name="'+snapshot+'" '+resaltarOption+' stock='+sugerencias[i]["stock"]+' alarma1='+sugerencias[i]["alarma1"]+' alarma2='+sugerencias[i]["alarma2"]+' comentarios="'+sugerencias[i]["comentarios"]+'" ultimoMov="'+sugerencias[i]["ultimoMovimiento"]+'" '+sel+ '>[' + sugerencias[i]["entidad"]+': '+codigo_emsa+'] --- '+sugerencias[i]["nombre_plastico"] + '</option>';
        }
        mostrar += '</select>';
      }
      else {
        mostrar = '<p name="hint" value="">No se encontraron sugerencias!</p>';
      }
      $(id).after(mostrar);
      
      /// Agregado a pedido de Diego para que se abra el select automáticamente:
      var length = parseInt($('#hint> option').length, 10);
      if (length > limiteSelects) {
        length = limiteSelects;
      }
      else {
        length++;
      }
      if (length > totalSugerencias){
        length = totalSugerencias + 2;
      }
      //open dropdown
      $("#hint").attr('size',length);
      
      if (seleccionado !== ''){
        $("#hint").focus();
      }
      else {    
        switch(id) {
          case '#producto': $("#producto").focus();
                            break;
          case '#productoStock':  $("#productoStock").focus();
                                  break;
          case '#productoMovimiento': $("#productoMovimiento").focus(); 
                                      break;
          default: break;  
        }     
      }
      
      if (totalSugerencias === 1){
        ///Comentado por ahora pues Diego prefiere que NO salte de forma automática:
        //$("#comentarios").focus();
        $("#hint option[value='"+unico+"'] ").attr("selected", true);
        //$("#cantidad").focus();
      }      
    });
  }
}
/********** fin showHint(str, id, seleccionado) **********/

/**
 * \brief Función que muestra en pantalla el botón para disparar el popover con el historial
 *        Básicamente, hace la consulta del historial para el producto y arma el botón con el popover.
 * @param {String} prod String con el id del producto a consultar.
*/
function mostrarHistorial(prod){
  //if (parseInt($("#historial").length, 10) > 0){
    $("#historial").popover('dispose');
    $("#historial").remove();//alert('fsd');
  //}
  
  ///Vuelvo a redefinir limiteHistorialProducto para que tome el último valor en caso de que se haya cambiado con el modal.
  var limiteHistorialProducto = parseInt($("#limiteHistorialProducto").val(), 10);
  var url = "data/selectQuery.php";
  var query = "select movimientos.idmov, productos.nombre_plastico as nombre, DATE_FORMAT(movimientos.fecha, '%d/%m/%Y') as fecha, DATE_FORMAT(movimientos.hora, '%H:%i:%s') as hora, movimientos.cantidad, movimientos.tipo, movimientos.comentarios as comentarios, movimientos.estado from movimientos inner join productos on productos.idprod=movimientos.producto where productos.idprod="+prod+" order by movimientos.fecha desc, movimientos.hora desc limit "+limiteHistorialProducto+"";
  //alert(query);
  $.getJSON(url, {query: ""+query+""}).done(function(request){
    var datos = request.resultado;
    var totalDatos = parseInt(request.rows, 10);
    if (totalDatos > 0){
      var mostrar = '';
      var j = 0;
      for (var i in datos){
        j = parseInt(i, 10)+1;
        var comentario = datos[i]["comentarios"];
        if ((comentario === '')||(comentario === null)||(comentario === "undefined")){
          comentario = '';
        }
        else {
          comentario = "&nbsp;["+comentario+"]";
        }
        mostrar += "<a href='editarMovimiento.php?id="+datos[i]["idmov"]+"' target='_blank' class='linkHistorialProducto'>"+j+": "+datos[i]["fecha"]+" "+datos[i]["hora"]+" - "+datos[i]["tipo"]+' ('+datos[i]["estado"]+')'+": <span class='negritaGrande'>"+datos[i]["cantidad"]+"</span>"+comentario+"</a><br>";
      }
      var popover = '<a role="button" tabindex="0" id="historial" class="btn btn-danger historial" title="Historial de '+datos[i]["nombre"]+'" data-container="body" data-toggle="popover" data-trigger="click" data-placement="right" data-content="'+mostrar+'">Historial</a>';
      
      $("#historial").popover('dispose');
      $("#historial").remove();
      if (parseInt($("#comentHint").length, 10) > 0) {
        $("#comentHint").after(popover);
      }
      else {
        $("#ultimoMov").after(popover);
      } 
      $("#historial").popover({html:true});
    }
    else {
      ///ver si avisar que no hay movimientos.
    }
  });
}
/********** fin mostrarHistorial(prod) **********/

/**
 * \brief Función que muestra en pantalla el botón para disparar el popover con el historial general
 *        Básicamente, hace la consulta del historial para los últimos movimientos y arma el botón con el popover.
 *        @param {String} id String con el id del elemento delante del cual debe ir el botón para ver el historial.
*/
function mostrarHistorialGeneral(id){
  if (parseInt($("#historialGeneral").length, 10) > 0){
    $("#historialGeneral").popover('dispose');
    $("#historialGeneral").remove();
  }
  ///Vuelvo a redefinir limiteHistorialGeneral para que tome el último valor en caso de que se haya cambiado con el modal.
  var limiteHistorialGeneral = parseInt($("#limiteHistorialGeneral").val(), 10);
  var url = "data/selectQuery.php";
  var query = "select movimientos.idmov, productos.entidad, productos.nombre_plastico as nombre, productos.codigo_emsa as codigo, DATE_FORMAT(movimientos.fecha, '%d/%m/%Y') as fecha, DATE_FORMAT(movimientos.hora, '%H:%i:%s') as hora, movimientos.cantidad as cantidad, movimientos.tipo, movimientos.comentarios as comentarios, movimientos.estado from movimientos inner join productos on productos.idprod=movimientos.producto order by movimientos.fecha desc, movimientos.hora desc limit "+limiteHistorialGeneral+"";
  //alert(query);
  $.getJSON(url, {query: ""+query+""}).done(function(request){
    var datos = request.resultado;
    var totalDatos = parseInt(request.rows, 10);
    if (totalDatos > 0){
      var mostrar = '';
      var j = 0;
      for (var i in datos){
        j = parseInt(i, 10)+1;
        var comentario = datos[i]["comentarios"];
        if ((comentario === '')||(comentario === null)||(comentario === "undefined")){
          comentario = '';
        }
        else {
          comentario = "&nbsp;["+comentario+"]";
        }
        var codigo = datos[i]["codigo"];
        if ((codigo === '')||(codigo === null)||(codigo === "undefined")){
          codigo = 'COD. NO INGRESADO';
        }
        //mostrar += j+": "+datos[i]['fecha']+" "+datos[i]['hora']+" - "+datos[i]['entidad']+"/"+datos[i]['nombre']+" - "+datos[i]['tipo']+": <span class='negritaGrande'>"+cantidad+"</span>"+comentario+"<br>";
        mostrar += "<a href='editarMovimiento.php?id="+datos[i]['idmov']+"' target='_blank' class='linkHistorialGeneral'>"+j+": "+datos[i]['fecha']+" "+datos[i]['hora']+" - "+datos[i]['entidad']+"/"+codigo+" - "+datos[i]['tipo']+' ('+datos[i]['estado']+')'+": <span class='negritaGrande'>"+datos[i]['cantidad']+"</span>"+comentario+"</a><br>";
      }
      var titulo = '&Uacute;ltimos '+limiteHistorialGeneral+' movimientos:';
      var popover = '<a role="button" tabindex="0" id="historialGeneral" class="btn btn-primary" title="'+titulo+'" data-container="#gralHistory" data-toggle="popover" data-trigger="click" data-placement="left" data-content="'+mostrar+'">Últimos '+limiteHistorialGeneral+' Movimientos</a>';
      //var popover = '<a role="button" tabindex="0" id="historialGeneral" class="btn btn-primary" title="'+titulo+'" data-container="#gralHistory" data-toggle="popover" data-trigger="click" data-placement="left" data-content="'+mostrar+'">Last</a>';
      
      $(id).append(popover);
      $("#historialGeneral").popover({html:true});
    }
    else {
      ///ver si avisar que no hay movimientos.
    }
   //$("#miFooter").css("background-color", "red");
   
  });
}
/********** fin mostrarHistorialGeneral(id) **********/

/**
 * 
 * @param {String} str String con la cadena de texto a buscar como parte del producto.
 * @param {String} id String con el id del campo luego del cual se tienen que agregar los datos.
 * @param {String} seleccionado String que indica, si es que es disitinto de nulo, el producto seleccionado.
 * \brief Función que muestra las sugerencias de los productos disponibles.
 */
function showHintProd(str, id, seleccionado) {
  if (str.length === 0) { 
    $("#hintProd").remove();
    $("#snapshot").remove();
    $("#stock").remove();
    $("#promedio1").remove();
    $("#promedio2").remove();
    $("#ultimoMov").remove();
    $("#historial").remove();
    $("#producto").val();
    return;
  } 
  else {
    var url = "data/selectQuery.php";
    var query = "select idprod, entidad, nombre_plastico, codigo_emsa, codigo_origen, bin, snapshot, stock, alarma1, alarma2, ultimoMovimiento from productos where (productos.nombre_plastico like '%"+str+"%' or productos.codigo_emsa like '%"+str+"%' or productos.codigo_origen like '%"+str+"%' or productos.bin like '%"+str+"%' or productos.entidad like '%"+str+"%' or productos.idprod like '%"+str+"%') and estado='activo' order by productos.nombre_plastico asc";
    //alert(query);
    $.getJSON(url, {query: ""+query+""}).done(function(request) {
      var sugerencias = request.resultado;
      var totalSugerencias = parseInt(request.rows, 10);
      $("[name='hintProd']").remove();
            
      var mostrar = '';
      
      if (totalSugerencias >= 1) {
        mostrar = '<select name="hintProd" id="hintProd" tabindex="2" class="hint">';
        if (totalSugerencias > 1) {
          mostrar += '<option value="NADA" name="NADA">--Seleccionar--</option>';
        }
        for (var i in sugerencias) {
          var bin = sugerencias[i]["bin"];
          if ((bin === null) || (bin === '') ){
            bin = 'SIN BIN';
          }
          var snapshot = sugerencias[i]["snapshot"];
          if ((snapshot === null)||(snapshot === '')) {
            snapshot = 'NADA';
          }
          var codigo_emsa = sugerencias[i]["codigo_emsa"];
          if ((codigo_emsa === null) || (codigo_emsa === "")) {
            codigo_emsa = 'SIN CODIGO AÚN';
          }
          var sel = "";
          var elegido = parseInt(seleccionado, 10);
          if (parseInt(sugerencias[i]["idprod"], 10) === elegido) {
            sel = 'selected="yes"';
          }
          //mostrar += '<option value="'+sugerencias[i]["idprod"]+'" name="'+snapshot+'" stock='+sugerencias[i]["stock"]+' alarma='+sugerencias[i]["alarma"]+'>[' + sugerencias[i]["entidad"]+'] '+sugerencias[i]["nombre_plastico"] + ' {' +bin+'} --'+ codigo_emsa +'--</option>';
          mostrar += '<option value="'+sugerencias[i]["idprod"]+'" name="'+snapshot+'" stock='+sugerencias[i]["stock"]+' alarma1='+sugerencias[i]["alarma1"]+' alarma2='+sugerencias[i]["alarma2"]+' ultimoMov="'+sugerencias[i]["ultimoMovimiento"]+'" '+sel+ '>[' + sugerencias[i]["entidad"]+': '+codigo_emsa+'] --- '+sugerencias[i]["nombre_plastico"] + '</option>';
        }
        mostrar += '</select>';
      }
      else {
        mostrar = '<p name="hintProd" value="">No se encontraron sugerencias!</p>';
      }
      $(id).after(mostrar);
      
      //inhabilitarProducto();
      //$("#hintProd").focusin();
      
      /// Agregado a pedido de Diego para que se abra el select automáticamente:
      var length = parseInt($("#hintProd > option").length, 10);

      if ((length > 10)||(length === 0)) {
        length = 10;
      }
      else {
        length++;
      }
      if (length > totalSugerencias){
        length = totalSugerencias + 1;
      }

      //open dropdown
      $("#hintProd").attr('size',length);
      inhabilitarProducto();
      ///Si elegido es -1 el llamado viene de eliminarProducto. Entonces borro los datos del producto (foto, stock y último movimiento), y pongo el foco en Seleccionar.
      if (elegido === -1 ){
        $("#hintProd").focus();
        $("#hintProd option[value='NADA']").attr('selected', true);
        $("#snapshot").remove();
        $("#stock").remove();
        $("#ultimoMov").remove();
      }
    });
  }
}
/********** fin showHintProd(str, id, seleccionado) **********/

/***********************************************************************************************************************
/// ********************************************** FIN FUNCIONES GENÉRICAS *********************************************
************************************************************************************************************************
*/


/***********************************************************************************************************************
/// ************************************************ FUNCIONES MOVIMIENTOS *********************************************
************************************************************************************************************************
*/

/**
 * \brief Función que valida los datos pasados para el movimiento.
 * @returns {Boolean} Devuelve un booleano que indica si se pasó o no la validación de los datos para el movimiento.
 */
function validarMovimiento() {
  var seguir = false;
  var cantidad = $("#cantidad").val();
  //var cantidad2 = $("#cantidad2").val();
  var fecha = $("#fecha").val();
  //var usuarioBoveda = $("#usuarioBoveda").val();
  //var usuarioGrabaciones = $("#usuarioGrabaciones").val();
  var hoy = new Date();
  var diaHoy = hoy.getDate();
  var mesHoy = hoy.getMonth()+1;
  if (diaHoy < 10) 
    {
    diaHoy = '0'+diaHoy;
  }                     
  if (mesHoy < 10) 
    {
    mesHoy = '0'+mesHoy;
  }
  var hoyFecha = hoy.getFullYear()+'-'+mesHoy+'-'+diaHoy;
      
  if (fecha === ''){
    alert('Por favor ingrese la fecha del movimiento.');
    $("#fecha").focus();
    seguir = false;
  }
  else {
    if (fecha > hoyFecha){
      alert('La fecha seleccionada es posterior al día de hoy. \n¡Por favor verifique!.');
      $("#fecha").focus();
      seguir = false;
    }
    else {
      if (($("#hint").find('option:selected').val() === "NADA") || ($("#producto").val() === ''))
        {
        alert('Debe seleccionar el nombre del plástico.');
        document.getElementById("hint").focus();
        seguir = false;
      }
      else
        {
        var cant = validarEntero(cantidad);
        if (cant){
          cantidad = parseInt(cantidad, 10);
        }
        if ((cantidad <= 0) || (cantidad === "null") || !cant)
          {
          alert('La cantidad de tarjetas debe ser un ENTERO mayor o igual a 1.');
          $("#cantidad").val("");
          document.getElementById("cantidad").focus();
          seguir = false;
        } 
        else
          {
            /// Se quitan el doble ingreso de la cantidad, y el ingreso de las personas involucradas a pedido de Diego:
  ////        var cant2 = validarEntero(document.getElementById("cantidad2").value);  
  ////
  ////        if ((cantidad2 <= 0) || (cantidad2 === "null") || !cant2)
  ////          {
  ////          alert('La repetición de la cantidad de tarjetas debe ser un entero mayor o igual a 1.');
  ////          $("#cantidad2").val("");
  ////          document.getElementById("cantidad2").focus();
  ////          seguir = false;
  ////        } 
  ////        else
  ////          {
  ////          if (cantidad !== cantidad2)
  ////            {
  ////            alert('Las cantidades de tarjetas ingresadas deben coincidir. Por favor verifique!.');
  ////            $("#cantidad").val("");
  ////            $("#cantidad2").val("");
  ////            document.getElementById("cantidad").focus();
  ////            seguir = false;
  //////          } 
  ////          else
  ////            {
  //            if (usuarioBoveda === "ninguno")
  //              {
  //              alert('Se debe seleccionar al controlador 1. Por favor verifique!.');
  //              document.getElementById("usuarioBoveda").focus();
  //              seguir = false;
  //            } 
  //            else
  //              {
  //              if (usuarioGrabaciones === "ninguno")
  //                {
  //                alert('Se debe seleccionar al controlador 2. Por favor verifique!.');
  //                document.getElementById("usuarioGrabaciones").focus();
  //                seguir = false;
  //              } 
  //              else
  //                {
  //                if (usuarioGrabaciones === usuarioBoveda) {
  //                  alert('NO puede estar el mismo usuario en ambos controles. Por favor verifique!.');
  //                  document.getElementById("usuarioGrabaciones").focus();
  //                  seguir = false;
  //                } 
  //                else {  
  //                  seguir = true;
  //                }
  //              //}// usuarioGrabaciones
  //            //}// usuarioBoveda  
  //          //}// cantidad != cantidad2
  //        //}// cantidad 2
        seguir = true;
        }// cantidad
      }// nombre_plastico
    }// fecha menor a hoy
  }// fecha no seleccionada
  if (seguir) return true;
  else return false;
}
/********** fin validarMovimiento() **********/

/**
  \brief Función que carga en el selector pasado como parámetro la tabla para agregar un movimiento.
         Además, según desde donde se llame, carga también el "hint" de productos ya hecha así también como el tipo de movimiento recién hecho.
  @param {String} selector String con el selector en donde se debe mostrar la tabla.
  @param {String} hint String con la palabra o palabras a buscar como sugerencia de productos.
  @param {Integer} prod Integer con el id del producto.  
  @param {String} tipo String con el tipo de movimiento ingresado anteriormente.
  @param {String} fecha String con la fecha del movimiento ingresado anteriormente.
*/
function cargarMovimiento(selector, hint, prod, tipo, fecha){
  var url = "data/selectQuery.php";
  var query = "select iduser, apellido, nombre from usuarios where (estado='activo' and (sector='Bóveda' or sector='Grabaciones')) order by nombre asc, apellido asc";

  /// Recupero fecha actual para pre setear en el campo Fecha:
  var actual = new Date();
  var dia = actual.getDate();
  var mes = parseInt(actual.getMonth(), 10);
  mes = mes +1;
  if (mes < 10) {
    mes = "0"+mes;
  }
  if (dia < 10) {
    dia = "0"+dia;
  }
  var año = actual.getFullYear();
  var hoy = año+"-"+mes+"-"+dia;
  
  $.getJSON(url, {query: ""+query+""}).done(function(request) {
    //var usuarios = request.resultado;
    var total = parseInt(request.rows, 10);
    if (total >= 1) {
      
      var titulo = '<h2 id="titulo" class="encabezado">INGRESO DE MOVIMIENTOS</h2>';
      var formu = '<form method="post" action="movimiento.php">';
      var tabla = '<table class="tabla2" id="movimiento" name="movimiento">\n\
                    <caption>Formulario para agregar movimientos</caption>';
      var tr = '<th colspan="2" class="tituloTabla">MOVIMIENTO</th>';
      tr += '<tr>\n\
              <th><font class="negra">Fecha:</font></th>\n\
              <td align="center"><input type="date" name="fecha" id="fecha" title="Ingresar la fecha del movimiento" style="width:100%; text-align: center" min="2017-09-01" value="'+hoy+'"></td>\n\
            </tr>';
      tr += '<tr>\n\
              <th align="left"><font class="negra">Producto:</font></th>\n\
              <td align="center">\n\
                <input type="text" id="producto" name="producto" placeholder="Producto" title="Ingresar el producto" size="9" class="agrandar" tabindex="1" onkeyup=\'showHint(this.value, "#producto", "")\' value="'+hint+'">\n\
              </td>\n\
            </tr>';
      tr += '<tr>\n\
              <td colspan="2" align="center"><p id="gralHistory"></p></td>\n\
            </tr>';
      tr += '<tr>\n\
              <th align="left"><font class="negra">Tipo:</font></th>\n\
              <td align="center">\n\
                <select id="tipo" name="tipo" tabindex="4" style="width:100%" title="Seleccionar el tipo de movimiento" >\n\
                  <option value="Retiro" selected="yes">Retiro</option>\n\
                  <option value="Ingreso">Ingreso</option>\n\
                  <option value="Renovaci&oacute;n">Renovaci&oacute;n</option>\n\
                  <option value="Destrucci&oacute;n">Destrucci&oacute;n</option>\n\
                  <option value="AJUSTE Ingreso">AJUSTE Ingreso</option>\n\
                  <option value="AJUSTE Retiro">AJUSTE Retiro</option>\n\
                </select>\n\
              </td>\n\
            </tr>';
      tr += '<tr>\n\
              <th align="left"><font class="negra">Cantidad:</font></th>\n\
              <td align="center"><input type="text" id="cantidad" name="cantidad" placeholder="Cantidad" title="Ingresar la cantidad" class="agrandar" tabindex="3" maxlength="35" size="9"></td>\n\
            </tr>';
//      tr += '<tr>\n\
//              <th align="left"><font class="negra">Repetir Cantidad:</font></th>\n\
//              <td align="center"><input type="text" id="cantidad2" name="cantidad2" class="agrandar" maxlength="35" size="9"></td>\n\
//            </tr>';
      tr += '<tr>\n\
              <th align="left"><font class="negra">Comentarios:</font></th>\n\
              <td align="center"><textarea id="comentarios" name="comMov" placeholder="Comentarios" title="Ingresar un comentario" tabindex="2" class="agrandar" cols="15" rows="5" maxlength="250"></textarea></td>\n\
            </tr>';
//      tr += '<th colspan="2" class="centrado">CONTROL</th>';
//      tr += '<tr>\n\
//              <th align="left"><font class="negra">Control 1:</font></th>\n\
//              <td>\n\
//                <select id="usuarioBoveda" name="usuarioBoveda" style="width:100%">\n\
//                  <option value="ninguno" selected="yes">---Seleccionar---</option>';
//      for (var index in usuarios) 
//        {
//        tr += '<option value="'+usuarios[index]["iduser"]+'" name="'+usuarios[index]["nombre"]+' '+usuarios[index]['apellido']+'">'+usuarios[index]['nombre']+' '+usuarios[index]['apellido']+'</option>';
//      }
//      tr += '</select>\n\
//            </td>\n\
//          </tr>';
//      tr += '<tr>\n\
//              <th align="left"><font class="negra">Control 2:</font></th>\n\
//              <td>\n\
//                <select id="usuarioGrabaciones" name="usuarioGrabaciones" style="width: 100%">\n\
//                  <option value="ninguno" selected="yes">---Seleccionar---</option>';
//      for (var index in usuarios) 
//        {
//        tr += '<option value="'+usuarios[index]["iduser"]+'" name="'+usuarios[index]["nombre"]+' '+usuarios[index]['apellido']+'">'+usuarios[index]['nombre']+' '+usuarios[index]['apellido']+'</option>';
//      }
//      tr += '</select>\n\
//            </td>\n\
//          </tr>';
      tr += '<tr>\n\
              <td colspan="2" class="pieTabla">\n\
                <input type="button" value="ACEPTAR" id="agregarMovimiento" name="agregarMovimiento" title="Ejecutar la consulta" tabindex="5" class="btn btn-success" align="center"/>\n\
              </td>\n\
              <td style="display:none">\n\
                <input type="text" id="idPasado" name="idPasado" value="<?php echo $idPasado ?>">\n\
              </td>\n\
            </tr>';
      tabla += tr;
      tabla += '</table>';
      formu += titulo;
      formu += tabla;
      formu += '</form><br>';
      var mostrar = '';
      mostrar += formu;
      $(selector).html(mostrar);
      
      if ((tipo !== '') && (tipo !== undefined)){
        if ((tipo === 'Ingreso')||(tipo === 'Retiro')){
          $("#tipo option[value="+ tipo +"]").attr("selected",true);
        }
        else {
          $("#tipo option:contains('"+tipo+"')").attr("selected", true);
        }
      }
      
      if ((fecha !== '') && (fecha !== undefined)){
        $("#fecha").val(fecha);
      }
      
      if (prod !== "-1") {
        showHint(hint, "#producto", String(prod));
      }
      else {
        ///showHint(hint, "#producto", "");
        $("#producto").focus();
      }   
      
      setTimeout(function(){mostrarHistorialGeneral("#gralHistory")}, 0);
    }
  });    
}
/********** fin cargarMovimiento(selector, hint, prod, tipo, fecha) **********/

/**
 * @param {Boolean} agregarRepetido Booleano que indica si a pesar de haber un movimiento con idénticas características se agrega a la base de datos.
 * \brief Función que hace el agregado del movimiento en la base de datos. 
 *        Se separó del evento agregarMoviemiento para poder hacer el agregado al detectar el ENTER en el elemento cantidad.         
 */
function agregarMovimiento(agregarRepetido){
  verificarSesion('', 's');
  
  var url = "data/selectQuery.php";
  var ultimoRegistro = "select fecha, producto, tipo, cantidad from movimientos order by fecha desc, hora desc limit 1";
  $.getJSON(url, {query: ""+ultimoRegistro+""}).done(function(request) {
    var resultado = request["resultado"];
    var fechaAnterior = resultado[0]['fecha'];
    var tipoAnterior = resultado[0]['tipo'];
    var cantidadAnterior = parseInt(resultado[0]['cantidad'], 10);
    var idAnterior = resultado[0]['producto'];
    
    var fecha = $("#fecha").val();
    var idProd = $("#hint").val();
    var busqueda = $("#producto").val();
    var stockActual = -1;
    stockActual = parseInt($("#hint").find('option:selected').attr("stock"), 10);
    var alarma1 = parseInt($("#hint").find('option:selected').attr("alarma1"), 10);
    var alarma2 = parseInt($("#hint").find('option:selected').attr("alarma2"), 10);
    var tipo = $("#tipo").val();
    var cantidad = parseInt($("#cantidad").val(), 10);
    var comentarios = $("#comentarios").val();
    //var idUserBoveda = $("#usuarioBoveda").val();
    //var idUserGrabaciones = $("#usuarioGrabaciones").val();
    var tempDate = new Date();
    var minutos = parseInt(tempDate.getMinutes(), 10);
    var segs = parseInt(tempDate.getSeconds(), 10); 
    if (minutos < 10){
      minutos = "0"+minutos;
    }
    if (segs < 10){
      segs = "0"+segs;
    }
    var hora = tempDate.getHours()+":"+minutos+":"+segs;
    var nuevoStock = -1;
    nuevoStock = stockActual;

    /// Elimino el pop up de confirmación a pedido de Diego: 
    /// Esto elimina también la necesidad de chequear la variable confirmar en el if más abajo
    //var confirmar = confirm("¿Confirma el ingreso de los siguientes datos? \n\nFecha: "+fechaMostrar+"\nProducto: "+nombreProducto+"\nTipo: "+tipo+"\nCantidad: "+cantidad+"\nControl 1: "+userBoveda+"\nControl 2: "+userGrabaciones+"\nComentarios: "+comentarios);

    /// Si el movimiento NO es una devolución, calculo el nuevo stock. 
    // De serlo, NO se quita de stock pues las tarjetas se reponen (igualmente, por ahora no existe el tipo "Devolución"):
    if ((tipo !== 'Ingreso') && (tipo !== 'AJUSTE Ingreso')){
      nuevoStock -= cantidad;
    }
    if ((tipo === 'Ingreso') || (tipo === 'AJUSTE Ingreso')) {
      nuevoStock += cantidad;
    }

    var avisarAlarma1 = false;
    var avisarAlarma2 = false;
    var avisarInsuficiente = false;

    /// Si el nuevoStock es menor a 0, siginifica que no hay stock suficiente. Se alerta y se descuenta sólo la cantidad disponible.
    /// CAMBIO: La política actual es DEJAR en suspenso el movimiento hasta que haya stock suficiente. NO HAY QUE HACER EL MOVIMIENTO!!
    var seguir = validarMovimiento();
    var repetido = false;
    //alert('fecha: '+fecha+' - prod: '+idProd+' - cantidad: '+cantidad+' - tipo: '+tipo+'\nfecha: '+fechaAnterior+' - prod: '+idAnterior+' - cantidad: '+cantidadAnterior+' - tipo: '+tipoAnterior);
    if ((fecha === fechaAnterior)&&(idProd === idAnterior)&&(cantidad === cantidadAnterior)&&(tipo === tipoAnterior)){
      if (!agregarRepetido){
        $("#modalMovRepetido").modal("show");
        seguir = false;
        return;
      } 
    }
    
    if (nuevoStock <0) {
      //cantidad = stockActual;
      avisarInsuficiente = true;
      seguir = false;
      //nuevoStock = 0;
    }
    else {
      if ((nuevoStock < alarma1) && (nuevoStock > alarma2)) {
        avisarAlarma1 = true;
      }
      if (nuevoStock < alarma2) {
        avisarAlarma2 = true;
      }
    }
    
    if (seguir) {
      inhabilitarAgregado();
      var userSesion = $("#userID").val();
      var userControl;
      if (userSesion === 2){
        userControl = 3;
      }
      else {
        userControl = 2;
      }
      /// Agrego el movimiento según los datos pasados:
      var url = "data/updateQuery.php";
      var queries = new Array();
      var query = "insert into movimientos (producto, fecha, hora, tipo, cantidad, control1, control2, comentarios, estado) values ("+idProd+", '"+fecha+"', '"+hora+"', '"+tipo+"', "+cantidad+", "+userSesion+", "+userControl+", '"+comentarios+"', 'OK')";
      //alert(document.getElementById("usuarioSesion").value); --- USUARIO QUE REGISTRA!!!
      queries.push(query);
      var fechaTemp = fecha.split("-");
      var fechaMostrar = fechaTemp[2]+"/"+fechaTemp[1]+"/"+fechaTemp[0];
      var ultimoMovimiento = fechaMostrar+" "+hora+" - "+tipo+": "+cantidad;
      var query1 = "update productos set stock="+nuevoStock+", ultimoMovimiento='"+ultimoMovimiento+"' where idprod="+idProd;
      queries.push(query1);
      var jsonQuery = JSON.stringify(queries);
      var log = "SI";
      
      $.getJSON(url, {query: ""+jsonQuery+"", log: log}).done(function(request) {
        var resultado = request["resultado"];//alert('resultado: '+resultado);
        /// Si el agregado es exitoso, actualizo el stock y la fecha de la última modificación en la tabla Productos:
        if (resultado === "OK") {
//          if (avisarAlarma1) {
//            //alert('El stock quedó por debajo de la alarma1 definida!. \n\nStock actual: ' + nuevoStock);
//          }
//          else {
//            if (avisarAlarma2) {
//              //alert('El stock quedó por debajo de la alarma2 definida!. \n\nStock actual: ' + nuevoStock);
//            }
//            else {
//              if (avisarInsuficiente) {
//                //alert('Stock insuficiente!. \nSe descuenta sólo la cantidad existente. \n\nStock 0!!.');
//              }
//              else {
//                //alert('Registro agregado correctamente!. \n\nStock actual: '+nuevoStock);
//              }
//            }
//          }
          var tipo1 = encodeURI(tipo);
          window.location.href = "movimiento.php?h="+busqueda+"&id="+idProd+"&t="+tipo1+"&f="+fecha+"&c="+cantidad;
        }
        else {
          if (resultado === 'ERROR INSERT'){
            alert('Hubo un error en el ingreso del movimiento. Por favor verifique.');
          }
          else {
            alert('Hubo un error en la actualizacion del producto. Por favor verifique.');
          }  
        }
        habilitarAgregado(); 
      })  
      .fail(function(d, textStatus, error) {
        //alert('error: '+error+'\n'+textStatus+'\n'+d["resultado"]);
        alert("Hubo un ERROR en la respuesta del servidor.\nPor favor VERIFICAR si el movimiento Y la actualización del STOCK correspondiente se lograron completar!.\nDe lo contrario avise.");
      })
      .always(function() {
        //alert( "complete" );
        habilitarAgregado(); 
      });
    }
    else {
//      if (!repetido){
//        alert('Movimiento REPETIDO.\nNO se hace!');
//      }
      if (avisarInsuficiente) {
        alert('No hay stock suficiente del producto como para realizar el retiro.\n\n NO SE REALIZA!.');
      }  
    }
  });       
//}
}
/********** fin agregarMovimiento() **********/

/**
 * @param {Boolean} agregarCbioFecha Booleano que indica si a pesar de cambiar la fecha se modifica el movimiento.
 * \brief Función que hace la actualización del movimiento en la base de datos. 
 *        Se separó del evento actualizarMoviemiento para poder hacer el agregado al detectar el ENTER en el elemento comentarios.       
 */
function actualizarMovimiento(agregarCbioFecha){
  verificarSesion('', 's');
  var idmov = $("input[name='idMov']").val();
  var idprod = $("#idprod").val();
  var comentarios = $("#comentarios").val();
  var fecha = $("#fecha").val();
  var nombre = $("#nombre").val();
  $("#tipoEditarMov").attr('disabled', false);
  var tipo = $("#tipoEditarMov").val();
  var estadoMov = $("#estadoMov").val();
  var cantidad = parseInt($("#cantidad").val(), 10);
  var ultimoMovimiento = $("#ultimoMovimiento").val();
  var tempUltimo = ultimoMovimiento.split(" ");
  var fechita = tempUltimo[0];
  var horita = tempUltimo[1];
  var tipito = '';
  var cant = '';
  if (tempUltimo[3] === 'AJUSTE'){
    tipito = tempUltimo[3]+' '+tempUltimo[4];
    cant = tempUltimo[5];
  }
  else {
    tipito = tempUltimo[3];
    cant = tempUltimo[4];
  }
  
  var stockViejo = parseInt($("#stockViejo").val(), 10);
  var comentariosViejos = $("#comentariosViejos").val();
  var tipoViejo = $("#tipoViejo").val();
  var fechaVieja = $("#fechaVieja").val();
  var estadoMovViejo = $("#estadoMovViejo").val();
  
  var nuevoStock = stockViejo;
  var cambiarTipo = false;
  var cambiarComentarios = false;
  var cambiarFecha = false;
  var cambiarStock = false;
  var cambiarEstado = false;
  
  if (comentariosViejos !== comentarios){
    cambiarComentarios = true;
  }
  
  if (tipoViejo !== tipo){
    var tipoCambio = tipoViejo+'-'+tipo;
    cambiarTipo = true;
    switch (tipoCambio){
      case 'Retiro-Renovación': 
      case 'Renovación-Retiro': 
      case 'Retiro-Destrucción': 
      case 'Destrucción-Retiro':
      case 'Renovación-Destrucción': 
      case 'Destrucción-Renovación':    
      case 'Renovación-AJUSTE Retiro': 
      case 'AJUSTE Retiro-Renovación':
      case 'Destrucción-AJUSTE Retiro':
      case 'AJUSTE Retiro-Destrucción':
      case 'Ingreso-AJUSTE Ingreso':
      case 'AJUSTE Ingreso-Ingreso':
      case 'Retiro-AJUSTE Retiro': 
      case 'AJUSTE Retiro-Retiro': break;
      
      case 'AJUSTE Retiro-AJUSTE Ingreso':
      case 'AJUSTE Retiro-Ingreso':
      case 'Destrucción-AJUSTE Ingreso':                            
      case 'Destrucción-Ingreso':
      case 'Renovación-AJUSTE Ingreso':
      case 'Renovación-Ingreso':
      case 'Retiro-AJUSTE Ingreso':
      case 'Retiro-Ingreso':  nuevoStock = stockViejo + 2*cantidad;
                              cambiarStock = true;
                              break;
         
      case 'AJUSTE Ingreso-AJUSTE Retiro':
      case 'Ingreso-AJUSTE Retiro':
      case 'AJUSTE Ingreso-Destrucción': 
      case 'Ingreso-Destrucción':                        
      case 'AJUSTE Ingreso-Renovación':
      case 'Ingreso-Renovación':                          
      case 'AJUSTE Ingreso-Retiro':                        
      case 'Ingreso-Retiro':  nuevoStock = stockViejo - 2*cantidad;
                              cambiarStock = true;
                              break;                 
      default: cambiarTipo = false;
               break;
    }
  }
  
  if (estadoMov !== estadoMovViejo){
    cambiarEstado = true;
  }
  
  //alert('tipo viejo: '+tipoViejo+'\ntipo nuevo: '+tipo+'\ncomentarios viejo: '+comentariosViejos+'\ncomentarios nuevos: '+comentarios+'\nstock viejo: '+stockViejo+'\nnuevoStock: '+nuevoStock+'\nestado viejo: '+estadoMovViejo+'\nnuevoEstado: '+estadoMov);

  var hoy = new Date();
  var diaHoy = hoy.getDate();
  var mesHoy = hoy.getMonth()+1;
  if (diaHoy < 10) 
    {
    diaHoy = '0'+diaHoy;
  }                     
  if (mesHoy < 10) 
    {
    mesHoy = '0'+mesHoy;
  }
  var hoyFecha = hoy.getFullYear()+'-'+mesHoy+'-'+diaHoy;
  var validar = true;
  if (fecha === ''){
    alert('Por favor ingrese la fecha del movimiento.');
    $("#fecha").focus();
    validar = false;
  }
  else {
    if (fecha > hoyFecha){
      alert('La fecha seleccionada es posterior al día de hoy. \n¡Por favor verifique!.');
      $("#fecha").focus();
      validar = false;
    }
    else {
      if (fecha !== fechaVieja){
        if (!agregarCbioFecha){
          $("#modalCbioFecha").modal("show");
          validar = false;
          return;
        }    
      }
    }
  }
  
  ///Se comenta la validación del movimiento pues por el momento SÓLO se puede EDITAR el comentario el cual es opcional.
  ///De en un futuro querer editar algo más habrá que crear la función validarMovimiento. Se setea la variable validar a TRUE
  //var validar = validarMovimiento();
  //var validar = true;
  
  if (validar) {
    var confirmar;
    if (agregarCbioFecha){
      confirmar = true;
      cambiarFecha = true;
    }  
    else {
      confirmar = confirm('¿Confirma la modificación del movimiento con los siguientes datos?\n\nFecha: '+fecha+'\nHora: '+horita+'\nProducto: '+nombre+'\nTipo: '+tipo+'\nCantidad: '+cantidad+'\nComentarios: '+comentarios+"\n?");
    }

    if (confirmar) {
      // Según lo que se haya o no cambiado, armo la consulta para la actualización del MOVIMIENTO:
      if (cambiarFecha || cambiarComentarios || cambiarTipo || cambiarEstado){
        var url = "data/updateQuery.php";
        var query = 'update movimientos set ';
        
        if (cambiarFecha){
          query += 'fecha="'+fecha+'"';// where idmov='+idmov;
          if (cambiarTipo){
            query += ', tipo="'+tipo+'"';
            if (cambiarComentarios){
              query += ', comentarios="'+comentarios+'"';
              if (cambiarEstado){
                query += ', estado="'+estadoMov+'"';
              }
            }
            else {
              if (cambiarEstado){
                query += ', estado="'+estadoMov+'"';
              }
            }
          }
          else {
            if (cambiarComentarios){
              query += ', comentarios="'+comentarios+'"';
              if (cambiarEstado){
                query += ', estado="'+estadoMov+'"';
              }
            }
            else {
              if (cambiarEstado){
                query += ', estado="'+estadoMov+'"';
              }
            }
          }
        }
        else {
          if (cambiarTipo){
            query += 'tipo="'+tipo+'"';
            if (cambiarComentarios){
              query += ', comentarios="'+comentarios+'"';
              if (cambiarEstado){
                query += ', estado="'+estadoMov+'"';
              }
            }
            else{
              if (cambiarEstado){
                query += ', estado="'+estadoMov+'"';
              }
            }
          }
          else {
            if (cambiarComentarios){
              query += 'comentarios="'+comentarios+'"';
              if (cambiarEstado){
                query += ', estado="'+estadoMov+'"';
              }
            }
            else {
              query += ' estado="'+estadoMov+'"';
            }
          }
        }
        query += ' where idmov='+idmov;
           
        var log = "SI";
        //alert(query);
        var jsonQuery = JSON.stringify(query);
        $.getJSON(url, {query: ""+jsonQuery+"", log: log}).done(function(request) {
          var resultado = request["resultado"];
          //var mensaje = request['mensaje'];//alert(mensaje);
          if (resultado === "OK") {
            ///si se hizo la actualización de los datos y se cambió la fecha o el tipo 
            ///hay que actualizar los parámetros del último movimiento.
            ///Además, si hubo cambio en el stock, también hay que ajustarlo en la tabla de PRODUCTOS:
            ///(ESTA OPCIÓN AÚN NO ESTÁ HABILITADA!!!!)
            if (cambiarFecha || cambiarStock || cambiarTipo){
              var ultMov = 'ultimoMovimiento="';
              var query = 'update productos set ';
              //if ((cambiarFecha)&&(fecha > fechaAnterior)){
              if (cambiarFecha){  
                //alert('anterior: '+fechaAnterior+'\nnueva: '+fecha); 
                var tempFecha = fecha.split("-");
                var fechaUltimo = tempFecha[2]+'/'+tempFecha[1]+'/'+tempFecha[0];
                //query += 'ultimoMovimiento="'+fechaUltimo+' '+restoUltimo+'"';
                ultMov += fechaUltimo;
              }
              else {
                ultMov += fechita;
              }
              ultMov += ' '+horita+' - ';
              if (cambiarTipo){
                ultMov += tipo+':';
              }
              else {
                ultMov += tipito;
              }
              ultMov += ' '+cant;
              query += ultMov+'"';
              
              if (cambiarStock){
                query += ', stock='+nuevoStock+'';
              }
              
              ///Caso casi improbable en que SÓLO haya habido cambio de stock
              ///Ver de quitar, pues para que haya habido necesariamente tiene que haber habido cambio de tipo....
              if ((cambiarStock)&&!(cambiarFecha)&&!(cambiarTipo)) {
                query += 'stock='+nuevoStock+'';
              }
              
              query += ' where idprod='+idprod+'';
              var jsonQuery = JSON.stringify(query);
              //alert(query);
              $.getJSON(url, {query: ""+jsonQuery+"", log: log}).done(function(request) {
                var resultado1 = request["resultado"];
                if (resultado1 === "OK") {
                  alert('¡Los datos del movimiento se actualizaron correctamente!.');
                  $("#modalCbioFecha").modal("hide");
                  $("#estadoMovViejo").val(estadoMov);
                  $("#comentariosViejos").val(comentarios);
                  $("#tipoViejo").val(tipo);
                  $("#fechaVieja").val(fecha);
                  setTimeout(function(){cargarEditarMovimiento(idmov, "main-content")}, 20);
                  inhabilitarMovimiento();
                }
                else {
                  alert('Hubo un problema en la actualización del campo último movimiento.\nLos datos del MOVIMIENTO YA se actualizaron.\n¡Por favor verifique!.');
                }
              });
            }
            // si no se cambió la fecha, se confirma modificación del resto y termina:
            else {
              alert('¡Los datos del movimiento se actualizaron correctamente!.');
              $("#estadoMovViejo").val(estadoMov);
              $("#comentariosViejos").val(comentarios);
              $("#tipoViejo").val(tipo);
              $("#fechaVieja").val(fecha);
              setTimeout(function(){cargarEditarMovimiento(idmov, "main-content")}, 20);
              inhabilitarMovimiento();
            }  
          }
          else {
            alert('Hubo un problema en la actualización de los datos del movimiento.\n¡Por favor verifique!.');
          }
        });
      }// if or cambiarFecha, cambiarTipo, cambiarComentarios, cambiarEstado     
      else {
        alert('¡NO hubo modificaciones al movimiento!.');
        inhabilitarMovimiento();
      }
    }// if confirmar
  }// if validar
  //}
}
/********** fin actualizarMovimiento() **********/

/**
  \brief Función que deshabilita algunos controles para evitar dobles ingresos.
*/
function inhabilitarAgregado(){
  document.getElementById("agregarMovimiento").disabled = true;
}
/********** fin inhabilitarAgregado() **********/

/**
  \brief Función que habilita los input del form agregarMovimiento.
*/
function habilitarAgregado(){
  document.getElementById("agregarMovimiento").disabled = false;
}
/********** fin habilitarAgregado() **********/

/**
  \brief Función que deshabilita los input del form editarMovimiento.
*/
function inhabilitarMovimiento(){
  document.getElementById("fecha").disabled = true;
  document.getElementById("hora").disabled = true;
  document.getElementById("nombre").disabled = true;
  document.getElementById("tipoEditarMov").disabled = true;
  document.getElementById("cantidad").disabled = true;
  document.getElementById("estadoMov").disabled = true;
  document.getElementById("comentarios").disabled = true;
  document.getElementById("editarMovimiento").value = "EDITAR";
  document.getElementById("actualizarMovimiento").disabled = true;
}
/********** fin inhabilitarMovimiento() **********/

/**
  \brief Función que habilita los input del form editarMovimiento.
*/
function habilitarMovimiento(){
  ///******* Queda hecho para poder editar el resto de los campos, pero la idea es SOLO poder editar los comentarios. **********
  ///******* Ahora (17/5/2018) se agrega también la edición de la fecha por lo que también se habilita la misma. ***************
  document.getElementById("fecha").disabled = false;
  document.getElementById("tipoEditarMov").disabled = false;
  document.getElementById("estadoMov").disabled = false;
  //document.getElementById("hora").disabled = false;
  //document.getElementById("nombre").disabled = false;
  //document.getElementById("cantidad").disabled = false;
  document.getElementById("comentarios").disabled = false;
  document.getElementById("editarMovimiento").value = "BLOQUEAR";
  document.getElementById("actualizarMovimiento").disabled = false;
}
/********** fin habilitarMovimiento() **********/

/**
  \brief Función que carga en el selector pasado como parámetro la tabla para ver el movimiento.
  @param {String} selector String con el selector en donde se debe mostrar la tabla.
  @param {Integer} idMov Entero con el identificador del movimiento a cargar.
*/
function cargarEditarMovimiento(idMov, selector){
  var url = "data/selectQuery.php";
  var query = 'select movimientos.fecha, movimientos.hora, movimientos.cantidad, movimientos.comentarios, movimientos.tipo, movimientos.estado as estadoMov, productos.entidad, productos.codigo_emsa, productos.nombre_plastico, productos.ultimoMovimiento, productos.idprod, productos.stock from movimientos inner join productos on movimientos.producto=productos.idprod where movimientos.idmov='+idMov;
  
  $.getJSON(url, {query: ""+query+""}).done(function(request) {
    var resultado = request["resultado"];
    var total = request["rows"];
    if (total >= 1) {
      var cantidad = parseInt(resultado[0]['cantidad'], 10);
      var stockViejo = parseInt(resultado[0]['stock'], 10);
      var idprod = parseInt(resultado[0]['idprod']);
      var fecha = resultado[0]['fecha'];
      var ultimoMovimiento = resultado[0]['ultimoMovimiento'];
      var estadoMov = resultado[0]['estadoMov'];
      var estadoERROR = '';
      var estadoOK = '';
      switch (estadoMov){
        case 'OK': estadoOK = 'selected';
                   break;
        case 'ERROR': estadoERROR = 'selected';
                      break;
        default: alert('en default');break;
      }
      //var fecha = '';
      var hora = '';
//      if (fechaTemp !== null) {
//        var temp = fechaTemp.split('-');
//        fecha = temp[2]+"/"+temp[1]+"/"+temp[0];
//      }
      var horaTemp = resultado[0]['hora'];
      if (horaTemp !== null) {
        var temp = horaTemp.split(':');
        hora = temp[0]+":"+temp[1];
      }
      var tipo = resultado[0]['tipo'];
      var codigo = resultado[0]['codigo_emsa'];
      var entidad = resultado[0]['entidad'];
      var comentarios = resultado[0]['comentarios'];
      if ((comentarios === 'undefined')||(comentarios === null)){
        comentarios = '';
      }
      var producto = resultado[0]['nombre_plastico'];
    }
    var mostrar = "";
    var titulo = '<h2 id="titulo" class="encabezado">EDICIÓN DE MOVIMIENTOS</h2>';
    var formu = '<form method="post" action="editarMovimiento.php">';
    var tabla = '<table class="tabla2" name="editarMovimiento">\n\
                  <caption>Formulario para editar el movimiento</caption>';
    var tr = '<th colspan="3" class="centrado tituloTabla">DATOS DEL MOVIMIENTO</th>';
    var selRetiro = '';
    var selReno = '';
    var selIngreso = '';
    var selDestruccion = '';
    var selAjusteRetiro = '';
    var selAjusteIngreso = '';
    var habilitarEgreso = ' disabled';
    var habilitarIngreso = ' disabled';

    switch (tipo){
      case 'Retiro': selRetiro = 'selected';
                     habilitarEgreso = '';
                     break;
      case 'Renovación':  selReno = 'selected';
                          habilitarEgreso = '';
                          break;
      case 'Ingreso': selIngreso = 'selected';
                      habilitarIngreso = '';
                      break;
      case 'Destrucción': selDestruccion = 'selected';
                          habilitarEgreso = '';
                          break;
      case 'AJUSTE Retiro': selAjusteRetiro = 'selected';
                            habilitarEgreso = '';
                            break;
      case 'AJUSTE Ingreso': selAjusteIngreso = 'selected';
                             habilitarIngreso = ' ';
                             break;                  
      default: break;
    }
    

    tr += '<tr>\n\
            <th align="left" width="15"><font class="negra">Fecha:</font></th>\n\
            <td align="center" colspan="2"><input type="date" name="fecha" id="fecha" title="Elegir fecha del movimiento\n" placeholder="Fecha" class="agrandar" style="width:100%; text-align: center"></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Hora:</font></th>\n\
              <td align="center" colspan="2"><input type="text" name="hora" id="hora" title="Elegir la hora del movimiento\n(NO editable)" placeholder="Hora" class="agrandar" maxlength="35" style="width:100%; text-align: center" disabled></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Estado:</font></th>\n\
              <td align="center" colspan="2">\n\
                <select id="estadoMov" name="estadoMov" tabindex="10" style="width:100%" title="Cambiar el estado del movimiento" placeholder="Estado del movimiento" >\n\
                  <option value="OK" '+estadoOK+'>OK</option>\n\
                  <option value="ERROR" '+estadoERROR+'>ERROR</option>\n\
                </select>\n\
              </td>\n\
          </tr>';              
    tr += '<tr>\n\
              <th align="left"><font class="negra">Entidad:</font></th>\n\
              <td align="center" colspan="2"><input type="text" name="entidad" id="entidad" title="Ingresar la entidad del producto\n(NO editable)" placeholder="Entidad" class="agrandar" maxlength="75" style="width:100%; text-align: center" disabled></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Nombre:</font></th>\n\
              <td align="center" colspan="2"><input type="text" name="nombre" id="nombre" title="Ingresar el nombre del producto\n(NO editable)" placeholder="Producto" class="agrandar" maxlength="75" style="width:100%; text-align: center" disabled></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">C&oacute;digo:</font></th>\n\
              <td align="center" colspan="2"><input type="text" name="codigo" id="codigo" title="Ingresar el código del producto\n(NO editable)" placeholder="Código" class="agrandar" maxlength="75" style="width:100%; text-align: center" disabled></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Tipo:</font></th>\n\
              <td align="center">\n\
                <select id="tipoEditarMov" name="tipoEditarMov" tabindex="4" style="width:100%" title="Seleccionar el tipo de movimiento" placeholder="Tipo de movimiento" >\n\
                  <option value="Retiro" '+selRetiro+habilitarEgreso+'>Retiro</option>\n\
                  <option value="Ingreso" '+selIngreso+habilitarIngreso+'>Ingreso</option>\n\
                  <option value="Renovaci&oacute;n" '+selReno+habilitarEgreso+'>Renovaci&oacute;n</option>\n\
                  <option value="Destrucci&oacute;n" '+selDestruccion+habilitarEgreso+'>Destrucci&oacute;n</option>\n\
                  <option value="AJUSTE Retiro" '+selAjusteRetiro+habilitarEgreso+'>AJUSTE Retiro</option>\n\
                  <option value="AJUSTE Ingreso" '+selAjusteIngreso+habilitarIngreso+'>AJUSTE Ingreso</option>\n\
                </select>\n\
              </td>\n\
            </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Cantidad:</font></th>\n\
              <td align="center" colspan="2"><input type="text" id="cantidad" name="cantidad" title="Ingresar la cantidad" placeholder="Cantidad" class="agrandar" maxlength="35" size="9" disabled></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Comentarios:</font></th>\n\
              <td align="center" colspan="2"><textarea id="comentarios" name="comEditMov" title="Ingresar los comentarios del movimiento" placeholder="Comentarios" tabindex="1" class="agrandar" rows="3" cols="18" maxlength="250"></textarea></td>\n\
          </tr>';
    tr += '<tr>\n\
              <td class="pieTablaIzquierdo" style="width: 50%;border-right: 0px;"><input type="button" value="BLOQUEAR" id="editarMovimiento" name="editarMovimiento" title="Habilitar/Deshabilitar la edición del movimiento" class="btn btn-primary" align="center"/></td>\n\
              <td class="pieTablaDerecho" style="width: 50%;border-left: 0px;"><input type="button" value="ACTUALIZAR" id="actualizarMovimiento" name="actualizarMovimiento" title="Realizar la edición del movimiento" tabindex="2" class="btn btn-warning" align="center"/></td>\n\
              <td style="display:none"><input type="text" name="idMov" value="'+idMov+'"></td>\n\
              <td style="display:none"><input type="text" id="fechaVieja" name="fechaVieja" value="'+fecha+'"></td>\n\
              <td style="display:none"><input type="text" id="idprod" name="idprod" value="'+idprod+'"></td>\n\
              <td style="display:none"><input type="text" id="tipoViejo" name="tipoViejo" value="'+tipo+'"></td>\n\
              <td style="display:none"><input type="text" id="estadoMovViejo" name="estadoMovViejo" value="'+estadoMov+'"></td>\n\
              <td style="display:none"><input type="text" id="comentariosViejos" name="comentariosViejos" value="'+comentarios+'"></td>\n\
              <td style="display:none"><input type="text" id="ultimoMovimiento" name="ultimoMovimiento" value="'+ultimoMovimiento+'"></td>\n\
              <td style="display:none"><input type="text" id="stockViejo" name="stockViejo" value="'+stockViejo+'"></td>\n\
              <td style="display:none"><input type="text" id="cantidad" name="cantidad" value="'+cantidad+'"></td>\n\
          </tr>';
    tabla += tr;
    tabla += '</table>';
    
    formu += tabla;
    formu += '</form>';
    mostrar += titulo;
    mostrar += formu;
    //var volver = '<br><a href="busquedas.php" name="volver" id="volverEdicionMovimiento" title="Volver a BÚSQUEDAS">Volver</a><br><br>';
    var volver = '<a href="#" name="volver" id="volverEdicionMovimiento" title="Cerrar la ventana" onclick="javascript:window.close()">Cerrar</a><br><br>';
    mostrar += volver;
    $(selector).html(mostrar);
  
    if (total >=1) {
      $("#fecha").val(fecha);
      $("#hora").val(hora);
      $("#entidad").val(entidad);
//      if (selIngreso === 'selected'){
//        $("#tipo").val('Ingreso');
//      }
//      else {
//        if (selAjusteIngreso === 'seleceted'){
//          $("#tipo").val('AJUSTE Ingreso');
//        }
//        else {
//          $("#tipo").val(tipo);
//        }
//      }
      if ((tipo === 'Ingreso')||(tipo === 'AJUSTE Ingreso')||(tipo === 'AJUSTE Retiro')){
        //$("#tipo").attr('disabled', true);
      }
      $("#nombre").val(producto);
      $("#codigo").val(codigo);
      $("#cantidad").val(cantidad.toLocaleString());
      $("#comentarios").val(comentarios);
    }
    
    $("#comentarios").attr("autofocus", true);
  }); 
}
/********** fin cargarEditarMovimiento(idMov, selector) **********/

/***********************************************************************************************************************
/// ********************************************* FIN FUNCIONES MOVIMIENTOS ********************************************
************************************************************************************************************************
**/



/***********************************************************************************************************************
/// ************************************************* FUNCIONES USUARIOS ***********************************************
************************************************************************************************************************
*/

/**
 * \brief Función que carga en el form pasado como parámetro todos los usuarios.
 * @param {String} selector String con el DIV donde se deben de cargar los datos.
 * @param {Int} user Id del usuario a resaltar en el listado.
 */ 
function cargarUsuarios(selector, user){
  var url = "data/selectQuery.php";
  var query = "select idusuarios, apellido, nombre, empresa from usuarios where estado='activo' order by empresa asc, apellido asc, idusuarios asc";
  
  $.getJSON(url, {query: ""+query+""}).done(function(request) {
    var usuario = request.resultado;
    var total = parseInt(request.rows, 10);
    var encabezado = '<h2 id="titulo" class="encabezado">LISTADO DE USUARIOS</h2>';
    var cargar = '';
    cargar += encabezado;
    if (total >= 1) {
      var tabla = '<table id="usuarios" name="usuarios" class="tabla2">';
      var tr = '<tr>\n\
                  <th colspan="4" class="tituloTabla">USUARIOS</th>\n\
                </tr>';
      tr += '<tr>\n\
                <th>Ítem</th>\n\
                <th>Apellido</th>\n\
                <th>Nombre</th>\n\
                <th>Empresa</th>\n\
            </tr>';
      for (var index in usuario) {
        var nombre = usuario[index]["nombre"];
        var apellido = usuario[index]["apellido"];
        var empresa = usuario[index]["empresa"];
        var id = usuario[index]["idusuarios"];
        var i = parseInt(index, 10) + 1;
        var clase = '';
        if ((id !== 0) && (id === user)){
                clase = 'resaltado';
            }
            else {
              clase = '';
            }
        tr += '<tr>\n\
                  <td>'+i+'</td>\n\
                  <td><a href="#" id="'+id+'" class="detailUser '+clase+'">'+apellido+'</a></td>\n\
                  <td><a href="#" id="'+id+'" class="detailUser '+clase+'">'+nombre+'</a></td>\n\
                  <td><b>'+empresa+'</b></td>\n\
              </tr>';
      }
      tr += '<tr>\n\
                <td class="pieTabla" colspan="4"><input type="button" value="NUEVO" id="nuevoUsuario" class="btn-success"></td>\n\
             </tr>';
      tr += '</table>';
      tabla += tr;
      cargar += tabla;
      $(selector).html(cargar);
    }
    else {
      var texto = '<h2>Ya NO quedan usuarios activos!.</h2>';
      cargar += texto;
      vaciarContent("#main-content");
      $("#main-content").html(cargar);
    }    
    
  });
}
/********** fin cargarUsuarios(selector, user) **********/

/**
  \brief Función que recupera y carga los datos del usuario pasado como parámetro.
  @param {Int} user Entero con el índice del usuario a recuperar.
*/
function cargarDetalleUsuario(user) {
  var url = "data/selectQuery.php"; 
  var query = "select nombre, apellido, empresa, mail, telefono, observaciones from usuarios where idusuarios='"+user+"' limit 1";
  
  $.getJSON(url, {query: ""+query+""}).done(function(request) {
    var usuario = request.resultado[0];
    var nombre = usuario["nombre"];
    var apellido = usuario["apellido"];
    var empresa = usuario["empresa"];
    var mail = usuario["mail"];if (mail === null) mail = '';
    var tel = usuario["telefono"];if (tel === null) tel = '';
    var obs = usuario["observaciones"];if (obs === null) obs = '';
    if (parseInt($("#content").length, 10) === 0) {
      var divs = "<div id='fila' class='row'>\n\
                    <div id='selector' class='col-md-6 col-sm-12'></div>\n\
                    <div id='content' class='col-md-6 col-sm-12'></div>\n\
                  </div>";
      $("#main-content").empty();
      $("#main-content").append(divs);
    }
    cargarUsuarios('#selector', user);
    $("#selector").css('padding-right', '30px');
    
    var emsa = '';
    var bbva = '';
    var itau = '';
    var scotia = '';
    switch (empresa) {
      case "EMSA": emsa = 'selected';
                   break;
      case "BBVA": bbva = 'selected';
                   break;
      case "ITAU": itau = 'selected';
                   break;
      case "SCOTIA": scotia = 'selected';
                     break;
      default: break;               
    }
    var formu = '<form name="userDetail" id="userDetail" method="post" action="exportar.php" class="exportarForm">';
    var tabla = '<table id="detalleUsuario" name="detalleUsuario" class="tabla2">';
    var tr = '<tr>\n\
                <th colspan="4" class="tituloTabla">DATOS DEL USUARIO</th>\n\
              </tr>';
    tr += '<tr>\n\
              <th>Apellido</th>\n\
              <td><input id="apellido" name="apellido" class="resaltado" type="text" value="'+apellido+'" disabled="true"></td>\n\
              <th>Nombre</th>\n\
              <td><input id="nombre" name="nombre" class="resaltado" type="text" value="'+nombre+'" disabled="true"></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th>Empresa</th>\n\
              <td colspan="3">\n\
                <select id="empresa" name="empresa" style="width:100%" disabled="true">\n\
                  <option value="seleccionar">---SELECCIONAR---</option>\n\
                  <option value="EMSA" '+emsa+'>EMSA</option>\n\
                  <option value="BBVA" '+bbva+'>BBVA</option>\n\
                  <option value="ITAU" '+itau+'>ITAU</option>\n\
                  <option value="SCOTIA" '+scotia+'>SCOTIA</option>\n\
                </select>\n\
              </td>\n\
          </tr>';
    tr += '<tr>\n\
              <th>Mail</th>\n\
              <td colspan="3"><input id="mail" name="mail" type="text" value="'+mail+'" disabled="true"></td>\n\
           </tr>';
    tr += '<tr>\n\
              <th>Teléfono</th>\n\
              <td colspan="3"><input id="telefono" name="telefono" type="text" value="'+tel+'" disabled="true"></td>\n\
           </tr>';
    tr += '<tr>\n\
              <th>Observaciones</th>\n\
              <td colspan="3"><textarea id="observaciones" name="observaciones" disabled="true">'+ obs +'</textarea></td>\n\
           </tr>';
    tr += '<tr>\n\
              <td class="pieTablaIzquierdo"><input type="button" id="editarUsuario" name="editarUsuario" value="EDITAR" onclick="cambiarEdicion()" class="btn-info"></td>\n\
              <td colspan="1"><input type="button" id="actualizarUsuario" name="actualizarUsuario" disabled="true" value="ACTUALIZAR" class="btn-warning"></td>\n\
              <td colspan="1"><input type="button" id="7" name="exportarUsuario" value="EXPORTAR" class="btn-info exportar"></td>\n\
              <td class="pieTablaDerecho"><input type="button" id="eliminarUsuario" name="eliminarUsuario" value="ELIMINAR" class="btn-danger"></td>\n\
              <td style="display:none"><input type="text" id="fuente" name="fuente" value="usuario"></td>\n\
              <td style="display:none"><input type="text" id="param" name="param" value=""></td>\n\
              <td style="display:none"><input type="text" id="iduser" name="iduser" value="'+user+'"></td>\n\
          </tr>'; 
    tr += '</table>';
    tr += '</form>';
    tabla += tr;
    var encabezado = '<h3 id="titulo" class="encabezado">DETALLES DEL USUARIO</h3>';
    var cargar = '';
    cargar += encabezado;
    cargar += formu;
    cargar += tabla;
    $("#content").html(cargar);
  });
}
/********** fin cargarDetalleUsuario(user) **********/

/**
  \brief Función que deshabilita los input del form Usuario.
*/
function inhabilitarUsuario(){
  document.getElementById("nombre").disabled = true;
  document.getElementById("apellido").disabled = true;
  document.getElementById("empresa").disabled = true;
  document.getElementById("mail").disabled = true;
  document.getElementById("telefono").disabled = true;
  document.getElementById("observaciones").disabled = true;
  document.getElementById("editarUsuario").value = "EDITAR";
  document.getElementById("actualizarUsuario").disabled = true;
}
/********** fin inhabilitarUsuario() **********/

/**
  \brief Función que habilita los input del form Usuario.
*/
function habilitarUsuario(){
  document.getElementById("nombre").disabled = false;
  document.getElementById("apellido").disabled = false;
  document.getElementById("empresa").disabled = false;
  document.getElementById("mail").disabled = false;
  document.getElementById("telefono").disabled = false;
  document.getElementById("observaciones").disabled = false;
  document.getElementById("editarUsuario").value = "BLOQUEAR";
  document.getElementById("actualizarUsuario").disabled = false;
}
/********** fin habilitarUsuario() **********/

/**
 * \brief Función que valida los datos pasados para el usuario.
 * @returns {Boolean} Devuelve un booleano que indica si se pasó o no la validación de los datos para el usuario.
 */
function validarUsuario() {
  var seguir = false;
  
  if (parseInt($("#nombre").length, 10) === 0)
    {
    alert('Debe ingresar el nombre del usuario.');
    document.getElementById("nombre").focus();
    seguir = false;
  }
  else
    {
    if (parseInt($("#apellido").length, 10) === 0)
      {
      alert('Debe ingresar el apellido del usuario.');
      document.getElementById("apellido").focus();
      seguir = false;
    } 
    else
      {
      if (parseInt($("#empresa").length, 10) === 0)
        {
        alert('Debe ingresar la empresa donde trabaja el usuario.');
        document.getElementById("empresa").focus();
        seguir = false;
      }
      else
        {
        if (document.getElementById("empresa").value === 'seleccionar')
          {
          alert('Debe seleccionar una empresa.');
          document.getElementById("empresa").focus();
          seguir = false;
        }
        else
          {
          seguir = true;
        }// empresa = seleccionar  
      }// empresa
    }// apellido
  }// nombre
  
  if (seguir) return true;
  else return false;
}
/********** fin validarUsuario() **********/

/**
 * \brief Función que primero valida la info ingresada, y de ser válida, hace la actualización del pwd del usuario del sistema.
 */
function actualizarUser() {
    verificarSesion('', 's');
    
    var pw1 = $("#pw1").val();
    var pw2 = $("#pw2").val();

    if (pw1 === ''){
      alert('La contraseña 1 NO puede estar vacía.\nPor favor verifique.');
      $("#pw1").focus();
    }
    else {
      if (pw2 === ''){
        alert('La contraseña 2 NO puede estar vacía.\nPor favor verifique.');
        $("#pw2").focus();
      }
      else {
        if (pw1 !== pw2) {
          alert('Las contraseñas ingresadas NO son iguales.\nPor favor verifique.');
          $("#pw1").val('');
          $("#pw2").val('');
          $("#pw1").focus();
        }
        else {
          //alert('hay que actualizar a: '+$("#usuarioSesion").val()+'\nID: '+$("#userID").val());
          /******** COMENTO PARTE DEL USUARIO POR AHORA **********************/
          ///var user = $("#nombreUser").val();
          var iduser = $("#userID").val();
          var url = "data/updateQuery.php";
          var query = 'update appusers set password=sha1("'+pw1+'") ';
          /*
          if (user !== ''){
            query += ', user="'+user+'" ';
          }
          */
          query += 'where id_usuario='+iduser;
          var log = "NO";
          var jsonQuery = JSON.stringify(query);
          //alert(query);
          $.getJSON(url, {query: ""+jsonQuery+"", log: log}).done(function(request) {
            var resultado = request["resultado"];
            if (resultado === "OK") {
              alert('Los datos se modificaron correctamente!.');
              $("#modalPwd").modal("hide");
              //cargarEditarMovimiento(idmov, "main-content");
              //inhabilitarMovimiento();
            }
            else {
              alert('Hubo un problema en la actualización. Por favor verifique.');
            }
            
          });
        }
      }
    }
  //}
}
/********** fin actualizarUser() **********/

/**
 * \brief Función que primero valida la info ingresada, y de ser válida, hace la actualización de los parámetros del usuario.
 */
function actualizarParametros()  {
    verificarSesion('', 's');
    
    ///Recupero parámetros pasados por el usuario:
    var pageSize = $("#pageSize").val();
    var limiteSelects = $("#tamSelects").val();
    var limiteHistorialGeneral = $("#tamHistorialGeneral").val();
    var limiteHistorialProducto = $("#tamHistorialProducto").val();
    
    var limiteMaximoPagina = 1000;
    var limiteMaximoHistoriales = 50;
    var limiteMaximoSelects = 50;
    
    ///Valido que sean válidos:
    var validarPage = validarEntero(pageSize);
    var seguir = true;
    if ((pageSize <= 0) || (pageSize > limiteMaximoPagina) || (pageSize === "null") || (!validarPage)){
      alert('El tamaño de la página DEBE ser un entero entre 1 y '+limiteMaximoPagina+'.\nPor favor verifique.');
      seguir = false;
      $("#pageSize").focus();
    }
    else {
      var validarHistorialGeneral = validarEntero(limiteHistorialGeneral);
      if ((limiteHistorialGeneral <= 0) || (limiteHistorialGeneral > limiteMaximoHistoriales) || (limiteHistorialGeneral === "null") || (!validarHistorialGeneral)){
        alert('El valor para el HISTORIAL GENERAL DEBE ser un entero 1 y '+limiteMaximoHistoriales+'.\nPor favor verifique.');
        seguir = false;
        $("#tamHistorialGeneral").focus();
      }
      else {
        var validarHistorialProducto = validarEntero(limiteHistorialProducto);
        if ((limiteHistorialProducto <= 0) || (limiteHistorialProducto > limiteMaximoHistoriales) || (limiteHistorialProducto === "null") || (!validarHistorialProducto)){
          alert('El valor para el HISTORIAL del PRODUCTO DEBE ser un entero entre 1 y '+limiteMaximoHistoriales+'.\nPor favor verifique.');
          seguir = false;
          $("#tamHistorialProducto").focus();
        }
        else {
          var validarLimiteSelects = validarEntero(limiteSelects);
          if ((limiteSelects <= 0) || (limiteSelects > limiteMaximoSelects) || (limiteSelects === "null") || (!validarLimiteSelects)){
            alert('El tamaño máximo para los selects DEBE ser un entero entre 1 y '+limiteMaximoSelects+'.\nPor favor verifique.');
            seguir = false;
            $("#tamSelects").focus();
          }
          else {
            seguir = true;
          }  
        }
      }
    }///***************** FIN validación **************
    
    if (seguir) {
      var url = "data/updateParametros.php";
      var log = "NO";
      
      pageSize = parseInt(pageSize, 10);
      limiteSelects = parseInt(limiteSelects, 10);
      limiteHistorialGeneral = parseInt(limiteHistorialGeneral, 10);
      limiteHistorialProducto = parseInt(limiteHistorialProducto, 10);
      var paginaVieja = parseInt($("#tamPagina").val(), 10);
      var limiteViejoSelects = parseInt($("#limiteSelects").val(), 10);
      var historialViejoProducto = parseInt($("#limiteHistorialProducto").val(), 10);
      var historialViejoGeneral = parseInt($("#limiteHistorialGeneral").val(), 10);
      
      var cambioPagina = true;
      var cambioSelects = true;
      var cambioHistorialProducto = true;
      var cambioHistorialGeneral = true;
        
      if (paginaVieja === pageSize){
        cambioPagina = false;
        pageSize = -1;
      }
      
      if (limiteViejoSelects === limiteSelects){
        cambioSelects = false;
        limiteSelects = -1;
      }
      
      if (historialViejoProducto === limiteHistorialProducto){
        cambioHistorialProducto = false;
        limiteHistorialProducto = -1;
      }
      
      if (historialViejoGeneral === limiteHistorialGeneral){
        cambioHistorialGeneral = false;
        limiteHistorialGeneral = -1;
      }
      
      //alert('Valores a cambiar:\nPagina: '+pageSize+'\nHistorial General: '+limiteHistorialGeneral+'\nHistorial Producto: '+limiteHistorialProducto);
      
      if (!cambioPagina && !cambioHistorialGeneral && !cambioHistorialProducto && !cambioSelects){
        alert('No se cambiaron los parámetros dado que todos eran iguales.');
        $("#modalParametros").modal("hide");
      }
      else {
        $.getJSON(url, {tamPagina: ""+pageSize+"", tamSelects: ""+limiteSelects+"", tamHistorialProducto: ""+limiteHistorialProducto+"", tamHistorialGeneral: ""+limiteHistorialGeneral+"", log: log}).done(function(request) {
          //alert(request.resultadoDB);
          if (request.resultadoDB === "OK"){
            //alert('Los parametros se actualizaron correctamente en la base de datos!');
            if (cambioPagina && cambioHistorialProducto && cambioHistorialGeneral && cambioSelects){
              alert('Todos los parámetros se cambiaron con éxito:\n\nNUEVOS PARÁMETROS:\n---------------------------\nTamaño de página: '+pageSize+'\nTamaño de Selects: '+limiteSelects+"\nHistorial General: "+limiteHistorialGeneral+"\nHistorial Producto: "+limiteHistorialProducto+'\n---------------------------');
            }
            else {
              if (!cambioPagina && !cambioHistorialProducto && !cambioHistorialGeneral && !cambioSelects){
                alert('No se cambiaron los parámetros.');
              }
              else {
                var mostrar = '-------- NUEVOS PARÁMETROS: --------';
                if (cambioPagina){
                  mostrar += '\n# Tamaño de página: '+pageSize;
                }
                if (cambioSelects){
                  mostrar += '\n# Tamaño de Selects: '+limiteSelects;
                }
                if (cambioHistorialGeneral){
                  mostrar += '\n# Historial General: '+limiteHistorialGeneral;
                }
                if (cambioHistorialProducto){
                  mostrar += '\n# Historial Producto: '+limiteHistorialProducto;
                }
                mostrar += '\n--------------------------------------------';
                alert(mostrar);
              }
            }
          }
          else {
            alert('Hubo un problema al actualizar los datos en la base de datos.\nPor favor inténtelo nuevamente.');
          }
          $("#modalParametros").modal("hide");
          location.reload(true);
        });
      }///************ FIN ELSE TODOS IGUALES ****
    }///************ FIN IF SEGUIR ***************
  //}///************* FIN IF SESION ****************
}
/********** fin actualizarParametros() **********/

/***********************************************************************************************************************
/// *********************************************** FIN FUNCIONES USUARIOS *********************************************
************************************************************************************************************************
**/


/***********************************************************************************************************************
/// ************************************************* FUNCIONES BÚSQUEDAS **********************************************
************************************************************************************************************************
*/

/**
 * \brief Función que valida los datos pasados para la búsqueda.
 * @returns {Boolean} Devuelve un booleano que indica si se pasó o no la validación de los datos para la búsqueda.
 */
function validarBusqueda() {
  
}
/********** fin validarBusqueda() **********/

/**
 * \brief Función que muestra el resultado de la consulta en pantalla. Arma la tabla con los datos pasados y luego la muestra en pantalla.
 * @param {String} radio String con el tipo de consulta realizada para saber que tipo de tabla hay que armar. 
 * @param {Array} datos Array de Strings con los datos a mostrar.
 * @param {String} j String con el número de pestaña donde se tiene que mostrar la tabla. 
 * @param {Boolean} todos Booleano que indica si la consutla realizada fue para todos los productos o entidades, o si fue sólo para algunos. Es para mostrar bien el caption de la tabla.
 * @param {String} offset String con el número de registro donde comienza la tabla de entre todos los registros del resultado.
 * @param {Boolean} fin Booleano que indica si el producto continúa en la página siguiente o no. Se usa diferente según sea STOCK o MOVIMIENTO.
 * @param {Object} subtotales Objeto con los subtotales, a saber, subtotales{retiros: XX, renovaciones: xx, destrucciones: XX, ingresos: XX}.
 * @param {Integer} max Entero con el total de datos a mostrar en la tabla.
 * @param {Integer} totalPlasticos Entero con el total acumulado del stock. SÓLO se usa en consultas de stock de entidades.
 * @param {String} tipoConsulta String con el mensaje del tipo de consulta para usarlo en el captio en los casos de stocks viejos.
 * @param {Integer} totalPaginas Integer con el total de páginas del resultado.
 * @param {String} mostrarEstado String que indica si se debe mostrar o no el estado de los movimientos en los reportes.
 * @returns {String} String con el HTML para mostrar la tabla.
 */
function mostrarTabla(radio, datos, j, todos, offset, fin, subtotales, max, totalPlasticos, tipoConsulta, totalPaginas, mostrarEstado){
  var tabla = '<table name="resultados" id="resultados_'+j+'" class="tabla2">';
  var rutaFoto = 'images/snapshots/';
  var totalCampos = '';
  var camposResumen = '';
  var totalCamposProd = '';
  var camposResumenProd = '';
  if (mostrarEstado)
    {
    totalCampos = 13;
    camposResumen = 12;
    totalCamposProd = 7;
    camposResumenProd = 6;
  }
  else {
    totalCampos = 12;
    camposResumen = 11;
    totalCamposProd = 6;
    camposResumenProd = 5;
  }
  
  switch(radio) {
    case 'entidadStock':  tabla += '<tr><th class="tituloTabla" colspan="10">CONSULTA DE STOCK</th></tr>';
                          tabla += '<tr>\n\
                                      <th>Item</th>\n\
                                      <th>Entidad</th>\n\
                                      <th>Nombre</th>\n\
                                      <th>BIN</th>\n\
                                      <th>Cód. EMSA</th>\n\
                                      <th>Cód. Origen</th>\n\
                                      <th>Snapshot</th>\n\
                                      <th>&Uacute;ltimo Movimiento</th>\n\
                                      <th>Mensaje</th>\n\
                                      <th>Stock</th>\n\
                                   </tr>';
                          //var total = parseInt(subtotales["stock"], 10);
                          var total = 0;
                          for (var i=0; i<max; i++) { 
                            var entidad = datos[i]["entidad"];
                            var nombre = datos[i]['nombre_plastico'];
                            var bin = datos[i]['bin'];
                            var snapshot = datos[i]['snapshot'];
                            if ((snapshot === '')||(snapshot === undefined)||(snapshot === null)){
                              snapshot = 'noDisponible1.png';
                            }
                            var codigo_emsa = datos[i]['codigo_emsa'];
                            var codigo_origen = datos[i]['codigo_origen'];
                            if ((codigo_origen === '')||(codigo_origen === null)) 
                                {
                                codigo_origen = 'NO Ingresado';
                              }
                            if ((codigo_emsa === '')||(codigo_emsa === null)) 
                                {
                                codigo_emsa = 'NO Ingresado';
                              } 
                            var stock = parseInt(datos[i]['stock'], 10);
                            var alarma1 = parseInt(datos[i]['alarma1'], 10);
                            var alarma2 = parseInt(datos[i]['alarma2'], 10);
                            var ultimoMovimiento = datos[i]['ultimoMovimiento'];
                            if (ultimoMovimiento === null) {
                              ultimoMovimiento = '';
                            }
                            var mensaje = datos[i]['prodcom'];
                            var claseComentario = "";
                            if ((mensaje === "undefined")||(mensaje === null)||(mensaje === "")) 
                              {
                              mensaje = "";
                              claseComentario = "";
                            }
                            else {
                              var patron = "dif";
                              var buscar = mensaje.search(new RegExp(patron, "i"));
                              if (buscar !== -1){
                                claseComentario = "resaltarDiferencia";
                              }
                              else {
                                var patron = "stock";
                                var buscar = mensaje.search(new RegExp(patron, "i"));
                                if (buscar !== -1){
                                  claseComentario = "resaltarStock";
                                }
                                else {
                                  var patron = "plastico";
                                  var buscar = mensaje.search(new RegExp(patron, "i"));
                                  var patron1 = "plástico";
                                  var buscar1 = mensaje.search(new RegExp(patron1, "i"));
                                  if ((buscar !== -1)||(buscar1 !== -1)){
                                    claseComentario = "resaltarPlastico";
                                  }
                                  else {
                                    claseComentario = "resaltarComentario";
                                  }
                                }
                              }
                            }
                            var claseResaltado = "alarma1";
                            if ((stock < alarma1) && (stock > alarma2)){
                              claseResaltado = "alarma1";
                            }
                            else {
                              if (stock < alarma2) {
                                claseResaltado = "alarma2";
                              }
                              else {
                                claseResaltado = "resaltado italica";
                              }
                            }  
                            if ((bin === 'SIN BIN')||(bin === null)||(bin === '')) 
                              {
                              bin = 'N/D o N/C';
                            }
                            tabla += '<tr>\n\
                                        <td>'+offset+'</td>\n\
                                        <td style="text-align: left">'+entidad+'</td>\n\
                                        <td nowrap>'+nombre+'</td>\n\
                                        <td nowrap>'+bin+'</td>\n\
                                        <td>'+codigo_emsa+'</td>\n\
                                        <td>'+codigo_origen+'</td>\n\
                                        <td><img id="snapshot" name="hint" src="'+rutaFoto+snapshot+'" alt="No se cargó aún." height="76" width="120"></img></td>\n\
                                        <td>'+ultimoMovimiento+'</td>\n\
                                        <td class="'+claseComentario+'" >'+mensaje+'</td>\n\
                                        <td class="'+claseResaltado+'" style="text-align: right">'+stock.toLocaleString('es-UY')+'</td>\n\
                                      </tr>';
                            offset++;
                            total += stock;
                          }
//                          if (!todos){
//                            tabla += '<caption>Stock de <b><i>'+entidad+'</i></b></caption>';
//                          }
//                          else {
//                            tabla += '<caption>Stock de <b><i>todas las entidades</i></b></caption>';
//                          }
                          tabla += '<caption><b><i>'+tipoConsulta+'</i></b></caption>';
                          var subtitulo = '';
                          var totalPlasticos1 = '';
                          if (fin){
                            //subtitulo = 'SUB-TOTAL';
                            //totalPlasticos1 = total;
                          } 
                          else {
                            subtitulo = 'TOTAL';
                            totalPlasticos1 = parseInt(totalPlasticos, 10);
                            tabla += '<tr><th colspan="9" class="centrado">'+subtitulo+':</th><td class="resaltado1 italica" style="text-align: right">'+parseInt(totalPlasticos1, 10).toLocaleString()+'</td></tr>';
                          }  

                          //var subtotalesJson = JSON.stringify(subtotales);
                          tabla += '<tr>\n\
                                      <td class="pieTabla" colspan="10">\n\
                                        <input type="button" indice="'+j+'" name="exportarBusqueda" value="EXPORTAR" class="btn btn-primary exportar">\n\
                                      </td>\n\
                                    </tr>';
//                          tabla += "<tr>\n\
//                                      <td style='display:none'><input type='text' id='subtotales_"+j+"' value="+subtotalesJson+"></td>\n\
//                                    </tr>";
                          tabla += "</table>";
                          break;
    case 'productoStock': var bin = datos[0]['bin'];
                          //var produ = datos[0]["idProd"];
                          if ((bin === 'SIN BIN')||(bin === null)||(bin === '')) 
                              {
                              bin = 'N/D o N/C';
                            }
                          var codigo_origen = datos[0]['codigo_origen'];
                          if ((codigo_origen === '')||(codigo_origen === null)) 
                              {
                              codigo_origen = 'NO Ingresado';
                            }
                          var codigo_emsa = datos[0]['codigo_emsa'];
                          if ((codigo_emsa === '')||(codigo_emsa === null)) 
                              {
                              codigo_emsa = 'NO Ingresado';
                            }   
                          var fechaCreacion = datos[0]['fechaCreacion'];
                          if ((fechaCreacion === '')||(fechaCreacion === null)) 
                            {
                            fechaCreacion = 'NO Ingresada';
                          }
                          else {
                            var fechaTemp = fechaCreacion.split('-');
                            fechaCreacion = fechaTemp[2]+'/'+fechaTemp[1]+'/'+fechaTemp[0];
                          }
                          var alarma1 = parseInt(datos[0]['alarma1'], 10);
                          var alarma2 = parseInt(datos[0]['alarma2'], 10);
                          var stock = parseInt(datos[0]['stock'], 10);
                          var snapshot = datos[0]['snapshot'];
                          if ((snapshot === '')||(snapshot === undefined)||(snapshot === null)){
                            snapshot = 'noDisponible1.png';
                          }
                          var ultimoMovimiento = datos[0]['ultimoMovimiento'];
                          if (ultimoMovimiento === null) {
                              ultimoMovimiento = '';
                            }
                          var contacto = datos[0]['contacto'];
                          if (contacto === null) 
                              {
                              contacto = '';
                            }
                          var prodcom = datos[0]['prodcom'];
                          var claseComentario = "";
                          if ((prodcom === "undefined")||(prodcom === null)||(prodcom === "")) 
                            {
                            prodcom = "";
                          }
                          else {
                            var patron = "dif";
                            var buscar = prodcom.search(new RegExp(patron, "i"));
                            if (buscar !== -1){
                              claseComentario = "resaltarDiferencia";
                            }
                            else {
                              var patron = "stock";
                              var buscar = prodcom.search(new RegExp(patron, "i"));
                              if (buscar !== -1){
                                claseComentario = "resaltarStock";
                              }
                              else {
                                var patron = "plastico";
                                var buscar = prodcom.search(new RegExp(patron, "i"));
                                var patron1 = "plástico";
                                var buscar1 = prodcom.search(new RegExp(patron1, "i"));
                                if ((buscar !== -1)||(buscar1 !== -1)){
                                  claseComentario = "resaltarPlastico";
                                }
                                else {
                                  claseComentario = "resaltarComentario";
                                }
                              }
                            }
                          }  
                            
                          var claseResaltado = "italica";
                          if ((stock < alarma1) && (stock > alarma2)){
                            claseResaltado = "alarma1";
                          }
                          else {
                            if (stock < alarma2) {
                              claseResaltado = "alarma2";
                            }
                            else {
                              claseResaltado = "resaltado italica";
                            }
                          } 
                          //tabla += '<caption>Stock del producto <b><i>'+datos[0]['nombre_plastico']+'</i></b></caption>';
                          tabla += '<caption><b><i>'+tipoConsulta+'</i></b></caption>';
                          tabla += '<tr>\n\
                                      <th colspan="2" class="tituloTabla">DETALLES</th>\n\
                                   </tr>';                       
                          tabla += '<tr><th style="text-align:left">Nombre:</th><td>'+datos[0]['nombre_plastico']+'</td></tr>';
                          tabla += '<tr><th style="text-align:left">Entidad:</th><td>'+datos[0]['entidad']+'</td></tr>';
                          tabla += '<tr><th style="text-align:left">C&oacute;digo EMSA:</th><td>'+codigo_emsa+'</td></tr>';
                          tabla += '<tr><th style="text-align:left">C&oacute;digo Origen:</th><td>'+codigo_origen+'</td></tr>';
                          tabla += '<tr><th style="text-align:left">Fecha de Creaci&oacute;n:</th><td>'+fechaCreacion+'</td></tr>';
                          tabla += '<tr><th style="text-align:left">BIN:</th><td nowrap>'+bin+'</td></tr>';
                          tabla += '<tr><th style="text-align:left">Snapshot:</th><td><img id="snapshot" name="hint" src="'+rutaFoto+snapshot+'" alt="No se cargó aún." height="125" width="200"></img></td></tr>';
                          tabla += '<tr><th style="text-align:left">Contacto:</th><td>'+contacto+'</td></tr>';
                          tabla += '<tr><th style="text-align:left">Comentarios:</th><td class="'+claseComentario+'">'+prodcom+'</td></tr>';
                          tabla += '<tr><th style="text-align:left">&Uacute;ltimo Movimiento:</th><td>'+ultimoMovimiento+'</td></tr>';
                          tabla += '<tr><th style="text-align:left">Stock:</th><td class="'+claseResaltado+'">'+stock.toLocaleString()+'</td></tr>';
                          tabla += '<tr>\n\
                                      <td class="pieTabla" colspan="2">\n\
                                        <input type="button" indice="'+j+'" name="exportarBusqueda" value="EXPORTAR" class="btn btn-primary exportar">\n\
                                      </td>\n\
                                    </tr>\n\
                                  </table>';
                          break;
      case 'productoStockViejo':  var bin = datos[0]['bin'];
                                  var produ = datos[0]['idprod'];
                                  if ((bin === 'SIN BIN')||(bin === null)||(bin === '')) 
                                      {
                                      bin = 'N/D o N/C';
                                    }
                                  var codigo_origen = datos[0]['codigo_origen'];
                                  if ((codigo_origen === '')||(codigo_origen === null)) 
                                      {
                                      codigo_origen = 'NO Ingresado';
                                    }
                                  var codigo_emsa = datos[0]['codigo_emsa'];
                                  if ((codigo_emsa === '')||(codigo_emsa === null)) 
                                      {
                                      codigo_emsa = 'NO Ingresado';
                                    }  
                                  var fechaCreacion = datos[0]['fechaCreacion'];
                                  if ((fechaCreacion === '')||(fechaCreacion === null)) 
                                    {
                                    fechaCreacion = 'NO Ingresada';
                                  }
                                  else {
                                    var fechaTemp = fechaCreacion.split('-');
                                    fechaCreacion = fechaTemp[2]+'/'+fechaTemp[1]+'/'+fechaTemp[0];
                                  }  
                                  var alarma1 = parseInt(datos[0]['alarma1'], 10);
                                  var alarma2 = parseInt(datos[0]['alarma2'], 10);
                                  var stock = parseInt(subtotales["stockViejo"][produ], 10);
                                  var snapshot = datos[0]['snapshot'];
                                  if ((snapshot === '')||(snapshot === undefined)||(snapshot === null)){
                                    snapshot = 'noDisponible1.png';
                                  }
                                  var ultimoMovimiento = datos[0]['ultimoMovimiento'];
                                  if (ultimoMovimiento === null) {
                                      ultimoMovimiento = '';
                                    }
                                  var contacto = datos[0]['contacto'];
                                  if (contacto === null) 
                                      {
                                      contacto = '';
                                    }
                                  var prodcom = datos[0]['prodcom'];
                                  var claseComentario = "";
                                  if ((prodcom === "undefined")||(prodcom === null)||(prodcom === "")) 
                                    {
                                    prodcom = "";
                                  }
                                  else {
                                    var patron = "dif";
                                    var buscar = prodcom.search(new RegExp(patron, "i"));
                                    if (buscar !== -1){
                                      claseComentario = "resaltarDiferencia";
                                    }
                                    else {
                                      var patron = "stock";
                                      var buscar = prodcom.search(new RegExp(patron, "i"));
                                      if (buscar !== -1){
                                        claseComentario = "resaltarStock";
                                      }
                                      else {
                                        var patron = "plastico";
                                        var buscar = prodcom.search(new RegExp(patron, "i"));
                                        var patron1 = "plástico";
                                        var buscar1 = prodcom.search(new RegExp(patron1, "i"));
                                        if ((buscar !== -1)||(buscar1 !== -1)){
                                          claseComentario = "resaltarPlastico";
                                        }
                                        else {
                                          claseComentario = "resaltarComentario";
                                        }
                                      }
                                    }
                                  }  

                                  var claseResaltado = "italica";
                                  if ((stock < alarma1) && (stock > alarma2)){
                                    claseResaltado = "alarma1";
                                  }
                                  else {
                                    if (stock < alarma2) {
                                      claseResaltado = "alarma2";
                                    }
                                    else {
                                      claseResaltado = "resaltado italica";
                                    }
                                  }
                                  tabla += '<caption>'+tipoConsulta+'</caption>';
                                  tabla += '<tr>\n\
                                              <th colspan="2" class="tituloTabla">DETALLES</th>\n\
                                           </tr>';                       
                                  tabla += '<tr><th style="text-align:left">Nombre:</th><td>'+datos[0]['nombre_plastico']+'</td></tr>';
                                  tabla += '<tr><th style="text-align:left">Entidad:</th><td>'+datos[0]['entidad']+'</td></tr>';
                                  tabla += '<tr><th style="text-align:left">C&oacute;digo EMSA:</th><td>'+codigo_emsa+'</td></tr>';
                                  tabla += '<tr><th style="text-align:left">C&oacute;digo Origen:</th><td>'+codigo_origen+'</td></tr>';
                                  tabla += '<tr><th style="text-align:left">Fecha de Creaci&oacute;n:</th><td>'+fechaCreacion+'</td></tr>';
                                  tabla += '<tr><th style="text-align:left">BIN:</th><td nowrap>'+bin+'</td></tr>';
                                  tabla += '<tr><th style="text-align:left">Snapshot:</th><td><img id="snapshot" name="hint" src="'+rutaFoto+snapshot+'" alt="No se cargó aún." height="125" width="200"></img></td></tr>';
                                  tabla += '<tr><th style="text-align:left">Contacto:</th><td>'+contacto+'</td></tr>';
                                  tabla += '<tr><th style="text-align:left">Comentarios:</th><td class="'+claseComentario+'">'+prodcom+'</td></tr>';
                                  tabla += '<tr><th style="text-align:left">&Uacute;ltimo Movimiento:</th><td>'+ultimoMovimiento+'</td></tr>';
                                  tabla += '<tr><th style="text-align:left">Stock:</th><td class="'+claseResaltado+'">'+stock.toLocaleString()+'</td></tr>';
                                  tabla += '<tr>\n\
                                              <td class="pieTabla" colspan="2">\n\
                                                <input type="button" indice="'+j+'" name="exportarBusqueda" value="EXPORTAR" class="btn btn-primary exportar">\n\
                                              </td>\n\
                                            </tr>\n\
                                          </table>';
                                  break;                    
      case 'totalStock':  tabla += '<caption><b><i>Stock total en b&oacute;veda.</i></b></caption>';
                          tabla += '<tr>\n\
                                      <th colspan="3" class="tituloTabla">DETALLES</th>\n\
                                    </tr>';
                          tabla += '<tr>\n\
                                        <th>Item</th>\n\
                                        <th>Entidad</th>\n\
                                        <th>Stock</th>\n\
                                     </tr>';          
                          var total = 0;
                          for (var k in datos) { 
                            //var produ = datos[i]["idProd"];
                            var entidad = datos[k]["entidad"];
                            //var nombre = datos[i]['nombre_plastico'];
                            var bin = datos[k]['bin'];
                            var codigo_emsa = datos[k]['codigo_emsa'];
                            var stock = datos[k]['stock'];
                            var subtotal = parseInt(datos[k]['subtotal'], 10);
                            if ((bin === 'SIN BIN')||(bin === null)||(bin === '')) 
                              {
                              bin = 'N/D o N/C';
                            }
                            tabla += '<tr>\n\
                                        <td>'+offset+'</td>\n\
                                        <td style="text-align: left">'+entidad+'</td>\n\
                                        <td class="resaltado italica" style="text-align: right">'+subtotal.toLocaleString()+'</td>\n\
                                      </tr>';
                            offset++;  
                            total += subtotal;
                          }
                          if (!fin){
                            subtitulo = 'TOTAL';
                            tabla += '<tr><th colspan="2" class="centrado">TOTAL:</th><td class="resaltado1 italica" style="text-align: right">'+parseInt(totalPlasticos, 10).toLocaleString()+'</td></tr>';
                          }
                          var subtotalesJson = JSON.stringify(subtotales);
//                          tabla += "<tr>\n\
//                                      <td style='display:none'><input type='text' id='subtotales_"+j+"' value="+subtotalesJson+"></td>\n\
//                                    </tr>";
                          tabla += '<tr>\n\
                                      <td class="pieTabla" colspan="3">\n\
                                        <input type="button" indice="'+j+'" name="exportarBusqueda" value="EXPORTAR" class="btn btn-primary exportar">\n\
                                      </td>\n\
                                    </tr>\n\
                                  </table>';              
                          break;
      case 'entidadStockViejo': tabla += '<tr><th class="tituloTabla" colspan="10">CONSULTA DE STOCK</th></tr>';
                                tabla += '<tr>\n\
                                            <th>Item</th>\n\
                                            <th>Entidad</th>\n\
                                            <th>Nombre</th>\n\
                                            <th>BIN</th>\n\
                                            <th>Cód. EMSA</th>\n\
                                            <th>Cód. Origen</th>\n\
                                            <th>Snapshot</th>\n\
                                            <th>&Uacute;ltimo Movimiento</th>\n\
                                            <th>Mensaje</th>\n\
                                            <th>Stock</th>\n\
                                         </tr>';
                                //var total = 0;
                                //alert('en el radio: '+totalPlasticos);
                                for (var i=0; i<max; i++) {
                                  ///************************* INICIO RECUPERACIÓN DATOS ******************************************************************
                                  var produ = parseInt(datos[i]["idprod"], 10);
                                  var entidad = datos[i]["entidad"];
                                  var nombre = datos[i]['nombre_plastico'].trim();
                                  var bin = datos[i]['bin'];
                                  var codigo_emsa = datos[i]['codigo_emsa'];
                                  if ((codigo_emsa === '')||(codigo_emsa === null)) 
                                      {
                                      codigo_emsa = 'NO Ingresado';
                                    }
                                  var codigo_origen = datos[i]['codigo_origen'];
                                  if ((codigo_origen === '')||(codigo_origen === null)) 
                                    {
                                    codigo_origen = 'NO Ingresado';
                                  }
                                  var snapshot = datos[i]['snapshot'];
                                  if ((snapshot === '')||(snapshot === undefined)||(snapshot === null)){
                                    snapshot = 'noDisponible1.png';
                                  }
                                  var ultimoMovimiento = datos[i]['ultimoMovimiento'];
                                  if (ultimoMovimiento === null) {
                                      ultimoMovimiento = '';
                                    }
                                  var alarma1 = parseInt(datos[i]['alarma1'], 10);
                                  var alarma2 = parseInt(datos[i]['alarma2'], 10);//alert(alarma1);
                                  var stock = parseInt(subtotales['stockViejo'][produ], 10);//alert('offset: '+offset+' - produ: '+produ+' : '+stock);
                                  //total += stock;
                                  //var stock = parseInt(datos[i]['stock'], 10);
                                  var claseResaltado = '';
                                  if ((stock < alarma1) && (stock > alarma2)){
                                    claseResaltado = "alarma1";
                                  }
                                  else {
                                    if (stock < alarma2) {
                                      claseResaltado = "alarma2";
                                    }
                                    else {
                                      claseResaltado = "resaltado";
                                    }
                                  }
                                  var comentarios = datos[i]['comentarios'];
                                  var claseComentario = "";
                                  if ((comentarios === "undefined")||(comentarios === null)||(comentarios === "")) 
                                    {
                                    comentarios = "";
                                    claseComentario = "";
                                  }
                                  else {
                                    var patron = "dif";
                                    var buscar = comentarios.search(new RegExp(patron, "i"));
                                    if (buscar !== -1){
                                      claseComentario = "resaltarDiferencia";
                                    }
                                    else {
                                      var patron = "stock";
                                      var buscar = comentarios.search(new RegExp(patron, "i"));
                                      if (buscar !== -1){
                                        claseComentario = "resaltarStock";
                                      }
                                      else {
                                        var patron = "plastico";
                                        var buscar = comentarios.search(new RegExp(patron, "i"));
                                        var patron1 = "plástico";
                                        var buscar1 = comentarios.search(new RegExp(patron1, "i"));
                                        if ((buscar !== -1)||(buscar1 !== -1)){
                                          claseComentario = "resaltarPlastico";
                                        }
                                        else {
                                          claseComentario = "resaltarComentario";
                                        }
                                      }
                                    }
                                  }  
                                  if ((bin === 'SIN BIN')||(bin === null)||(bin === '')) 
                                    {
                                    bin = 'N/D o N/C';
                                  }
                                  ///************************* FIN RECUPERACIÓN DATOS *********************************************************************
                                  
                                  ///Muestro el renglón con los datos del movimiento:
                                  tabla += '<tr>\n\
                                              <td>'+offset+'</td>\n\
                                              <td>'+entidad+'</td>\n\
                                              <td nowrap>'+nombre+'</td>\n\
                                              <td nowrap>'+bin+'</td>\n\
                                              <td nowrap>'+codigo_emsa+'</td>\n\
                                              <td nowrap>'+codigo_origen+'</td>\n\
                                              <td><img id="snapshot" name="hint" src="'+rutaFoto+snapshot+'" alt="No se cargó aún." height="75" width="120"></img></td>\n\
                                              <td>'+ultimoMovimiento+'</td>\n\
                                              <td class="'+claseComentario+'">'+comentarios+'</td>\n\
                                              <td class="'+claseResaltado+'">'+stock.toLocaleString()+'</td>\n\
                                            </tr>'; 
                                  offset++;  
                                }/// FIN DEL FOR ********************************************************
                               
                                ///************************ CAPTION segun si es TODOS o alguna ENTIDAD *******************************************
                                tabla += '<caption>'+tipoConsulta+'</caption>';
                                ///************************ FIN CAPTION segun si es TODOS o alguna ENTIDAD ***************************************
                                var subtitulo = '';
                                var totalPlasticos2 = 0;
                                if (fin){
                                  //subtitulo = 'SUB-TOTAL';
                                  //totalPlasticos1 = total;
                                } 
                                else {
                                  subtitulo = 'TOTAL';
                                  totalPlasticos2 = parseInt(totalPlasticos, 10);
                                  tabla += '<tr><th colspan="9" class="centrado">'+subtitulo+':</th><td class="resaltado1 italica" style="text-align: right">'+totalPlasticos2.toLocaleString()+'</td></tr>';
                                } 
                          
                                var subtotalesJson = JSON.stringify(subtotales);
                                tabla += '<tr>\n\
                                            <td class="pieTabla" colspan="10">\n\
                                              <input type="button" indice="'+j+'" name="exportarBusqueda" value="EXPORTAR" class="btn btn-primary exportar">\n\
                                            </td>\n\
                                          </tr>';
//                                tabla += "<tr>\n\
//                                            <td style='display:none'><input type='text' id='subtotales_"+j+"' value="+subtotalesJson+"></td>\n\
//                                          </tr>";
                                tabla += "</table>";
                                break;                   
      case 'entidadMovimiento': tabla += '<tr><th class="tituloTabla" colspan="'+totalCampos+'">MOVIMIENTOS</th></tr>';
                                tabla += '<tr>\n\
                                            <th>Item</th>\n\
                                            <th>Fecha</th>\n\
                                            <th>Hora</th>\n\
                                            <th>Entidad</th>\n\
                                            <th>Nombre</th>\n\
                                            <th>BIN</th>\n\
                                            <th>Cód. EMSA</th>\n\
                                            <th>Cód. Origen</th>\n\
                                            <th>Snapshot</th>\n\
                                            <th>Tipo</th>';
                                if (mostrarEstado){
                                  tabla += '<th>Estado</th>';
                                } 
                                tabla += '  <th>Comentarios</th>\n\
                                            <th>Cantidad</th>\n\
                                    </tr>';

                                ///Defino variable tipoMov para detectar el tipo de movimiento filtrado, a saber:
                                ///Todos -> "de todos los tipos (inc. AJUSTES)": usado para consultar TODOS los movimientos 
                                ///Clientes -> "de todos los tipos": usado para consultar todos los movimientos, menos los de AJUSTES
                                ///Ajustes -> "del tipo AJUSTE": usado para consultar los movimientos por ajustes (tanto ingresos como egresos)
                                ///AJUSTE Retiro -> "del tipo AJUSTE Retiro": usado para consultar los movimientos por ajustes de retiros
                                ///AJUSTE Ingreso -> "del tipo AJUSTE Ingreso": usado para consultar los movimientos por ajustes de ingresos
                                var tipoMov = '';
                                ///Veo si contiene la palabra AJUSTE; de tenerla hay 4 opciones
                                if (tipoConsulta.indexOf("AJUSTE") > -1){
                                  if (tipoConsulta.indexOf("Retiro") > -1){
                                    tipoMov = 'AJUSTE Retiros';
                                  }
                                  else {
                                    if (tipoConsulta.indexOf("Ingreso") > -1){
                                      tipoMov = 'AJUSTE Ingresos';
                                    }
                                    else {
                                      if (tipoConsulta.indexOf("todos") > -1){
                                        tipoMov = "Todos";
                                      }
                                      else {
                                        tipoMov = "Ajustes";
                                      }
                                    }
                                  }
                                }
                                else {
                                  if (tipoConsulta.indexOf("todos") > -1){
                                    tipoMov = "Clientes";
                                  }
                                  else {
                                    if (tipoConsulta.indexOf("Retiro") > -1){
                                      tipoMov = 'retiros';
                                    }
                                    else {
                                      if (tipoConsulta.indexOf("Ingreso") > -1){
                                        tipoMov = 'ingresos';
                                      }
                                      else {
                                        if (tipoConsulta.indexOf("Renovación") > -1){
                                          tipoMov = 'renovaciones';
                                        }
                                        else {
                                          tipoMov = 'destrucciones';
                                        }
                                      }
                                    }
                                  }  
                                }
                                //alert(tipoMov);
                                var productoViejo = parseInt(datos[0]['idprod'], 10);

                                for (var i=0; i<max; i++) {
                                  ///************************* INICIO RECUPERACIÓN DATOS ************************************************************
                                  var produ = parseInt(datos[i]["idprod"], 10);
                                  var idmov = datos[i]["idmov"];
                                  var entidad = datos[i]["entidad"];
                                  var nombre = datos[i]['nombre_plastico'].trim();
                                  var cantidad = parseInt(datos[i]['cantidad'], 10);
                                  var bin = datos[i]['bin'];
                                  var codigo_emsa = datos[i]['codigo_emsa'];
                                  if ((codigo_emsa === '')||(codigo_emsa === null)) 
                                      {
                                      codigo_emsa = 'NO Ingresado';
                                    }
                                  var codigo_origen = datos[i]['codigo_origen'];
                                  if ((codigo_origen === '')||(codigo_origen === null)) 
                                    {
                                    codigo_origen = 'NO Ingresado';
                                  }
                                  var tipo1 = datos[i]['tipo'];
                                  var estadoMov = datos[i]['estado'];
                                  var snapshot = datos[i]['snapshot'];
                                  if ((snapshot === '')||(snapshot === undefined)||(snapshot === null)){
                                    snapshot = 'noDisponible1.png';
                                  }
                                  var fecha = datos[i]['fecha'];
                                  var hora = datos[i]["hora"];    

                                  var alarma1 = parseInt(datos[i]['alarma1'], 10);
                                  var alarma2 = parseInt(datos[i]['alarma2'], 10);
                                  var stock = parseInt(datos[i]['stock'], 10);
                                  var claseResaltado = '';
                                  if ((stock < alarma1) && (stock > alarma2)){
                                    claseResaltado = "alarma1";
                                  }
                                  else {
                                    if (stock < alarma2) {
                                      claseResaltado = "alarma2";
                                    }
                                    else {
                                      claseResaltado = "resaltado";
                                    }
                                  }  
                                  var comentarios = datos[i]['comentarios'];
                                  if ((comentarios === "undefined")||(comentarios === null)) {
                                      comentarios = "";
                                    }
                                  if ((bin === 'SIN BIN')||(bin === null)||(bin === '')) 
                                    {
                                    bin = 'N/D o N/C';
                                  }
                                  ///************************* FIN RECUPERACIÓN DATOS ***************************************************************
                                  var mostrarResumenProducto;
                                  /// Chequeo si es una consulta de UN solo tipo de movimientos o de todos:
                                  if (tipoConsulta.indexOf("todos los tipos") > -1){
                                    mostrarResumenProducto = true;
                                  }
                                  else {
                                    mostrarResumenProducto = false;
                                  }  
                                  
                                  /// En caso de ser de UN solo tipo, NO agrego el resumen del producto a pedido de Diego:
                                  if (mostrarResumenProducto){
                                    ///Si hay un cambio de producto, ANTES de poner el primer movimiento del nuevo producto, muestro el resumen del producto viejo:
                                    if (productoViejo !== produ) {
                                      var totalConsumos = 0;
                                      var retiros1 = 0;
                                      var ajusteRetiros1 = 0;
                                      var renos1 = 0;
                                      var destrucciones1 = 0;
                                      var ingresos1 = 0;
                                      var ajusteIngresos1 = 0;
                                      
                                      if (subtotales["retiros"] !== null){
                                        if (subtotales["retiros"][productoViejo] !== undefined) {
                                          retiros1 = parseInt(subtotales["retiros"][productoViejo], 10);
                                          tabla += '<tr>\n\
                                                      <td colspan="'+camposResumen+'" class="negrita">Total Retiros:</td>\n\
                                                      <td class="subtotal" colspan="1">'+retiros1.toLocaleString()+'</td>\n\
                                                    </tr>';
                                          totalConsumos += retiros1;
                                        }
                                      }
                                      if (subtotales["renovaciones"] !== null){
                                        if (subtotales["renovaciones"][productoViejo] !== undefined) {
                                          renos1 = parseInt(subtotales["renovaciones"][productoViejo], 10);
                                          tabla += '<tr>\n\
                                                      <td colspan="'+camposResumen+'" class="negrita">Total Renovaciones:</td>\n\
                                                      <td class="subtotal" colspan="1">'+renos1.toLocaleString()+'</td>\n\
                                                    </tr>';
                                          totalConsumos += renos1;
                                        } 
                                      }
                                      if (subtotales["destrucciones"] !== null){
                                        if (subtotales["destrucciones"][productoViejo] !== undefined) {
                                          destrucciones1 = parseInt(subtotales["destrucciones"][productoViejo], 10);
                                          tabla += '<tr>\n\
                                                      <td colspan="'+camposResumen+'" class="negrita">Total Destrucciones:</td>\n\
                                                      <td class="subtotal" colspan="1">'+destrucciones1.toLocaleString()+'</td>\n\
                                                    </tr>';
                                          totalConsumos += destrucciones1;
                                        }
                                      }
                                      if (totalConsumos > 0) {
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total de Consumos:</td>\n\
                                                    <td class="totalConsumos" colspan="1">'+totalConsumos.toLocaleString()+'</td>\n\
                                                  </tr>';
                                      }
                                      if (subtotales["ingresos"] !== null) {
                                        if (subtotales["ingresos"][productoViejo] !== undefined) {
                                          ingresos1 = parseInt(subtotales["ingresos"][productoViejo], 10);
                                          tabla += '<tr>\n\
                                                      <td colspan="'+camposResumen+'" class="negrita">Total de Ingresos:</td>\n\
                                                      <td class="totalIngresos" colspan="1">'+ingresos1.toLocaleString()+'</td>\n\
                                                    </tr>';
                                        }         
                                      }
                                      
                                      if ((tipoMov === 'Todos')||(tipoMov === 'Ajustes')||(tipoMov === 'AJUSTE Retiros')||(tipoMov === 'AJUSTE Ingresos'))
                                        {
                                        if (subtotales["AJUSTE Retiros"] !== null){
                                          if (subtotales["AJUSTE Retiros"][productoViejo] !== undefined) {
                                            ajusteRetiros1 = parseInt(subtotales["AJUSTE Retiros"][productoViejo], 10);
                                            tabla += '<tr>\n\
                                                        <td colspan="'+camposResumen+'" class="negrita">Total AJUSTE Retiros:</td>\n\
                                                        <td class="totalAjusteRetiros" colspan="1">'+ajusteRetiros1.toLocaleString()+'</td>\n\
                                                      </tr>';
                                            //totalConsumos += retiros1;
                                          }
                                        }
                                        if (subtotales["AJUSTE Ingresos"] !== null) {
                                          if (subtotales["AJUSTE Ingresos"][productoViejo] !== undefined) {
                                            ajusteIngresos1 = parseInt(subtotales["AJUSTE Ingresos"][productoViejo], 10);
                                            tabla += '<tr>\n\
                                                        <td colspan="'+camposResumen+'" class="negrita">Total AJUSTE Ingresos:</td>\n\
                                                        <td class="totalAjusteIngresos" colspan="1">'+ajusteIngresos1.toLocaleString()+'</td>\n\
                                                      </tr>';
                                          }         
                                        }
                                      }
                                      
                                      productoViejo = produ;
                                      tabla += '<th colspan="'+totalCampos+'">&nbsp;\n\
                                                </th>';
                                    }
                                  }
                                  ///Muestro el renglón con los datos del movimiento:
                                  tabla += '<tr>\n\
                                              <td>'+offset+'</td>\n\
                                              <td>'+fecha+'</td>\n\
                                              <td>'+hora+'</td>\n\
                                              <td>'+entidad+'</td>\n\
                                              <td nowrap>'+nombre+'</td>\n\
                                              <td nowrap>'+bin+'</td>\n\
                                              <td nowrap>'+codigo_emsa+'</td>\n\
                                              <td nowrap>'+codigo_origen+'</td>\n\
                                              <td><img id="snapshot" name="hint" src="'+rutaFoto+snapshot+'" alt="No se cargó aún." height="75" width="120"></img></td>\n\
                                              <td>'+tipo1+'</td>';
                                  if (mostrarEstado){
                                    tabla += '<td>'+estadoMov+'</td>';
                                  }            
                                  tabla += '  <td>'+comentarios+'</td>\n\
                                              <td class="'+claseResaltado+'"><a href="editarMovimiento.php?id='+idmov+'" target="_blank">'+cantidad.toLocaleString()+'</a></td>\n\
                                            </tr>'; 
                                  if ((fin) && (parseInt(i, 10) === parseInt(tamPagina-1, 10))){
                                    var totalConsumos = 0;
                                    var retiros2 = 0;
                                    var renos2 = 0;
                                    var destrucciones2 = 0;
                                    var ingresos2 = 0;
                                    var ajusteRetiros2 = 0;
                                    var ajusteIngresos2 = 0;
                                    if (subtotales["retiros"] !== null){
                                      if (subtotales["retiros"][productoViejo] !== undefined) {
                                        retiros2 = parseInt(subtotales["retiros"][productoViejo], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total Retiros:</td>\n\
                                                    <td class="subtotal" colspan="1">'+retiros2.toLocaleString()+'</td>\n\
                                                  </tr>';
                                        totalConsumos += retiros2;
                                      }
                                    }
                                    if (subtotales["renovaciones"] !== null){
                                      if (subtotales["renovaciones"][productoViejo] !== undefined) {
                                        renos2 = parseInt(subtotales["renovaciones"][productoViejo], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total Renovaciones:</td>\n\
                                                    <td class="subtotal" colspan="1">'+renos2.toLocaleString()+'</td>\n\
                                                  </tr>';
                                        totalConsumos += renos2;
                                      } 
                                    }
                                    if (subtotales["destrucciones"] !== null){
                                      if (subtotales["destrucciones"][productoViejo] !== undefined) {
                                        destrucciones2 = parseInt(subtotales["destrucciones"][productoViejo], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total Destrucciones:</td>\n\
                                                    <td class="subtotal" colspan="1">'+destrucciones2.toLocaleString()+'</td>\n\
                                                  </tr>';
                                        totalConsumos += destrucciones2;
                                      }
                                    }
                                    if (totalConsumos > 0) {
                                      tabla += '<tr>\n\
                                                  <td colspan="'+camposResumen+'" class="negrita">Total de Consumos:</td>\n\
                                                  <td class="totalConsumos" colspan="1">'+totalConsumos.toLocaleString()+'</td>\n\
                                                </tr>';
                                    }
                                    if (subtotales["ingresos"] !== null) {
                                      if (subtotales["ingresos"][productoViejo] !== undefined) {
                                        ingresos2 = parseInt(subtotales["ingresos"][productoViejo], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total de Ingresos:</td>\n\
                                                    <td class="totalIngresos" colspan="1">'+ingresos2.toLocaleString()+'</td>\n\
                                                  </tr>';
                                      }         
                                    }
                                    if (subtotales["AJUSTE Retiros"] !== null){
                                      if (subtotales["AJUSTE Retiros"][productoViejo] !== undefined) {
                                        ajusteRetiros2 = parseInt(subtotales["AJUSTE Retiros"][productoViejo], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total AJUSTE Retiros:</td>\n\
                                                    <td class="totalAjusteRetiros" colspan="1">'+ajusteRetiros2.toLocaleString()+'</td>\n\
                                                  </tr>';
                                        //totalConsumos += retiros2;
                                      }
                                    }
                                    if (subtotales["AJUSTE Ingresos"] !== null) {
                                      if (subtotales["AJUSTE Ingresos"][productoViejo] !== undefined) {
                                        ajusteIngresos2 = parseInt(subtotales["AJUSTE Ingresos"][productoViejo], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total AJUSTE Ingresos:</td>\n\
                                                    <td class="totalAjusteIngresos" colspan="1">'+ajusteIngresos2.toLocaleString()+'</td>\n\
                                                  </tr>';
                                      }         
                                    }
                                    
                                    productoViejo = produ;
                                    tabla += '<th colspan="'+totalCampos+'">&nbsp;\n\
                                          </th>';
                                  }
                                  offset++;  
                                }/// FIN DEL FOR ****************************************************************************************************
                                
                                
                                            
                                //alert(tipoConsulta+'\n'+tipoMov);
                                ///****************** RESUMEN último producto ó RESUMEN GENERAL *****************************************************
                                if ((subtotales[""+tipoMov+""] !== null)&&(subtotales[""+tipoMov+""] !== undefined)){
                                  var subtotal = 0;
                                  for(var i in subtotales[""+tipoMov+""]){
                                    subtotal += parseInt(subtotales[tipoMov][i], 10);
                                  } 
                                }
                                else {
                                  if (tipoMov === 'Ajustes'){
                                    var subtotalAjuRetiros = 0;
                                    var subtotalAjuIngresos = 0;
                                    for (var i in subtotales['AJUSTE Retiros']){
                                      subtotalAjuRetiros += parseInt(subtotales["AJUSTE Retiros"][i], 10);
                                    }
                                    for (var i in subtotales['AJUSTE Ingresos']){
                                      subtotalAjuIngresos += parseInt(subtotales["AJUSTE Ingresos"][i], 10);
                                    }
                                  }
                                  else {
                                    ///Acá solo llegan los casos de 'TODOS para Clientes' y de TODOS, pero en ninguno de los casos es necesario 
                                    ///sumar el subtotal puesto que en ambos casos se muestra el resumen por producto.
                                  }
                                }
                                
                                ///Detecto si es o no la primer página.
                                ///En caso de serlo seteo el total de Páginas a 0 para que NO muestre el resumen para el último producto
                                var pagActual = parseInt($(".nav-link.active").attr("activepage"), 10);

                                if (offset === tamPagina+1){
                                  totalPaginas = 0;
                                }
                                if (pagActual === totalPaginas){
                                  /// En caso de ser de UN solo tipo, NO agrego el resumen del producto a pedido de Diego:
                                  if (mostrarResumenProducto){
                                    ///Resumen para el último producto: 
                                    var totalConsumos = 0;
                                    if (subtotales["retiros"] !== null){
                                      if (subtotales["retiros"][productoViejo] !== undefined) {
                                        var retiros3 = parseInt(subtotales["retiros"][productoViejo], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total Retiros:</td>\n\
                                                    <td class="subtotal" colspan="1">'+retiros3.toLocaleString()+'</td>\n\
                                                  </tr>';
                                        totalConsumos += retiros3;
                                      }
                                    }
                                    if (subtotales["renovaciones"] !== null){
                                      if (subtotales["renovaciones"][productoViejo] !== undefined) {
                                        var renos3 = parseInt(subtotales["renovaciones"][productoViejo], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total Renovaciones:</td>\n\
                                                    <td class="subtotal" colspan="1">'+renos3.toLocaleString()+'</td>\n\
                                                  </tr>';
                                        totalConsumos += renos3;
                                      } 
                                    }
                                    if (subtotales["destrucciones"] !== null){
                                      if (subtotales["destrucciones"][productoViejo] !== undefined) {
                                        var destrucciones3 = parseInt(subtotales["destrucciones"][productoViejo], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total Destrucciones:</td>\n\
                                                    <td class="subtotal" colspan="1">'+destrucciones3.toLocaleString()+'</td>\n\
                                                  </tr>';
                                        totalConsumos += destrucciones3;
                                      }
                                    }
                                    if (totalConsumos > 0) {
                                      tabla += '<tr>\n\
                                                  <td colspan="'+camposResumen+'" class="negrita">Total de Consumos:</td>\n\
                                                  <td class="totalConsumos" colspan="1">'+totalConsumos.toLocaleString()+'</td>\n\
                                                </tr>';
                                    }
                                    if (subtotales["ingresos"] !== null) {
                                      if (subtotales["ingresos"][productoViejo] !== undefined) {
                                        var ingresos3 = parseInt(subtotales["ingresos"][productoViejo], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total de Ingresos:</td>\n\
                                                    <td class="totalIngresos" colspan="1">'+ingresos3.toLocaleString()+'</td>\n\
                                                  </tr>';
                                      }         
                                    }
                                    
                                    if ((tipoMov === 'Todos')||(tipoMov === 'Ajustes')||(tipoMov === 'AJUSTE Retiros')||(tipoMov === 'AJUSTE Ingresos'))
                                      {
                                      if (subtotales["AJUSTE Retiros"] !== null){
                                        if (subtotales["AJUSTE Retiros"][productoViejo] !== undefined) {
                                          ajusteRetiros1 = parseInt(subtotales["AJUSTE Retiros"][productoViejo], 10);
                                          tabla += '<tr>\n\
                                                      <td colspan="'+camposResumen+'" class="negrita">Total AJUSTE Retiros:</td>\n\
                                                      <td class="totalAjusteRetiros" colspan="1">'+ajusteRetiros1.toLocaleString()+'</td>\n\
                                                    </tr>';
                                          //totalConsumos += retiros1;
                                        }
                                      }
                                      if (subtotales["AJUSTE Ingresos"] !== null) {
                                        if (subtotales["AJUSTE Ingresos"][productoViejo] !== undefined) {
                                          ajusteIngresos1 = parseInt(subtotales["AJUSTE Ingresos"][productoViejo], 10);
                                          tabla += '<tr>\n\
                                                      <td colspan="'+camposResumen+'" class="negrita">Total AJUSTE Ingresos:</td>\n\
                                                      <td class="totalAjusteIngresos" colspan="1">'+ajusteIngresos1.toLocaleString()+'</td>\n\
                                                    </tr>';
                                        }         
                                      }
                                    }

                                    productoViejo = produ;
                                    tabla += '<th colspan="'+totalCampos+'">&nbsp;\n\
                                            </th>';
                                  }
                                  else {
                                    if ((tipoMov === 'Ajustes')){
                                      if (subtotales["AJUSTE Retiros"] !== null){
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total AJUSTE Retiros:</td>\n\
                                                    <td class="totalAjusteRetiros" colspan="1">'+subtotalAjuRetiros.toLocaleString()+'</td>\n\
                                                  </tr>';
                                      }
                                      if (subtotales["AJUSTE Ingresos"] !== null) {
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumen+'" class="negrita">Total AJUSTE Ingresos:</td>\n\
                                                    <td class="totalAjusteIngresos" colspan="1">'+subtotalAjuIngresos.toLocaleString()+'</td>\n\
                                                  </tr>';                 
                                      }
                                    }
                                    else {
                                      tabla += '<tr>\n\
                                                <td colspan="'+camposResumen+'" class="negrita">Total '+tipoMov+':</td>\n\
                                                <td class="subtotal" colspan="1">'+subtotal.toLocaleString()+'</td>\n\
                                              </tr>';
                                    }               
                                  }
                                }  
                                ///****************** FIN RESUMEN último producto ó RESUMEN GENERAL *************************************************
                                
                                ///************************ CAPTION segun si es TODOS o alguna ENTIDAD **********************************************
                                if (!todos){
                                  tabla += '<caption>Movimientos de <b><i>'+entidad+'</i></b></caption>';
                                }
                                else {
                                  tabla += '<caption>Movimientos de <b><i>todas las entidades</i></b></caption>';
                                }
                                ///************************ FIN CAPTION segun si es TODOS o alguna ENTIDAD ******************************************
                                
                                var subtotalesJson = JSON.stringify(subtotales);
                                tabla += "<tr>\n\
                                            <td style='display:none'><input type='text' id='subtotales_"+j+"' value='"+subtotalesJson+"'></td>\n\
                                          </tr>";
                                tabla += '<tr>\n\
                                            <td class="pieTabla" colspan="'+totalCampos+'">\n\
                                              <input type="button" indice="'+j+'" name="exportarBusqueda" value="EXPORTAR" class="btn btn-primary exportar">\n\
                                            </td>\n\
                                          </tr>\n\
                                        </table>';
                                break;
      case 'productoMovimiento':  ///************************* INICIO RECUPERACIÓN DATOS ******************************************************************
                                  var bin = datos[0]['bin'];
                                  var ultimoMovimiento = datos[0]['ultimoMovimiento'];
                                  if (ultimoMovimiento === null) {
                                    ultimoMovimiento = '';
                                  }
                                  var contacto = datos[0]['contacto'];
                                  if (contacto === null) 
                                      {
                                      contacto = '';
                                    }
                                  var codigo_emsa = datos[0]['codigo_emsa'];
                                  if ((codigo_emsa === '')||(codigo_emsa === null)) 
                                      {
                                      codigo_emsa = 'NO Ingresado';
                                    }
                                  var codigo_origen = datos[0]['codigo_origen'];
                                  if ((codigo_origen === '')||(codigo_origen === null)) 
                                    {
                                    codigo_origen = 'NO Ingresado';
                                  }  
                                  var fechaCreacion = datos[0]['fechaCreacion'];
                                  if ((fechaCreacion === '')||(fechaCreacion === null)) 
                                    {
                                    fechaCreacion = 'NO Ingresada';
                                  }
                                  else {
                                    var fechaTemp = fechaCreacion.split('-');
                                    fechaCreacion = fechaTemp[2]+'/'+fechaTemp[1]+'/'+fechaTemp[0];
                                  }
                                  var comentarios = datos[0]['prodcom'];
                                  var claseComentario = "";
                                  if ((comentarios === "undefined")||(comentarios === null)||(comentarios === "")) 
                                    {
                                    comentarios = "";
                                  }
                                  else {
                                    var patron = "dif";
                                    var buscar = comentarios.search(new RegExp(patron, "i"));
                                    if (buscar !== -1){
                                      claseComentario = "resaltarDiferencia";
                                    }
                                    else {
                                      var patron = "stock";
                                      var buscar = comentarios.search(new RegExp(patron, "i"));
                                      if (buscar !== -1){
                                        claseComentario = "resaltarStock";
                                      }
                                      else {
                                        var patron = "plastico";
                                        var buscar = comentarios.search(new RegExp(patron, "i"));
                                        var patron1 = "plástico";
                                        var buscar1 = comentarios.search(new RegExp(patron1, "i"));
                                        if ((buscar !== -1)||(buscar1 !== -1)){
                                          claseComentario = "resaltarPlastico";
                                        }
                                        else {
                                          claseComentario = "resaltarComentario";
                                        }
                                      }
                                    }
                                  }
                                    
                                  if ((bin === 'SIN BIN')||(bin === null)||(bin === '')) 
                                      {
                                      bin = 'N/D o N/C';
                                    }
                                  var snapshot = datos[0]['snapshot'];
                                  if ((snapshot === '')||(snapshot === undefined)||(snapshot === null)){
                                    snapshot = 'noDisponible1.png';
                                  }
                                  var alarma1 = parseInt(datos[0]['alarma1'], 10);
                                  var alarma2 = parseInt(datos[0]['alarma2'], 10);
                                  var stock = parseInt(datos[0]['stock'],10);
                                  if ((stock < alarma1) && (stock > alarma2)){
                                    claseResaltado = "alarma1";
                                  }
                                  else {
                                    if (stock < alarma2) {
                                      claseResaltado = "alarma2";
                                    }
                                    else {
                                      claseResaltado = "resaltado italica";
                                    }
                                  }
                                  ///************************* FIN RECUPERACIÓN DATOS *********************************************************************
                                  
                                  ///********************************************* TABLA DEL PRODUCTO *****************************************************
                                  var tabla = '<table name="detallesProducto" id="detallesProducto_'+j+'" class="tabla2">';
                                  tabla += '<caption>Detalles del producto <b><i>'+datos[0]['nombre_plastico']+'</i></b></caption>';
                                  tabla += '<tr>\n\
                                              <th colspan="2" class="tituloTabla">PRODUCTO</th>\n\
                                           </tr>';                       
                                  tabla += '<tr><th>Nombre:</th><td>'+datos[0]['nombre_plastico']+'</td></tr>';
                                  tabla += '<tr><th>Entidad:</th><td>'+datos[0]['entidad']+'</td></tr>';
                                  tabla += '<tr><th>C&oacute;d. EMSA:</th><td>'+codigo_emsa+'</td></tr>';
                                  tabla += '<tr><th>C&oacute;d. Origen:</th><td>'+codigo_origen+'</td></tr>';
                                  tabla += '<tr><th>Fecha de Creaci&oacute;n:</th><td>'+fechaCreacion+'</td></tr>';
                                  tabla += '<tr><th>BIN:</th><td nowrap>'+bin+'</td></tr>';
                                  tabla += '<tr><th>Snapshot:</th><td><img id="snapshot" name="hint" src="'+rutaFoto+snapshot+'" alt="No se cargó aún." height="125" width="200"></img></td></tr>';
                                  tabla += '<tr><th>Contacto:</th><td>'+contacto+'</td></tr>';
                                  tabla += '<tr><th>Comentarios:</th><td class="'+claseComentario+'">'+comentarios+'</td></tr>';
                                  tabla += '<tr><th>&Uacute;ltimo Moviemiento:</th><td>'+ultimoMovimiento+'</td></tr>';
                                  tabla += '<tr><th>Stock:</th><td class="'+claseResaltado+'">'+stock.toLocaleString()+'</td></tr>';
                                  tabla += '<tr><th colspan="2" class="pieTabla centrado">FIN</th></tr>';
                                  tabla += '</table>';
                                  ///********************************************* TABLA DEL PRODUCTO *****************************************************
                                  
                                  tabla += '<br>';
                                  
                                  ///********************************************* TABLA MOVIMIENTOS ******************************************************
                                  tabla += '<table name="movimientos" id="resultados_'+j+'" class="tabla2">';
                                  tabla += '<caption>Movimientos del producto <b><i>'+datos[0]['nombre_plastico']+'</i></b></caption>';
                                  tabla += '<tr><th class="tituloTabla" colspan="'+totalCamposProd+'">MOVIMIENTOS</th></tr>';
                                  tabla += '<tr>\n\
                                              <th>Item</th>\n\
                                              <th>Fecha</th>\n\
                                              <th>Hora</th>\n\
                                              <th>Tipo</th>';
                                  if (mostrarEstado){
                                    tabla += '<th>Estado</th>';
                                  }
                                  tabla += '  <th>Comentarios</th>\n\
                                              <th>Cantidad</th>\n\
                                           </tr>';
                                  ///Defino variable tipoMov para detectar el tipo de movimiento filtrado, a saber:
                                  ///Todos -> "de todos los tipos (inc. AJUSTES)": usado para consultar TODOS los movimientos 
                                  ///Clientes -> "de todos los tipos": usado para consultar todos los movimientos, menos los de AJUSTES
                                  ///Ajustes -> "del tipo AJUSTE": usado para consultar los movimientos por ajustes (tanto ingresos como egresos)
                                  ///AJUSTE Retiro -> "del tipo AJUSTE Retiro": usado para consultar los movimientos por ajustes de retiros
                                  ///AJUSTE Ingreso -> "del tipo AJUSTE Ingreso": usado para consultar los movimientos por ajustes de ingresos
                                  var tipoMov = '';
                                  ///Veo si contiene la palabra AJUSTE; de tenerla hay 4 opciones
                                  if (tipoConsulta.indexOf("AJUSTE") > -1){
                                    if (tipoConsulta.indexOf("Retiro") > -1){
                                      tipoMov = 'AJUSTE Retiros';
                                    }
                                    else {
                                      if (tipoConsulta.indexOf("Ingreso") > -1){
                                        tipoMov = 'AJUSTE Ingresos';
                                      }
                                      else {
                                        if (tipoConsulta.indexOf("todos") > -1){
                                          tipoMov = "Todos";
                                        }
                                        else {
                                          tipoMov = "Ajustes";
                                        }
                                      }
                                    }
                                  }
                                  else {
                                    if (tipoConsulta.indexOf("todos") > -1){
                                      tipoMov = "Clientes";
                                    }
                                    else {
                                      if (tipoConsulta.indexOf("Retiro") > -1){
                                        tipoMov = 'Retiros';
                                      }
                                      else {
                                        if (tipoConsulta.indexOf("Ingreso") > -1){
                                          tipoMov = 'Ingresos';
                                        }
                                        else {
                                          if (tipoConsulta.indexOf("Renovación") > -1){
                                            tipoMov = 'Renovaciones';
                                          }
                                          else {
                                            tipoMov = 'Destrucciones';
                                          }
                                        }
                                      }
                                    }  
                                  }
                                  
                                  ///****************************** COMIENZO A RECORRER ARRAY CON LOS DATOS ***********************************************
                                  for (var i=0; i<max; i++) {
                                    ///*********************************** RECUPERO DATOS DEL MOVIMIENTO **************************************************
                                    var tipo2 = datos[i]['tipo'];
                                    var fecha = datos[i]['fecha'];
                                    var hora = datos[i]["hora"];
                                    var idmov = datos[i]["idmov"];
                                    var produ = datos[i]['idprod'];
                                    var estadoMov = datos[i]['estado'];
                                    var cantidad = parseInt(datos[i]['cantidad'], 10);
                                    var alarma1 = parseInt(datos[i]['alarma1'], 10);
                                    var alarma2 = parseInt(datos[i]['alarma2'], 10);
                                    var stock = parseInt(datos[i]['stock'], 10);
                                    var claseResaltado = '';
                                    if ((stock < alarma1) && (stock > alarma2)){
                                      claseResaltado = "alarma1";
                                    }
                                    else {
                                      if (stock < alarma2) {
                                        claseResaltado = "alarma2";
                                      }
                                      else {
                                        claseResaltado = "resaltado";
                                      }
                                    } 
                                    var comentarios = datos[i]['comentarios'];
                                    if ((comentarios === "undefined")||(comentarios === null)) {
                                      comentarios = "";
                                    }
                                    ///*********************************** FIN RECUPERO DATOS DEL MOVIMIENTO **********************************************
                                    
                                    ///*************************************** Muestro Datos del Movimiento ***********************************************
                                    tabla += '<tr>\n\
                                                <td>'+offset+'</td>\n\
                                                <td>'+fecha+'</td>\n\
                                                <td>'+hora+'</td>\n\
                                                <td>'+tipo2+'</td>';
                                    if (mostrarEstado){
                                      tabla += '<td>'+estadoMov+'</td>';
                                    }
                                    tabla += '  <td>'+comentarios+'</td>\n\
                                                <td class="'+claseResaltado+'"><a href="editarMovimiento.php?id='+idmov+'">'+cantidad.toLocaleString()+'</a></td>\n\
                                              </tr>';
                                    ///*************************************** FIN Muestro Datos del Movimiento ********************************************          
                                    offset++;  
                                  }
                                  ///************************************ COMIENZO RESUMEN DEL PRODUCTO ***************************************************
                                  var pagActual = parseInt($(".nav-link.active").attr("activepage"), 10);
                                  /// SE COMENTA PUES totalPaginas ahora se pasa como parámetro
                                  ///Agrego if para saber si la variable con el total de páginas existe o no pues solo existirá si el total de datos 
                                  ///es mayor al tamaño de página elegida (de lo contrario no se crea el div con los datosOcultos
//                                  if (parseInt($("#totalPaginas_"+j).length, 10) > 0){
//                                    totalPaginas = parseInt($("#totalPaginas_"+j).val(), 10);alert('en el if');
//                                  }
//                                  else {
//                                    totalPaginas = 1;
//                                  }

                                  if (pagActual === totalPaginas){
                                    var totalConsumos = 0;
                                    var retiros1 = 0;
                                    var ajusteRetiros1 = 0;
                                    var renos1 = 0;
                                    var destrucciones1 = 0;
                                    var ingresos1 = 0;
                                    var ajusteIngresos1 = 0;
                                    if (subtotales["retiros"] !== null){
                                      if (subtotales["retiros"][produ] !== undefined) {
                                        retiros1 = parseInt(subtotales["retiros"][produ], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumenProd+'" class="negrita">Total Retiros:</td>\n\
                                                    <td class="subtotal" colspan="1">'+retiros1.toLocaleString()+'</td>\n\
                                                  </tr>';
                                        totalConsumos += retiros1;
                                      }
                                    }
                                    if (subtotales["renovaciones"] !== null){
                                      if (subtotales["renovaciones"][produ] !== undefined) {
                                        renos1 = parseInt(subtotales["renovaciones"][produ], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumenProd+'" class="negrita">Total Renovaciones:</td>\n\
                                                    <td class="subtotal" colspan="1">'+renos1.toLocaleString()+'</td>\n\
                                                  </tr>';
                                        totalConsumos += renos1;
                                      } 
                                    }
                                    if (subtotales["destrucciones"] !== null){
                                      if (subtotales["destrucciones"][produ] !== undefined) {
                                        destrucciones1 = parseInt(subtotales["destrucciones"][produ], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumenProd+'" class="negrita">Total Destrucciones:</td>\n\
                                                    <td class="subtotal" colspan="1">'+destrucciones1.toLocaleString()+'</td>\n\
                                                  </tr>';
                                        totalConsumos += destrucciones1;
                                      }
                                    }
                                    
                                    if ((tipoMov === 'Clientes')||(tipoMov === 'Todos')){
                                      if (totalConsumos > 0) {
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumenProd+'" class="negrita">Total de Consumos:</td>\n\
                                                    <td class="totalConsumos" colspan="1">'+totalConsumos.toLocaleString()+'</td>\n\
                                                  </tr>';
                                      }
                                    }
                                    
                                    if (subtotales["ingresos"] !== null) {
                                      if (subtotales["ingresos"][produ] !== undefined) {
                                        ingresos1 = parseInt(subtotales["ingresos"][produ], 10);
                                        tabla += '<tr>\n\
                                                    <td colspan="'+camposResumenProd+'" class="negrita">Total de Ingresos:</td>\n\
                                                    <td class="totalIngresos" colspan="1">'+ingresos1.toLocaleString()+'</td>\n\
                                                  </tr>';
                                      }         
                                    }
                                    
                                    if ((tipoMov === 'Todos')||(tipoMov === 'Ajustes')||(tipoMov === 'AJUSTE Retiros')||(tipoMov === 'AJUSTE Ingresos'))
                                      {
                                      if (subtotales["AJUSTE Retiros"] !== null){
                                        if (subtotales["AJUSTE Retiros"][produ] !== undefined) {
                                          ajusteRetiros1 = parseInt(subtotales["AJUSTE Retiros"][produ], 10);
                                          tabla += '<tr>\n\
                                                      <td colspan="'+camposResumenProd+'" class="negrita">Total AJUSTE Retiros:</td>\n\
                                                      <td class="totalAjusteRetiros" colspan="1">'+ajusteRetiros1.toLocaleString()+'</td>\n\
                                                    </tr>';
                                          //totalConsumos += retiros1;
                                        }
                                      }
                                      if (subtotales["AJUSTE Ingresos"] !== null) {
                                        if (subtotales["AJUSTE Ingresos"][produ] !== undefined) {
                                          ajusteIngresos1 = parseInt(subtotales["AJUSTE Ingresos"][produ], 10);
                                          tabla += '<tr>\n\
                                                      <td colspan="'+camposResumenProd+'" class="negrita">Total AJUSTE Ingresos:</td>\n\
                                                      <td class="totalAjusteIngresos" colspan="1">'+ajusteIngresos1.toLocaleString()+'</td>\n\
                                                    </tr>';
                                        }         
                                      }
                                    }
                                    ///**************************************** FIN RESUMEN DEL PRODUCTO ****************************************************

                                    tabla += '<th colspan="'+totalCamposProd+'">&nbsp;\n\
                                              </th>';
                                  }      
                                  var subtotalesJson = JSON.stringify(subtotales);
                                  tabla += "<tr>\n\
                                              <td style='display:none'><input type='text' id='subtotales_"+j+"' value='"+subtotalesJson+"'></td>\n\
                                            </tr>";
                                  tabla += '<tr>\n\
                                              <td class="pieTabla" colspan="'+totalCamposProd+'">\n\
                                                <input type="button" indice="'+j+'" name="exportarBusqueda" value="EXPORTAR" class="btn btn-primary exportar">\n\
                                              </td>\n\
                                            </tr>\n\
                                          </table>'; 
                                  break;
      default: break;
    }
    
  $('html, body').animate({scrollTop:136}, '100');
  
  return tabla;
} 
/********** fin mostrarTabla(radio, datos, j, todos, offset, fin, subtotales, max, totalPlasticos) **********/

/**
 * \brief Función que, en base a los parámetros pasados, ejecuta la o las consultas pertinentes
 * @param {String} radio String que indica el tipo de consulta a realizar (stock de entidades o de productos, total en bóveda, o movimientos).
 * @param {type} queries Array de Strings con la o las consultas a realizar.
 * @param {type} consultasCSV Array de Strings con las consultas para generar el o los CSV.
 * @param {type} idProds Array de Int con los ID del o de los productos.
 * @param {type} tipoConsultas Array de Strings con el mensaje que indica los tipos de consultas realizadas.
 * @param {type} entidadesStock Array de Strings con los nombres de la o las entidades seleccionadas para consultar su stock.
 * @param {type} entidadesMovimiento Array de Strings con los nombres de la o las entidades seleccionadas para consultas sus movimientos.
 * @param {type} nombresProductos Array de Strings con los nombres del o de los productos seleccionados.
 * @param {type} nombres Array de Strings con el nombre a mostrar en las pestañas generadas.
 * @param {type} ent Array de Strings con los nombres de las entidades seleccionadas.
 * @param {String} prodHint String con la cadena usada para la búsqueda de productos.
 * @param {String} mensajeTipo String con el tipo de consulta realizada (si fue stock o movimientos y de que entidad o producto). 
 * @param {String} mensajeUsuario String con el usuario seleccionado, sólo en el caso se haya filtrado por algún usuario involucrado.
 * @param {String} mensajeFecha String con el rango de fechas elegido para la consulta, o todo el rango en caso de no haberlo seleccionado.
 * @param {String} zip String que indica el tipo de seguridad que se requiere para el archivo ZIP que se genera.
 * @param {String} zipManual String con la contraseña elegida para el ZIP que se genera en caso de haber elegido por el tipo manual.
 * @param {String} planilla String que indica el tipo de seguridad que se requiere para la planilla EXCEL que se genera.
 * @param {String} planillaManual String con la contraseña elegida para la planilla EXCEL que se genera en caso de haber elegido por el tipo manual.
 * @param {Boolean} marcaAgua Booleano que indica si se quiere agregar o no la marca de agua de seguridad en los PDFs generados.
 * @param {String} p String que indica el tipo de filtro de fechas que se usó para la consulta.
 * @param {String} d1 String que indica la primer fecha del rango (puede ser una fecha o el mes en caso de que sea por meses).
 * @param {String} d2 String que indica la segunda fecha del rango (puede ser una fecha o el año en caso de que sea por meses).
 * @param {String} tipo String que indica el tipo movimiento que se quiere filtrar.
 * @param {String} user String que indica el usuario involucrado que se usó para filtrar.
 * @param {String} estadoMov String que indica el estado de los movimientos usado para filtrar.
 * @param {String} mostrarEstado String que indica si se debe mostrar o no el estado de los movimientos en los reportes.
 * @returns {String} String con el HTML que contiene los títulos y la tabla a mostrar. La tabla la generará mostrarTabla a la cual se llama desde acá.
 */
function mostrarResultados(radio, queries, consultasCSV, idProds, tipoConsultas, entidadesStock, entidadesMovimiento, nombresProductos, nombres, ent, prodHint, mensajeTipo, mensajeUsuario, mensajeFecha, zip, planilla, marcaAgua, zipManual, planillaManual, p, d1, d2, tipo, user, estadoMov, mostrarEstado){
  var url = '';
  var tipoUrl = encodeURI(tipo);
  var entUrl = encodeURIComponent(ent);
  if ((radio === 'entidadStockViejo')||(radio === 'productoStockViejo')){
    url = "data/stockViejoJSON.php";
  }
  else {
    url = "data/selectQueryJSON.php";
  }
  
  $("#main-content").empty();

  var mostrarGlobal = '<ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">';
  var activo = '';
  var campos = '';
  var largos = '';
  var mostrarCamposQuery = '';
  var x = 55;
  var tipMov = '';
  var selected = '';
  
  switch (radio){
    case 'entidadStockViejo':
    case 'entidadStock':tipMov = 'entStock'; 
                        break;
    case 'productoStockViejo':                      
    case 'productoStock': tipMov = 'prodStock';
                          break;
    case 'totalStock':  tipMov = 'totalStock';
                        break;                  
    case 'entidadMovimiento': tipMov = 'entMov';
                              break;
    case 'productoMovimiento':  tipMov = 'prodMov';
                                break;
    default: break;
  }
  
  for (var n in queries){
    if (n == 0) {
      activo = 'active';
      selected = 'true';
    }
    else {
      activo = '';
      selected = 'false';
    }
    mostrarGlobal += '<li class="nav-item rounded-right rounded-left">\n\
                        <a class="nav-link '+activo+'" id="pills-'+idProds[n]+'-tab" activepage="1" data-toggle="pill" href="#panel-'+idProds[n]+'" role="tab" aria-controls="'+idProds[n]+'" aria-selected="'+selected+'">'+nombres[n]+'</a>\n\
                      </li>'; 
    //alert(queries[n]);
  }
  mostrarGlobal += '</ul>';
  mostrarGlobal += '<div class="tab-content rounded-right rounded-left" id="pills-tabContent">';

  var jsonQuery = JSON.stringify(queries);
  
  $.getJSON(url, {query: ""+jsonQuery+"", tipo: ""+radio+""}).done(function(request){
    for (var j in request){
      var datos = request[j].resultado;
      var totalPlasticos = 0;
      totalPlasticos = request[j].suma;
      var totalRetiros = request[j]["retiros"];
      var totalRenovaciones = request[j]["renovaciones"];
      var totalDestrucciones = request[j]["destrucciones"];
      var totalIngresos = request[j]["ingresos"];
      var totalAjusteRetiros = request[j]["ajusteRetiros"];
      var totalAjusteIngresos = request[j]["ajusteIngresos"];
      var stockViejo = '';
      if ((radio === 'entidadStockViejo')||(radio === 'productoStockViejo')){
        stockViejo = request[j]["stockViejo"];
        queries[j] = request[j].query;
      }
      else {
        stockViejo = null;
      }
      var jsonStockViejo = JSON.stringify(stockViejo);
      var totalDatos = parseInt(request[j].totalRows, 10);
      
      if (j == 0) {
        activo = 'show active';
      }
      else {
        activo = '';
      }
      
      //var divi = '<div class="tab-pane '+activo+' rounded-right" id="'+idProds[j]+'" indice="'+j+'" role="tabpanel" aria-labelledby="pills-home-tab">'; 
      var divi = '<div class="tab-pane fade '+activo+'" id="panel-'+idProds[j]+'" indice="'+j+'" role="tabpanel" aria-labelledby="pills-'+idProds[j]+'-tab">'; 
      var mostrar = '';
      mostrar += divi;
      var titulo = "<h2 id='titulo'>Resultado de la búsqueda</h2>";
      mostrar += titulo;
      var mensajeConsulta = tipoConsultas[j];
      if (mensajeTipo !== null) {
        mensajeConsulta += " "+mensajeTipo;
      }
      mensajeConsulta += " "+mensajeFecha;
      if (mensajeUsuario !== null) {
        mensajeConsulta += mensajeUsuario;
      } 
      mostrar += "<h3>"+mensajeConsulta+"</h3>";
      var mensajeTotalDatos = '';

      var todos = false;
      if (totalDatos >= 1) 
        {
        var formu = '<form name="resultadoBusqueda" id="resultadoBusqueda_'+j+'" target="_blank" action="exportar.php" method="POST" class="exportarForm">';
        switch (radio){
          case 'entidadStock':  if (entidadesStock[0] === 'todos'){
                                  todos = true;
                                }
                                mensajeTotalDatos = "<h3>Total de productos: <font class='naranja'>"+totalDatos+"</font></h3>";
                                break;
          case 'productoStock': break;
          case 'totalStock':  mensajeTotalDatos = "<h3>Total de entidades: <font class='naranja'>"+totalDatos+"</font></h3>";
                              break;
          case 'entidadStockViejo': if (entidadesStock[0] === 'todos'){
                                      todos = true;
                                    }
                                    mensajeTotalDatos = "<h3>Total de productos: <font class='naranja'>"+totalDatos+"</font></h3>";
                                    break;                   
          case 'entidadMovimiento': if (entidadesMovimiento[0] === 'todos'){
                                      todos = true;
                                    }
                                    mensajeTotalDatos = "<h3>Total de movimientos: <font class='naranja'>"+totalDatos+"</font></h3>";
                                    break;
          case 'productoStockViejo':  break;
          case 'productoMovimiento':  mensajeTotalDatos = "<h3>Total de movimientos: <font class='naranja'>"+totalDatos+"</font></h3>";
                                      break;
          default: break;
        }

        var subtotales = {"retiros":totalRetiros, "renovaciones":totalRenovaciones, "destrucciones":totalDestrucciones, "ingresos":totalIngresos, "stockViejo": stockViejo, "AJUSTE Retiros": totalAjusteRetiros, "AJUSTE Ingresos": totalAjusteIngresos};

        ///Vuelvo a definir una variable local tamPagina para actualizar el valor que ya tiene.
        ///Esto es para que tome el último valor en caso de que se haya modificado desde el modal (que no cambia hasta recargar la página).
        var tamPagina = parseInt($("#tamPagina").val(), 10);
        var max = parseInt(tamPagina, 10);
        var parcial = true; 
        ///Chequeo en que caso estoy pues la parte de movimientos funciona con parcial invertido:
        if ((radio === 'entidadMovimiento') || (radio === 'productoMovimiento')){
          parcial = false;
        }
        if (totalDatos < tamPagina){
          max = totalDatos%tamPagina;
          parcial = false;
        }
        var totalPaginas = Math.ceil(totalDatos/tamPagina);
        //                                            <td style="display:none"><input type="text" id="param" name="param" value=""></td>\n\
        //                                            <td style="display:none"><input type="text" id="d1" name="d1" value="'+d1+'"></td>\n\
        //                                            <td style="display:none"><input type="text" id="d2" name="d2" value="'+d2+'"></td>\n\
        //                                            <td style="display:none"><input type="text" id="p" name="p" value="'+p+'"></td>\n\
        //                                            <td style="display:none"><input type="text" id="tipo" name="tipo" value="'+tipo+'"></td>\n\
        //                                            <td style="display:none"><input type="text" id="user" name="user" value="'+user+'"></td>\n\
        var mostrarEstadoBinario = '0';
        if (mostrarEstado === false){
          mostrarEstadoBinario = '0';
        }
        else {
          mostrarEstadoBinario = '1';
        }

        var datosOcultos = '<table id="datosOcultos_'+j+'" name="datosOcultos" class="tabla2" style="display:none">';
        switch (radio){
          case 'entidadStockViejo':
          case 'entidadStock':  campos = "Id-IdProd-Entidad-Nombre-BIN-C&oacute;d. EMSA-C&oacute;d. Origen-Contacto-Snapshot-&Uacute;lt. Mov.-Stock-Alarma1-Alarma2-Mensaje-Fecha Creaci&oacute;n";
                                largos = "0.8-0.5-1.2-2.5-0.8-1.9-1.5-1-1-1.2-1.6-1-2-1.7-1.5";
                                mostrarCamposQuery = "1-0-1-1-0-1-1-0-0-1-1-0-0-0-0";
                                x = 20;
                                tipMov = 'entStock';
                                datosOcultos += '<tr><td style="display:none"><input type="text" id="query_'+j+'" name="query_'+j+'" value="'+queries[j]+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="subtotales_'+j+'" name="subtotales_'+j+'" value='+jsonStockViejo+'></td>\n\
                                                    <td style="display:none"><input type="text" id="radio_'+j+'" name="radio_'+j+'" value="'+radio+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="idTipo_'+j+'" name="idTipo_'+j+'" value="1"></td>\n\
                                                    <td style="display:none"><input type="text" id="indice_'+j+'" name="indice" value=""></td>\n\
                                                    <td style="display:none"><input type="text" id="consultaCSV_'+j+'" name="consultaCSV_'+j+'" value="'+consultasCSV[j]+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="campos_'+j+'" name="campos_'+j+'" value="'+campos+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="largos_'+j+'" name="largos_'+j+'" value="'+largos+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="entidad_'+j+'" name="entidad_'+j+'" value="'+entidadesStock[j]+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="mostrar_'+j+'" name="mostrar_'+j+'" value="'+mostrarCamposQuery+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="tipoConsulta_'+j+'" name="tipoConsulta_'+j+'" value="'+mensajeConsulta+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="x_'+j+'" name="x_'+j+'" value="'+x+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="zip_'+j+'" name="zip_'+j+'" value="'+zip+'"></td>\n\
                                                    <td style="display:none"><input type="password" id="zipManual_'+j+'" name="zipManual_'+j+'" value="'+zipManual+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="planilla_'+j+'" name="planilla_'+j+'" value="'+planilla+'"></td>\n\
                                                    <td style="display:none"><input type="password" id="planillaManual_'+j+'" name="planillaManual_'+j+'" value="'+planillaManual+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="marcaAgua_'+j+'" name="marcaAgua_'+j+'" value="'+marcaAgua+'"></td>\n\
                                                  </tr>';
                                break;
          case 'productoStockViejo':                      
          case 'productoStock': campos = "Id-IdProd-Entidad-Nombre-BIN-C&oacute;d. EMSA-C&oacute;d. Origen-Contacto-Snapshot-&Uacute;lt. Mov.-Stock-Alarma1-Alarma2-Mensaje-Fecha Creaci&oacute;n";
                                largos = "0.8-0.5-1.2-2.5-0.8-2-1.5-1-1-1.2-1.4-1-2-1.7-1.5";
                                mostrarCamposQuery = "1-0-1-1-0-1-1-0-0-1-1-0-0-0-0";
                                x = 22;
                                tipMov = 'prodStock';
                                datosOcultos += '<tr><td style="display:none"><input type="text" id="query_'+j+'" name="query_'+j+'" value="'+queries[j]+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="subtotales_'+j+'" name="subtotales_'+j+'" value='+jsonStockViejo+'></td>\n\
                                                    <td style="display:none"><input type="text" id="radio_'+j+'" name="radio_'+j+'" value="'+radio+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="idTipo_'+j+'" name="idTipo_'+j+'" value="2"></td>\n\
                                                    <td style="display:none"><input type="text" id="indice_'+j+'" name="indice" value=""></td>\n\
                                                    <td style="display:none"><input type="text" id="consultaCSV_'+j+'" name="consultaCSV_'+j+'" value="'+consultasCSV[j]+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="campos_'+j+'" name="campos_'+j+'" value="'+campos+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="largos_'+j+'" name="largos_'+j+'" value="'+largos+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="nombreProducto_'+j+'" name="nombreProducto_'+j+'" value="'+nombresProductos[j]+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="idProd_'+j+'" name="idProd_'+j+'" value="'+idProds[j]+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="mostrar_'+j+'" name="mostrar_'+j+'" value="'+mostrarCamposQuery+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="tipoConsulta_'+j+'" name="tipoConsulta_'+j+'" value="'+mensajeConsulta+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="x_'+j+'" name="x_'+j+'" value="'+x+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="zip_'+j+'" name="zip_'+j+'" value="'+zip+'"></td>\n\
                                                    <td style="display:none"><input type="password" id="zipManual_'+j+'" name="zipManual_'+j+'" value="'+zipManual+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="planilla_'+j+'" name="planilla_'+j+'" value="'+planilla+'"></td>\n\
                                                    <td style="display:none"><input type="password" id="planillaManual_'+j+'" name="planillaManual_'+j+'" value="'+planillaManual+'"></td>\n\
                                                    <td style="display:none"><input type="text" id="marcaAgua_'+j+'" name="marcaAgua_'+j+'" value="'+marcaAgua+'"></td>\n\
                                                  </tr>';
                                break;
          case 'totalStock':  campos = 'Id-Entidad-Stock';
                              largos = '1-3.0-1.8';
                              mostrarCamposQuery = "1-1-1";
                              x = 60;
                              tipMov = 'totalStock';
                              datosOcultos += '<tr><td style="display:none"><input type="text" id="query_0" name="query_0" value="'+queries[j]+'"></td>\n\
                                                <td style="display:none"><input type="text" id="idTipo_'+j+'" name="idTipo_'+j+'" value="3"></td>\n\
                                                <td style="display:none"><input type="text" id="indice_'+j+'" name="indice" value=""></td>\n\
                                                <td style="display:none"><input type="text" id="radio_'+j+'" name="radio_'+j+'" value="'+radio+'"></td>\n\
                                                <td style="display:none"><input type="text" id="consultaCSV_0" name="consultaCSV_0" value="'+consultasCSV[j]+'"></td>\n\
                                                <td style="display:none"><input type="text" id="campos_'+j+'" name="campos_'+j+'" value="'+campos+'"></td>\n\
                                                <td style="display:none"><input type="text" id="mostrar_'+j+'" name="mostrar_'+j+'" value="'+mostrarCamposQuery+'"></td>\n\
                                                <td style="display:none"><input type="text" id="largos_'+j+'" name="largos_'+j+'" value="'+largos+'"></td>\n\
                                                <td style="display:none"><input type="text" id="tipoConsulta_0" name="tipoConsulta_0" value="'+mensajeConsulta+'"></td>\n\
                                                <td style="display:none"><input type="text" id="x_'+j+'" name="x_'+j+'" value="'+x+'"></td>\n\
                                                <td style="display:none"><input type="text" id="zip_'+j+'" name="zip_'+j+'" value="'+zip+'"></td>\n\
                                                <td style="display:none"><input type="password" id="zipManual_'+j+'" name="zipManual_'+j+'" value="'+zipManual+'"></td>\n\
                                                <td style="display:none"><input type="text" id="planilla_'+j+'" name="planilla_'+j+'" value="'+planilla+'"></td>\n\
                                                <td style="display:none"><input type="password" id="planillaManual_'+j+'" name="planillaManual_'+j+'" value="'+planillaManual+'"></td>\n\
                                                <td style="display:none"><input type="text" id="marcaAgua_'+j+'" name="marcaAgua_'+j+'" value="'+marcaAgua+'"></td>\n\
                                              </tr>';
                             break;
          case 'entidadMovimiento': campos = 'Id-IdProd-Entidad-Nombre-BIN-Cód. EMSA-Cód. Origen-Contacto-Snapshot-&Uacute;lt. Mov.-Stock-Alarma1-Alarma2-ComentariosProd-Fecha Creaci&oacute;n-Fecha-Hora-Cantidad-Tipo-Comentarios-Estado-IdMov';
                                    //Orden de la consulta: idprod - entidad - nombre - bin - cod emsa - cod origen - contacto - snapshot - ult.Mov - stock - alarma1 - alarma2 - prodcom - fechaCreacion - fecha - hora - cantidad - tipo - comentarios - estado - idmov
                                    largos = '0.75-0.5-1.6-1.9-1-2.0-1.5-1-1-1-1-1-1.1-1.5-1.85-1.25-0.8-1.2-1.3-2-1-0.5';
                                    mostrarCamposQuery = '1-0-1-1-0-1-1-0-0-0-0-0-0-0-0-1-1-1-1-1-'+mostrarEstadoBinario+'-0';
                                    x = 40;
                                    tipMov = 'entMov';
                                    datosOcultos += '<tr><td style="display:none"><input type="text" id="query_'+j+'" name="query_'+j+'" value="'+queries[j]+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="radio_'+j+'" name="radio_'+j+'" value="'+radio+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="idTipo_'+j+'" name="idTipo_'+j+'" value="4"></td>\n\
                                                        <td style="display:none"><input type="text" id="indice_'+j+'" name="indice" value=""></td>\n\
                                                        <td style="display:none"><input type="text" id="consultaCSV_'+j+'" name="consultaCSV_'+j+'" value="'+consultasCSV[j]+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="campos_'+j+'" name="campos_'+j+'" value="'+campos+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="largos_'+j+'" name="largos_'+j+'" value="'+largos+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="mostrar_'+j+'" name="mostrar_'+j+'" value="'+mostrarCamposQuery+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="entidad_'+j+'" name="entidad_'+j+'" value="'+entidadesMovimiento[j]+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="tipoConsulta_'+j+'" name="tipoConsulta_'+j+'" value="'+mensajeConsulta+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="x_'+j+'" name="x_'+j+'" value="'+x+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="zip_'+j+'" name="zip_'+j+'" value="'+zip+'"></td>\n\
                                                        <td style="display:none"><input type="password" id="zipManual_'+j+'" name="zipManual_'+j+'" value="'+zipManual+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="planilla_'+j+'" name="planilla_'+j+'" value="'+planilla+'"></td>\n\
                                                        <td style="display:none"><input type="password" id="planillaManual_'+j+'" name="planillaManual_'+j+'" value="'+planillaManual+'"></td>\n\
                                                        <td style="display:none"><input type="text" id="marcaAgua_'+j+'" name="marcaAgua_'+j+'" value="'+marcaAgua+'"></td>\n\
                                                      </tr>';
                                    break;
          case 'productoMovimiento':  campos = 'Id-IdProd-Entidad-Nombre-BIN-Cód. EMSA-Cód. Origen-Contacto-Snapshot-&Uacute;lt. Mov.-Stock-Alarma1-Alarma2-ComentariosProd-Fecha Creaci&oacute;n-Fecha-Hora-Cantidad-Tipo-Comentarios-Estado-IdMov';
                                      //Orden de la consulta: idprod - entidad - nombre - bin - cod emsa - cod origen - contacto - snapshot - ult.Mov - stock - alarma1 - alarma2 - prodcom - fechaCreacion - fecha - hora - cantidad - tipo - comentarios - estado - idmov
                                      largos = '0.65-0.5-1.5-1.8-1-1-1-1-1-1-1-1-1.1-1.5-1.85-1.25-0.8-1.2-1.4-2-1-0.8';
                                      mostrarCamposQuery = '1-0-0-0-0-0-0-0-0-0-0-0-0-0-0-1-1-1-1-1-'+mostrarEstadoBinario+'-0';
                                      x = 40;
                                      tipMov = 'prodMov';
                                      datosOcultos += '<tr><td style="display:none"><input type="text" id="query_'+j+'" name="query_'+j+'" value="'+queries[j]+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="radio_'+j+'" name="radio_'+j+'" value="'+radio+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="idTipo_'+j+'" name="idTipo_'+j+'" value="5"></td>\n\
                                                          <td style="display:none"><input type="text" id="indice_'+j+'" name="indice" value=""></td>\n\
                                                          <td style="display:none"><input type="text" id="consultaCSV_'+j+'" name="consultaCSV_'+j+'" value="'+consultasCSV[j]+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="campos_'+j+'" name="campos_'+j+'" value="'+campos+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="largos_'+j+'" name="largos_'+j+'" value="'+largos+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="nombreProducto_'+j+'" name="nombreProducto_'+j+'" value="'+nombresProductos[j]+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="mostrar_'+j+'" name="mostrar_'+j+'" value="'+mostrarCamposQuery+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="idProd_'+j+'" name="idProd_'+j+'" value="'+idProds[j]+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="tipoConsulta_'+j+'" name="tipoConsulta_'+j+'" value="'+mensajeConsulta+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="x_'+j+'" name="x_'+j+'" value="'+x+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="zip_'+j+'" name="zip_'+j+'" value="'+zip+'"></td>\n\
                                                          <td style="display:none"><input type="password" id="zipManual_'+j+'" name="zipManual_'+j+'" value="'+zipManual+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="planilla_'+j+'" name="planilla_'+j+'" value="'+planilla+'"></td>\n\
                                                          <td style="display:none"><input type="password" id="planillaManual_'+j+'" name="planillaManual_'+j+'" value="'+planillaManual+'"></td>\n\
                                                          <td style="display:none"><input type="text" id="marcaAgua_'+j+'" name="marcaAgua_'+j+'" value="'+marcaAgua+'"></td>\n\
                                                        </tr>';
                                      break;
          default: break;
        }
        datosOcultos += '</table>';
        formu += datosOcultos;

        var tabla = mostrarTabla(radio, datos, j, todos, 1, parcial, subtotales, max, totalPlasticos, mensajeConsulta, totalPaginas, mostrarEstado);
        formu += tabla;
        
        formu += '</form>';
        
        if (mensajeTotalDatos !== ''){
          mostrar += mensajeTotalDatos;
        }
        

        ///************************************ Comienzo paginación **********************************************************
        
        
        var page = 1;
        var ultimoRegistro = tamPagina;
        if (tamPagina > totalDatos){
          ultimoRegistro = totalDatos;
        }
        if (totalPaginas > 1){
          var rango = "<h5 id='rango_"+j+"' class='rango'>(P&aacute;gina "+page+": registros del 1 al "+ultimoRegistro+")</h5>";
          mostrar += rango;
        }
        
        mostrar += formu;

        if (totalPaginas > 1) {
          var paginas = '<div class="pagination" id="paginas" indice="'+j+'">\n\
                          <ul>';
          paginas += '<input style="display: none" type="text" id="totalPaginas_'+j+'" value="'+totalPaginas+'">';
          paginas += '<input style="display: none" type="text" id="totalRegistros_'+j+'" value="'+totalDatos+'">';
          paginas += '<input style="display: none" type="text" id="totalPlasticos_'+j+'" value="'+totalPlasticos+'">';
          for (var k=1;k<=totalPaginas;k++) {
            if (page === k) {
            //si muestro el índice de la página actual, no coloco enlace
              paginas += '<li ><a class="paginate pageActive" i='+j+' data="'+k+'">'+k+'</a></li>';
            }  
            else {
            //si el índice no corresponde con la página mostrada actualmente,
            //coloco el enlace para ir a esa página
              paginas += '<li><a class="paginate" i='+j+' data="'+k+'">'+k+'</a></li>';
            }
          }
          if (page !== totalPaginas) {
            paginas += '<li><a class="paginate siguiente" i='+j+' data="'+(page+1)+'">Siguiente</a></li>';
          } 
          paginas += '</ul>';
          paginas += '</div>';
          mostrar += paginas;
        }
        ///***************************************** FIN paginación **********************************************************
        
        if (idProds[j] === undefined) {
          idProds[j] = '';
        }
                
        var volver = '<br><a title="Volver a BÚSQUEDAS" href="busquedas.php?h='+prodHint+'&t='+tipMov+'&zip='+zip+'&planilla='+planilla+'&marca='+marcaAgua+'&id='+idProds+'&ent='+entUrl+'&p='+p+'&d1='+d1+'&d2='+d2+'&tipo='+tipoUrl+'&user='+user+'&est='+estadoMov+'&m='+mostrarEstado+'" name="volver" id="volverBusqueda" >Volver</a><br><br>';
        mostrar += volver;
        mostrar += '</div>';
        $("#pills-tabContent").append(mostrar);
        delete(totalDatos);
        delete(datos);   
      }/// FIN del if de totalDatos>1  
      else {
        mostrar += "<br><hr><h3>No existen registros para la consulta realizada.</h3><hr>";
        var volver = '<br><a title="Volver a BÚSQUEDAS" href="busquedas.php?h='+prodHint+'&t='+tipMov+'&zip='+zip+'&planilla='+planilla+'&marca='+marcaAgua+'&id='+idProds+'&ent='+entUrl+'&p='+p+'&d1='+d1+'&d2='+d2+'&tipo='+tipoUrl+'&user='+user+'&est='+estadoMov+'&m='+mostrarEstado+'" name="volver" id="volverBusqueda" >Volver</a><br><br>';
        mostrar += volver;
        mostrar += '</div>';
        $("#pills-tabContent").append(mostrar);
      }         
    }
  });
  mostrarGlobal += '</div>';
  $("#main-content").append(mostrarGlobal);
}
/********** fin mostrarResultados(radio, queries, consultasCSV, idProds, tipoConsultas, entidadesStock, entidadesMovimiento, nombresProductos, nombres, ent, prodHint, mensajeTipo, mensajeUsuario, mensajeFecha, zip, planilla, marcaAgua, zipManual, planillaManual, p, d1, d2, tipo, user) **********/

/**
 * \brief Función que ejecuta la búsqueda y muestra el resultado.
 */
function realizarBusqueda(){
    verificarSesion('', 's');
    var radio = $('input:radio[name=criterio]:checked').val();
    var entidadesStock = new Array();
    $("#entidadStock option:selected").each(function() {
      entidadesStock.push($(this).val());
    });
    var entidadesMovimiento = new Array();
    $("#entidadMovimiento option:selected").each(function() {
      entidadesMovimiento.push($(this).val());
    });
    var todos = false;
    var idProds = new Array();
    var nombresProductos = new Array();
    var nombres = new Array();
    var tipoConsultas = new Array();
    if ((radio === 'productoStock')||(radio === 'productoMovimiento')){
      $("#hint option:selected").each(function() {
        idProds.push($(this).val());
        var nombreProducto = $(this).text( );
        nombresProductos.push(nombreProducto);
        if ((nombreProducto !== "undefined") && (nombreProducto !== '') && (nombreProducto !== '--Seleccionar--')) {
          ///Separo en partes el nombreProducto que contiene [entidad: codigo] --- nombreProducto
          var tempo = nombreProducto.split("- ");
          nombres.push(tempo[1].trim());
          //var tempo2 = tempo1.split("{");
          //var nombreSolo = tempo2[0].trim();
        }
      });
    }
    
    var queries = new Array();
    var consultasCSV = new Array();
    
    var tipo = $("#tipo").find('option:selected').val( );
    var estadoMov = $("#estadoMov").find('option:selected').val( );
    var mostrarEstado = $("#mostrarEstado").prop("checked");
    var idUser = $("#usuario").val();
    var nombreUsuario = $("#usuario").find('option:selected').text( );
    var radioFecha = $('input:radio[name=criterioFecha]:checked').val();
    var inicio = $("#inicio").val();
    var fin = $("#fin").val();
    var mes = $("#mes").val();
    var año = $("#año").val();
    var d1 = '';
    var d2 = '';
    var zip = $("#zip").val();
    var planilla = $("#planilla").val();
    var zipManual = '';
    var planillaManual = '';
    if (zip === 'manual') {
      zipManual = $("#zipManual").val();
    }
    if (planilla === 'manual'){
      planillaManual = $("#planillaManual").val();
    }
    var marcaAgua = '';
    if($("#marcaAgua").is(':checked')) {  
      marcaAgua = true;
    } 
    else {  
      marcaAgua = false;  
    }  
    var rangoFecha = null;
    var prodHint = '';
    var ent = new Array();
    
    //var query = 'select productos.entidad, productos.nombre_plastico, productos.bin, productos.codigo_emsa, productos.contacto, productos.snapshot, productos.ultimoMovimiento, productos.stock, productos.alarma1, productos.alarma2, productos.comentarios as prodcom';
    //var consultaCSV = 'select productos.entidad as entidad, productos.nombre_plastico as nombre, productos.bin as BIN, productos.stock as stock, productos.alarma1, productos.alarma2';
    var tipoConsulta = '';
    var mensajeFecha = '';
    
    var validado = true;
    var validarFecha = false;
    var validarTipo = false;
    var validarUser = false;
    var ordenFecha = false;
     
    ///Agrego condición para detectar el caso en que se quiera el stock de un producto o entidad a una fecha anterior a la actual:
    if ((radioFecha === 'intervalo')&&((radio === 'entidadStock')||(radio === 'productoStock'))){
      if (radio === 'entidadStock'){
        radio = 'entidadStockViejo';
      }
      else {
        radio = 'productoStockViejo';
      }
    }
    
    var hoy = new Date();
    var diaHoy = hoy.getDate();
    var mesHoy = hoy.getMonth()+1;
    if (diaHoy < 10) 
      {
      diaHoy = '0'+diaHoy;
    }                     
    if (mesHoy < 10) 
      {
      mesHoy = '0'+mesHoy;
    }
    var hoyFecha = hoy.getFullYear()+'-'+mesHoy+'-'+diaHoy;
    var hoyMostrar = diaHoy+'/'+mesHoy+'/'+hoy.getFullYear();
    var hourTemp = hoy.getHours();
    var minTemp = hoy.getMinutes();
    var secTemp = hoy.getSeconds();
    if (hourTemp < 10) 
      {
      hourTemp = '0'+hourTemp;
    } 
    if (minTemp < 10) 
      {
      minTemp = '0'+minTemp;
    } 
    if (secTemp < 10) 
      {
      secTemp = '0'+secTemp;
    } 
    var horaMostrar = hourTemp+':'+minTemp;
    var remplaza = /[\s.&]/g;
    switch (radio) {
      case 'entidadStock':  delete nombres;
                            var nombres = new Array();
                            for (var i in entidadesStock){
                              delete (query);
                              delete (consultaCSV);
                              delete (tipoConsulta);
                              var tipoConsulta = '';
                              var query = 'select productos.idprod, productos.entidad, productos.nombre_plastico, productos.bin, productos.codigo_emsa, productos.codigo_origen, productos.contacto, productos.snapshot, productos.ultimoMovimiento, productos.stock, productos.alarma1, productos.alarma2, productos.comentarios as prodcom, productos.fechaCreacion';
                              var consultaCSV = 'select productos.idprod, productos.entidad as entidad, productos.nombre_plastico as nombre, productos.bin as BIN, productos.codigo_emsa, codigo_origen, productos.stock as stock, productos.alarma1, productos.alarma2, productos.comentarios, productos.fechaCreacion';
                              if (entidadesStock[i] !== 'todos') {
                                ent.push(entidadesStock[i]);
                                query += " from productos where entidad='"+entidadesStock[i]+"' and estado='activo'";
                                consultaCSV += " from productos where entidad='"+entidadesStock[i]+"' and estado='activo'";
                                tipoConsulta = 'Stock de <b><i>'+entidadesStock[i]+'</i></b> al d&iacute;a: '+hoyMostrar+' ('+horaMostrar+')';
                              } 
                              else {
                                query += " from productos where estado='activo'";
                                consultaCSV += " from productos where estado='activo'";
                                tipoConsulta = 'Stock de <b><i>todas las entidades</i></b> al d&iacute;a: '+hoyMostrar+' ('+horaMostrar+')';
                                todos = true;
                                ent.push('todos');
                              }
                              queries.push(query);
                              consultasCSV.push(consultaCSV);
                              tipoConsultas.push(tipoConsulta);
                              var entidadTemp = entidadesStock[i];
                              entidadTemp = entidadTemp.replace(remplaza, "");
                              idProds.push(entidadTemp);
                              nombres.push(entidadesStock[i]);
                              validarFecha = false;
                              validarTipo = false;
                              validarUser = false;
                            }
                            if (todos && (entidadesStock.length > 1)){
                              alert('No se puede consultar "TODOS" junto con otras entidades. Por favor verifique.');
                              $("#entidadStock").focus();
                              return;
                            }
                            if (entidadesStock.length > limiteSeleccion) {
                              alert("Se superó el máximo de "+limiteSeleccion+" opciones elegidas. Por favor verifique.");
                              $("#entidadStock").focus();
                              return;
                            }
                            break;
      case 'productoStock': if (idProds.length > 0){
                              for (var i in idProds){
                                if ((idProds[i] === 'NADA') || (nombresProductos[i] === '')){
                                  alert('Debe seleccionar al menos un producto ó seleccionar no debe de estar marcado. Por favor verifique.');
                                  document.getElementById("productoStock").focus();
                                  validado = false;
                                  return false;
                                }
                                else {
                                  query = 'select productos.idprod, productos.entidad, productos.nombre_plastico, productos.bin, productos.codigo_emsa, productos.codigo_origen, productos.contacto, productos.snapshot, productos.ultimoMovimiento, productos.stock, productos.alarma1, productos.alarma2, productos.comentarios as prodcom, productos.fechaCreacion';
                                  query += " from productos where idProd="+idProds[i];
                                  consultaCSV = 'select productos.idprod, productos.entidad as entidad, productos.nombre_plastico as nombre, productos.bin as BIN, productos.codigo_emsa, codigo_origen, productos.stock as stock, productos.alarma1, productos.alarma2, productos.comentarios, productos.fechaCreacion';
                                  consultaCSV += " from productos where idProd="+idProds[i];
                                  tipoConsulta = 'Stock del producto <b><i>'+nombres[i]+'</i></b> al d&iacute;a: '+hoyMostrar+' ('+horaMostrar+')';
                                  queries.push(query);
                                  consultasCSV.push(consultaCSV);
                                  tipoConsultas.push(tipoConsulta);
                                  validarFecha = false;
                                  validarTipo = false;
                                  validarUser = false;
                                }
                                prodHint = $("#productoStock").val();
                              }
                            }
                            else {
                              alert('Para realizar una consulta de stock por producto hay que elegir al menos un producto.\n¡Por favor verifique!.');
                              $("#productoStock").focus();
                              validado = false;
                            } 
                            break;
      case 'totalStock':  query = "select entidad, sum(stock) as subtotal from productos where estado='activo' group by entidad";
                          queries[0] = query;
                          consultaCSV = "select entidad as Entidad, sum(stock) as Subtotal from productos where estado='activo' group by entidad";
                          consultasCSV[0] = consultaCSV;
                          tipoConsulta = '<b><i>Total de plásticos en bóveda</i></b>';
                          tipoConsultas[0] = tipoConsulta;
                          idProds[0] = 1;
                          delete nombres;
                          var nombres = new Array();
                          nombres[0] = "Stock en Bóveda";
                          break;   
      case 'entidadStockViejo': delete nombres;
                                var nombres = new Array();
                                for (var i in entidadesStock){
                                  query = 'select productos.idprod, productos.entidad, productos.nombre_plastico, productos.bin, productos.codigo_emsa, productos.codigo_origen, productos.contacto, productos.snapshot, productos.ultimoMovimiento, productos.stock, productos.alarma1, productos.alarma2, productos.comentarios as prodcom, productos.fechaCreacion';
                                  query += ", DATE_FORMAT(movimientos.fecha, '%d/%m/%Y') as fecha, DATE_FORMAT(movimientos.hora, '%H:%i') as hora, movimientos.cantidad, movimientos.tipo, movimientos.comentarios, movimientos.estado, movimientos.idmov from productos inner join movimientos on productos.idprod=movimientos.producto where productos.estado='activo' ";
                                  var consultaCSV = "select productos.idprod, productos.entidad as entidad, productos.nombre_plastico as nombre, productos.bin as BIN, productos.codigo_emsa, codigo_origen, productos.stock as stock, productos.alarma1, productos.alarma2, productos.comentarios, productos.fechaCreacion from productos where productos.estado='activo' ";
                                  if (entidadesStock[i] !== 'todos') {
                                    ent.push(entidadesStock[i]);
                                    query += "and productos.entidad='"+entidadesStock[i]+"'";
                                    consultaCSV += "and productos.entidad='"+entidadesStock[i]+"'";
                                    tipoConsulta = 'Stock de <b><i>'+entidadesStock[i]+"</i></b>";
                                  } 
                                  else {
                                    tipoConsulta = 'Stock de <b><i>todas las entidades</i></b>';
                                    todos = true;
                                    ent.push('todos');
                                  }
                                  queries.push(query);
                                  consultasCSV.push(consultaCSV);
                                  tipoConsultas.push(tipoConsulta);
                                  var entidadTemp = entidadesStock[i];
                                  entidadTemp = entidadTemp.replace(remplaza, "");
                                  idProds.push(entidadTemp);
                                  nombres.push(entidadesStock[i]);
                                }
                                if (todos && (entidadesStock.length > 1)){
                                  alert('No se puede consultar "TODOS" junto con otras entidades. Por favor verifique.');
                                  $("#entidadStock").focus();
                                  return;
                                }
                                if (entidadesStock.length > limiteSeleccion) {
                                  alert("Se superó el máximo de "+limiteSeleccion+" opciones elegidas. Por favor verifique.");
                                  $("#entidadStock").focus();
                                  return;
                                }
                                validarFecha = true;
                                validarTipo = false;
                                validarUser = false;
                                ordenFecha = true;
                                break;
      case 'productoStockViejo':  if (idProds.length > 0){
                                    for (var k in idProds){
                                    query = 'select productos.idprod, productos.entidad, productos.nombre_plastico, productos.bin, productos.codigo_emsa, productos.codigo_origen, productos.contacto, productos.snapshot, productos.ultimoMovimiento, productos.stock, productos.alarma1, productos.alarma2, productos.comentarios as prodcom, productos.fechaCreacion';
                                    query += ", DATE_FORMAT(movimientos.fecha, '%d/%m/%Y') as fecha, DATE_FORMAT(movimientos.hora, '%H:%i') as hora, movimientos.cantidad, movimientos.tipo, movimientos.comentarios, movimientos.estado, movimientos.idmov from productos inner join movimientos on productos.idprod=movimientos.producto where idprod="+idProds[k];
                                    consultaCSV = 'select productos.idprod, productos.entidad as entidad, productos.nombre_plastico as nombre, productos.bin as BIN, productos.codigo_emsa, codigo_origen, productos.stock as stock, productos.alarma1, productos.alarma2, productos.comentarios, productos.fechaCreacion';
                                    consultaCSV += " from productos where idProd="+idProds[k];
                                    if ((idProds[k] === 'NADA') || (nombresProductos[k] === '')){
                                      alert('Debe seleccionar al menos un producto ó seleccionar no debe de estar marcado. Por favor verifique.');
                                      document.getElementById("productoStock").focus();
                                      validado = false;
                                      return false;
                                    }
                                    else {
                                      queries.push(query);
                                      consultasCSV.push(consultaCSV);
                                      validarFecha = true;
                                      validarTipo = false;
                                      validarUser = false;
                                      ordenFecha = true;
                                    }
                                    tipoConsulta = 'Stock del producto <b><i>'+nombres[k]+"</i></b>";
                                    tipoConsultas.push(tipoConsulta);
                                    prodHint = $("#productoStock").val();
                                  }
                                  }
                                  else {
                                    alert('Para realizar una consulta de stock por producto hay que elegir al menos un producto.\n¡Por favor verifique!.');
                                    $("#productoStock").focus();
                                    validado = false;
                                  }
                                  break;                        
      case 'entidadMovimiento': delete nombres;
                                var nombres = new Array();
                                for (var i in entidadesMovimiento){
                                  query = 'select productos.idprod, productos.entidad, productos.nombre_plastico, productos.bin, productos.codigo_emsa, productos.codigo_origen, productos.contacto, productos.snapshot, productos.ultimoMovimiento, productos.stock, productos.alarma1, productos.alarma2, productos.comentarios as prodcom, productos.fechaCreacion';
                                  query += ", DATE_FORMAT(movimientos.fecha, '%d/%m/%Y') as fecha, DATE_FORMAT(movimientos.hora, '%H:%i') as hora, movimientos.cantidad, movimientos.tipo, movimientos.comentarios,  movimientos.estado, movimientos.idmov from productos inner join movimientos on productos.idprod=movimientos.producto where productos.estado='activo' ";
                                  consultaCSV = "select productos.idprod, DATE_FORMAT(movimientos.fecha, '%d/%m/%Y') as fecha, DATE_FORMAT(movimientos.hora, '%H:%i') as hora, productos.entidad, productos.nombre_plastico, productos.bin, productos.codigo_emsa, productos.codigo_origen, productos.fechaCreacion, movimientos.tipo, movimientos.cantidad, movimientos.comentarios, movimientos.estado from productos inner join movimientos on productos.idprod=movimientos.producto where productos.estado='activo' ";
                                  if (entidadesMovimiento[i] !== 'todos') {
                                    ent.push(entidadesMovimiento[i]);
                                    query += "and productos.entidad='"+entidadesMovimiento[i]+"'";
                                    consultaCSV += "and productos.entidad='"+entidadesMovimiento[i]+"'";
                                    tipoConsulta = 'Movimientos de <b><i>'+entidadesMovimiento[i]+"</i></b>";
                                  } 
                                  else {
                                    tipoConsulta = 'Movimientos de <b><i>todas las entidades</i></b>';
                                    todos = true;
                                    ent.push('todos');
                                  }
                                  ///*********************************** TEST ESTADO MOVIMIENTOS ***********************************************
//                                  switch(tipo){
//                                    case 'Todos': tipoConsulta = tipoConsulta.replace('Movimientos', 'Movimientos totales');
//                                                  break;
//                                    case 'Clientes': break;
//                                    default:  switch(estadoMov){
//                                                case 'OK': tipoConsulta = tipoConsulta.replace('Movimientos', 'Movimientos OK');
//                                                           break;
//                                                case 'ERROR': tipoConsulta = tipoConsulta.replace('Movimientos', 'Movimientos erróneos');
//                                                              break;
//                                                default: break;
//                                              };
//                                              break; 
//                                  }
                                  ///********************************** FIN TEST ESTADO MOVIMIENTOS *********************************************
                                  queries.push(query);
                                  consultasCSV.push(consultaCSV);
                                  tipoConsultas.push(tipoConsulta);
                                  var entidadTemp = entidadesMovimiento[i];
                                  entidadTemp = entidadTemp.replace(remplaza, "");
                                  idProds.push(entidadTemp);
                                  nombres.push(entidadesMovimiento[i]);
                                }
                                if (todos && (entidadesMovimiento.length > 1)){
                                  alert('No se puede consultar "TODOS" junto con otras entidades. Por favor verifique.');
                                  $("#entidadMovimiento").focus();
                                  return;
                                }
                                if (entidadesMovimiento.length > limiteSeleccion) {
                                  alert("Se superó el máximo de "+limiteSeleccion+" opciones elegidas. Por favor verifique.");
                                  $("#entidadMovimiento").focus();
                                  return;
                                }
                                validarFecha = true;
                                validarTipo = true;
                                validarUser = true;
                                ordenFecha = true;
                                break;
      case 'productoMovimiento':  if (idProds.length > 0){
                                  for (var k in idProds){
                                    query = 'select productos.idprod, productos.entidad, productos.nombre_plastico, productos.bin, productos.codigo_emsa, productos.codigo_origen, productos.contacto, productos.snapshot, productos.ultimoMovimiento, productos.stock, productos.alarma1, productos.alarma2, productos.comentarios as prodcom, productos.fechaCreacion';
                                    query += ", DATE_FORMAT(movimientos.fecha, '%d/%m/%Y') as fecha, DATE_FORMAT(movimientos.hora, '%H:%i') as hora, movimientos.cantidad, movimientos.tipo, movimientos.comentarios,  movimientos.estado, movimientos.idmov from productos inner join movimientos on productos.idprod=movimientos.producto where ";
                                    //consultaCSV = 'select productos.entidad as entidad, productos.nombre_plastico as nombre, productos.bin as BIN, productos.stock as stock, productos.alarma1, productos.alarma2';
                                    consultaCSV = "select productos.idprod, DATE_FORMAT(movimientos.fecha, '%d/%m/%Y'), DATE_FORMAT(movimientos.hora, '%H:%i') as hora, productos.entidad, productos.nombre_plastico, productos.bin, productos.codigo_emsa, productos.codigo_origen, productos.fechaCreacion, movimientos.tipo, movimientos.cantidad, movimientos.comentarios, movimientos.estado from productos inner join movimientos on productos.idprod=movimientos.producto where productos.estado='activo' ";                                 
                                    if ((idProds[k] === 'NADA') || (nombresProductos[k] === '')){
                                      alert('Debe seleccionar al menos un producto ó seleccionar no debe de estar marcado. Por favor verifique.');
                                      document.getElementById("productoMovimiento").focus();
                                      validado = false;
                                      return false;
                                    }
                                    else {
                                      query += "idprod="+idProds[k];
                                      consultaCSV += "and idprod="+idProds[k];
                                      queries.push(query);
                                      consultasCSV.push(consultaCSV);
                                      validarFecha = true;
                                      validarTipo = true;
                                      validarUser = true;
                                      ordenFecha = true;
                                    }
                                    tipoConsulta = 'Movimientos del producto <b><i>'+nombres[k]+"</i></b>";
                                    tipoConsultas.push(tipoConsulta);
                                    prodHint = $("#productoMovimiento").val();
                                  }
                                  }
                                  else {
                                    alert('Para realizar una consulta de movimientos por producto hay que elegir al menos un producto.\n¡Por favor verifique!.');
                                    $("#productoMovimiento").focus();
                                    validado = false;
                                  }
                                  break;
      default: break;
    }
    
    if (validarFecha) {
      switch (radioFecha) {
        case 'intervalo': if ((radio === 'entidadStockViejo')||(radio === 'productoStockViejo')){
                            if (inicio === ''){
                              alert('Debe seleccionar la fecha de inicio. Por favor verifique!.');
                              document.getElementById("inicio").focus();
                              validado = false;
                              return false;
                            }
                            else {
                              fin = hoyFecha;
                              if (inicio>fin) 
                                {
                                alert('Error. La fecha inicial NO puede ser mayor a la fecha actual. Por favor verifique.');
                                validado = false;
                                return false;
                              }
                              else {
                                validado = true;  
                                var inicioTemp = inicio.split('-');
                                var inicioMostrar = inicioTemp[2]+"/"+inicioTemp[1]+"/"+inicioTemp[0];
                                var finTemp = fin.split('-');
                                var finMostrar = finTemp[2]+"/"+finTemp[1]+"/"+finTemp[0];
                                rangoFecha = " and (fecha >'"+inicio+"') and (fecha <='"+fin+"')";
                                mensajeFecha = "al día: "+inicioMostrar;
                              }
                            }
                          }
                          else {
                            ///Comienzo la validación de las fechas:  
                            if ((inicio === '') && (fin === '')) 
                              {
                              alert('Debe seleccionar al menos una de las dos fechas. Por favor verifique!.');
                              document.getElementById("inicio").focus();
                              validado = false;
                              return false;
                            }
                            else 
                              {
                              if (inicio === '') 
                                {
                                inicio = $("#inicio" ).attr("min");
                                }
                              if ((fin === '') || (fin > hoyFecha))
                                {
                                fin = hoyFecha;
                              }

                              if (inicio>fin) 
                                {
                                alert('Error. La fecha inicial NO puede ser mayor que la fecha final. Por favor verifique.');
                                validado = false;
                                return false;
                              }
                              else 
                                {
                                validado = true;  
                                if (inicio === fin){
                                  var diaTemp = inicio.split('-');
                                  var diaMostrar = diaTemp[2]+"/"+diaTemp[1]+"/"+diaTemp[0];
                                  rangoFecha = " and (fecha ='"+inicio+"')";
                                  mensajeFecha = "del día: "+diaMostrar;
                                }
                                else {
                                  var inicioTemp = inicio.split('-');
                                  var inicioMostrar = inicioTemp[2]+"/"+inicioTemp[1]+"/"+inicioTemp[0];
                                  var finTemp = fin.split('-');
                                  var finMostrar = finTemp[2]+"/"+finTemp[1]+"/"+finTemp[0];
                                  rangoFecha = " and (fecha >='"+inicio+"') and (fecha <='"+fin+"')";
                                  mensajeFecha = "entre las fechas: "+inicioMostrar+" y "+finMostrar;
                                }
                              }
                            } /// FIN validación de las fechas intervalo.
                          }  
                          d1 = inicio;
                          d2 = fin;
                          break;
        case 'mes': if (mes === 'todos') {
                      inicio = año+"-01-01";
                      fin = año+"-12-31";
                      mensajeFecha = "del año "+año;
                    }
                    else {
                      inicio = año+"-"+mes+"-01";
                      var añoFin = parseInt(año, 10);
                      var mesSiguiente = parseInt(mes, 10) + 1;
                      if (mesSiguiente === 13) {
                        mesSiguiente = 1;
                        añoFin = parseInt(año, 10) + 1;
                      }
                      if (mesSiguiente < 10) 
                        {
                        mesSiguiente = '0'+mesSiguiente;
                      }
                      fin = añoFin+"-"+mesSiguiente+"-01";
                      var mesMostrar = '';
                      switch (mes) {
                        case '01': mesMostrar = "Enero";
                                   break;
                        case '02': mesMostrar = "Febrero";
                                   break;
                        case '03': mesMostrar = "Marzo";
                                   break;
                        case '04': mesMostrar = "Abril";
                                   break;
                        case '05': mesMostrar = "Mayo";
                                   break;
                        case '06': mesMostrar = "Junio";
                                   break;
                        case '07': mesMostrar = "Julio";
                                   break;
                        case '08': mesMostrar = "Agosto";
                                   break;
                        case '09': mesMostrar = "Setiembre";
                                   break;
                        case '10': mesMostrar = "Octubre";
                                   break;
                        case '11': mesMostrar = "Noviembre";
                                   break;
                        case '12': mesMostrar = "Diciembre";
                                   break;
                        default: break;         
                      }
                      mensajeFecha = "del mes de "+mesMostrar+" de "+año;
                    }
                    validado = true;
                    rangoFecha = " and (fecha >='"+inicio+"') and (fecha <'"+fin+"')";
                    d1 = mes;
                    d2 = año;
                    break;
        case 'todos': break;
        default: break;
      }
    }

    if (validado) 
      {
      for (var n in queries){//alert(queries[n]);
        if (rangoFecha !== null) {
          queries[n] += rangoFecha;
          if ((radio !== 'entidadStockViejo')&&(radio !== 'productoStockViejo')){
            consultasCSV[n] += rangoFecha;
          } 
        }
        switch (estadoMov){
          case 'Todos': break;
          case 'OK': estadoMovimiento = " and movimientos.estado='OK'";
                     break;
          case 'ERROR': estadoMovimiento = " and movimientos.estado='ERROR'";
                        break;
          default: break;              
        }
        
        var mensajeTipo = null;  
        if (validarTipo) { 
          if (tipo !== 'Todos') {
            var estadoMovimiento = '';
            switch (estadoMov){
              case 'Todos': break;
              case 'OK': estadoMovimiento = " and movimientos.estado='OK'";
                         break;
              case 'ERROR': estadoMovimiento = " and movimientos.estado='ERROR'";
                            break;
              default: break;              
            }
            if (tipo === 'Clientes'){
              queries[n] += " and tipo!='AJUSTE Retiro' and tipo!='AJUSTE Ingreso'"+estadoMovimiento;
              consultasCSV[n] += " and tipo!='AJUSTE Retiro' and tipo!='AJUSTE Ingreso'"+estadoMovimiento;
              mensajeTipo = "de todos los tipos";
              mostrarEstado = false;
            }
            else {
              if (tipo === 'Ajustes'){
                queries[n] += " and (tipo='AJUSTE Retiro' or tipo='AJUSTE Ingreso')"+estadoMovimiento;
                consultasCSV[n] += " and (tipo='AJUSTE Retiro' or tipo='AJUSTE Ingreso')"+estadoMovimiento;
                mensajeTipo = "del tipo AJUSTE";
              }
              else {
                queries[n] += " and tipo='"+tipo+"'"+estadoMovimiento;
                consultasCSV[n] += " and tipo='"+tipo+"'"+estadoMovimiento;
                mensajeTipo = "del tipo "+tipo;
              }
            }    
          }
          else {
            mensajeTipo = "de todos los tipos (inc. AJUSTES)";
          };
        }

        var mensajeUsuario = null;
        if (validarUser) {
          if (idUser !== 'todos') {
            queries[n] += " and (control1="+idUser+" or control2="+idUser+")";
            consultasCSV[n] += " and (control1="+idUser+" or control2="+idUser+")";
            mensajeUsuario = " en los que está involucrado el usuario "+nombreUsuario;
          }
        }

        if (ordenFecha) {
          queries[n] += " order by entidad asc, codigo_emsa asc, nombre_plastico asc, idprod, movimientos.fecha desc, hora desc";
          if ((radio !== 'entidadStockViejo')&&(radio !== 'productoStockViejo')){
            consultasCSV[n] += " order by entidad asc, codigo_emsa asc, nombre_plastico asc, idprod, movimientos.fecha desc, hora desc";
          }
          else {
            consultasCSV[n] += " order by entidad asc, codigo_emsa asc, nombre_plastico asc, idprod asc";
          }
        }
        else {
          queries[n] += " order by entidad asc, codigo_emsa asc, nombre_plastico asc, idprod asc";
          consultasCSV[n] += " order by entidad asc, codigo_emsa asc, nombre_plastico asc, idprod asc";
        }
        
        //alert(queries[n]);
      }
            
      mostrarResultados(radio, queries, consultasCSV, idProds, tipoConsultas, entidadesStock, entidadesMovimiento, nombresProductos, nombres, ent, prodHint, mensajeTipo, mensajeUsuario, mensajeFecha, zip, planilla, marcaAgua, zipManual, planillaManual, radioFecha, d1, d2, tipo, idUser, estadoMov, mostrarEstado);
    }/// Fin del IF de validado
    else {
      //alert('NO validado');//Igualmente no llega a esta etapa dado que al no ser válida retorna falso y sale.    
    } 
  //}
}
/********** fin realizarBusqueda() **********/

/**
 * \brief Función que genera el formulario para realizar las consultas.
 * @param {String} selector String con el nombre del DIV donde cargar el form.
 * @param {String} hint String con la sugerencia pasada.
 * @param {String} tipo String que indica si la consulta es de stock o de movimientos.
 * @param {String} idProdus String con el identificador del producto previamente seleccionado (si corresponde).
 * @param {String} entidadSeleccionada String con de la entidad previamente seleccionada (si corresponde).
 * @param {String} zip String con la seguridad para el ZIP previamente seleccionada (si corresponde).
 * @param {String} planilla String con la seguridad para la planilla de EXCEL previamente seleccionada (si corresponde).
 * @param {Boolean} marcaAgua Booleano que indica si previamente se eligió o no agregar la marca de agua (si corresponde).
 * @param {String} p String con el criterio de fechas previamente seleccionada (si corresponde).
 * @param {String} d1 String con la primer fecha previamente seleccionada (si corresponde).
 * @param {String} d2 String con la segunda fecha previamente seleccionada (si corresponde).
 * @param {String} tipoFiltro String con el tipo de movimiento a filtrar que previamente se seleccionó (si corresponde).
 * @param {Integer} user Integer con el ID del usuario que previamente se usó para filtrar (si corresponde).
 * @param {String} estadoMov String que indica el estado de los movimientos usado para filtrar (si corresponde).
 * @param {String} mostrarEstado String que indica si se muestra o no el estado de los movimientos en los reportes (si corresponde).
 */
function cargarFormBusqueda(selector, hint, tipo, idProdus, entidadSeleccionada, zip, planilla, marcaAgua, p, d1, d2, tipoFiltro, user, estadoMov, mostrarEstado){
  //verificarSesion('', 's');
  var url = "data/selectQuery.php";
  var consultarProductos = "select idprod, nombre_plastico as nombre from productos order by nombre_plastico asc";
  
  $.getJSON(url, {query: ""+consultarProductos+""}).done(function(request){
    var resultadoProductos = request["resultado"];
    var productos = new Array();
    var idprods = new Array();
    for (var i in resultadoProductos) {
      productos.push(resultadoProductos[i]["nombre"]);
      idprods.push(resultadoProductos[i]["idprod"]);
    }
    
    var consultarEntidades = "select distinct entidad from productos order by entidad asc, nombre_plastico asc";
    
    $.getJSON(url, {query: ""+consultarEntidades+""}).done(function(request){
      var resultadoEntidades = request["resultado"];
      var entidades = new Array();
      for (var i in resultadoEntidades) {
        entidades.push(resultadoEntidades[i]["entidad"]);
      }
      
      var consultarUsuarios = "select iduser, apellido, nombre from usuarios order by sector asc, apellido asc, nombre asc";
    
      $.getJSON(url, {query: ""+consultarUsuarios+""}).done(function(request){
        var resultadoUsuarios = request["resultado"];
        var idusers = new Array();
        var nombresUsuarios = new Array();
        var apellidosUsuarios = new Array();
        for (var i in resultadoUsuarios) {
          idusers.push(resultadoUsuarios[i]["iduser"]);
          apellidosUsuarios.push(resultadoUsuarios[i]["apellido"]);
          nombresUsuarios.push(resultadoUsuarios[i]["nombre"]);
        }
                 
        var tabla = '<table id="parametros" name="parametros" class="tabla2">\n\
                      <caption>Formulario para realizar las consultas</caption>';
        var tr = '<tr>\n\
                    <th colspan="5" class="tituloTabla">TIPO DE CONSULTA</th>\n\
                  </tr>';
        tr += '<tr>\n\
                <th colspan="5" class="subTituloTabla1">STOCK</th>\n\
              </tr>';
        tr += '<tr>\n\
                <td class="fondoVerde">\n\
                  <input type="radio" name="criterio" title="Elegir el tipo de consulta a realizar\nSeleccionar si se quiere conocer el stock de una entidad" value="entidadStock" checked="checked">\n\
                </td>\n\
                <th>Entidad:</th>\n\
                  <td colspan="3">\n\
                    <select name="entidad" id="entidadStock" tabindex="1" style="width: 100%" multiple title="Seleccionar la entidad" size="6">\n\
                      <option value="todos">---TODOS---</option>';
        for (var j in entidades) {
          var entidad = entidades[j].trim();
          tr += '<option value="'+entidad+'">'+entidad+'</option>';
        }  
        tr += '   </select>\n\
                </td>\n\
              </tr>';
        tr += '<tr>\n\
                <td class="fondoVerde">\n\
                  <input type="radio" name="criterio" title="Elegir el tipo de consulta a realizar\nSeleccionar si se quiere conocer el stock de un producto" value="productoStock">\n\
                </td>\n\
                <th>Producto:</th>\n\
                <td align="center" colspan="3">\n\
                  <input type="text" id="productoStock" name="producto" placeholder="Producto" title="Ingresar el producto" class="agrandar size="9" tabindex="2" onkeyup=\'showHint(this.value, "#productoStock", "")\'>\n\
                </td>\n\
              </tr>';
        tr += '<tr>\n\
                <td class="fondoVerde">\n\
                  <input type="radio" name="criterio" title="Elegir el tipo de consulta a realizar\nSeleccionar si se quiere conocer el stock total de plásticos" value="totalStock">\n\
                </td>\n\
                <td colspan="4" class="negrita" style="text-align: left">Total de plásticos en bóveda</td>\n\
              </tr>';
        tr += '<tr>\n\
                <th colspan="5" class="subTituloTabla1">MOVIMIENTOS</th>\n\
              </tr>';
        tr += '<tr>\n\
                <td class="fondoVerde">\n\
                  <input type="radio" name="criterio" title="Elegir el tipo de consulta a realizar\nSeleccionar si se quieren conocer los movimientos de una entidad" value="entidadMovimiento">\n\
                </td>\n\
                <th>Entidad:</th>\n\
                  <td colspan="3">\n\
                    <select name="entidad" id="entidadMovimiento" title="Seleccionar la entidad" tabindex="3" multiple style="width: 100%" size="6">\n\
                      <option value="todos">---TODOS---</option>';
        for (var j in entidades) {
          var entidad1 = entidades[j].trim();
          tr += '<option value="'+entidad1+'">'+entidad1+'</option>';
        }   
        tr += '   </select>\n\
                </td>\n\
              </tr>';
        tr += '<tr>\n\
                <td class="fondoVerde">\n\
                  <input type="radio" name="criterio" title="Elegir el tipo de consulta a realizar\nSeleccionar si se quieren conocer los movimientos de un producto" value="productoMovimiento">\n\
                </td>\n\
                <th>Producto:</th>\n\
                <td align="center" colspan="3">\n\
                  <input type="text" id="productoMovimiento" name="producto" placeholder="Producto" title="Ingresar el producto" class="agrandar" size="9" tabindex="4" onkeyup=\'showHint(this.value, "#productoMovimiento", "")\'>\n\
                </td>\n\
              </tr>';
        tr += '<tr>\n\
                <th colspan="5">FILTROS</th>\n\
              </tr>';
        tr += '<tr>\n\
                <th colspan="5" class="subTituloTabla2">PER&Iacute;ODO</th>\n\
              </tr>';
        tr += '<tr>\n\
                  <td class="fondoNaranja">\n\
                    <input type="radio" name="criterioFecha" title="Elegir el período a buscar\nSeleccionar si se quiere buscar por fechas" value="intervalo">\n\
                  </td>\n\
                  <th>Entre:</th>\n\
                  <td>\n\
                    <input type="date" name="inicio" id="inicio" title="Elegir la fecha de inicio\n(Sólo si se optó por una consulta por fechas)" tabindex="6" style="width:100%; text-align: center" min="2017-10-01">\n\
                  </td>\n\
                  <td>y:</td>\n\
                  <td>\n\
                    <input type="date" name="fin" id="fin" title="Elegir la fecha de finalización\n(Sólo si se optó por una consulta por fechas)" tabindex="7" style="width:100%; text-align: center" min="2017-10-01">\n\
                  </td>\n\
                </tr>';
        tr += '<tr>\n\
                <td class="fondoNaranja">\n\
                  <input type="radio" name="criterioFecha" title="Elegir el período a buscar\nSeleccionar si se quiere buscar por meses" value="mes">\n\
                </td>\n\
                <th>Mes:</th>\n\
                <td>\n\
                  <select id="mes" name="mes" title="Elegir el mes a buscar\n(Sólo si se optó por una consulta por mes)" tabindex="8" style="width:100%">\n\
                    <option value="todos" selected="yes">--Seleccionar--</option>\n\
                    <option value="01">Enero</option>\n\
                    <option value="02">Febrero</option>\n\
                    <option value="03">Marzo</option>\n\
                    <option value="04">Abril</option>\n\
                    <option value="05">Mayo</option>\n\
                    <option value="06">Junio</option>\n\
                    <option value="07">Julio</option>\n\
                    <option value="08">Agosto</option>\n\
                    <option value="09">Setiembre</option>\n\
                    <option value="10">Octubre</option>\n\
                    <option value="11">Noviembre</option>\n\
                    <option value="12">Diciembre</option>\n\
                  </select>\n\
                </td>\n\
                <th>Año:</th>\n\
                <td>\n\
                  <select id="año" name="año" title="Elegir el año\n(Sólo si se optó por una consulta por mes)" tabindex="9" style="width:100%">\n\
                    <option value="2017">2017</option>\n\
                    <option value="2018">2018</option>\n\
                    <option value="2019" selected="yes">2019</option>\n\
                    <option value="2020">2020</option>\n\
                    <option value="2021">2021</option>\n\
                  </select>\n\
                </td>\n\
              </tr>';
        tr += '<tr>\n\
                <td class="fondoNaranja">\n\
                  <input type="radio" name="criterioFecha" title="Elegir el período a buscar\nSeleccionar si se quieren TODOS los movimientos" value="todos" checked="checked">\n\
                </td>\n\
                <th>TODOS</th>\n\
              </tr>';
        tr += '<tr>\n\
                <th colspan="5" class="subTituloTabla2">MOVIMIENTOS</th>\n\
              </tr>';
        tr += '<tr>\n\
                <th>Tipo:</th>\n\
                <td colspan="1">\n\
                  <select id="tipo" name="tipo" title="Elegir el tipo de consulta a buscar" tabindex="10" style="width:100%">\n\
                    <option value="Todos">---REPORTE INTERNO---</option>\n\
                    <option value="Clientes" selected="yes">REPORTE CLIENTES</option>\n\
                    <option value="Retiro">Retiro</option>\n\
                    <option value="Ingreso">Ingreso</option>\n\
                    <option value="Renovaci&oacute;n">Reno</option>\n\
                    <option value="Destrucci&oacute;n">Destrucci&oacute;n</option>\n\
                    <option value="Ajustes">SOLO AJUSTES</option>\n\
                    <option value="AJUSTE Retiro">AJUSTE Retiro</option>\n\
                    <option value="AJUSTE Ingreso">AJUSTE Ingreso</option>\n\
                  </select>\n\
                </td>\n\
                <th>Estado:</th>\n\
                <td colspan="1">\n\
                  <select id="estadoMov" name="estadoMov" title="Elegir el estado del movimiento a buscar" tabindex="11" style="width:100%">\n\
                    <option value="Todos" selected="yes">---TODOS---</option>\n\
                    <option value="OK">OK</option>\n\
                    <option value="ERROR">ERROR</option>\n\
                  </select>\n\
                </td>\n\
                <td>\n\
                  <label for="mostrarEstado">Mostrar Estados: &nbsp;&nbsp;&nbsp;<input type="checkbox" id="mostrarEstado" name="mostrarEstado" placeholder="Mostrar Estado" title="Marcar para que el campo Estado sea visible en los informes" \'> </label>\n\
                </td>\n\
              </tr>';
        tr += '<tr>\n\
                <th colspan="5" class="subTituloTabla2">USUARIO</th>\n\
              </tr>';
        tr += '<tr>\n\
                <th>Usuario:</th>\n\
                <td colspan="2">\n\
                  <select name="usuario" id="usuario" title="Elegir un usuario" tabindex="12" style="width: 100%">\n\
                    <option value="todos" selected="yes">---TODOS---</option>';
        for (var j in nombresUsuarios) {
            tr += '<option value="'+idusers[j]+'">'+nombresUsuarios[j]+' '+apellidosUsuarios[j]+'</option>';
          }      
        tr += '   </select>\n\
                </td>\n\
              </tr>';
        tr += '<tr>\n\
                <th colspan="5">SEGURIDAD</th>\n\
              </tr>';
        tr += '<tr>\n\
                <th>ZIP:</th>\n\
                <td colspan="2">\n\
                  <select id="zip" name="zip" title="Elegir el tipo de seguridad para abrir el ZIP" tabindex="13" style="width:100%">\n\
                    <option value="nada" selected="yes">--- SIN SEGURIDAD ---</option>\n\
                    <option value="fecha">Seg&uacute;n Fecha</option>\n\
                    <option value="random">Rand&oacute;mico</option>\n\
                    <option value="manual">Manual</option>\n\
                  </select>\n\
                </td>\n\
                <td colspan="2">\n\
                  <input type="text" id="zipManual" name="zipManual" placeholder="Contraseña para el ZIP" disabled="yes">\n\
                </td>\n\
              </tr>';
        tr += '<tr>\n\
                <th>Planilla:</th>\n\
                <td colspan="2">\n\
                  <select id="planilla" name="planilla" title="Elegir el tipo de seguridad para modificar los datos de la planilla" tabindex="14" style="width:100%">\n\
                    <option value="misma" selected="yes">--- MISMA QUE EL ZIP ---</option>\n\
                    <option value="nada">SIN SEGURIDAD</option>\n\
                    <option value="fecha">Seg&uacute;n Fecha</option>\n\
                    <option value="random">Rand&oacute;mico</option>\n\
                    <option value="manual">Manual</option>\n\
                  </select>\n\
                </td>\n\
                <td colspan="2">\n\
                  <input type="text" id="planillaManual" name="planillaManual" placeholder="Contraseña para la PLANILLA" disabled="yes">\n\
                </td>\n\
              </tr>';
        tr += '<tr>\n\
                <th>Marca de Agua</th>\n\
                <td>\n\
                  <input type="checkbox" name="marcaAgua" id="marcaAgua" title="Seleccionar si se quiere o no que aparezca la marca de agua." tabindex="15" checked="checked">\n\
                </td>\n\
              </tr>';
        tr += '<tr>\n\
                <td colspan="5" class="pieTabla">\n\
                  <input type="button" class="btn btn-success" name="consultar" id="realizarBusqueda" title="Ejecutar la consulta" tabindex="16" value="Consultar" align="center">\n\
                </td>\n\
              </tr>';
        tabla += tr;
        tabla += '</table>';
        
        var mostrar = '';   
        //var volver = '<a href="estadisticas.php">Volver</a>';
        mostrar += tabla;
        mostrar += '<br><br>';
        //mostrar += volver;
        mostrar += '<br><br>';
        $(selector).html(mostrar);
        if ((tipo === 'prodStock')||(tipo === 'prodMov')){
          var sel = '';
          if (idProdus !== ''){  
            var produsTemp = idProdus.split(',');
            if (tipo === 'prodStock') {
              sel = '#productoStock';
              $("#productoStock").val(hint);
              $("#productoMovimiento").val(''); 
              showHint(hint, "#productoStock",idProdus);
            }
            else {
              sel = '#productoMovimiento';
              $("#productoMovimiento").val(hint);
              $("#productoStock").val('');
              showHint(hint, "#productoMovimiento",idProdus);
            } 
            for (var i = 0; i < produsTemp.length; i++) {
              if (tipo === 'prodStock') {
                $('#productoStock option[value="'+produsTemp[i]+'"]').attr("selected", true);  
              }
              else {
                $('#productoMovimiento option[value="'+produsTemp[i]+'"]').attr("selected", true);
              } 
            }
            $(sel).parent().prev().prev().children().prop("checked", true);
            $(sel).focus();
          }
        }
        else {
          if (tipo === 'totalStock') {
            $("[name=criterio]").val(["totalStock"]);
            $("#realizarBusqueda").focus();
          }
          else {
            $("#productoMovimiento").val('');
            $("#productoStock").val('');
            var sel = '';
            if (entidadSeleccionada !== ''){
              var entTemp = entidadSeleccionada.split(',');//alert(entTemp);
              for (var i = 0; i < entTemp.length; i++) { 
                if (tipo === 'entStock') {
                  $('#entidadStock option[value="'+entTemp[i]+'"]').attr("selected", true);
                  sel = '#entidadStock';
                }
                else {
                  $('#entidadMovimiento option[value="'+entTemp[i]+'"]').attr("selected", true);
                  sel = '#entidadMovimiento';
                }    
              }
              $(sel).parent().prev().prev().children().prop("checked", true);
              $(sel).focus();
            }
            else {
              $('#entidadStock option[value="todos"]').attr("selected", true);
              $('#entidadMovimiento option[value="todos"]').attr("selected", true);
            }
          }        
        }
            
        if (zip !== ''){
          $("#zip").val(zip);
          if (zip === 'manual'){
            $("#productoMovimiento").val('');
            $("#productoStock").val('');
            $("#zipManual").attr("disabled", false);
            $("#zipManual").val('');
          }
        }
        if (planilla !== ''){
          $("#planilla").val(planilla);
          if (planilla === 'manual'){
            $("#productoMovimiento").val('');
            $("#productoStock").val('');
            $("#planillaManual").attr("disabled", false);
            $("#planillaManual").val('');
          }
        }
        if (marcaAgua !== ''){
          if (marcaAgua !== "true"){
            $("#marcaAgua").attr("checked", false);
          }
        }
        else {
            $("#marcaAgua").attr("checked", true);
        }
        if (p !== ''){
          switch (p){
            case 'intervalo': $("#inicio").val(d1);
                              $("#fin").val(d2);     
                              break;
            case 'mes': if (d1 === ''){
                          $("#mes").val('todos');
                          $("#año").val('2019');
                        }
                        else {
                          $("#mes").val(d1);
                          $("#año").val(d2);
                        }
                        break;
            case 'todos': break;
            default: break;
          }
          $("input:radio[name=criterioFecha][value="+p+"]").prop("checked", true);
        }
        else {
          $("#mes").val('todos');
          $("#año").val('2019');
        }
        
        if (tipoFiltro !== ''){
          $("#tipo").val(tipoFiltro);
          if (tipoFiltro === 'Todos'){
            $("#estadoMov").val('Todos');
            $("#mostrarEstado").prop("checked", true);
            $("#estadoMov").prop("disabled", true);
            $("#mostrarEstado").prop("disabled", true);
          }
          else {
            if (tipoFiltro === 'Clientes'){
              $("#estadoMov").val('OK');
              $("#mostrarEstado").prop("checked", false);
              $("#estadoMov").prop("disabled", true);
              $("#mostrarEstado").prop("disabled", true);
            }
            else {
              if (estadoMov !== ''){
                var isTrueSet = (mostrarEstado === 'true');
                $("#estadoMov").val(estadoMov);
                $("#mostrarEstado").prop("checked", isTrueSet);
              }
              else {
                $("#estadoMov").val('Todos');
                $("#mostrarEstado").prop("checked", true);
              }
            }
          }
        }
        else {
          $("#tipo").val('Clientes');
          $("#estadoMov").val('OK');
          $("#mostrarEstado").prop("checked", false);
          $("#estadoMov").prop("disabled", true);
          $("#mostrarEstado").prop("disabled", true);
        }
        
        if (user !== ''){
          $("#usuario").val(user);
        }
      });  
    });  
  });
}
/********** fin cargarFormBusqueda(selector, hint, tipo, idProd, entidadSeleccionada, zip, planilla, marcaAgua, p, d1, d2, tipoFiltro, user) **********/

/***********************************************************************************************************************
/// *********************************************** FIN FUNCIONES BÚSQUEDAS *********************************************
************************************************************************************************************************
**/


/***********************************************************************************************************************
/// ************************************************* FUNCIONES PRODUCTOS **********************************************
************************************************************************************************************************
*/

/**
  \brief Función que carga en el selector pasado como parámetro la tabla para ver los productos.
  @param {String} selector String con el selector en donde se debe mostrar la tabla.
  @param {Integer} idProd Entero con el identificador del producto a cargar.
*/
function cargarProducto(idProd, selector){
  var url = "data/selectQuery.php";
  var query = 'select idprod, nombre_plastico, entidad, fechaCreacion, codigo_emsa, bin, codigo_origen, contacto, snapshot, stock, alarma1, alarma2, ultimoMovimiento, comentarios from productos where idprod='+idProd+' limit 1';
  
  $.getJSON(url, {query: ""+query+""}).done(function(request) {
    var resultado = request["resultado"];
    var total = request["rows"];
    if (total >= 1) {
      var stock = parseInt(resultado[0]['stock'], 10);
      var alarma1 = parseInt(resultado[0]['alarma1'], 10);
      var alarma2 = parseInt(resultado[0]['alarma2'], 10);
      var ultimoMovimiento = resultado[0]['ultimoMovimiento'];
      if ((ultimoMovimiento === undefined) || (ultimoMovimiento === null)||(ultimoMovimiento === "null")){
        ultimoMovimiento = 'NO HAY';
      }
      var t1 = resultado[0]['fechaCreacion'];
      var fechaCreacion;
      if ((t1 === undefined) || (t1 === null)||(t1 === "null")){
          fechaCreacion = 'NO seteada';
      }
      else {
        var temp = t1.split('-');
        fechaCreacion = temp[2]+'/'+temp[1]+'/'+temp[0]; 
      }
      //alert(fechaCreacion);
    }
    var mostrar = "";
    var formu = '<form method="post" id="productUpdate" name="productUpdate" action="producto.php">';
    var tabla = '<table class="tabla2" name="producto">\n\
                  <caption>Formulario para editar los datos del producto</caption>';
    var tr = '<th colspan="3" class="centrado tituloTabla">DATOS DEL PRODUCTO</th>';

    tr += '<tr>\n\
            <th align="left"><font class="negra">Entidad:</font></th><td align="center" colspan="2"><input type="text" name="entidad" id="entidad" title="Ingresar la entidad" placeholder="Entidad" tabindex="4" class="agrandar" style="width:100%; text-align: center"></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Nombre:</font></th>\n\
              <td align="center" colspan="2"><input type="text" name="nombre" id="nombre" title="Ingresar el nombre del producto" placeholder="Nombre" tabindex="5" class="agrandar" maxlength="35" style="width:100%; text-align: center"></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Código EMSA:</font></th>\n\
              <td align="center" colspan="2"><input type="text" name="codigo_emsa" id="codigo_emsa" title="Ingresar el código de EMSA" placeholder="C&oacute;digo EMSA" tabindex="6" class="agrandar" maxlength="35" style="width:100%; text-align: center"></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Código Origen:</font></th>\n\
              <td align="center" colspan="2"><input type="text" name="codigo_origen" id="codigo_origen" title="Ingresar el código de origen" placeholder="C&oacute;digo Origen" tabindex="7" class="agrandar" maxlength="35" style="width:100%; text-align: center"></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Fecha de Creación:</font></th>\n\
              <td align="center" colspan="2"><input type="text" name="fechaCreacion" id="fechaCreacion" title="Fecha en que fue creado el producto. NO es editable." placeholder="Fecha de creaci&oacute;n" tabindex="-2" class="agrandar" maxlength="35" style="width:100%; text-align: center"></td>\n\
          </tr>';  
    tr += '<tr>\n\
              <th align="left"><font class="negra">Contacto:</font></th>\n\
              <td align="center" colspan="2"><input type="text" id="contacto" name="contacto2" title="Ingresar el contacto" placeholder="Contacto" tabindex="8" class="agrandar" maxlength="35" size="9"></td>\n\
           </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Foto:</font></th>\n\
              <td align="center" colspan="2"><input type="text" id="nombreFoto" name="nombreFoto" title="Ingresar el nombre de la foto" placeholder="Nombre de la foto" tabindex="9" class="agrandar" maxlength="35" size="9"></td>\n\
           </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">BIN:</font></th>\n\
              <td align="center" colspan="2"><input type="text" name="bin" id="bin" title="Ingresar el BIN del producto" placeholder="BIN" tabindex="10" class="agrandar" maxlength="35" style="width:100%; text-align: center"></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Stock:</font></th>\n\
              <td align="center" colspan="2"><input type="text" id="stockProducto" name="stockProducto" title="Stock del producto.\nSólo editable en un producto nuevo" placeholder="Stock" tabindex="-1" class="agrandar" maxlength="35" size="9"></td>\n\
          </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Alarma 1:</font></th>\n\
              <td align="center" colspan="2"><input type="text" id="alarma1" name="alarma1" title="Cantidad de plásticos para disparar el primer nivel de alarma" placeholder="Nivel de advertencia" tabindex="11" class="agrandar" maxlength="35" size="9"></td>\n\
           </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Alarma 2:</font></th>\n\
              <td align="center" colspan="2"><input type="text" id="alarma2" name="alarma2" title="Cantidad de plásticos para disparar el nivel crítico de alarma" placeholder="Nivel Crítico" tabindex="12" class="agrandar" maxlength="35" size="9"></td>\n\
           </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Último Movimiento:</font></th>\n\
              <td align="center" colspan="2"><input type="text" id="ultimoMovimiento" name="ultimoMovimiento" title="Último movimiento realizado.\nNO editable; se actualiza de forma automática" placeholder="&Uacute;ltimo Movimiento" class="agrandar" maxlength="35" size="9"></td>\n\
           </tr>';
    tr += '<tr>\n\
              <th align="left"><font class="negra">Comentarios:</font></th>\n\
              <td align="center" colspan="2"><textarea id="comentarios" name="comProd"  title="Ingresar un comentario" placeholder="Comentarios" tabindex="13" class="agrandar" maxlength="250" rows="5" cols="30"></textarea></td>\n\
          </tr>';
    tr += '<tr>\n\
              <td style="width: 33%;border-right: 0px;"><input type="button" value="EDITAR" id="editarProducto" name="editarProducto" title="Habilitar la edición del producto" tabindex="3" class="btn btn-primary" align="center"/></td>\n\
              <td style="width: 33%;border-left: 0px;border-right: 0px;"><input type="button" value="ACTUALIZAR" id="actualizarProducto" name="actualizarProducto" title="Realizar la actualización" tabindex="14" class="btn btn-warning" align="center"/></td>\n\
              <td style="width: 33%;border-left: 0px;"><input type="button" value="ELIMINAR" id="eliminarProducto" name="eliminarProducto" title="Dar de baja el producto" class="btn btn-danger" align="center"/></td>\n\
          </tr>';
    tr += '<tr>\n\
             <td style="display:none"><input type="text" id="idprod" value='+idProd+'></td>\n\
           </tr>';
    tr += '<tr>\n\
              <td colspan="3" class="pieTabla"><input type="button" value="NUEVO" id="agregarProducto" name="agregarProducto" title="Agregar un nuevo producto" class="btn btn-success" align="center"/></td>\n\
          </tr>';
    tabla += tr;
    tabla += '</table>';
    formu += tabla;
    formu += '</form>';
    mostrar += formu;
    $(selector).html(mostrar);
  
    if (total >=1) {
    $("#entidad").val(resultado[0]['entidad']);
    $("#nombre").val(resultado[0]['nombre_plastico']);
    $("#codigo_emsa").val(resultado[0]['codigo_emsa']);
    $("#codigo_origen").val(resultado[0]['codigo_origen']);
    $("#fechaCreacion").val(fechaCreacion);
    $("#contacto").val(resultado[0]['contacto']);
    $("#nombreFoto").val(resultado[0]['snapshot']);
    $("#stockProducto").val(stock.toLocaleString());
    $("#alarma1").val(alarma1);
    $("#alarma2").val(alarma2);
    $("#comentarios").val(resultado[0]['comentarios']);
    $("#ultimoMovimiento").val(ultimoMovimiento);
    $("#bin").val(resultado[0]['bin']); 
    
    //$(selector).html(mostrar);

    if ((stock < alarma1) && (stock > alarma2)) {
      $("#stockProducto").addClass('alarma1');
    }
    else {
      if (stock < alarma2) {
        $("#stockProducto").addClass('alarma2');
      }
      else {
        $("#stockProducto").addClass('resaltado');
      }
    }
    }
    inhabilitarProducto();
  }); 
}
/********** fin cargarProducto(idProd, selector) **********/

/**
  \brief Función que carga en el selector pasado como parámetro la tabla con el campo para la búsqueda de productos.
  @param {String} selector String con el selector en donde se debe mostrar la tabla.
*/
function cargarBusquedaProductos(selector) {
  var mostrar = '';
  var tabla = '<table class="tabla2" name="busquedaProducto" style="width: 60%;">\n\
                <caption>Formulario para buscar el producto</caption>\n\
                <tr>\n\
                  <th align="left" class="tituloTabla" colspan="5"><font class="negra">BUSCAR:</font></th>\n\
                </tr>\n\
                <tr>\n\
                  <td align="center" colspan="5" class="pieTabla"><input type="text" id="productoBusqueda" name="productoBusqueda" placeholder="Producto" title="Ingresar el producto" tabindex="1" class="agrandar" size="9" onkeyup=\'showHintProd(this.value, "#productoBusqueda", ""), ""\'></td>\n\
                </tr>\n\
              </table><br>';
  mostrar += tabla;
  $(selector).html(mostrar);
  $("#productoBusqueda").focus();
}
/********** fin cargarBusquedaProductos(selector) **********/

/**
 * \brief Función que valida los datos pasados para el producto
 * @param {Boolean} nuevo Booleano que indica si estoy validando un producto nuevo a agregar, o editando uno ya ingresado.
 * @returns {Boolean} Devuelve un booleano que indica si se pasó o no la validación de los datos para el producto.
 */
function validarProducto(nuevo) {
  var entidad = $("#entidad").val();
  var nombre = $("#nombre").val();
  var stockProducto1 = $("#stockProducto").val();
  var alarma1 = parseInt($("#alarma1").val(), 10);
  var alarma2 = parseInt($("#alarma2").val(), 10);
  var seguir = true;
  var al1Ingresada = false;
  var al2Ingresada = false;
    
  if ((entidad === '') || (entidad === null)) {
    alert('El campo Entidad NO puede estar vacío. Por favor verifique.');
    $("#entidad").focus();
    seguir = false;
    return false;
  }
  
  if (seguir){
    if ((nombre === '') || (nombre === null)) {
      alert('El Nombre del producto NO puede estar vacío. Por favor verifique.');
      $("#nombre").focus();
      seguir = false;
      return false;
    }
  }
  
  /// Si estoy agregando un producto nuevo, y si se ingresa el stock inicial, debo validarlo:
  if (nuevo) {
    if (seguir) {
      if ((stockProducto1 !== undefined)&&(stockProducto1 !== '')){
        var stockProducto = parseInt(stockProducto1, 10);
        var stock1 = validarEntero(stockProducto);
        if ((!stock1) || (stockProducto < 0)) {
          alert('El stock inicial debe ser un entero mayor o igual a 0. Por favor verifique.');
          $("#stockProducto").val('');
          $("#stockProducto").focus();
          seguir = false;
          return false;
        }
      }
      else {
        $("#stockProducto").val(0);
      }
    }
  }
  
  if (seguir) {
    if ((alarma1 === '') || (alarma1 === null))
      {
      alert('La alarma 1 no puede ser nula ni estar vacía.\nPor favor verifique');
      $("#alarma1").focus();
      seguir = false;
      return false;
    }
    else {
      var al1 = validarEntero(alarma1);
      if ((!al1) || (alarma1 <= 0)) {
        alert('La alarma 1 debe ser un entero mayor que 0. Por favor verifique.');
        $("#alarma1").val('');
        $("#alarma1").focus();
        seguir = false;
        return false;
      }
      else {
        al1Ingresada = true;
      }
    }
  }
  
  if (seguir) {
    if ((alarma2 === '') || (alarma2 === null))
      {
      alert('La alarma 2 no puede ser nula ni estar vacía.\nPor favor verifique');
      $("#alarma2").focus();
      seguir = false;
      return false;
    }
    else {
      var al2 = validarEntero(alarma2);
      if ((!al2) || (alarma2 <= 0)) {
        alert('La alarma 2 debe ser un entero mayor que 0. Por favor verifique.');
        $("#alarma2").val('');
        $("#alarma2").focus();
        seguir = false;
        return false;
      }
      else {
        al2Ingresada = true;
      }
    }
  }
  
  if (seguir) {
    if (al1Ingresada && al2Ingresada) {
      if (alarma2 >= alarma1) {
        alert('La alarma 2 (nivel crítico) DEBE ser menor que la alarma 1 (nivel advertencia).\nPor favor verifique.');
        $("#alarma2").val('');
        $("#alarma2").focus();
        seguir = false;
        return false;
      }
    }
  }
  
  if (seguir) {
    return true;
  }
  else {
    return false;
  }
  
}
/********** fin validarProducto(nuevo) **********/

/**
  \brief Función que deshabilita los input del form Producto.
*/
function inhabilitarProducto(){
  document.getElementById("nombre").disabled = true;
  document.getElementById("entidad").disabled = true;
  document.getElementById("codigo_origen").disabled = true;
  document.getElementById("codigo_emsa").disabled = true;
  document.getElementById("fechaCreacion").disabled = true;
  document.getElementById("contacto").disabled = true;
  document.getElementById("nombreFoto").disabled = true;
  document.getElementById("bin").disabled = true;
  document.getElementById("alarma1").disabled = true;
  document.getElementById("alarma2").disabled = true;
  document.getElementById("ultimoMovimiento").disabled = true;
  document.getElementById("comentarios").disabled = true;
  document.getElementById("stockProducto").disabled = true;
  document.getElementById("editarProducto").value = "EDITAR";
  document.getElementById("actualizarProducto").disabled = true;
}
/********** fin inhabilitarProducto() **********/

/**
  \brief Función que habilita los input del form Producto.
*/
function habilitarProducto(){
  document.getElementById("nombre").disabled = false;
  document.getElementById("entidad").disabled = false;
  document.getElementById("codigo_origen").disabled = false;
  document.getElementById("codigo_emsa").disabled = false;
  //document.getElementById("fechaCreacion").disabled = false;
  document.getElementById("contacto").disabled = false;
  document.getElementById("nombreFoto").disabled = false;
  document.getElementById("bin").disabled = false;
  document.getElementById("alarma1").disabled = false;
  document.getElementById("alarma2").disabled = false;
  //document.getElementById("ultimoMovimiento").disabled = false;
  document.getElementById("comentarios").disabled = false;
  //document.getElementById("stockProducto").disabled = false;
  document.getElementById("editarProducto").value = "BLOQUEAR";
  document.getElementById("actualizarProducto").disabled = false;
}
/********** fin habilitarProducto() **********/

/***********************************************************************************************************************
/// ********************************************** FIN FUNCIONES PRODUCTOS *********************************************
************************************************************************************************************************
**/



/**************************************************************************************************************************
/// ************************************************* FUNCIONES ESTADISTICAS **********************************************
***************************************************************************************************************************
*/

/**
  \brief Función que carga en el selector pasado como parámetro el formulario para realizar las estadisticas.
  @param {String} selector String con el selector en donde se debe mostrar el formulario.
*/
function cargarFormEstadisticas(selector){
  var url = "data/selectQuery.php";
  var query = "select distinct entidad from productos order by entidad asc, nombre_plastico asc";

  $.getJSON(url, {query: ""+query+""}).done(function(request) {
    var entidades = request["resultado"];
    var mostrar = '';
    var titulo = '<h2 id="titulo" class="encabezado">CONSULTAR ESTAD&Iacute;STICAS</h2>';
    var formu = '<form method="POST" id="graficar" action="graficar.php">';
    var tabla = '<table id="estadisticas" name="estadisticas" class="tabla2">\n\
                  <caption>Formulario para ver las estadísticas</caption>';
    var tr = '<tr>\n\
                <th colspan="5" class="centrado tituloTabla">CRITERIOS</th>\n\
              </tr>';
    tr += '<tr>\n\
            <td class="fondoVerde"><input type="radio" name="criterio" title="Elegir el criterio a consultar\nSeleccionar si se quiere la estadística de una entidad" value="entidadMovimiento" checked="true"></td>\n\
            <th>Entidad:</th>\n\
            <td colspan="3">\n\
              <select name="entidad" id="entidadGrafica" title="Seleccionar la entidad" style="width: 100%">\n\
                <option value="todos">---TODOS---</option>';
    for (var i in entidades) {
      tr += '<option value="'+entidades[i]['entidad']+'">'+entidades[i]['entidad']+'</option>';
    }
    tr += '   </select>\n\
            </td>\n\
          </tr>';
    tr += '<tr>\n\
            <td class="fondoVerde"><input type="radio" name="criterio" title="Elegir el criterio a consultar\nSeleccionar si se quiere la estadística de un producto" value="productoMovimiento"></td>\n\
            <th>Producto:</th>\n\
            <td align="center" colspan="3"><input type="text" id="productoGrafica" name="producto" title="Ingresar el producto" placeholder="Producto" class="agrandar" size="9" onkeyup="showHint(this.value, \'#productoGrafica\', \'\')"></td>\n\
          </tr>';
    tr += '<th colspan="5" class="centrado">FECHAS</th>';
    tr += '<tr>\n\
                  <td class="fondoNaranja">\n\
                    <input type="radio" name="criterioFecha" title="Elegir el período a buscar\nSeleccionar si se quiere consultar por fechas" value="intervalo">\n\
                  </td>\n\
                  <th>Entre:</th>\n\
                  <td>\n\
                    <input type="date" name="diaInicio" id="diaInicio" title="Elegir la fecha de inicio\n(Sólo si se busca por fechas)" tabindex="6" style="width:100%; text-align: center" min="2017-10-01">\n\
                  </td>\n\
                  <td>y:</td>\n\
                  <td>\n\
                    <input type="date" name="diaFin" id="diaFin" title="Elegir la fecha de finalización\n(Sólo si se busca por fechas)" tabindex="7" style="width:100%; text-align: center" min="2017-10-01">\n\
                  </td>\n\
                </tr>';
    tr += '<tr>\n\
            <td class="fondoNaranja">\n\
              <input type="radio" name="criterioFecha" title="Elegir el período a buscar\nSeleccionar si se quiere consultar por meses" value="mes">\n\
            </td>\n\
            <th nowrap>Mes Inicial:</th>\n\
            <td>\n\
              <select id="mesInicio" name="mesInicio" title="Elegir el mes de inicio\n(Sólo si se busca por meses)" tabindex="8" style="width:100%">\n\
                <option value="todos">--Seleccionar--</option>\n\
                <option value="1">Enero</option>\n\
                <option value="2">Febrero</option>\n\
                <option value="3">Marzo</option>\n\
                <option value="4">Abril</option>\n\
                <option value="5">Mayo</option>\n\
                <option value="6">Junio</option>\n\
                <option value="7">Julio</option>\n\
                <option value="8">Agosto</option>\n\
                <option value="9">Setiembre</option>\n\
                <option value="10">Octubre</option>\n\
                <option value="11">Noviembre</option>\n\
                <option value="12">Diciembre</option>\n\
              </select>\n\
            </td>\n\
            <th>Año:</th>\n\
            <td>\n\
              <select id="añoInicio" title="Elegir el año de inicio\n(Sólo si se busca por meses)" name="añoInicio" tabindex="9" style="width:100%">\n\
                <option value="2017">2017</option>\n\
                <option value="2018">2018</option>\n\
                <option value="2019">2019</option>\n\
                <option value="2020">2020</option>\n\
                <option value="2021">2021</option>\n\
              </select>\n\
            </td>\n\
          </tr>';
    tr += '<tr>\n\
                <td class="fondoNaranja">\n\
                </td>\n\
                <th>Mes Final:</th>\n\
                <td>\n\
                  <select id="mesFin" name="mesFin" title="Elegir el mes de finalización\n(Sólo si se busca por meses)" tabindex="8" style="width:100%">\n\
                    <option value="todos">--Seleccionar--</option>\n\
                    <option value="1">Enero</option>\n\
                    <option value="2">Febrero</option>\n\
                    <option value="3">Marzo</option>\n\
                    <option value="4">Abril</option>\n\
                    <option value="5">Mayo</option>\n\
                    <option value="6">Junio</option>\n\
                    <option value="7">Julio</option>\n\
                    <option value="8">Agosto</option>\n\
                    <option value="9">Setiembre</option>\n\
                    <option value="10">Octubre</option>\n\
                    <option value="11">Noviembre</option>\n\
                    <option value="12">Diciembre</option>\n\
                  </select>\n\
                </td>\n\
                <th>Año:</th>\n\
                <td>\n\
                  <select id="añoFin" name="añoInicio" title="Elegir el año de finalización\n(Sólo si se busca por meses)" tabindex="9" style="width:100%">\n\
                    <option value="2017">2017</option>\n\
                    <option value="2018">2018</option>\n\
                    <option value="2019">2019</option>\n\
                    <option value="2020">2020</option>\n\
                    <option value="2021">2021</option>\n\
                  </select>\n\
                </td>\n\
              </tr>';
    tr += '<tr>\n\
                <td class="fondoNaranja">\n\
                  <input type="radio" name="criterioFecha" title="Elegir el período a buscar\nSeleccionar si se quieren TODOS los movimientos" value="todos" checked="checked">\n\
                </td>\n\
                <th>TODOS</th>';
    tr += '<tr>\n\
            <th colspan="2">Tipo:</th>\n\
            <td colspan="3">\n\
              <select id="tipo" name="tipo" title="Elegir el tipo de movimiento a buscar" style="width:100%">\n\
                <option value="Todos">---REPORTE INTERNO---</option>\n\
                <option value="Clientes" selected="yes">REPORTE CLIENTES</option>\n\
                <option value="Retiro">Retiro</option>\n\
                <option value="Ingreso">Ingreso</option>\n\
                <option value="Renovaci&oacute;n">Reno</option>\n\
                <option value="Destrucci&oacute;n">Destrucci&oacute;n</option>\n\
                <option value="Ajustes">SOLO AJUSTES</option>\n\
                <option value="AJUSTE Retiro">AJUSTE Retiro</option>\n\
                <option value="AJUSTE Ingreso">AJUSTE Ingreso</option>\n\
              </select>\n\
            </td>\n\
          </tr>';
//    tr += '<tr>\n\
//            <th>Usuario:</th>\n\
//            <td colspan="3">\n\
//              <select name="usuario" id="usuario" style="width: 100%">\n\
//                <option value="todos">---TODOS---</option>\n\
//              </select>\n\
//            </td>\n\
//          </tr>';
    tr += '<tr>\n\
            <td colspan="5" class="pieTabla"><input type="button" class="btn btn-success" title="Realizar la gráfica" name="realizarGrafica" id="realizarGrafica" value="Consultar" align="center"></td>\n\
            <td style="display:none"><input type="text" id="consulta" name="consulta" value=""></td>\n\
            <td style="display:none"><input type="text" id="fechaInicio" name="fechaInicio" value=""></td>\n\
            <td style="display:none"><input type="text" id="fechaFin" name="fechaFin" value=""></td>\n\
            <td style="display:none"><input type="text" id="mensaje" name="mensaje" value=""></td>\n\
            <td style="display:none"><input type="text" id="nombreGrafica" name="nombreGrafica" value=""></td>\n\
            <td style="display:none"><input type="text" id="hacerGrafica" name="hacerGrafica" value=""></td>\n\
          </tr>';
    tabla += tr;
    tabla += '</table>';
    formu += tabla;
    formu += '</form><br>';
    mostrar += titulo;
    mostrar += formu;
    $("#nombreGrafica").val("");
    
    var parametros = jQuery(location).attr('search');
    var criterio = '';
    var tipo = '';
    var e = '';
    var h = '';
    if (parametros){
      var temp = parametros.split('?');
      var temp1 = temp[1].split('&');
      var tam = temp1.length;
      
      if (tam !== 4){
        var temp2 = temp1[0].split('=');
        criterio = temp2[1];
        if (criterio === 'intervalo'){
          var temp4 = temp1[1].split('=');
          var temp5 = temp1[2].split('=');
          var temp6 = temp1[3].split('=');
          var temp7 = temp1[4].split('=');
          var temp8 = temp1[5].split('=');
          var d1 = temp4[1];
          var d2 = temp5[1];        
          e = decodeURI(temp6[1]);
          tipo = decodeURI(temp7[1]);
          h = decodeURI(temp8[1]);
        }
        if (criterio === 'mes'){
          var temp6 = temp1[1].split('=');
          var temp7 = temp1[2].split('=');
          var temp8 = temp1[3].split('=');
          var temp9 = temp1[4].split('=');
          var temp10 = temp1[5].split('=');
          var temp11 = temp1[6].split('=');
          var temp12 = temp1[7].split('=');
          var m1 = temp6[1];
          var a1 = temp7[1];
          var m2 = temp8[1];
          var a2 = temp9[1];  
          e = decodeURI(temp10[1]);
          tipo = decodeURI(temp11[1]);
          h = decodeURI(temp12[1]);
        }
      }
      else {
        var temp2 = temp1[1].split('=');
        var temp3 = temp1[2].split('=');
        var temp4 = temp1[3].split('=');
        e = decodeURI(temp2[1]);
        tipo = decodeURI(temp3[1]);
        h = decodeURI(temp4[1]);
      }
    }
    
    $(selector).html(mostrar);
    
    if ((criterio === 'todos')||(criterio === '')){
      ///Seteo valores por defecto en las otras opciones:
      $("#mesInicio").val('todos');
      $("#añoInicio").val('2018');
      $("#mesFin").val('todos');
      $("#añoFin").val('2019');
      $("[name=criterioFecha]").val(["todos"]);
      if ((tipo === '')||(tipo === undefined)){
        $("#tipo").val('Todos');
      }
      else {
        $("#tipo").val(tipo);
      }
    }
    if (criterio === 'intervalo'){
      $("#diaInicio").val(d1);
      $("#diaFin").val(d2);
      ///Seteo valores por defecto en las otras opciones:
      $("#mesInicio").val('todos');
      $("#añoInicio").val('2018');
      $("#mesFin").val('todos');
      $("#añoFin").val('2018');
      $("[name=criterioFecha]").val(["intervalo"]);
      $("#tipo").val(tipo);
    }
    if (criterio === 'mes'){
      $("#mesInicio").val(m1);
      $("#añoInicio").val(a1);
      $("#mesFin").val(m2);
      $("#añoFin").val(a2);
      $("[name=criterioFecha]").val(["mes"]);
      $("#tipo").val(tipo);
    }
    
    if ((e !== '')&&(e !== undefined)){
      var tem = validarEntero(e);
      if (tem === true){
        $("#entidadGrafica").val('todos');
        $("#productoGrafica").val(h);
        showHint(h, '#productoGrafica', e);
      }
      else {
        $("#entidadGrafica").val(e);
        $("#productoGrafica").val('');
      }
    }
    else {
      $("#entidadGrafica").val('todos');
      $("#productoGrafica").val('');
    }
  });
}
/********** fin cargarFormEstadisticas(selector) **********/

/**
  \brief Función que carga en el selector pasado como parámetro una imágen con la gráfica.
  @param {String} selector String con el selector en donde se debe mostrar la gráfica.
*/
function cargarGrafica(selector){
  var mostrar = '';
  var titulo = '<h2 id="titulo" class="encabezado">RESULTADO ESTAD&Iacute;STICAS</h2>';
  var formuInicio = '<form name="exportarGraph" id="exportarGraph" target="_blank" action="generarGrafica.php" method="POST">';
  var formuFin = "</form>";
  var grafica = '<figure>\n\
                  <img src="graficar.php?" id="grafiquita" width="740px" height="400px">\n\
                  <figcaption>Gr&aacute;fica con las estad&iacute;sticas</figcaption>\n\
                </figure>';
//  grafica += '<figure>\n\
//                <img src="graficar.php?t=2" id="grafiquita1" width="740px" height="400px">\n\
//                <figcaption>Gr&aacute;fica con las estad&iacute;sticas</figcaption>\n\
//              </figure>';
  
  var parametros = jQuery(location).attr('search');//alert('en cargar gráfica\np: '+parametros);
  var temp = parametros.split('?');
  var temp1 = temp[1].split('&');
  var tam = temp1.length;
  
  //temp1[0] corresponde siempre a g=1 para hacer la gráfica el cual NO se necesita ahora
  //var temp2 = temp1[0].split('=');
  
  var temp3 = temp1[1].split('=');
  var criterio = temp3[1];
  var param = '';
  var e = '';
  var t = '';
  var h = '';
  if (tam === 7){
    var temp4 = temp1[2].split('=');
    var temp5 = temp1[3].split('=');
    var temp6 = temp1[4].split('=');
    var temp7 = temp1[5].split('=');
    var temp8 = temp1[6].split('=');
    var d1 = temp4[1];
    var d2 = temp5[1];
    e = decodeURI(temp6[1]);
    t = decodeURI(temp7[1]);
    h = decodeURI(temp8[1]);
    param = '&d1='+d1+'&d2='+d2+'&e='+e+'&t='+t+'&h='+h+'';
  }
  if (tam === 9){
    var temp6 = temp1[2].split('=');
    var temp7 = temp1[3].split('=');
    var temp8 = temp1[4].split('=');
    var temp9 = temp1[5].split('=');
    var temp10 = temp1[6].split('=');
    var temp11 = temp1[7].split('=');
    var temp12 = temp1[8].split('=');
    var m1 = temp6[1];
    var a1 = temp7[1];
    var m2 = temp8[1];
    var a2 = temp9[1];  
    e = decodeURI(temp10[1]);
    t = decodeURI(temp11[1]);
    h = decodeURI(temp12[1]);
    param = '&m1='+m1+'&a1='+a1+'&m2='+m2+'&a2='+a2+'&e='+e+'&t='+t+'&h='+h+'';
  }
  if (tam === 5){
    var temp4 = temp1[2].split('=');
    var temp5 = temp1[3].split('=');
    var temp6 = temp1[4].split('=');
    e = decodeURI(temp4[1]);
    t = decodeURI(temp5[1]);
    h = decodeURI(temp6[1]);
    param = '&e='+e+'&t='+t+'&h='+h+'';
  }
  //alert('tam: '+tam+'\ncriterio: '+criterio+'\nparam: '+param);
  var volver = '<a title="Volver a ESTADÍSTICAS" href="estadisticas.php?c='+criterio+param+'"">Volver</a>';
  mostrar += titulo;
  mostrar += formuInicio;
  mostrar += grafica;
  mostrar += formuFin;
  mostrar += '<br><br>';
  mostrar += volver;
  mostrar += '<br><br>';
  $(selector).html(mostrar);
}
/********** fin cargarGrafica(selector) **********/

/**
  \brief Función que se encarga de realizar la gráfica.
*/
function realizarGrafica(){
  verificarSesion('', 's');
  var radio = $('input:radio[name=criterio]:checked').val();
  var entidadGrafica = document.getElementById("entidadGrafica").value;
  var idProd = $("#hint").val();
  var productoGrafica = $("#productoGrafica").val();
  var nombreProducto = $("#hint").find('option:selected').text( );

  if ((nombreProducto !== "undefined") && (nombreProducto !== '')) {
    ///Separo en partes el nombreProducto que contiene [entidad: codigo] --- nombreProducto
    var tempo = nombreProducto.split("--- ");
    var nombreSolo = tempo[1].trim();
    ///*** Extraigo también la entidad correspondiente para poder luego generar la carpeta bajo la misma:
    var tempo2 = nombreProducto.split(":");
    var tempo3 = tempo2[0].split('[');
    var entProdGrafica = tempo3[1];
  }

  var tipo = $("#tipo").find('option:selected').val( ); 
  var criterioFecha = $('input:radio[name=criterioFecha]:checked').val();

  var mensajeFecha = '';
  var inicio = '';
  var fin = '';
  var rangoFecha = '';
  var hoy = new Date();
  var tempMonth = parseInt(hoy.getMonth(), 10)+1;
  var tempDia = hoy.getDate();
  var tempAño = hoy.getUTCFullYear();
  if (tempMonth < 10){
    tempMonth = "0"+tempMonth;
  }
  if (tempDia < 10){
    tempDia = "0"+tempDia;
  }
  var meses = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];

  var validado = true;

  switch (criterioFecha) {
    case "intervalo": var diaInicio = $("#diaInicio").val();
                      var diaFin = $("#diaFin").val();
                      if (diaInicio === ''){
                        diaInicio = $("#diaInicio").attr("min");
                      }
                      else {
                        diaInicio = $("#diaInicio").val();
                      }
                      if (diaFin === ''){
                        diaFin = tempAño+"-"+tempMonth+"-"+tempDia;
                      }
                      else {
                        diaFin = $("#diaFin").val();
                      }
                      var inicioDate = new Date(diaInicio+" 00:00:00");
                      var finDate = new Date(diaFin+" 23:59:59");
                      if (finDate < inicioDate) {
                        alert('ERROR. La fecha final NO puede ser anterior a la fecha inicial.\nPor favor verifique.');
                        $("#diaInicio").focus();
                        validado = false;
                      }
                      else {
                        var mesTemp = inicioDate.getUTCMonth()+1;
                        if (mesTemp < 10) {
                          mesTemp = "0"+mesTemp;
                        }
                        var diaTemp = inicioDate.getDate();
                        if (diaTemp < 10) {
                          diaTemp = "0"+diaTemp;
                        }
                        var dia1 = diaTemp+"/"+mesTemp.toString()+"/"+inicioDate.getUTCFullYear();
                        inicio = inicioDate.getUTCFullYear()+"-"+mesTemp.toString()+"-"+diaTemp;

                        if (finDate > hoy){
                          var mesTemp1 = hoy.getUTCMonth()+1;
                          if (mesTemp1 < 10) {
                            mesTemp1 = "0"+mesTemp1;
                          }
                          var diaTemp1 = hoy.getDate();
                          if (diaTemp1 < 10) {
                            diaTemp1 = "0"+diaTemp1;
                          }
                          fin = hoy.getUTCFullYear()+"-"+mesTemp1.toString()+"-"+diaTemp1;
                          dia2 = diaTemp1+"/"+mesTemp1.toString()+"/"+hoy.getUTCFullYear();
                        }
                        else {
                          var mesTemp2 = finDate.getUTCMonth()+1;
                          if (mesTemp2 < 10) {
                            mesTemp2 = "0"+mesTemp2;
                          }
                          var diaTemp2 = finDate.getDate();
                          if (diaTemp2 < 10) {
                            diaTemp2 = "0"+diaTemp2;
                          }
                          dia2 = diaTemp2+"/"+mesTemp2.toString()+"/"+finDate.getUTCFullYear();
                          fin = finDate.getUTCFullYear()+"-"+mesTemp2.toString()+"-"+diaTemp2;
                        }

                        if (inicio == fin) {
                          mensajeFecha = "del día "+dia1;
                        }
                        else {
                          mensajeFecha = "entre el "+dia1+" y el "+dia2;
                        }                      
                      }
                      rangoFecha = "(fecha >= '"+inicio + "') and (fecha <= '"+fin+"')";
                      break;
    case "mes": ///Recupero valores pasados:
                var mesInicio = $("#mesInicio").val();
                var añoInicio = parseInt($("#añoInicio").val(), 10);
                var mesFin = $("#mesFin").val();
                var añoFin = parseInt($("#añoFin").val(), 10);   
                if (mesInicio === 'todos'){
                  mesInicio = 1;
                }
                else {
                  mesInicio = parseInt(mesInicio, 10);
                }
                if ((añoInicio === 2017)&&(mesInicio < 9)){
                  mesInicio = 9;
                }
                if (mesFin === 'todos'){
                  mesFin = 12;
                }
                else {
                  mesFin = parseInt(mesFin, 10);
                }
                
                ///Instancio dos objetos tipo Date con las fechas inicial y final:
                var finDate1 = new Date(añoFin,mesFin,0, 23,59,59);
                var inicioDate1 = new Date(añoInicio+"-"+mesInicio+"-01 00:00:00");

                var mes1 = '';
                var mes2 = '';
                var dia1 = '';
                var dia2 = '';

                var inicialMonth1 = parseInt(inicioDate1.getUTCMonth(), 10)+1;  
                if (inicialMonth1 < 10){
                  mes1 = '0'+inicialMonth1.toString();
                }
                else {
                  mes1 = inicialMonth1.toString();
                }
                if (inicioDate1.getDate() < 10){
                  dia1 = '0'+inicioDate1.getDate();
                }
                else {
                  dia1 = inicioDate1.getDate();
                }
                inicio = inicioDate1.getUTCFullYear()+"-"+mes1+"-"+dia1;
                
                ///Chequeo que la fecha final pasada no sea posterior a hoy:
                if (finDate1 > hoy){
                  fin = tempAño+"-"+tempMonth.toString()+"-"+tempDia;
                  añoFin = hoy.getUTCFullYear();
                  mesFin = hoy.getMonth()+1;
                  //dia2 = hoy.getDate()+"/"+hoy.getMonth()+1+"/"+hoy.getUTCFullYear();
                }
                else {
                  var finalMonth1 = parseInt(finDate1.getMonth(), 10)+1;
                  if (finalMonth1 < 10){
                    mes2 = '0'+finalMonth1.toString();
                  }
                  else {
                    mes2 = finalMonth1.toString();
                  }
                  if (finDate1.getDate() < 10){
                    dia2 = '0'+finDate1.getDate();
                  }
                  else {
                    dia2 = finDate1.getDate();
                  }
                  fin = finDate1.getFullYear()+"-"+mes2+"-"+dia2;
                }
                //alert('inicio: '+inicio+'\nfin: '+fin);
                ///Comienzo validación del rango elegido:
                if (añoFin < añoInicio) {
                  alert('ERROR. El año final NO puede ser anterior al año inicial. \nPor favor verifique.');
                  $("#añoInicio").focus();
                  validado = false;
                }
                else {
                  ///Mismo año:
                  if (añoInicio === añoFin){
                    ///Mismo año y mes final anterior al inicial:
                    if (mesFin < mesInicio) {
                      alert('ERROR. El mes final NO puede ser anterior que el mes inicial.\nPor favor verifique.');
                      $("#mesInicio").focus();
                      validado = false;
                    }
                    else {
                      ///Mismo año y mismo mes, poner solo del mes y año tal:
                      if (mesFin === mesInicio) {
                        mensajeFecha = "de "+meses[mesInicio]+" de "+añoInicio;
                      }
                      ///Mismo año, pero meses distintos, entonces poner entre tal mes y tal mes del año tal:
                      else {
                        mensajeFecha = "entre "+meses[mesInicio]+" y "+meses[mesFin]+" de "+añoInicio;
                      }
                    }
                  }
                  ///Año final es necesariamente mayor al inicial por lo cual NO IMPORTAN los meses. Pongo rango completo:
                  else {
                    mensajeFecha = "entre "+meses[mesInicio]+"/"+añoInicio+" y "+meses[mesFin]+"/"+añoFin;
                  }
                  ///Sólo agrego un IF para el caso en que sea de enero a diciembre cosa que aparezca solo del año tal:
                  if ((añoInicio === añoFin)&&(mesInicio === 1)&&(mesFin === 12)){
                    mensajeFecha = "de "+añoInicio;
                  }

                  rangoFecha = "(fecha >= '"+inicio + "') and (fecha <= '"+fin+"')";
                }    
                break;
    case "todos": var fin = tempAño+"-"+tempMonth+"-"+tempDia;
                  inicio = '2017-09-01';
                  rangoFecha = "(fecha >= '"+inicio + "') and (fecha <= '"+fin+"')";
                  mensajeFecha = "entre "+meses[09]+"/"+"2017"+" y "+meses[hoy.getUTCMonth()+1]+"/"+hoy.getFullYear();
                  break;
    default: break;
  }
  ////*************************************************************************************************************************************************////////
  var tipoConsulta = '';

  var query = "select productos.nombre_plastico, movimientos.cantidad, movimientos.tipo, fecha from productos inner join movimientos on productos.idprod=movimientos.producto where productos.estado='activo' ";
  //alert("rango: "+rangoFecha+"\nquery:"+query);
  var nombre = '';
  switch (radio) {
    case 'entidadMovimiento': if (entidadGrafica !== 'todos') {
                                query += "and entidad='"+entidadGrafica+"' ";
                                tipoConsulta = 'de '+entidadGrafica;
                                nombre = entidadGrafica;
                              } 
                              else {
                                tipoConsulta = 'de todas las entidades';
                                nombre = 'Todos';
                              }
                              
                              break;                       
    case 'productoMovimiento':  if ((idProd === 'NADA') || (nombreProducto === '')){
                                  alert('Debe seleccionar un producto. Por favor verifique.');
                                  document.getElementById("productoMovimiento").focus();
                                  validado = false;
                                  return false;
                                }
                                else {
                                  query += "and idProd="+idProd+' ';
                                }
                                tipoConsulta = 'del producto '+nombreSolo;
                                nombre = entProdGrafica+'---'+nombreSolo;
                                break;
    default: break;
  }

  if (validado) {
    if (criterioFecha !== 'todos'){
      query += "and "+rangoFecha;
    }
    var mensajeTipo = null;
    var tipo1 = '';
    if (tipo !== 'Todos') 
      {
      if (tipo === 'Clientes'){
        query += " and tipo!='AJUSTE Retiro' and tipo!='AJUSTE Ingreso'";
        tipo1 = 'Movimientos';
      }
      else if (tipo === 'Ajustes'){
        query += " and (tipo='AJUSTE Retiro' or tipo='AJUSTE Ingreso')";
        tipo1 = 'Ajustes';
      }
      else {
        query += " and tipo='"+tipo+"'";
        switch (tipo) {
          case "Retiro": tipo1 = "Retiros";
                                  break;
          case "Ingreso": tipo1 = "Ingresos";
                                  break;
          case "Renovación": tipo1 = "Renovaciones";
                                  break;
          case "Destrucción": tipo1 = "Destrucciones";
                                  break;
          case "AJUSTE Retiro": tipo1 = "AJUSTE Retiros";
                                  break;
          case "AJUSTE Ingreso": tipo1 = "AJUSTE Ingresos";
                                  break;  
          case "Ajustes": tipo1 = "Ajustes";
                          break;
          default: break;
        }
      }  
      mensajeTipo = tipo1+" ";
    }
    else {
      mensajeTipo = "Movimientos totales ";
    };

    query += " order by fecha asc, hora desc, entidad asc, nombre_plastico asc,  idprod";
    var mensajeConsulta = "";
    if (mensajeTipo !== null) {
      mensajeConsulta += mensajeTipo;
    }
    mensajeConsulta += tipoConsulta+" "+mensajeFecha;

    var url = "data/selectQuery.php";
    //alert(query);
    $.getJSON(url, {query: ""+query+""}).done(function(request){
      var totalDatos = parseInt(request.rows, 10);     
      if (totalDatos >= 1) {
        $("#consulta").val(query);
        $("#mensaje").val(mensajeConsulta);
        $("#fechaInicio").val(inicio);
        $("#fechaFin").val(fin);//alert('inicio: '+inicio+'\nfin: '+fin);
        $("#hacerGrafica").val("yes");
        $("#nombreGrafica").val(nombre);
        var parametros = '';
        switch (criterioFecha){
          case 'intervalo': parametros = '&d1='+diaInicio+'&d2='+diaFin+'';
                            break;
          case 'mes': parametros = '&m1='+mesInicio+'&a1='+añoInicio+'&m2='+mesFin+'&a2='+añoFin+''; 
                      break;
          case 'todos': break;
          default: break;  
        }
        var elegido = '';
        switch (radio){
          case 'entidadMovimiento': elegido = '&e='+entidadGrafica;
                                    break;
          case 'productoMovimiento': elegido = '&e='+idProd;
                                     break;
          default: break;
        }
        $('#graficar').attr('action', 'estadisticas.php?g=1&c='+criterioFecha+parametros+elegido+'&t='+tipo+'&h='+productoGrafica+'');
        $("#graficar").submit();
      }
      else {
        alert("No existen registros que coincidan con esos parámetros.");
      }
    }); 
  }  
}
/********** fin realizarGrafica() **********/

/**************************************************************************************************************************
/// ********************************************** FIN FUNCIONES ESTADISTICAS *********************************************
***************************************************************************************************************************
**/



/**
\brief Función que se ejecuta al cargar la página.
En la misma se ve primero desde que página se llamó, y en base a eso
se llama a la función correspondiente para cargar lo que corresponda (actividades, referencias, etc.)
Además, en la función también están los handlers para los distintos eventos jquery.
*/
function todo () {
  ///Levanto la url actual: 
  var urlActual = jQuery(location).attr('pathname');
  var parametros = jQuery(location).attr('search');
  var remplaza = /\+|%20/g;
  if (parametros) {
    //parametros = unescape(parametros);
    parametros = parametros.replace(remplaza, " ");
  }
  var res = urlActual.split("/");
  var tam = res.length;
  var dir = res[tam-1];
  ///Según en que url esté, es lo que se carga:
  switch (dir) {
    case "movimiento.php":  {
                            if (parametros) {
                              var temp = parametros.split('?');
                              var temp1 = temp[1].split('&');
                              var temp2 = temp1[0].split('=');
                              var temp3 = temp1[1].split('=');
                              var temp4 = temp1[2].split('=');
                              var temp5 = temp1[3].split('=');
                              var h = temp2[1]; 
                              var tipo = decodeURI(temp4[1]);
                              var fecha = decodeURI(temp5[1]);
                              var idprod = parseInt(temp3[1], 10);
                              setTimeout(function(){cargarMovimiento("#main-content", h, idprod, tipo, fecha)}, 100);                                          
                            }
                            else {
                              setTimeout(function(){cargarMovimiento("#main-content", "", "-1", "", "")}, 100);
                            }
                            break;    
                          }
    case "index.php": break;
                                    
    case "producto.php":  if (parametros){
                                          var temp = parametros.split('?');
                                          var temp1 = temp[1].split('=');
                                          var id = temp1[1];
                                          setTimeout(function(){cargarProducto(id, "#content")}, 100);
                                          setTimeout(function(){cargarBusquedaProductos("#selector")}, 100);                                          
                                          setTimeout(function(){habilitarProducto()}, 450);
                                          setTimeout(function(){$("#comentarios").focus()}, 460);
                                        }
                          else {
                            setTimeout(function(){cargarBusquedaProductos("#selector")}, 100);
                            setTimeout(function(){cargarProducto(0, "#content")}, 100);
                          }
                          break;                                                                      
    case "busquedas.php": {
                          if (parametros) {
                            var temp = parametros.split('?');
                            var temp1 = temp[1].split('&');
                            var temp2 = temp1[0].split('=');
                            var temp3 = temp1[1].split('=');
                            var temp4 = temp1[2].split('=');
                            var temp5 = temp1[3].split('=');
                            var temp6 = temp1[4].split('=');
                            var temp7 = temp1[5].split('=');
                            var temp8 = temp1[6].split('=');
                            var temp9 = temp1[7].split('=');
                            var temp10 = temp1[8].split('=');
                            var temp11 = temp1[9].split('=');
                            var temp12 = temp1[10].split('=');
                            var temp13 = temp1[11].split('=');
                            var temp14 = temp1[12].split('=');
                            var temp15 = temp1[13].split('=');

                            var hint = temp2[1];
                            var tipMov = temp3[1];
                            var zip = temp4[1];
                            var planilla = temp5[1];
                            var marcaAgua = temp6[1];
                            var id = temp7[1];
                            var ent = decodeURIComponent(temp8[1]);
                            var p = temp9[1];
                            var d1 = temp10[1];
                            var d2 = temp11[1];
                            var tipo = decodeURI(temp12[1]);
                            var user = temp13[1];
                            var estadoMov = temp14[1];
                            var mostrarEstado = temp15[1];
                            //alert('hint: '+hint+'\ntipoMov: '+tipMov+'\nids: '+id+'\nent: '+ent+'\nzip: '+zip+'\nplanilla: '+planilla+'\nmarcaAgua: '+marcaAgua+'\np: '+p+'\nd1: '+d1+'\nd2: '+d2+'\ntipo: '+tipo+'\nuser: '+user);
                            setTimeout(function(){cargarFormBusqueda("#fila", hint, tipMov, id, ent, zip, planilla, marcaAgua, p, d1, d2, tipo, user, estadoMov, mostrarEstado)}, 30); 
                          }
                          else {
                            setTimeout(function(){cargarFormBusqueda("#fila", '', '', '', '', '', '', '', '', '', '', '', '', '', '')}, 30);
                          }
                          break;
                          }
    case "estadisticas.php":  if (parametros) {
                                              var temp = parametros.split('?');
                                              var temp1 = temp[1].split('&');
                                              var tama = temp1.length;
                                              var hacerGrafica = '0';
                                              if (tama !== 1){
                                                var temp2 = temp1[0].split('=');
                                                hacerGrafica = temp2[1];
                                              }
 
                                             if (hacerGrafica ===  '1') {
                                                setTimeout(function(){cargarGrafica("#main-content")}, 100);
                                              }
                                              else {
                                                setTimeout(function(){cargarFormEstadisticas("#main-content")}, 100);
                                              }
                                            }
                              else {
                                setTimeout(function(){cargarFormEstadisticas("#main-content")}, 100);
                              }  
                              break;  
    case "editarMovimiento.php":  if (parametros) {
                                                  var temp = parametros.split('?');
                                                  var temp1 = temp[1].split('=');
                                                  var idmov = temp1[1];
                                                  setTimeout(function(){cargarEditarMovimiento(idmov, "#main-content")}, 30);
                                                }
                                  else {
                                      setTimeout(function(){cargarEditarMovimiento(-1, "#main-content")}, 1000);
                                    }  
                                  break;                                       
    default: break;
  }  

/*****************************************************************************************************************************
/// Comienzan las funciones que manejan los eventos relacionados al RESALTADO de los input.
******************************************************************************************************************************
*/
      
///Disparar funcion cuando algún elemento de la clase agrandar reciba el foco.
///Se usa para resaltar el elemento seleccionado.
$(document).on("focus", ".agrandar", function (){
  $(this).css("font-size", "1.35em");
  $(this).css("background-color", "#e7f128");
  $(this).css("font-weight", "bolder");
  $(this).css("color", "red");
  $(this).css("height", "100%");
  //$(this).css("max-width", "100%");
  //$(this).parent().prev().prev().children().prop("checked", true);
});
/********** fin on("focus", ".agrandar", function () **********/

///Disparar funcion cuando algún elemento de la clase agrandar pierda el foco.
///Se usa para volver al estado "normal" el elemento que dejó de estar seleccionado.
$(document).on("blur", ".agrandar", function (){
  $(this).css("font-size", "inherit");
  $(this).css("background-color", "#ffffff");
  $(this).css("font-weight", "inherit");
  $(this).css("color", "inherit");
});
/********** fin on("blur", ".agrandar", function () **********/

/*****************************************************************************************************************************
/// ***************************************************** FIN RESALTADO ******************************************************
******************************************************************************************************************************
*/



/*****************************************************************************************************************************
/// Comienzan las funciones que manejan los eventos relacionados a los MOVIMIENTOS como ser creación, edición y eliminación.
******************************************************************************************************************************
*/


///Disparar funcion al cambiar el elemento elegido en el select con las sugerencias para los productos.
///Cambia el color de fondo para resaltarlo, carga un snapshot del plástico si está disponible, y muestra
///el stock actual.
$(document).on("change focusin", "#hint", function (){
  //verificarSesion('', 's');
  var rutaFoto = 'images/snapshots/';
  var nombreFoto = $(this).find('option:selected').attr("name");
 
  var prod = $(this).find('option:selected').val();
  $(this).css('background-color', '#ffffff');
  //$(this).find('option:selected').css('background-color', '#ffffff');
  //
  /// Selecciono radio button correspondiente:
  $(this).parent().prev().prev().children().prop("checked", true);
  
  ///*********** PRUEBAS PROMEDIO CONSUMOS **************************************
  ///Variables para el cálculo del promedio:
  /// periodoDias: cantidad de días pasados sobre los cuales calcular el promedio.
  /// msegUnDia: es una constante en realidad que representa la cantidad de mseg que hay en un día.
  var periodoDias1 = 45;
  var mesesPeriodo1 = Math.ceil(periodoDias1/30);
  
  var periodoDias2 = 90;
  var mesesPeriodo2 = Math.ceil(periodoDias2/30);
  
  var msegUnDia = 1000*60*60*24;
   
  ///Recupero día actual y posteriormente, genero fecha de hoy a las 00:00hs:
  var hoyCompleto = new Date();
  var hoy = new Date(hoyCompleto.getFullYear(), hoyCompleto.getMonth(), hoyCompleto.getDate(), 0, 0, 0, 0);
  ///Paso el dia actual a las 00:00 a hora Unix:
  var ahoraMseg = hoy.getTime();
  
  /// Calculo cual es el día de origen para calcular el promedio segúna la hora Unix:
  var inicioMseg1 = ahoraMseg - periodoDias1*msegUnDia;
  var inicioMseg2 = ahoraMseg - periodoDias2*msegUnDia;
  
  /// Genero el día según los mseg:
  var diaInicio1 = new Date(inicioMseg1);
  var diaInicio2 = new Date(inicioMseg2);
  /// Como forma de asegurarme que quede desde las 00:00, extraigo los valores del día/mes/año y genero un nuevo día explicitando que sea a las 00:00hs:
  var dia1 = diaInicio1.getDate();
  var dia2 = diaInicio2.getDate();
  var mes1 = parseInt(diaInicio1.getMonth(), 10) + 1;
  var mes2 = parseInt(diaInicio2.getMonth(), 10) + 1;
  var año1 = diaInicio1.getFullYear();
  var año2 = diaInicio2.getFullYear();
  if (dia1 < 10) 
    {
    dia1 = '0'+dia1;
  }                     
  if (mes1 < 10) 
    {
    mes1 = '0'+mes1;
  }
  var nuevoDia1 = año1+'-'+mes1+'-'+dia1;
  if (dia2 < 10) 
    {
    dia2 = '0'+dia2;
  }                     
  if (mes2 < 10) 
    {
    mes2 = '0'+mes2;
  }
  var nuevoDia2 = año2+'-'+mes2+'-'+dia2;
  
  var query1 = "select sum(cantidad) as total1 from movimientos where producto="+prod+" and fecha>='"+nuevoDia1+"' and  (tipo='Retiro' or tipo='Destrucción' or tipo='Renovación')";
  var query2 = "select sum(cantidad) as total2 from movimientos where producto="+prod+" and fecha>='"+nuevoDia2+"' and  (tipo='Retiro' or tipo='Destrucción' or tipo='Renovación')";
  
  var url = "data/selectQuery.php";
  $.getJSON(url, {query: ""+query1+""}).done(function(request1) {
    var totalConsumos1 = request1.resultado[0]['total1'];
    if (totalConsumos1 === null){
      totalConsumos1 = 0;
    }
    else {
        totalConsumos1 = parseInt(totalConsumos1, 10);
      }
    var promedioMensual1 = Math.ceil(totalConsumos1/mesesPeriodo1);
    var unidades1 = '';
    var unidadesPromedio1 = '';
    if (promedioMensual1 === 1){
      unidadesPromedio1 = 'tarjeta/mes';
    }
    else {
      unidadesPromedio1 = 'tarjetas/mes';
    }
    if (totalConsumos1 === 1){
      unidades1 = 'tarjeta';
    }
    else {
      unidades1 = 'tarjetas';
    }
    
    $.getJSON(url, {query: ""+query2+""}).done(function(request2) {
      if (parseInt($("#stock").length, 10) > 0){
        $("#stock").remove();
      }
      if (parseInt($("#promedio1").length, 10) > 0){
        $("#promedio1").remove();
      }
      if (parseInt($("#promedio2").length, 10) > 0){
        $("#promedio2").remove();
      }
      if (parseInt($("#snapshot").length, 10) > 0){
        $("#snapshot").remove();
      }
      if (parseInt($("#ultimoMov").length, 10) > 0){
        $("#ultimoMov").remove();
      }
      if (parseInt($("#comentHint").length, 10) > 0){
        $("#comentHint").remove();
      }
      if (parseInt($(".popover").length, 10) > 0){
        $(".popover").remove();
      }
      var totalConsumos2 = request2.resultado[0]['total2'];
      if (totalConsumos2 === null){
        totalConsumos2 = 0;
      }
      else {
        totalConsumos2 = parseInt(totalConsumos2, 10);
      }
      var promedioMensual2 = Math.ceil(totalConsumos2/mesesPeriodo2);
      var unidades2 = '';
      var unidadesPromedio2 = '';
      if (promedioMensual2 === 1){
        unidadesPromedio2 = 'tarjeta/mes';
      }
      else {
        unidadesPromedio2 = 'tarjetas/mes';
      }
      if (totalConsumos2 === 1){
        unidades2 = 'tarjeta';
      }
      else {
        unidades2 = 'tarjetas';
      }
    
      var stock = $("#hint").find('option:selected').attr("stock");
      var comentarios = $("#hint").find('option:selected').attr("comentarios");
      var alarma1 = $("#hint").find('option:selected').attr("alarma1");
      alarma1 = parseInt(alarma1, 10);
      var alarma2 = $("#hint").find('option:selected').attr("alarma2");
      alarma2 = parseInt(alarma2, 10);
      var ultimoMovimiento = $("#hint").find('option:selected').attr("ultimomov");
      if ((ultimoMovimiento === 'undefined') || (ultimoMovimiento === null)||(ultimoMovimiento === "null")||(ultimoMovimiento === "")){
        ultimoMovimiento = 'NO HAY';
      }
      if ((stock === 'undefined') || ($(this).find('option:selected').val() === 'NADA')) {
        stock = '';
      }
      else {
        stock = parseInt(stock, 10);
      }
      var resaltado = '';
      if ((stock < alarma1) && (stock > alarma2)){
        resaltado = 'alarma1';
      }
      else {
        if (stock < alarma2) {
          resaltado = 'alarma2';
        }
        else {
          resaltado = 'resaltado';
        }  
      }

      var mostrar = '<p id="stock" name="hint" style="padding-top: 10px"><strong>Stock actual: </strong><font class="'+resaltado+'" style="font-size:3.0em; font-style:italic;">'+stock.toLocaleString()+'</font></p>';
      var dire = rutaFoto+nombreFoto;
      if (existeUrl(dire)){
        mostrar += '<img id="snapshot" name="hint" src="'+rutaFoto+nombreFoto+'" alt="No se cargó la foto aún." height="127" width="200"></img>';
      }
      mostrar += '<p id="promedio1" name="hint" style="padding-top: 1px;margin-bottom: 0px"><strong>Total Consumos (&uacute;lt. '+periodoDias1+' d&iacute;as):</strong> <font style="font-size:1.2em; font-style:italic;">'+totalConsumos1.toLocaleString()+' '+unidades1+' ('+promedioMensual1.toLocaleString()+' '+unidadesPromedio1+')</font></p>';
      mostrar += '<p id="promedio2" name="hint" style="padding-top: 1px"><strong>Total Consumos (&uacute;lt. '+periodoDias2+' d&iacute;as):</strong> <font style="font-size:1.2em; font-style:italic;">'+totalConsumos2.toLocaleString()+' '+unidades2+' ('+promedioMensual2.toLocaleString()+' '+unidadesPromedio2+')</font></p>';
      mostrar += '<p id="ultimoMov" name="ulitmoMov"><strong>Último Movimiento: <font style="font-style:italic;font-size:1.8em">'+ultimoMovimiento+'</font></strong></p>';
      var comentHint = '';
      if ((comentarios !== '')&&(comentarios !== "null")&&(comentarios !== ' ')&&(comentarios !== undefined)){
        /// Resaltado en AMARILLO del comentario que tiene el patrón: DIF
        if (comentarios.indexOf("dif") > -1){
          comentHint = "comentHintResaltar";
        }
        else {
          /// Resaltado en VERDE del comentario que tiene el patrón: STOCK
          if (comentarios.indexOf("stock") > -1){
            comentHint = "comentHintStock";
          }
          else {
            /// Resaltado en ROJO SUAVE del comentario que tiene el patrón: PLASTICO con o sin tilde
            if ((comentarios.indexOf("plastico") > -1)||((comentarios.indexOf("plástico") > -1))){
              comentHint = "comentHintPlastico";
            }
            else {
              /// Resaltado general en caso de tener un comentario que no cumpla con ninguno de los patrones anteriores
              comentHint = "comentHint";
            }
          }
        } 
      mostrar += '<p id="comentHint" name="comentHint" class="'+comentHint+'"><a href="producto.php?id='+prod+'" target="_blank">'+comentarios+'</a></p>';  
      }  

      //$(this).css('background-color', '#efe473');
      $(this).css('background-color', '#9db7ef');
      //$(this).find('option:selected').css('background-color', '#79ea52');
      $("#hint").after(mostrar);
      $(this).parent().prev().prev().children().prop("checked", true);
      setTimeout(function(){mostrarHistorial(prod)}, 10);
      //mostrarHistorial(prod);   
    });  
  });    
  
  //  alert(consulta);
  ///*********** FIN PRUEBAS PROMEDIO CONSUMOS **********************************
});
/********** fin on("change focusin", "#hint", function () **********/ 
  
/// ****** COMENTO EVENTO CLICK POR SER REDUNDANTE CON EL CHANGE ***************************  
/////Disparar función al hacer CLICK en alguna de las option del select #hint.
//$(document).on("click", "#hint", function (){
//  $("#historial").remove();
//  var prod = $(this).val();
//  if (parseInt($("#historial").length, 10) > 0){
//    $("#historial").remove();
//  }
//  setTimeout(function(){mostrarHistorial(prod)}, 200);       
//});
/// **************************** FIN EVENTO CLICK ******************************************* 
  
///Disparar función al hacer ENTER sobre alguna de las OPTION del select HINT.
///Básicamente, la idea es que al presionar ENTER, se ejecute la opción por defecto cosa de ahorrar tiempo.  
///En el caso de ser llamado desde MOVIMIENTOS, pasa al foco al campo CANTIDAD. Mientras que en el caso de BUSQUEDAS hace el SUBMIT.
///Además, si la tecla presionada es el TAB, se pasa el foco al siguiente elemento.
$(document).on("keydown", "#hint", function (e){
  var keyCode = e.keyCode || e.which;
  var temp = "#"+$(this).prev().attr("id");
  
  switch (temp) {
    case "#producto": var sel = $(this).find('option:selected').val();
                      var productos = new Array();
                      $('option:selected',this).each(function() {
                        productos.push($(this).val());
                      });
                      var totalProductos = productos.length;
                      if (totalProductos > 1){
                        alert("Los movimientos hay que agregarlos por cada producto. Por favor verifique.");
                      }
                      else {
                        if ((sel !== 'NADA') && ((keyCode === 1) || (keyCode === 13) || (keyCode === 9))) {
                          e.preventDefault();
                          //$("#comentarios").focus();
                          $("#cantidad").focus();
                        }
                      }
                      break;
    case "#productoStock":  var productosStock = new Array();
                            $('option:selected',this).each(function() {
                              productosStock.push($(this).val());
                            });
                            var totalProductosStock = productosStock.length;
                            var seguir = true;  
                            for (var i in productosStock) {
                              if (productosStock[i] === 'NADA'){
                                seguir = false;
                              }
                            }
                            if (e.which === 13){
                              if (seguir){
                                if (totalProductosStock > limiteSeleccion){
                                  alert("Se superó el máximo de "+limiteSeleccion+" opciones elegidas. Por favor verifique.");
                                }
                                else {
                                  realizarBusqueda();
                                }
                              }
                              else {
                                alert('--Seleccionar-- NO debe de estar marcado. Por favor verifique.');
                              }
                            }
                            if (keyCode == 9) {
                              e.preventDefault();    
                              $("#entidadMovimiento").focus();
                            }
                            break;
    case "#productoMovimiento": var productosMovimiento = new Array();
                                $('option:selected',this).each(function() {
                                  productosMovimiento.push($(this).val());
                                });
                                var totalProductosMovimiento = productosMovimiento.length;
                                var seguir = true;
                                //alert(entidadesStock);  
                                for (var i in productosMovimiento) {
                                  if (productosMovimiento[i] === 'NADA'){
                                    seguir = false;
                                  }
                                }
                                if (e.which === 13){
                                  if (seguir){
                                    if (totalProductosMovimiento > limiteSeleccion){
                                      alert("Se superó el máximo de "+limiteSeleccion+" opciones elegidas. Por favor verifique.");
                                    }
                                    else {
                                      realizarBusqueda();
                                    }
                                  }
                                  else {
                                    alert('--Seleccionar-- NO debe de estar marcado. Por favor verifique.');
                                  }
                                }   
                                if (keyCode == 9) {
                                  e.preventDefault();    
                                  $("#inicio").focus();
                                }
                                break;
    case "#productoGrafica":  var sel = $("#hint").find('option:selected').val(); 
                              if (((keyCode === 1) || (keyCode === 13))){
                                if (sel !== 'NADA') {
                                  realizarGrafica();
                                }
                                else {
                                  alert('Se debe elegir un producto del cual consultar las estadísticas. Por favor verifique.');
                                  $("#hint").focus();
                                }
                              }
                              if (keyCode == 9) {
                                e.preventDefault();    
                                $("#diaInicio").focus();
                              }
                              break;                            
    default: break;
  }  
}); 
/********** fin on("keydown", "#hint", function (e) **********/

///Disparar funcion al hacer clic en el botón para agregar el movimiento.
$(document).on("click", "#agregarMovimiento", function (){
  //verificarSesion('', 's');
  var seguir = true;
  seguir = validarMovimiento();
  if (seguir) {
    agregarMovimiento(false);
  }
});
/********** fin on("click", "#agregarMovimiento", function () **********/

///Disparar función al hacer enter estando en el elemento Cantidad.
///Básicamente, la idea es hacer "el submit" cosa de ahorrar tiempo en el ingreso.
$(document).on("keypress", "#cantidad", function(e) {
  if(e.which === 13) {
    var seguir = true;
    seguir = validarMovimiento();
    if (seguir) {
      agregarMovimiento(false);
    }
  }  
});
/********** fin on("keypress", "#cantidad", function(e) **********/

///Disparar función al hacer click en el botón de EDITAR del form para los movimientos.
///Cambia entre habilitar o deshabilitar los input del form cosa de poder hacer la edición del movimiento.
$(document).on("click", "#editarMovimiento", function (){
  var nombre = $(this).val();
  if (nombre === 'EDITAR') {
    habilitarMovimiento();
  }
  else {
    inhabilitarMovimiento();
  }
});
/********** fin on("click", "#editarMovimiento", function () **********/

///Dispara función para realizar los cambios con las modificaciones para el movimiento.
$(document).on("click", "#actualizarMovimiento", function (){
  /* *** Por ahora se comentan los otros campos pues solo se puede editar el comentario: ******
  var fecha = $("#fecha").val();
  var nombre = $("#nombre").val();
  var hora = $("#hora").val();
  var tipo = $("#tipo").val();
  var cantidad = $("#cantidad").val();
  */
  actualizarMovimiento(false);
});
/********** fin on("click", "#actualizarMovimiento", function () **********/

///Disparar función al hacer enter estando en el elemento Comentarios.
///Básicamente, la idea es hacer "el submit" cosa de ahorrar tiempo en la actualización del comentario.
///En el caso en que me encuentre en el form de movimientos, debe pasar al campo CANTIDAD en lugar del hacer el submit.
$(document).on("keypress", "#comentarios", function(e) {
  var commentName = $(this).attr("name");

  switch (commentName) {
    case "comMov":  if(e.which === 13) {
                      $("#cantidad").focus();
                    }                   
                    break;
    case "comEditMov":  if(e.which === 13) {
                          actualizarMovimiento(false);
                        }
                        break;
    case "comProd": if(e.which === 13) {
                      
                    }  
                    break;
    default: break;
  }  
});
/********** fin on("keypress", "#comentarios", function(e) **********/

///Disparar función al hacer enter estando en el elemento Producto.
///Básicamente, la idea es pasar el foco al select hint cosa de ahorrar tiempo en el ingreso.
$(document).on("keypress", "#producto", function(e) {
  if(e.which === 13) {
    //alert('enter');
    $("#hint").focus();
  }  
});
/********** fin on("keypress", "#producto", function(e) **********/

/*****************************************************************************************************************************
/// ***************************************************** FIN MOVIMIENTOS ****************************************************
******************************************************************************************************************************
*/



/*****************************************************************************************************************************
/// Comienzan las funciones que manejan los eventos relacionados a las PRODUCTOS como ser creación, edición y eliminación.
******************************************************************************************************************************
*/

///Disparar funcion al cambiar el elemento elegido en el select con las sugerencias para los productos.
///Cambia el color de fondo para resaltarlo, carga un snapshot del plástico si está disponible, y muestra
///el stock actual.
$(document).on("change focusin", "#hintProd", function (){
  $("#hintProd").css('background-color', '#9db7ef');
  var rutaFoto = 'images/snapshots/';
  var nombreFoto = $(this).find('option:selected').attr("name");
  $(this).css('background-color', '#ffffff');
  
  $("#snapshot").remove();
  $("#stock").remove();
  $("#promedio1").remove();
  $("#promedio2").remove();
  $("#ultimoMov").remove();
  $("#historial").remove();
  $("#stock").removeClass('alarma1');
  $("#stock").removeClass('alarma2');
  $("#stock").removeClass('resaltado');
  
  var idProd = $(this).find('option:selected').val();
  var stock = $("#hintProd").find('option:selected').attr("stock");
  var alarma1 = $("#hintProd").find('option:selected').attr("alarma1");
  alarma1 = parseInt(alarma1, 10);
  var alarma2 = $("#hintProd").find('option:selected').attr("alarma2");
  alarma2 = parseInt(alarma2, 10);
  var ultimoMovimiento = $("#hintProd").find('option:selected').attr("ultimomov");
  if ((ultimoMovimiento === undefined) || (ultimoMovimiento === null)||(ultimoMovimiento === "null")){
    ultimoMovimiento = 'NO HAY';
  }
  if ((stock === 'undefined') || ($(this).find('option:selected').val() === 'NADA')) {
    stock = '';
  }
  else {
    stock = parseInt(stock, 10);
  }
  var resaltado = '';
  if ((stock < alarma1) && (stock > alarma2)){
    resaltado = 'alarma1';
  }
  else {
    if (stock < alarma2) {
      resaltado = 'alarma2';
    }
    else {
      resaltado = 'resaltado';
    }  
  }

  var mostrar = '';
  var dire = rutaFoto+nombreFoto;
  if (existeUrl(dire)){
    mostrar += '<img id="snapshot" name="hintProd" src="'+dire+'" alt="No se cargó la foto aún." height="127" width="200"></img>';
  }

  mostrar += '<p id="stock" name="hintProd" style="padding-top: 10px"><strong>Stock actual: </strong><font class="'+resaltado+'" style="font-size:2.6em;font-style:italic;">'+stock.toLocaleString()+'</font></p>';
  mostrar += '<p id="ultimoMov" name="hintProd"><strong>Último Movimiento: <font style="font-size:1.1em;font-style:italic;">'+ultimoMovimiento+'</font></strong></p>';
  $(this).css('background-color', '#9db7ef');
  $("#hintProd").after(mostrar);
  if (idProd !== 'NADA') {
    cargarProducto(idProd, "#content");
  }
  else {
    $("#entidad").val('');
    $("#nombre").val('');
    $("#codigo_emsa").val('');
    $("#codigo_origen").val('');
    $("#contacto").val('');
    $("#nombreFoto").val('');
    $("#bin").val(''); 
    $("#stockProducto").val('');
    $("#alarma1").val('');
    $("#alarma2").val('');
    $("#ultimoMovimiento").val('');
    $("#comentarios").val('');
    $("#stock").remove();
    $("#ultimoMov").remove();
    $("#stockProducto").removeClass('alarma1');
    $("#stockProducto").removeClass('alarma2');
    $("#stockProducto").removeClass('resaltado');
  }
});
/********** fin on("change focusin", "#hintProd", function () **********/

///Disparar función al hacer CLICK con el mouse sobre alguna de las OPTION del select HINTPROD ó al darle ENTER sobre los mismos. 
///Básicamente, la idea es que al presionar ENTER o al hacer CLICK, se pase automáticamente al elemento Cantidad cosa de ahorrar tiempo.  
///Además, al hacer click en alguna de las opciones del select se minimiza (por ahora comentado).
/// Por ahora se comenta pues quizás es mejor que quede abierto:
///
///NOTA: POR AHORA SE QUITÓ el evento CLICK. Ver bien si sirve o NO.
$(document).on("keypress", "#hintProd", function (e){ 
  //close dropdown
  //alert('en el evento:'+e.which);
  //$("#hint").attr('size',0);
  if (($("#hintProd").find('option:selected').val() !== 'NADA') && ((e.which === 1) ||(e.which === 13))) {
    //$("#editarProducto").focus();
    habilitarProducto();
    $("#entidad").focus();
  }  
}); 
/********** fin on("keypress", "#hintProd", function (e) **********/

///Disparar función al hacer enter estando en el elemento productoBusqueda.
///Esto hace que se pase el foco al select hintProd para ahorrar tiempo.
$(document).on("keypress", "#productoBusqueda", function(e) {
  if(e.which === 13) {
    $("#hintProd").focus();
  }  
});
/********** fin on("keypress", "#productoBusqueda", function(e) **********/

///Dispara función para realizar los cambios con las modificaciones para el producto (luego de validar los datos obviamente).
$(document).on("click", "#actualizarProducto", function (){
    verificarSesion('', 's');
    var entidad = $("#entidad").val();
    var nombre = $("#nombre").val();
    var alarma1 = $("#alarma1").val();
    var alarma2 = $("#alarma2").val();
    var codigo_emsa = $("#codigo_emsa").val();
    var contacto = $("#contacto").val();
    var nombreFoto = $("#nombreFoto").val();
    var codigo_origen = $("#codigo_origen").val();
    /*var idProducto = $("#hintProd").val();*/
    var idProducto = $("#idprod").val();
    var comentarios = $("#comentarios").val();
    var bin = $("#bin").val();
    var stock = $("#stockProducto").val();

    if ((idProducto === 'NADA')) {
      alert('Se debe seleccionar un producto para poder actualizar. Por favor verifique.');
      $("#producto").focus();
    }
    else {
      var validar = validarProducto(false);
      if (validar) {
        /*
        var entero = validarEntero(alarma1);
        if (entero) {
          alarma1 = parseInt(alarma1, 10);
          if (alarma1 < 0) {
            alert('El valor para la alarma1 del producto debe ser un entero mayor o igual a 0. Por favor verifique.');
            $("#alarma1").val('');
            $("#alarma1").focus();
            return false;
          }
        }
        else {
          alert('El valor para la alarma1 del producto debe ser un entero. Por favor verifique.');
          $("#alarma1").val('');
          $("#alarma1").focus();
          return false;
        }
        var entero1 = validarEntero(alarma2);
        if (entero1) {
          alarma2 = parseInt(alarma2, 10);
          if (alarma2 < 0) {
            alert('El valor para la alarma2 del producto debe ser un entero mayor o igual a 0. Por favor verifique.');
            $("#alarma2").val('');
            $("#alarma2").focus();
            return false;
          }
        }
        else {
          alert('El valor para la alarma2 del producto debe ser un entero. Por favor verifique.');
          $("#alarma2").val('');
          $("#alarma2").focus();
          return false;
        }
        */
        ///Por ahora se anula el pedido de confirmación y se hace el update igual a pedido de Diego:
        //var confirmar = confirm('¿Confirma la modificación del producto con los siguientes datos?\n\nEntidad: '+entidad+'\nNombre: '+nombre+'\nCódigo Emsa: '+codigo_emsa+'\nCódigo Origen: '+codigo_origen+'\nContacto: '+contacto+'\nSnapshot: '+nombreFoto+'\nBin: '+bin+'\nAlarma1: '+alarma1+'\nAlarma2: '+alarma2+'\nComentarios: '+comentarios+"\n?");
        var confirmar = true;
        if (confirmar) {
          var url = "data/updateQuery.php";
          var query = "update productos set nombre_plastico= '"+nombre+"', entidad = '"+entidad+"', codigo_emsa = '"+codigo_emsa+"', codigo_origen = '"+codigo_origen+"', contacto = '"+contacto+"', snapshot = '"+nombreFoto+"', bin = '"+bin+"', alarma1 = "+alarma1+", alarma2 = "+alarma2+", comentarios = '"+comentarios+"' where idprod = "+idProducto;
          var log = "SI";
          var jsonQuery = JSON.stringify(query);
          //alert(query);
          $.getJSON(url, {query: ""+jsonQuery+"", log: log}).done(function(request) {
            var resultado = request["resultado"];
            if (resultado === "OK") {
              //alert('Los datos del producto se actualizaron correctamente!.');
              //showHintProd($("#producto").val(), "#producto", idProducto);
              //$("#hintProd option[value='"+idProducto+"']").attr("selected","selected");
              $("#stockProducto").removeClass('alarma1');
              $("#stockProducto").removeClass('alarma2');
              $("#stockProducto").removeClass('resaltado');
              if ((stock < alarma1) && (stock > alarma2)) {
                $("#stockProducto").addClass('alarma1');
              }
              else {
                if (stock < alarma2) {
                  $("#stockProducto").addClass('alarma2');
                }
                else {
                  $("#stockProducto").addClass('resaltado');
                }
              }
              var productoBusqueda = $("#productoBusqueda").val();
              if (productoBusqueda !== ''){
                var elegido = $("#hintProd").find('option:selected').val();
                showHintProd(productoBusqueda, "#productoBusqueda", elegido);
              }
              else {
                productoBusqueda = nombre;
                showHintProd(productoBusqueda, "#productoBusqueda", idProducto);
              }
              inhabilitarProducto();
              $("#productoBusqueda").focus();
            }
            else {
              alert('Hubo un problema en la actualización. Por favor verifique.');
            }
          });
      }
        else {
        alert('Se optó por no actualizar el producto!.');
      }
      }
    }
  //}
});
/********** fin on("click", "#actualizarProducto", function () **********/

///Disparar función al hacer enter estando en alguno de los input de la edición del Producto
///Esto hace que se pase el foco al siguiente input del form para ahorrar tiempo.
$(document).on("keypress", "#productUpdate input", function(e) {
  //alert($(this).attr("name"));
  if (e.which === 13) { 
    var tabindex = $(this).attr('tabindex');
    tabindex++;
    $('[tabindex=' + tabindex + ']').focus();
  }
});
/********** fin on("keypress", "#productUpdate input", function(e) **********/

///Dispara función que da de baja el producto. NO lo borra, sino que le cambia su estado a INACTIVO.
$(document).on("click", "#eliminarProducto", function (){
  verificarSesion('', 's');
  var nombre = $("#nombre").val();
  var idProducto = $("#hintProd").val();

  if ((idProducto === 'NADA')||(parseInt($("#hintProd").length, 10) === 0)) {
    alert('Se debe seleccionar un producto para poder eliminar. Por favor verifique.');
    $("#producto").focus();
  }
  else {
    var confirmar = confirm('¿Seguro que desea dar de baja el producto: \n\n'+nombre+" ?");
    if (confirmar) {
      var url = "data/updateQuery.php";
      var query = "update productos set estado = 'inactivo' where idprod = "+idProducto;
      var log = "SI";
      var jsonQuery = JSON.stringify(query);
      
      $.getJSON(url, {query: ""+jsonQuery+"", log: log}).done(function(request) {
        var resultado = request["resultado"];
        if (resultado === "OK") {
          alert('El producto '+nombre+' se dió de baja correctamente!.');
          $("#entidad").val('');
          $("#nombre").val('');
          $("#codigo_emsa").val('');
          $("#codigo_origen").val('');
          $("#stockProducto").val('');
          $("#comentarios").val('');
          $("#alarma1").val('');
          $("#alarma2").val('');
          $("#ultimoMovimiento").val('');
          $("#bin").val('');
          
          var productoBusqueda = $("#productoBusqueda").val();
          showHintProd(productoBusqueda, "#productoBusqueda", -1);     
        }
        else {
          alert('Hubo un problema en la eliminación. Por favor verifique.');
        }
      });
    }
    else {
      alert('Se optó por NO dar de baja el producto: \n\n'+nombre);
    }
  }
  
});
/********** fin on("keypress", "#productUpdate input", function(e) **********/

///Disparar función al hacer click en el botón de EDITAR del form para los productos.
///Cambia entre habilitar o deshabilitar los input del form cosa de poder hacer la edición del producto.
$(document).on("click", "#editarProducto", function (){
    verificarSesion('', 's');
    var nombre = $(this).val();
    if (nombre === 'EDITAR') {
      habilitarProducto();
    }
    else {
      inhabilitarProducto();
    }
});
/********** fin on("click", "#editarProducto", function () **********/

///Disparar función al hacer click en el botón AGREGAR (o NUEVO) del form productos.
///Según si dice NUEVO o AGREGAR, vacío el form para poder agregar los datos o envío los datos para agregarlo a la base de datos.
$(document).on("click", "#agregarProducto", function (){
  verificarSesion('', 's');
  var accion = $("#agregarProducto").val();
  if (accion === "NUEVO") {
    $("#agregarProducto").val("AGREGAR");
    $("#entidad").val('');
    $("#nombre").val('');
    $("#codigo_emsa").val('');
    $("#codigo_origen").val('');
    $("#fechaCreacion").val('');
    $("#contacto").val('');
    $("#nombreFoto").val('');
    $("#stockProducto").val(0);
    $("#comentarios").val('');
    $("#alarma1").val('');
    $("#alarma2").val('');
    $("#ultimoMovimiento").val('');
    $("#bin").val(''); 
    $("#productoBusqueda").val('');
    $("#producto").val('');
    $("#producto").attr("disabled", true);
    $("#hintProd").remove();
    $("#snapshot").remove();
    $("#stock").remove();
    $("#promedio1").remove();
    $("#promedio2").remove();
    $("#ultimoMov").remove();
    habilitarProducto();
    $("#stockProducto").attr("disabled", true);
    $("#editarProducto").attr("disabled", true);
    $("#actualizarProducto").attr("disabled", true);
    $("#eliminarProducto").attr("disabled", true);
    $("#entidad").focus();
  }
  else {
    var validar = validarProducto(true);
    if (validar) {
      var entidad = $("#entidad").val();
      var nombre = $("#nombre").val();
      var codigo_emsa = $("#codigo_emsa").val();
      var codigo_origen = $("#codigo_origen").val();
      var contacto = $("#contacto").val();
      ///Se comenta la recuperación del valor de stock inicial dado que, para que figure en los reportes, 
      ///el stock inicial SIEMPRE se pone como 0 cosa de forzar el ingreso inicial - 07/03/2019.
      //var stock = parseInt($("#stockProducto").val(), 10);
      var stock = 0;
      var alarma1 = parseInt($("#alarma1").val(), 10);
      var alarma2 = parseInt($("#alarma2").val(), 10);
      var nombreFoto = $("#nombreFoto").val();
       
      var comentarios = $("#comentarios").val();
      var bin = $("#bin").val();
      var fechaMseg = Date.now();
      var fechaTemp = new Date(fechaMseg);
      var mesActual = parseInt(fechaTemp.getMonth(), 10) + 1;
      var dia = parseInt(fechaTemp.getDate(), 10);
      if (mesActual < 10){
        mesActual = "0"+mesActual;
      }
      if (dia < 10){
        dia = "0"+dia;
      }
      var fechaCreacion = fechaTemp.getFullYear()+'-'+mesActual+'-'+dia;
      
      var url = "data/updateQuery.php";
      var query = "insert into productos (entidad, nombre_plastico, codigo_emsa, codigo_origen, contacto, snapshot, stock, bin, comentarios, alarma1, alarma2, estado, fechaCreacion) values ('"+entidad+"', '"+nombre+"', '"+codigo_emsa+"', '"+codigo_origen+"', '"+contacto+"', '"+nombreFoto+"', "+stock+", '"+bin+"', '"+comentarios+"', "+alarma1+", "+alarma2+", 'activo', '"+fechaCreacion+"')";
      var log = "SI";
      var jsonQuery = JSON.stringify(query);
      
      var confirmar = confirm("¿Confirma que desea agregar el producto con los siguientes datos: \n\nEntidad: "+entidad+"\nNombre: "+nombre+"\nCódigo Emsa: "+codigo_emsa+"\nCódigo Origen: "+codigo_origen+"\nContacto: "+contacto+"\nSnapshot: "+nombreFoto+"\nBin: "+bin+"\nStock Inicial: "+stock+"\nAlarma1: "+alarma1+"\nAlarma2: "+alarma2+"\nComentarios: "+comentarios+"\n?");
      if (confirmar) {
        $.getJSON(url, {query: ""+jsonQuery+"", log: log}).done(function(request){
          var resultado = request["resultado"];
          if (resultado === "OK") {
            alert('El producto se ingresó correctamente!.');
            inhabilitarProducto();
            $("#editarProducto").attr("disabled", true);
            $("#eliminarProducto").attr("disabled", true);
            $("#agregarProducto").val("NUEVO");
            $("#producto").attr("disabled", false);
          }
          else {
            alert('Hubo un problema en el ingreso del producto. Por favor verifique.');
          }
        });
      }
      else {
        alert('Se optó por no agregar el producto.');
        $("#entidad").val('');
        $("#nombre").val('');
        $("#bin").val(''); 
        $("#codigo_emsa").val('');
        $("#codigo_origen").val('');
        $("#contacto").val('');
        $("#stockProducto").val('');
        $("#alarma1").val('');
        $("#alarma2").val('');
        $("#comentarios").val('');
      }
    }  
  }   
});
/********** fin on("click", "#agregarProducto", function () **********/

/*****************************************************************************************************************************
/// ***************************************************** FIN PRODUCTOS ******************************************************
******************************************************************************************************************************
*/



/*****************************************************************************************************************************
/// Comienzan las funciones que manejan los eventos relacionados a los USUARIOS como ser creación, edición y eliminación.
******************************************************************************************************************************
*/

///Disparar funcion al hacer click en el botón eliminar.
///Esto hace que el registro correspondiente al usuario pase a estado de inactivo.
///Además, se "limpia" el form del div #selector quitando el usuario eliminado.
$(document).on("click", "#eliminarUsuario", function () {
  var pregunta = confirm('Está a punto de eliminar el registro. ¿Desea continuar?');
  if (pregunta) {
    var url = "data/selectQuery.php";
    var user = document.getElementById("iduser").value;
    var query = "select idusuarios as iduser from usuarios where estado='activo' order by empresa asc, apellido asc, idusuarios asc";
    
    $.getJSON(url, {query: ""+query+""}).done(function(request) {
      var idks = request["resultado"];
      var total = request["rows"];
      var ids = new Array();
      for (var index in idks) {
        ids.push(idks[index]["iduser"]);
      }
      
      var indiceActual = ids.indexOf(user);//alert(indiceActual);
      var user1 = 0;
      
      if (total === 1)  {//alert('total = 1. Este es el último');
        var volver = '<br><a href="index.php">Volver</a>';
        var texto = '<h2>Ya NO quedan usuarios!.</h2>';
        texto += volver;
        vaciarContent("#main-content");
        $("#main-content").html(texto);
      }
      else {
        if ((indiceActual !== 0)&&(indiceActual !== -1)) {
          user1 = indiceActual - 1;
        }
        else {
          if (indiceActual === 0) {
            user1 = indiceActual + 1;
          }
        }
      }
      var url = "data/updateQuery.php";
      var query = "update usuarios set estado='inactivo' where idusuarios='" + user + "'";
      var jsonQuery = JSON.stringify(query);
      $.getJSON(url, {query: ""+jsonQuery+""}).done(function(request) {
        var resultado = request["resultado"];
        if (resultado === "OK") {
          if (total > 1) {
            cargarDetalleUsuario(ids[user1]);
          }
        }
        else {
          alert('Hubo un error. Por favor verifique.');
        }
      });
    });
  }
  else {
    //alert('no quiso borrar');
  }
});
/********** fin on("click", "#eliminarUsuario", function () **********/

///Disparar funcion al hacer clic en el botón actualizar.
///Se validan todos los campos antes de hacer la actualización, y una vez hecha se inhabilita el form y parte de los botones.
$(document).on("click", "#actualizarUsuario", function (){
    var seguir = true;
    seguir = validarUsuario();

    ///En caso de que se valide todo, se prosigue a enviar la consulta con la actualización en base a los parámetros pasados
    if (seguir) {
      ///Recupero valores editados y armo la consulta para el update:
      var iduser = document.getElementById("iduser").value;
      var nombre = (document.getElementById("nombre").value).trim();
      var apellido = (document.getElementById("apellido").value).trim();
      var empresa = (document.getElementById("empresa").value).trim();
      var mail = (document.getElementById("mail").value).trim();
      var tel = (document.getElementById("telefono").value).trim();
      var obs = (document.getElementById("observaciones").value).trim();
      //alert('iduser: '+iduser+'\nnombre: '+nombre +'\napellido: '+apellido+'\nempresa: '+empresa+'\nmail: '+mail+'\ntel: '+tel+'\nobs: '+obs);
      
      var query = "select idusuarios as id, apellido from usuarios where nombre='"+nombre+"' and apellido='"+apellido+"' and empresa='"+empresa+"'";
      var url = "data/selectQuery.php";
      //alert(query);
      $.getJSON(url, {query: ""+query+""}).done(function(request) {
        var total = request["rows"];
        var id;
        if (total > 0) {
          id = request["resultado"][0]["id"];
        }
        if (((total <= 1) && (iduser === id)) || ((iduser !== id) && (total < 1))) {  
          var query = "update usuarios set nombre='" + nombre + "', apellido='" + apellido + "', empresa='"+empresa+"' , mail='"+mail+"', telefono='" + tel +"', observaciones='"+obs+"' where idusuarios='" + iduser + "'";
          var url = "data/updateQuery.php";
          //alert(query);
          var jsonQuery = JSON.stringify(query);
          ///Ejecuto la consulta y muestro mensaje según resultado:
          $.getJSON(url, {query: ""+jsonQuery+""}).done(function(request) {
            var resultado = request["resultado"];
            if (resultado === "OK") {
              alert('Registro modificado correctamente!');  
              $("#actualizarUsuario").attr("disabled", "disabled");
              document.getElementById("editarUsuario").value = "EDITAR";
              inhabilitarUsuario();
              cargarUsuarios("#selector", iduser);
            }
            else {
              alert('Hubo un error. Por favor verifique.');
            }
          });
        }
        else {
          alert('Ya existe un usuario con esos datos. Por favor verifique.');
        }
      });  
    }
  });
/********** fin on("click", "#actualizarUsuario", function () **********/

///Disparar función al hacer click en el botón Nuevo Usuario.
///Se vuelve al DIV #main-content y se genera un form en blanco para agregar los datos del usuario.
$(document).on("click", "#nuevoUsuario", function() {
  var encabezado = '<h1 class="encabezado">NUEVO USUARIO</h1>';
  var tabla = '<table id="datosUsuario" name="datosUsuario" class="tabla2" style="max-width:40%">';
  var tr = '<tr>\n\
              <th colspan="4" class="tituloTabla">DATOS DEL USUARIO</th>\n\
            </tr>';
  tr += '<tr>\n\
            <th>Apellido</th>\n\
            <td><input id="apellido" name="apellido" class="resaltado" type="text"></td>\n\
            <th>Nombre</th>\n\
            <td><input id="nombre" name="nombre" class="resaltado" type="text"></td>\n\
        </tr>';
  tr += '<tr>\n\
          <th>Empresa</th>\n\
          <td colspan="3">\n\
            <select id="empresa" name="empresa" style="width:100%">\n\
              <option value="seleccionar" selected="yes">---SELECCIONAR---</option>\n\
              <option value="EMSA" style="margin:auto; padding:auto">EMSA</option>\n\
              <option value="BBVA">BBVA</option>\n\
              <option value="ITAU">ITAU</option>\n\
              <option value="SCOTIA">SCOTIA</option>\n\
            </select>\n\
          </td>\n\
        </tr>';
  tr += '<tr>\n\
            <th>Mail</th>\n\
            <td colspan="3"><input id="mail" name="mail" type="text"></td>\n\
         </tr>';
  tr += '<tr>\n\
            <th>Teléfono</th>\n\
            <td colspan="3"><input id="telefono" name="telefono" type="text"></td>\n\
         </tr>';
  tr += '<tr>\n\
            <th>Observaciones</th>\n\
            <td colspan="3"><textarea id="observaciones" name="observaciones"></textarea></td>\n\
         </tr>';
  tr += '<tr>\n\
            <td colspan="4" class="pieTabla"><input type="button" id="agregarUsuario" name="agregarUsuario" value="AGREGAR" class="btn-success"></td>\n\
         </tr>'; 
  tr += '</table>';
  tabla += tr;
  var cargar = encabezado;
  cargar += tabla;
  var volver = '<br><a id="volverUsuario" href="usuario.php">Volver</a>';
  cargar += volver;
  vaciarContent("#main-content");
  $("#main-content").html(cargar);  
});
/********** fin on("click", "#nuevoUsuario", function() **********/

///Disparar función al hacer click en el botón Agregar Usuario.
///Se validan los datos para el usuario, luego 
///se cargan los dos DIVs (#selector y #content), en #selector se cargan el listado de usuarios y en 
///#content los datos del usuario recién agregado, siempre y cuando haya pasado la validación.
$(document).on("click", "#agregarUsuario", function(){
  var seguir = true;
  seguir = validarUsuario();
  
  ///En caso de que se valide todo, se prosigue a enviar la consulta con la actualización en base a los parámetros pasados
  if (seguir) {
    ///Recupero valores y armo la consulta para el insert:
    var apellido = (document.getElementById("apellido").value).trim();
    var nombre = (document.getElementById("nombre").value).trim();
    var empresa = (document.getElementById("empresa").value).trim();
    var tel = (document.getElementById("telefono").value).trim();
    var mail = (document.getElementById("mail").value).trim();
    var obs = (document.getElementById("observaciones").value).trim();
    //alert('apellido: '+apellido+'\nnombre: '+nombre +'\nempresa: '+empresa+'\nmail: '+mail+'\ntel: '+tel+'\nobs: '+obs);
      
    var query = "select apellido from usuarios where nombre='"+nombre+"' and apellido='"+apellido+"' and empresa='"+empresa+"'";
    var url = "data/selectQuery.php";
    //alert(query);
    $.getJSON(url, {query: ""+query+""}).done(function(request) {
      var total = request["rows"];
      if (total === 0) {
        var query = 'insert into usuarios (nombre, apellido, empresa, telefono, mail, observaciones) values ("'+nombre+'", "'+apellido+'", "'+empresa+'", "'+tel+'", "'+mail+'", "'+obs+'")';
        var url = "data/updateQuery.php";
        //alert(query);
        var jsonQuery = JSON.stringify(query);
        $.getJSON(url, {query: ""+jsonQuery+""}).done(function(request) {
          var resultado = request["resultado"];
          if (resultado === "OK") {  
            var query = 'select max(idusuarios) as ultimoUser from usuarios limit 1';
            var url = "data/selectQuery.php";
            $.getJSON(url, {query: ""+query+""}).done(function(request) {
              var iduser = request.resultado[0]["ultimoUser"];
              alert('Registro agregado correctamente!');
              if (parseInt($("#content").length, 10) === 0) {
                var divs = "<div id='fila' class='row'>\n\
                              <div id='selector' class='col-md-5 col-sm-12'></div>\n\
                              <div id='content' class='col-md-7 col-sm-12'></div>\n\
                            </div>";
              }  
              $("#main-content").empty();
              $("#main-content").append(divs);
              cargarUsuarios("#selector", iduser);
              cargarDetalleUsuario(iduser);
              inhabilitarUsuario();
            });
          } 
          else {
            alert('Hubo un error... Por favor verifique.');
          }
        }); 
      }
      else {
        alert('Ya existe un usuario con esos datos. Por favor verifique.');
      }
    });
  }
});
/********** fin on("click", "#agregarUsuario", function() **********/

///Disparar función al hacer enter estando en el elemento nombreUsuario.
///Básicamente, la idea es pasar el foco al elemento password cosa de ahorrar tiempo en el ingreso.
$(document).on("keypress", "#nombreUsuario", function(e) {
  if(e.which === 13) {
    e.preventDefault();
    $("#password").focus();
  }  
});
/********** fin on("keypress", "#nombreUsuario", function(e) **********/

///Disparar función al hacer enter estando en el elemento password.
///Básicamente, la idea es hacer el submit cosa de ahorrar tiempo en el ingreso.
$(document).on("keypress", "#password", function(e) {
  if(e.which === 13) {
    e.preventDefault();
    validarIngreso();
  }  
});
/********** fin on("keypress", "#password", function(e) **********/

///Disparar función al detectar el submit en el formulario de ingreso.
$(document).on("click", "#login", function(e) {
  e.preventDefault();
  validarIngreso();
});
/********** fin on("click", "#login", function(e) **********/

/*****************************************************************************************************************************
/// **************************************************** FIN USUARIOS ********************************************************
******************************************************************************************************************************
*/



/*****************************************************************************************************************************
/// *********************************************** INICIO MODAL REPETIDO ****************************************************
******************************************************************************************************************************
*/

///Disparar función al abrirse el modal con la alerta de movimiento repetido.
$(document).on("shown.bs.modal", "#modalMovRepetido", function() {
  var tipoModal = $("#tipo").val();
  var cantidadModal = $("#cantidad").val();
  var fechaModal = $("#fecha").val();
  var productoModal = $("#hint option:selected").text();
  var separoProductoModal = productoModal.split('--- ');
  productoModal = separoProductoModal[1];
  var separoFechaModal = fechaModal.split('-');
  fechaModal = separoFechaModal[2]+'/'+separoFechaModal[1]+'/'+separoFechaModal[0];
  
  $("#mdlTipo").val(tipoModal);
  $("#mdlFecha").val(fechaModal);
  $("#mdlCantidad").val(cantidadModal);
  $("#mdlProducto").val(productoModal);
  $("#btnModalRepCerrar").attr("autofocus", true);
  setTimeout(function (){$("#btnModalRepCerrar").focus();}, 50);
});
/********** fin on("shown.bs.modal", "#modalMovRepetido", function() **********/

///Disparar función al hacer click en el botón de AGREGAR que está en el MODAL.
$(document).on("click", "#btnModalRepetido", function(){
  agregarMovimiento(true);
});
/************** fin on("click", "#btnModalRepetido", function() ***************/

///Disparar función al cerrarse el modal con la alerta de movimiento repetido. Ya sea desde el botón cerrar como con "la cruz" para 
///cerrar de arriba a la derecha.
$(document).on("hide.bs.modal", "#modalMovRepetido", function() {
  $("#cantidad").val('');
  setTimeout(function (){$("#cantidad").focus();}, 50);
});
/********** fin on("shown.bs.modal", "#modalMovRepetido", function() **********/

/*****************************************************************************************************************************
/// ************************************************ FIN MODAL REPETIDO ******************************************************
******************************************************************************************************************************
*/



/*****************************************************************************************************************************
/// ********************************************* INICIO MODAL CAMBIO FECHA **************************************************
******************************************************************************************************************************
*/

///Disparar función al abrirse el modal con la alerta de movimiento repetido.
$(document).on("shown.bs.modal", "#modalCbioFecha", function() {
  var fechaActualModal = $("#fecha").val();
  var separoFechaModal = fechaActualModal.split('-');
  fechaActualModal = separoFechaModal[2]+'/'+separoFechaModal[1]+'/'+separoFechaModal[0];
  
  var fechaViejaModal = $("#fechaVieja").val();
  var separoFechaViejaModal = fechaViejaModal.split('-');
  fechaViejaModal = separoFechaViejaModal[2]+'/'+separoFechaViejaModal[1]+'/'+separoFechaViejaModal[0];
  
  $("#mdlFechaActual").val(fechaViejaModal);
  $("#mdlFechaNueva").val(fechaActualModal);

  $("#btnModalCbioFechaCerrar").attr("autofocus", true);
  setTimeout(function (){$("#btnModalCbioFechaCerrar").focus();}, 50);
});
/********** fin on("shown.bs.modal", "#modalMovRepetido", function() **********/

///Disparar función al hacer click en el botón de AGREGAR que está en el MODAL.
$(document).on("click", "#btnModalCbioFecha", function(){
  actualizarMovimiento(true);
});
/************** fin on("click", "#btnModalRepetido", function() ***************/

///Disparar función al cerrarse el modal con la alerta de movimiento repetido. Ya sea desde el botón cerrar como con "la cruz" para 
///cerrar de arriba a la derecha.
$(document).on("hide.bs.modal", "#modalCbioFecha", function() {
  var fechaViejaModal = $("#fechaVieja").val();  
  $("#fecha").val(fechaViejaModal);
  setTimeout(function (){$("#fecha").focus();}, 50);
});
/********** fin on("shown.bs.modal", "#modalMovRepetido", function() **********/

/*****************************************************************************************************************************
/// ********************************************** FIN MODAL CAMBIO FECHA ****************************************************
******************************************************************************************************************************
*/



/*****************************************************************************************************************************
/// **************************************************** INICIO MODAL USARIO *************************************************
******************************************************************************************************************************
*/

///Disparar función al hacer click en el link con el nombre del usuario que está logueado.
///Esto hace que se abra el modal para cambiar la contraseña.
$(document).on("click", "#user", function(){
  verificarSesion('', 's');
  $("#modalPwd").modal("show");
});
/********** fin on("click", "#user", function() **********/

///Disparar función al abrirse el modal para cambiar la contraseña.
///Lo único que hace es limpiar el form para poder ingresar los nuevos datos.
$(document).on("shown.bs.modal", "#modalPwd", function() {
  $("#pw1").val('');
  $("#pw2").val('');
  $("#pw1").attr("autofocus", true);
  $("#pw1").focus();
});
/********** fin on("shown.bs.modal", "#modalPwd", function() **********/

///Disparar función al hacer click en el botón de ACTUALIZAR que está en el MODAL.
///Primero valida que la info ingresada sea válida (pwd no nulos e iguales entre sí), y luego 
///ejecuta la consulta para cambiar la contraseña.
$(document).on("click", "#btnModal", function(){
  actualizarUser();
});
/********** fin on("click", "#btnModal", function() **********/

///Disparar función al hacer ENTER estando en el elemento pw1 del MODAL.
///Esto hace que se pase el foco al siguiente input del MODAL (pw2) cosa de ahorrar tiempo.
$(document).on("keypress", "#pw1", function(e) {
  if(e.which === 13) {
    $("#pw2").focus();
  }  
});
/********** fin on("keypress", "#pw1", function(e) **********/

///Disparar función al hacer ENTER estando en el elemento pw2 del MODAL.
///Esto hace que se llame a la función correspondiente (actualizarUser()) cosa de ahorrar tiempo.
$(document).on("keypress", "#pw2", function(e) {
  if(e.which === 13) {
    actualizarUser();
  }  
});
/********** fin on("keypress", "#pw2", function(e) **********/

/*****************************************************************************************************************************
/// **************************************************** FIN MODAL USARIO ****************************************************
******************************************************************************************************************************
*/



/*****************************************************************************************************************************
/// **************************************************** INICIO MODAL PARÁMETROS *********************************************
******************************************************************************************************************************
*/

///Disparar función al hacer click en el link que dice PARAMETROS debajo del usuario logueado
///Esto hace que se abra el modal para cambiar los parámetros.
$(document).on("click", "#param", function(){
  verificarSesion('', 's');
  $("#modalParametros").modal("show");
});
/********** fin on("click", "#param", function() **********/

///Disparar función al abrirse el modal para cambiar los parámetros.
///Lo único que hace es limpiar el form para poder ingresar los nuevos datos.
$(document).on("shown.bs.modal", "#modalParametros", function() {
  $("#pageSize").val($("#tamPagina").val());
  $("#tamSelects").val($("#limiteSelects").val());
  $("#tamHistorialGeneral").val($("#limiteHistorialGeneral").val());
  $("#tamHistorialProducto").val($("#limiteHistorialProducto").val());
  $("#pageSize").attr("autofocus", true);
  $("#pageSize").focus();
});
/********** fin on("shown.bs.modal", "#modalParametros", function() **********/

///Disparar función al hacer click en el botón de ACTUALIZAR que está en el MODAL.
///Llama a la función que se encarga de actualizar los parámetros.
$(document).on("click", "#btnParam", function(){
  actualizarParametros();
});
/********** fin on("click", "#btnParam", function() **********/

///Disparar función al hacer ENTER estando en el elemento pageSize del MODAL.
///Esto hace que se pase el foco al siguiente input del MODAL (tamSelects) cosa de ahorrar tiempo.
$(document).on("keypress", "#pageSize", function(e) {
  if(e.which === 13) {
    $("#tamSelects").focus();
  }  
});
/********** fin on("keypress", "#pageSize", function(e) **********/

///Disparar función al hacer ENTER estando en el elemento tamSelects del MODAL.
///Esto hace que se pase el foco al siguiente input del MODAL (tamHistorialGeneral) cosa de ahorrar tiempo.
$(document).on("keypress", "#tamSelects", function(e) {
  if(e.which === 13) {
    $("#tamHistorialGeneral").focus();
  }  
});
/********** fin on("keypress", "#tamSelects", function(e) **********/

///Disparar función al hacer ENTER estando en el elemento tamHistorialGeneral del MODAL.
///Esto hace que se pase el foco al siguiente input del MODAL (tamHistorialProducto) cosa de ahorrar tiempo.
$(document).on("keypress", "#tamHistorialGeneral", function(e) {
  if(e.which === 13) {
    $("#tamHistorialProducto").focus();
  }  
});
/********** fin on("keypress", "#tamHistorialGeneral", function(e) **********/

///Disparar función al hacer ENTER estando en el elemento tamHistorialProducto del MODAL.
///Esto hace que se llame a la función correspondiente (actualizarParametros()) cosa de ahorrar tiempo.
$(document).on("keypress", "#tamHistorialProducto", function(e) {
  if(e.which === 13) {
    actualizarParametros();
  }  
});
/********** fin on("keypress", "#tamHistorialProducto", function(e) **********/

///Disparar función al hacer CLICK a uno de los links del POPOVER con el HISTORIALGRAL.
///Esto hace que se cierre el popover.
$(document).on("click", ".linkHistorialGeneral", function(){
  $("#historialGeneral").popover('hide');
});
/********** fin on("click", ".linkHistorialGeneral", function() **********/

///Disparar función al hacer CLICK a uno de los links del POPOVER con el HISTORIAL PRODUCTO.
///Esto hace que se cierre el popover.
$(document).on("click", ".linkHistorialProducto", function(){
  $("#historial").popover('hide');
});
/********** fin on("click", ".linkHistorialGeneral", function() **********/

/*****************************************************************************************************************************
/// **************************************************** FIN MODAL PARÁMETROS ************************************************
******************************************************************************************************************************
*/



/*****************************************************************************************************************************
/// Comienzan las funciones que manejan los eventos relacionados a las BÚSQUEDAS como ser creación, edición y eliminación.
******************************************************************************************************************************
*/

///Disparar función al hacer enter estando en el elemento Producto.
///Básicamente, la idea es pasar el foco al select hint cosa de ahorrar tiempo en el ingreso.
$(document).on("keypress", "#productoStock, #productoMovimiento, #productoGrafica", function(e) { 
  if(e.which === 13) {
    //alert('enter');
    $("#hint").focus();//alert('afdkjldf');
  }
});      
/********** fin on("keypress", "#productoStock, #productoMovimiento, #productoGrafica", function(e) **********/

///Disparar función al presionar el TAB estando en alguno de los input del form para las búsquedas.
///Es un complemento del anterior que detecta primero si se presionó el TAB. En ese caso, chequea primero
///que haya alguna sugerencia en HINT, y si la hay pasa el foco al select cosa de ahorrar tiempo.
$(document).on("keydown", "#parametros input, #movimiento input", function(e) { 
  var keyCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
  var sel = $(this).attr("id");
  
  if ((sel === "productoStock")||(sel === "productoMovimiento")||(sel === "producto")){
    if (keyCode == 9) { 
      e.preventDefault(); 
      var length = parseInt($('#hint> option').length, 10);
      if (length > 0) {
        $("#hint").focus();
      }
      else {
        switch (sel) {
          case "producto":  //$("#comentarios").focus();
                            $("#cantidad").focus();
                            break;
          case "productoStock":  $("#entidadMovimiento").focus();
                            break;
          case "productoMovimiento":  $("#inicio").focus();
                            break;
                          default: break;                
        }
      }
    } 
  } 
});      
/********** fin on("keydown", "#parametros input, #movimiento input", function(e) **********/

///Disparar función al cambiar la entidad elegida en el select ENTIDAD. 
///Lo que hace es seleccionar automáticamente el radio button correspondiente.
$(document).on("change", "[name=entidad]", function (){
  $(this).parent().prev().prev().children().prop("checked", true);
});
/********** fin on("change", "[name=entidad]", function () **********/

///Disparar función al cambiar el mes elegido como parámetro para la búsqueda.
///Si se eligió algún mes quiere decir que la búsqueda es de movimientos y por mes/año 
///Lo que hace es seleccionar automáticamente el radio button correspondiente.
$(document).on("change", "#mes", function (){
  $(this).parent().prev().prev().children().prop("checked", true);
});
/********** fin on("change", "#mes", function () **********/

///Disparar función al cambiar el año elegido como parámetro para la búsqueda.
///Si se eligió algún año quiere decir que la búsqueda es de movimientos y por mes/año 
///Lo que hace es seleccionar automáticamente el radio button correspondiente.
$(document).on("change", "#año", function (){
  $(this).parent().prev().prev().prev().prev().children().prop("checked", true);
});
/********** fin on("change", "#año", function () **********/

///Disparar función al cambiar el mes elegido como parámetro para la búsqueda.
///Si se eligió alguna fecha de inicio quiere decir que la búsqueda es de movimientos y por rango (inicio/fin) 
///Lo que hace es seleccionar automáticamente el radio button correspondiente.
$(document).on("change", "#inicio", function (){
  $(this).parent().prev().prev().children().prop("checked", true);
});
/********** fin on("change", "#inicio", function () **********/

///Disparar función al cambiar el mes elegido como parámetro para la búsqueda.
///Si se eligió alguna fecha de fin quiere decir que la búsqueda es de movimientos y por rango (inicio/fin) 
///Lo que hace es seleccionar automáticamente el radio button correspondiente.
$(document).on("change", "#fin", function (){
  $(this).parent().prev().prev().prev().prev().children().prop("checked", true);
});
/********** fin on("change", "#fin", function () **********/

///Disparar función al cambiar el tipo de seguridad para el archivo ZIP generado.
///Si se eligió el tipo de pwd manual se debe agregar un input para poder ingresar el pwd.
$(document).on("change", "#zip", function (){
  if ($(this).val() === 'manual'){
    $("#zipManual").prop("disabled", false);
    $("#zipManual").focus();
  }
  else {
    $("#zipManual").prop("disabled", true);
  }
});
/********** fin on("change", "#zip", function () **********/

///Disparar función al cambiar el tipo de seguridad para el archivo EXCEL generado.
///Si se eligió el tipo de pwd manual se debe agregar un input para poder ingresar el pwd.
$(document).on("change", "#planilla", function (){
  if ($(this).val() === 'manual'){
    $("#planillaManual").prop("disabled", false);
    $("#planillaManual").focus();
  }
  else {
    $("#planillaManual").prop("disabled", true);
  }
});
/********** fin on("change", "#planilla", function () **********/

///Disparar función al cambiar el tipo de movimiento a consultar.
///Si se eligió el tipo 'Todos', se debe autoseleccionar y bloquear el estado 'Todos'.
///Si se eligió el tipo 'Clientes', se debe autoseleccionar y bloquear el estado 'OK'.
///En el resto de los casos, se puede elegir si se quieren 'Todos', los 'OK', o los de 'ERROR'.
$(document).on("change", "#tipo", function (){
  if ($(this).val() === 'Todos'){
    $("#estadoMov").val('Todos');
    $("#estadoMov").prop("disabled", true);
    $("#mostrarEstado").prop("checked", true);
    $("#mostrarEstado").prop("disabled", true);
  }
  else {
    if ($(this).val() === 'Clientes'){
      $("#estadoMov").val('OK');
      $("#estadoMov").prop("disabled", true);
      $("#mostrarEstado").prop("checked", false);
      $("#mostrarEstado").prop("disabled", true);
    }
    else {
      $("#estadoMov").prop("disabled", false);
      $("#estadoMov").val('Todos');
      $("#mostrarEstado").prop("disabled", false);
    }
  }
});
/********** fin on("change", "#tipo", function () **********/

///Disparar función al hacer click en el botón de CONSULTAR en la parte de búsquedas.
///Valida y arma la consulta, luego la ejecuta y muestra los resultados con un botón de EXPORTAR
///el cual permite hacer la exportación a PDF de la búsqueda realizada.
$(document).on("click", "#realizarBusqueda", function () {
  realizarBusqueda();
});
/********** fin on("click", "#realizarBusqueda", function () **********/

///Disparar función darle ENTER sobre los select ENTIDADSTOCK o ENTIDADMOVIMIENTO. 
///Básicamente, la idea es que al presionar ENTER se haga directamente el submit cosa de ahorrar tiempo.  
$(document).on("keypress", "#entidadStock, #entidadMovimiento", function (e){ 
  //close dropdown
  //$("#hint").attr('size',0);
  var temp = "#"+$(this).attr("id");
  //var sel = $(temp).find('option:selected').val();
  var entidades = new Array();
  $('option:selected',this).each(function() {
    entidades.push($(this).val());
  });
  var totalEntidades = entidades.length;
  var todos = false;
  for (var i in entidades) {
    if (entidades[i] === 'todos'){
      todos = true;
    }
  }

  if ((e.which === 1) || (e.which === 13)) {
    if (todos && (totalEntidades > 1)){
      alert('No se puede consultar "TODOS" junto con otras entidades. Por favor verifique.');
    }
    else {
      if (totalEntidades > limiteSeleccion){
        alert("Se superó el máximo de "+limiteSeleccion+" opciones elegidas. Por favor verifique.");
      }
      else {
        realizarBusqueda();
      }
    }
  }  
}); 
/********** fin on("keypress", "#entidadStock, #entidadMovimiento", function (e) **********/

///Disparar función al hacer click en botón de exportar.
///Esto hace que se recupere el id que corresponde a este tipo de exportación (listado de actividades) y se 
///redirija a la página exportar.php pasando ese parámetro:
$(document).on("click", ".exportar", function (){
  //alert('Está a punto de exportar el listado con las actividades. ¿Desea continuar?.');
  ///Levanto el id que identifica lo que se va a exportar, a saber:
  /// 1- stock por entidad.
  /// 2- stock por producto.
  /// 3- stock de plásticos en bóveda.
  /// 4- movimientos por entidad.
  /// 5- movimientos por producto.
  var id = $(this).attr("id");
  var indice = $(this).attr("indice");
  $("input[name='indice']" ).val(indice);
  var x = $("#x_"+indice+"").val();
  var query = $("#query_"+indice+"").val();
  var consultaCSV = $("#consultaCSV_"+indice+"").val();
  var largos = $("#largos_"+indice+"").val();
  var campos = $("#campos_"+indice+"").val();
  var mostrar = $("#mostrar_"+indice+"").val();
  var tipoConsulta = $("#tipoConsulta_"+indice+"").val();
  
  var zip = $("#zip_"+indice+"").val();
  var planilla = $("#planilla_"+indice+"").val();
  var zipRandom = false;
  var planillaRandom = false;
  
  switch (id) {
    case "1": var entidad = $("#entidad_"+indice+"").val();
              break;
    case "2": var idProd = $("#idProd_"+indice+"").val();
              var nombreProducto = $("#nombreProducto_"+indice+"").val();
              break;
    case "3": break;
    case "4": var criterioFecha = $("#criterioFecha").val();
              var entidad = $("#entidad").val();
              var tipo = $("#tipo").val();
              var usuario = $("#usuario").val();
              break;
    case "5": var criterioFecha = $("#criterioFecha").val();
              var idProd = $("#idProd_"+indice+"").val();
              var nombreProducto = $("#nombreProducto_"+indice+"").val();
              var tipo = $("#tipo").val();
              var usuario = $("#usuario").val();
              
    default: break;
  }
  
  switch (criterioFecha) {
    case "intervalo": var inicio = $("#inicio").val();
                      var fin = $("#fin").val();
                      break;
    case "mes": var mes = $("#mes").val();
                var año = $("#año").val();                 
                break;
    case "todos": break;
    default: break;
  }
  
  var param = "id:"+id+"&x:"+x+"&largos:"+largos+"&campos:"+campos+"&query:"+query+"&consultaCSV:"+consultaCSV+"&mostrar:"+mostrar+"&tipoConsulta:"+tipoConsulta;
  
  //var enviarMail = confirm('¿Desea enviar por correo electrónico el pdf?');
  
  /// Se quita la pregunta del envío del mail pues, por ahora, NO hay acceso a internet desde donde está instalado y carece de sentido:
  var enviarMail = false;
  
  if (enviarMail === true) {
    var dir = prompt('Dirección/es: (SEPARADAS POR COMAS)');
    if (dir === '') {
      alert('Error, la dirección no puede quedar vacía. Por favor verifique.');
      continuar = false;
    }
    else {
      if (dir !== null) {
        //alert('Se enviará el reporte a: '+dir);
        param += "&mails:"+dir+"";
      }
      else {
        alert('Error, se debe ingresar la dirección a la cual enviar el reporte y dar aceptar.');
        continuar = false;
      }
    }
  }  
  else {
    //alert('Se optó por no enviar el mail. Se sigue con el guardado en disco y muestra en pantalla.');
  }
 
  ///En base al id, veo si es necesario o no enviar parámetros:
  switch (id) {
    case "1": param += '&entidad:'+entidad;//+'&nombreProducto:'+nombreProducto;
              break;
    case "2": param += '&idProd:'+idProd+'&nombreProducto:'+nombreProducto;
              break;
    case "3": break;
    case "4": param += '&entidad:'+entidad+'&tipo:'+tipo+'&usuario:'+usuario;
              switch (criterioFecha){
                case "intervalo": param += '&inicio:'+inicio+'&fin:'+fin;
                                  break;
                case "mes": param += '&mes:'+mes+'&año:'+año;
                            break;
                case "todos": break;
                default: break;
              }
              break;
    case "5": param += '&idProd:'+idProd+'&tipo:'+tipo+'&usuario:'+usuario+'&nombreProducto:'+nombreProducto;
              switch (criterioFecha){
                case "intervalo": param += '&inicio:'+inicio+'&fin:'+fin;
                                  break;
                case "mes": param += '&mes:'+mes+'&año:'+año;
                            break;
                case "todos": break;
                default: break;
              }            
              break;
    default: break;
  }
  
  var caracteres = "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789";
  if (zip === 'random'){
//    var min = 10;
//    var max = 1000;
//    var pwdRandom = Math.round(Math.random()*(max-min)+parseInt(min));
    var pwdZip = "";
    for (i=0; i<10; i++) pwdZip += caracteres.charAt(Math.floor(Math.random()*caracteres.length));
      
    zipRandom = true;
    $("#zipManual_"+indice+"").val(pwdZip); 
  }
  if (planilla === 'random'){
    var pwdPlanilla = "";
    for (i=0; i<10; i++) pwdPlanilla += caracteres.charAt(Math.floor(Math.random()*caracteres.length));
    
    planillaRandom = true; 
    $("#planillaManual_"+indice+"").val(pwdPlanilla);
  }
  if ((zipRandom === true)||(planillaRandom === true)){
    var msgAlerta = '';
    if ((zipRandom === true)&&(planillaRandom === true)){
      msgAlerta = 'La contraseña generada para el ZIP es: <br><br><strong>'+pwdZip+'</strong><br><br>y la generada para la PLANILLA es:<br><br><strong>'+pwdPlanilla+"</strong><br><br>¡¡¡POR FAVOR ANÓTELAS!!!";
    }
    else {
      if ((zipRandom === true)&&(planilla === 'misma')){
        msgAlerta = 'La contraseña generada para el ZIP y para la PLANILLA es: <br><br><strong>'+pwdZip+"</strong><br><br>¡¡¡POR FAVOR ANÓTELA!!!";
      }
      else {
        if (zipRandom === true){
          msgAlerta = 'La contraseña generada para el ZIP es: <br><br><strong>'+pwdZip+"</strong><br><br>¡¡¡POR FAVOR ANÓTELA!!!";
        }
        else {
          msgAlerta = 'La contraseña generada para la PLANILLA es: <br><br><strong>'+pwdPlanilla+"</strong><br><br>¡¡¡POR FAVOR ANÓTELA!!!";
        }
      }
    }
    var alerta = '<div class="modal" id="modalExportar">\n\
                    <div class="modal-dialog">\n\
                      <div class="modal-content">\n\
                        <!-- Modal Header -->\n\
                        <div class="modal-header">\n\
                          <h4 class="modal-title">ATENCIÓN</h4>\n\
                          <button type="button" class="close" data-dismiss="modal">&times;</button>\n\
                        </div>\n\
                        \n\
                        <!-- Modal body -->\n\
                        <div class="modal-body">\n\
                         '+msgAlerta+'..\n\
                        </div>\n\
                        \n\
                        <!-- Modal footer -->\n\
                        <div class="modal-footer">\n\
                          <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>\n\
                        </div>\n\
                      </div>\n\
                    </div>\n\
                  </div>';
    //alert('antes de agregar');
    $("#resultadoBusqueda_"+indice).append(alerta);
    $('#modalExportar').modal('show');
  }
  else {
    $("#resultadoBusqueda_"+indice).submit();
  }
  
});//*** fin del click .exportar ***
/********** fin on("click", ".exportar", function () **********/

///Disparar función al cerrar el modal de exportar.
///Básicamente hace el submit del form:
$(document).on("hidden.bs.modal", "#modalExportar", function(){
  var padre = $(this).parent().attr("id");
  $("#"+padre+"").submit();
});
/********** fin on("hidden.bs.modal", "#modalExportar", function() **********/

///Disparar función al hacer click en alguno de los links con las PÁGINAS de los resultados.
///Básicamente arma la consulta para mostrar la pagina solicitada y llama a la función para ejecutarla.
$(document).on("click", ".paginate", function (){
  var page = parseInt($(this).attr('data'), 10);
  $(".nav-link.active").attr("activepage", ""+page+"");
  var indice = $(this).attr('i');
  var totalPaginas = parseInt($("#totalPaginas_"+indice).val(), 10);
  var totalRegistros = parseInt($("#totalRegistros_"+indice).val(), 10);
  var totalPlasticos = parseInt($("#totalPlasticos_"+indice).val(), 10);
  var tipoConsulta = $("#tipoConsulta_"+indice).val();
  ///Vuelvo a definir una variable local tamPagina para actualizar el valor que ya tiene.
  ///Esto es para que tome el último valor en caso de que se haya modificado desde el modal (que no cambia hasta recargar la página).
  var tamPagina = parseInt($("#tamPagina").val(), 10);
  var offset = (page-1)*tamPagina;
  var primerRegistro = offset+1;
  var ultimoRegistro = offset + tamPagina;
  if (ultimoRegistro > totalRegistros){
    ultimoRegistro = totalRegistros;
  }
  var rango = "<h5 id='rango_"+indice+"' class='rango'>(P&aacute;gina "+page+": registros del "+primerRegistro+" al "+ultimoRegistro+")</h4>";
  
  var limite = tamPagina;
  if (page < (totalPaginas-1)){
    limite = tamPagina + 1;
  }
  
  var max = tamPagina;
  
  var query = $("#query_"+indice).val();
  
  if (page === totalPaginas){
    max = totalRegistros%tamPagina;
    if (max === 0) {
      limite = tamPagina;
      max = tamPagina;
    }
    else {
      limite = max;
    }
  }
  
  query += " limit "+limite+" offset "+offset;
  
  //var idTipo = $("#idTipo").val();
  var radio = $("#radio_"+indice).val();
  var entidad = '';
  var todos = false;
  var stockViejo = JSON.parse($("#subtotales_"+indice).val());
  
  var url = "data/selectQuery.php";
  switch (radio){
    case 'entidadStockViejo': var subtotales = {'stockViejo': stockViejo};
                              break;
    case 'entidadMovimiento':
    case 'entidadStock':  entidad = $("#entidad_"+indice+"").val();
                          var subtotales = JSON.parse($("#subtotales_"+indice).val());
                          break;
    case 'productoStockViejo': 
    case 'productoStock': break;
    case 'totalStock':  var subtotales = JSON.parse($("#subtotales_"+indice).val());
                        break;
    case 'productoMovimiento':  subtotales = JSON.parse($("#subtotales_"+indice).val());
                                break;
    default: break;
  }
    
  if (entidad === 'todos'){
    todos = true;
  }
  //alert(query);
  
  $.getJSON(url, {query: ""+query+""}).done(function(request){
    var datos = request.resultado;

    ///Variable fin: en la parte de STOCK, indica que es la última página y hay que mostrar el total de stock para el producto o entidad
    ///              en la parte de MOVIMIENTOS, indica que los movimientos del producto siguen en la otra página y por ende NO hay que mostrar el resumen
    /// Como es la misma variable, en MOVIMIENTOS se USA INVERTIDA!!. Cuando sigue en la otra página se pasa TRUE.
    var fin = false;
    switch (radio){
      case "entidadStockViejo":
      case "entidadStock":  if (page < totalPaginas){
                              fin = true;
                            }
                            break;
      case "productoStockViejo":
      case "productoStock": break;
      case "totalStock":  if (page < totalPaginas){
                            fin = true;
                          }
                          break;
      case "entidadMovimiento": entidad = $("#entidad_"+indice+"").val();
                                if (page < totalPaginas){
                                  if (((datos[limite-1]['idprod']) !== (datos[limite-2]['idprod']))){
                                    fin = true;
                                  }
                                }
                                break;
      case "productoMovimiento": break;
      default: break;
    }
    
    var tabla = mostrarTabla(radio, datos, indice, todos, primerRegistro, fin, subtotales, max, totalPlasticos, tipoConsulta, totalPaginas);
    
    $("#resultados_"+indice+"").remove();
    if (parseInt($("#detallesProducto_"+indice+"").length, 10) > 0){
      $("#detallesProducto_"+indice+"").remove();
    }
    $("#rango_"+indice+"").remove();
    $("#resultadoBusqueda_"+indice+"").prepend(rango);
    $("#resultadoBusqueda_"+indice+"").append(tabla);
    
    if (page !== 1) {
      var anterior = '<li><a class="paginate anterior" i='+indice+' data="'+(page-1)+'">Anterior</a></li>';
      $(".pagination[indice='"+indice+"'] li .anterior").remove();
      $(".pagination[indice='"+indice+"'] ul").prepend(anterior); 
    }
    else {
      $(".pagination[indice='"+indice+"'] li .anterior").remove();
    }
    
    $(".pagination[indice='"+indice+"'] li a").each(function (){
      var indLi = parseInt($(this).attr('data'), 10);
      if (page === indLi){
        $(this).addClass('pageActive');   
      }
      else {
        $(this).removeClass('pageActive');
      }
      if (page !== totalPaginas){
        var siguiente = '<li><a class="paginate siguiente" i='+indice+' data="'+(page+1)+'">Siguiente</a></li>';
        $(".pagination[indice='"+indice+"'] li .siguiente").remove();
        $(".pagination[indice='"+indice+"'] ul").append(siguiente);
      }
      else {
        $(".pagination[indice='"+indice+"'] li .siguiente").remove();
      }
    });  
    $('html, body').animate({scrollTop:136}, '10');
  });  
});
/********** fin on("click", ".paginate", function () **********/

//$(document).on("shown.bs.tab", "a[data-toggle='pill']",  function () {
//  
//  var page = $(".nav-link.active").attr("activepage");
//  var indice = $(".tab-pane.active").attr("indice");
//  var totalPaginas = parseInt($("#totalPaginas_"+indice).val(), 10);
//  //alert("indice: "+indice+"\nPagina: "+page+"\nTotalPaginas: "+totalPaginas);
//  if (page !== 1) {
//    var anterior = '<li><a class="paginate anterior" i='+indice+' data="'+(page-1)+'">Anterior</a></li>';
//    $(".pagination[indice='"+indice+"'] li .anterior").remove();
//    $(".pagination[indice='"+indice+"'] ul").prepend(anterior); 
//  }
//  else {
//    $(".pagination[indice='"+indice+"'] li .anterior").remove();
//    //$(".pagination li a[data='1']").addClass('pageActive');
//  }
//
//  $(".pagination[indice='"+indice+"'] li a").each(function (){
//    var indLi = parseInt($(this).attr('data'), 10);
//    if (page === indLi){
//      $(this).addClass('pageActive');   
//    }
//    else {
//      $(this).removeClass('pageActive');
//    }
//    if (page !== totalPaginas){
//      var siguiente = '<li><a class="paginate siguiente" i='+indice+' data="'+(page+1)+'">Siguiente</a></li>';
//      $(".pagination[indice='"+indice+"'] li .siguiente").remove();
//      $(".pagination[indice='"+indice+"'] ul").append(siguiente);
//    }
//    else {
//      $(".pagination[indice='"+indice+"'] li .siguiente").remove();
//    }
//  }); 
//
//});
/********** fin on("shown.bs.tab", "a[data-toggle='pill']",  function () **********/

/*****************************************************************************************************************************
/// *************************************************** FIN BÚSQUEDAS ********************************************************
******************************************************************************************************************************
*/



/*****************************************************************************************************************************
/// Comienzan las funciones que manejan los eventos relacionados a las GRAFICAS
******************************************************************************************************************************
*/

///Disparar función al hacer click en el botón CONSULTAR del form graficar
///Básicamente, se llama a la función realizarGrafica()
$(document).on("click", "#realizarGrafica", function (){
  realizarGrafica();
});
/********** fin on("click", "#realizarGrafica", function () **********/

///Disparar función al cambiar el mes elegido como parámetro para la gráfica.
///Si se eligió alguna fecha de inicio quiere decir que la grñafica es por rango (inicio/fin) 
///Lo que hace es seleccionar automáticamente el radio button correspondiente.
$(document).on("change", "#diaInicio", function (){
  $(this).parent().prev().prev().children().prop("checked", true);
});
/********** fin on("change", "#diaInicio", function () **********/

///Disparar función al cambiar el mes elegido como parámetro para la gráfica.
///Si se eligió alguna fecha de fin quiere decir que la gráfica es por rango (inicio/fin) 
///Lo que hace es seleccionar automáticamente el radio button correspondiente.
$(document).on("change", "#diaFin", function (){
  $(this).parent().prev().prev().prev().prev().children().prop("checked", true);
});
/********** fin on("change", "#diaFin", function () **********/

///Disparar función al cambiar el mes elegido como parámetro para la estadística.
///Si se eligió algún mes quiere decir que la gráfica es por mes/año 
///Lo que hace es seleccionar automáticamente el radio button correspondiente.
$(document).on("change", "#mesInicio", function (){
  $(this).parent().prev().prev().children().prop("checked", true);
});
/********** fin on("change", "#mesInicio", function () **********/

///Disparar función al cambiar el año elegido como parámetro para la estadística.
///Si se eligió algún año quiere decir que la gráfica es por mes/año 
///Lo que hace es seleccionar automáticamente el radio button correspondiente.
$(document).on("change", "#añoInicio", function (){
  $(this).parent().prev().prev().prev().prev().children().prop("checked", true);
});
/********** fin on("change", "#añoInicio", function () **********/

///Disparar función al cambiar el mes elegido como parámetro para la estadística.
///Si se eligió algún mes quiere decir que la gráfica es por mes/año 
///Lo que hace es seleccionar automáticamente el radio button correspondiente.
$(document).on("change", "#mesFin, #añoFin", function (){
  $(this).parent().parent().prev().children().children().prop("checked", true);
});
/********** fin on("change", "#mesFin, #añoFin", function () **********/

/*****************************************************************************************************************************
/// *************************************************** FIN GRAFICAS *********************************************************
******************************************************************************************************************************
*/



/*****************************************************************************************************************************
/// Comienzan las funciones que manejan el DESPLAZAMIENTO dentro de la página
******************************************************************************************************************************
*/

///Función que muestra/oculta las flechas para subir y bajar la página según el scroll:
$(window).scroll(function() {
//alert('en el scroll');
  if ($(this).scrollTop() > 80) {
    $('.arrow').fadeIn(50);
  } else {
    $('.arrow').fadeOut(400);
  }
});
/********** fin scroll(function() **********/

///Función que desplaza el foco hacia el final de la página:
$(document).on("click", ".arrow-bottom", function() {
  //event.preventDefault();
  $('html, body').animate({scrollTop:$(document).height()}, '1000');
        return false;
});
/********** fin on("click", ".arrow-bottom", function() **********/

///Función que desplaza el foco hacia el comienzo de la página:
$(document).on("click", ".arrow-top", function() {
  //event.preventDefault();
  $('html, body').animate({scrollTop:136}, '1000');
  return false;
});
/********** fin on("click", ".arrow-top", function() **********/

/*****************************************************************************************************************************
/// *************************************************** FIN DESPLAZAMIENTO ***************************************************
******************************************************************************************************************************
*/

}

/**
 * \brief Función que envuelve todos los eventos JQUERY con sus respectivos handlers.
 */
$(document).on("ready", todo());
/********** fin on("ready", todo()) **********/