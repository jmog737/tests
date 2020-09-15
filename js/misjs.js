/**
  \brief Función que valida que el parámetro pasado sea un entero.
  @param numero Dato a validar.                  
*/
function validarEntero(numero) {//alert(valor);
	console.log("INICIO validarEntero");
  if (isNaN(numero)){
    //alert ("Ups... " + numero + " no es un número.");
		console.log("FIN validarEntero: no es un número");
    return false;
  } 
  else {
    if (numero % 1 == 0) {
      //alert ("Es un numero entero");
			console.log("FIN validarEntero: es entero");
      return true;
    } 
    else {
      //alert ("Es un numero decimal");
			console.log("FIN validarEntero: es decimal");
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
/********** fin existeUrl(url) **********/

/**
  \brief Función que oculta el p para donde se muestra el resumen del producto                
*/
function ocultarResumen(){
	$("#resumen").attr("display", "none");
}
/********** fin ocultarResumen() **********/

/**
  \brief Función que formatea la fecha según cual sea el destino:
	@param fecha String Fecha a formatear.
	@param destino String Destino para la fecha (el oigen será el opuesto).
*/
function formatearFecha(fecha, destino){
	var separador = '';
	var nuevoSeparador = '';
	if (destino === "db"){
		separador = "/";
		nuevoSeparador = "-";
	}
	else {
		separador = "-";
		nuevoSeparador = "/";
	}
	var splitted = fecha.split(separador);
	var fechaFormateada = splitted[2]+nuevoSeparador+splitted[1]+nuevoSeparador+splitted[0];
	console.log("Fecha ingresada: "+fecha+"\nFecha formateada: "+fechaFormateada);
	return fechaFormateada;
}
/********** fin ocultarResumen() **********/

/**
 * 
 * @param {String} str String con la cadena de texto a buscar como parte del producto.
 * @param {String} id String con el id del campo luego del cual se tienen que agregar los datos.
 * @param {String} seleccionado String que indica, si es que es disitinto de nulo, el producto seleccionado.
 * \brief Función que muestra las sugerencias de los productos disponibles.
 */
function showHint(str, id, seleccionado) {
	console.log("INICIO showHint...");
  if (str.length === 0) { 
		console.log("Sin texto ingresado aún");
    $("#hint").remove();
    $("#snapshot").remove();
    $("#stock").remove();
    $("#promedio1").remove();
    $("#promedio2").remove();
    $("#ultimoMov").remove();
		$("#comentHint").remove();
    $("#historial").remove();
    $("#producto").val("");
		ocultarResumen();
    return;
  } 
  else {
		var url = "data/selectQuery.php";
		console.log("Por ejecutar consulta:");
		    
    var query = "select idprod, entidad, nombre_plastico, codigo_emsa, codigo_origen, bin, snapshot, stock, alarma1, alarma2, comentarios, ultimoMovimiento from productos where (productos.nombre_plastico like '%"+str+"%' or productos.codigo_emsa like '%"+str+"%' or productos.codigo_origen like '%"+str+"%' or productos.bin like '%"+str+"%' or productos.entidad like '%"+str+"%' or productos.idprod like '%"+str+"%') and estado='activo' order by productos.entidad asc, productos.nombre_plastico asc";
		
		//console.log(query);
		
    if (seleccionado !== ''){
      var produsTemp = seleccionado.split(',');
    }
	  
    $.getJSON(url, {query: ""+query+""}).done(function(request) {
      var sugerencias = request.resultado;
      var totalSugerencias = parseInt(request.rows, 10);
			
			console.log("Terminó OK consulta: \nTotal sugerencias: "+totalSugerencias);
			
      $("[name='hint']").remove();
      $("#ultimoMov").remove();
			$("#comentHint").remove();
      $("#historial").remove();
      
      var mostrar = '';
      var unico = '';
      if (totalSugerencias >= 1) {
				$("#resumen").attr("display", "block");
        if ((parseInt($("#productoGrafica").length, 10) > 0)||(parseInt($("#producto").length, 10) > 0)){
          mostrar = '<select name="hint" id="hint" size="15">';
        }
        else {
          mostrar = '<select name="hint" id="hint" multiple size="15">';
        }
				
        if (totalSugerencias > 1) {
          mostrar += '<option value="NADA" name="NADA">--Seleccionar--</option>';
        }
				
				//Recorro resultado de la consulta y genero las option:
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
          
					//Resaltado de la opción en caso de tener un comentario el producto, de tenerlo, según ciertos patrones:
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
					//FIN Resaltado de la opción en caso de tener un comentario el producto, de tenerlo, según ciertos patrones:
          
					mostrar += '<option value="'+sugerencias[i]["idprod"]+'" name="'+snapshot+'" '+resaltarOption+' stock='+sugerencias[i]["stock"]+' alarma1='+sugerencias[i]["alarma1"]+' alarma2='+sugerencias[i]["alarma2"]+' comentarios="'+sugerencias[i]["comentarios"]+'" ultimoMov="'+sugerencias[i]["ultimoMovimiento"]+'" '+sel+ '>[' + sugerencias[i]["entidad"]+': '+codigo_emsa+'] --- '+sugerencias[i]["nombre_plastico"] + '</option>';
        }
				//FIN Recorro resultado de la consulta y genero las option
				
        mostrar += '</select>';
      }// FIN if en caso haya resultados en la consulta
      else {
        mostrar = '<p name="hint" id="sinSugerencias" value="">No se encontraron sugerencias!</p>';
      }
			
			//Se agrega el select con las opciones recuperadas en la consulta (si las hay)
			$("#resumen").append(mostrar);
			
      /// Agregado a pedido de Diego para que se abra el select automáticamente:
      var length = parseInt($('#hint> option').length, 10);
			var limiteSelects = 10;
			
      if (length > limiteSelects) {
        length = limiteSelects;
      }
      else {
        length;
      }
      if (length > totalSugerencias){
        length = totalSugerencias + 1;
      }
      //open dropdown:
      $("#hint").attr('size',length);
      
      if (seleccionado !== ''){
        $("#hint").focus();
      }
      else {    
        switch(id) {
          case '#resumen': $("#producto").focus();
                            break;
          case '#productoStock':  $("#productoStock").focus();
                                  break;
          case '#productoMovimiento': $("#productoMovimiento").focus(); 
                                      break;
          default:  break;  
        }     
      }
      
      if (totalSugerencias === 1){
        ///Comentado por ahora pues Diego prefiere que NO salte de forma automática:
        //$("#comentarios").focus();
        $("#hint option[value='"+unico+"'] ").attr("selected", true);
        //$("#cantidad").focus();
      }
			console.log("FIN showHint");
    });
		
  }
	console.log("FIN showHint...");
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
 // var limiteHistorialProducto = parseInt($("#limiteHistorialProducto").val(), 10);
	var limiteHistorialProducto = 3;
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
        mostrar += "<a href='editMovement.php?id="+datos[i]["idmov"]+"' target='_blank' class='linkHistorialProducto'>"+j+": "+datos[i]["fecha"]+" "+datos[i]["hora"]+" - "+datos[i]["tipo"]+' ('+datos[i]["estado"]+')'+": <span class='negritaGrande'>"+datos[i]["cantidad"]+"</span>"+comentario+"</a><br>";
      }
      var popover = '<a role="button" tabindex="0" id="historial" class="btn btn-danger" title="Historial de '+datos[i]["nombre"]+'" data-container="body" data-toggle="popover" data-trigger="focus" data-placement="right" data-content="'+mostrar+'">Historial</a>';
      
      $("#historial").popover('dispose');
      $("#historial").remove();
      if (parseInt($("#comentHint").length, 10) > 0) {
        $("#comentHint").after(popover);
      }
      else {
        $("#ultimoMov").after(popover);
      } 
			//alert(popover);
      $("#historial").popover({html:true});
    }
    else {
      ///ver si avisar que no hay movimientos.
    }
  });
}
/********** fin mostrarHistorial(prod) **********/

/**
* \brief Función que realiza la validación del from para AGREGAR MOVIMIENTO.
*/
function validarAgregar() {
	console.log("INICIO validarAgregar");
	var seguir = false;
  var cantidad = $("#cantidad").val();
  var fecha = $("#fecha").val();
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
		console.log("Falla validación: fecha NO ingresada");
    alert('Por favor ingrese la fecha del movimiento.');
    $("#fecha").focus();
    seguir = false;
  }
  else {
    if (fecha > hoyFecha){
			console.log("Falla validación: fecha futura");
      alert('La fecha seleccionada es posterior al día de hoy. \n¡Por favor verifique!.');
      $("#fecha").focus();
      seguir = false;
    }
    else {
			console.log("Seleccionado: "+$("#hint").find('option:selected').val());
			if ($("#producto").val() === '')	{
				console.log("Falla validación: NO se ingresó sugerencia");					
				alert('Debe ingresar algún texto para desplegar sugerencias.');	
				$("#producto").focus();
				seguir = false;
			}
			else {
				if (($("#hint").find('option:selected').val() === "NADA") || ($("#hint").find('option:selected').val() === undefined)){
					console.log("Falla validación: producto NO elegido: "+$("#hint").find('option:selected').val());					
					alert('Debe seleccionar el nombre del plástico.');	
					$("#hint").focus();
					$("#hint option:first").attr("selected", true);
					seguir = false;
				}
				else
					{
					console.log("Cantidad: "+cantidad+"\nTipo: "+typeof +cantidad);
					if ((cantidad === null)||(cantidad === '')){
						console.log("Falla validación: cantidad NO ingresada ó es un string");
						alert('Hay que ingresar un entero para la cantidad');
						$("#cantidad").focus();
						seguir = false;
					}
					else {
						var cant = validarEntero(cantidad);
						if (cant){
							cantidad = parseInt(cantidad, 10);
						}
						if ((cantidad <= 0) || !cant)
							{
							console.log("Falla validación: cantidad NO es entero ó es menor a 1");
							alert('La cantidad de tarjetas debe ser un ENTERO mayor o igual a 1.');
							$("#cantidad").val("");
							$("#cantidad").focus();
							seguir = false;
						} 
						else
							{	
							// Agrego inputs no visibles para pasar la info extra necesaria para validar el movimiento (stock, alarmas):
							var nombreProd = "<input type='text' style='display:none' value='"+$("#hint").find('option:selected').text()+"' name='nombreProd'>";	
							var stck = "<input type='text' style='display:none' value='"+$("#hint").find('option:selected').attr("stock")+"' name='stock'>";
							var al1 = "<input type='text' style='display:none' value='"+$("#hint").find('option:selected').attr("alarma1")+"' name='al1'>";
							var al2 = "<input type='text' style='display:none' value='"+$("#hint").find('option:selected').attr("alarma2")+"' name='al2'>";
							$("#btnContainer").append(nombreProd+stck+al1+al2);
							console.log("Validación exitosa:\n\nFecha: "+fecha+"\nProducto: "+$("#hint").find('option:selected').text()+" (id: "+$("#hint").find('option:selected').val()+")\nTipo: "+$("#tipo").find('option:selected').val()+"\nCantidad: "+cantidad+"\nStock: "+$("input[name='stock']").val()+"\nAlarma 1: "+$("input[name='al1']").val()+"\nAlarma 2: "+$("input[name='al2']").val()+"\nComentarios: "+$("#comentarios").val());
							seguir = true;
						}// else cantidad no entero
					}// cantidad no ingresada
      	}// else plástico no seleccionado
			}// else texto para sugerencias no ingresado
    }// else fecha menor a hoy
  }// else fecha no seleccionada
	//seguir = false;
  if (seguir) return true;
  else return false;
}
/********** fin validarAgregar() **********/

/**
\brief Función que se ejecuta al cargar la página.
En la misma se ve primero desde que página se llamó, y en base a eso
se llama a la función correspondiente para cargar lo que corresponda (actividades, referencias, etc.)
Además, en la función también están los handlers para los distintos eventos jquery.
*/
function todo () {
	///Disparar funcion al cambiar el elemento elegido en el select con las sugerencias para los productos.
	///Cambia el color de fondo para resaltarlo, carga un snapshot del plástico si está disponible, y muestra
	///el stock actual.
	$(document).on("change focusin", "#hint", function (){
		//verificarSesion('', 's');
		console.log("Opción seleccionada")
		var rutaFoto = 'images/snapshots/';
		var nombreFoto = $(this).find('option:selected').attr("name");

		var prod = $(this).find('option:selected').val();
		if (prod === "NADA"){
			//$("[name='hint']").remove();
			$("#stock").remove();
			$("#snapshot").remove();
			$("#promedio1").remove();
			$("#promedio2").remove();
      $("#ultimoMov").remove();
			$("#comentHint").remove();
      $("#historial").remove();
		}
		
		//Recupero los parámetros de la opción seleccionada:
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
		console.log("Stock: "+typeof(stock));
		// Resaltado del stock según los niveles de las alarmas:
		var resaltado = '';
		if ((stock < alarma1) && (stock > alarma2)){
			resaltado = 'alarma1';
		}
		else {
			if (stock < alarma2) {
				resaltado = 'alarma2';
			}
			else {
				resaltado = 'sinAlarma';
			}  
		}
		// FIN Resaltado del stock según los niveles de las alarmas
		
		console.log("Parámetros:\nStock: "+stock+"\nAlarma1: "+alarma1+"\nAlarma2: "+alarma2+"\nÚltimo Movimiento: "+ultimoMovimiento+"\nComentarios: "+comentarios);
		//FIN recupero los parámetros de la opción seleccionada

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
				///*********** FIN PRUEBAS PROMEDIO CONSUMOS **********************************

				var mostrar = '<p id="stock" name="hint"><strong>Stock actual: </strong><span class="'+resaltado+'">'+stock.toLocaleString("es-US")+'</span></p>';
				var dire = rutaFoto+nombreFoto;
				if (existeUrl(dire)){
					mostrar += '<img id="snapshot" name="hint" src="'+rutaFoto+nombreFoto+'" alt="Foto de la tarjeta seleccionada." height="127" width="200"></img>';
				}
				mostrar += '<p id="promedio1" name="hint"><strong>Total Consumos (&uacute;lt. '+periodoDias1+' d&iacute;as):</strong><span> '+totalConsumos1.toLocaleString()+' '+unidades1+' ('+promedioMensual1.toLocaleString()+' '+unidadesPromedio1+')</span></p>';
				mostrar += '<p id="promedio2" name="hint"><strong>Total Consumos (&uacute;lt. '+periodoDias2+' d&iacute;as):</strong> <span> '+totalConsumos2.toLocaleString()+' '+unidades2+' ('+promedioMensual2.toLocaleString()+' '+unidadesPromedio2+')</span></p>';
				mostrar += '<p id="ultimoMov" name="ulitmoMov"><strong>Último Movimiento: <span>'+ultimoMovimiento+'</span></strong></p>';
				
				// Resaltado de los comentarios en caso de tenerlos:
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
				// FIN Resaltado de los comentarios en caso de tenerlos:
				
				$("#hint").after(mostrar);
				setTimeout(function(){mostrarHistorial(prod)}, 10);
				//mostrarHistorial(prod);   
			});  
		});    		
	});
	/********** fin on("change focusin", "#hint", function () **********/ 
	
	///Disparar función al hacer CLICK a uno de los links del POPOVER con el HISTORIAL PRODUCTO.
	///Esto hace que se cierre el popover.
	$(document).on("click", ".linkHistorialProducto", function(){
		$("#historial").popover('hide');
	});
	/********** fin on("click", ".linkHistorialGeneral", function() **********/
	
	$(document).on("click", "tr", function() { 
		if($(this).attr('href') !== undefined){ 
			document.location = $(this).attr('href'); 
		}
	});

}

/**
 * \brief Función que envuelve todos los eventos JQUERY con sus respectivos handlers.
 */
$(document).on("ready", todo());
/********** fin on("ready", todo()) **********/