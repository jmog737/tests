<!-- Modal de cambio de FECHA -->
<div class="modal fade" id="modalCbioFecha" tabindex="-1" role="dialog" aria-labelledby="Modal" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document"> 
    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header tituloModal">
        <h4 class="modal-title">¡ATENCI&Oacute;N!: CAMBIO DE FECHA</h4>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close" tabindex="32"><span aria-hidden="true">&times;</span></button>
      </div>
      <div class="modal-body">
        ¡Esto <strong><i>puede</i></strong> generar diferencias con los reportes <strong>YA</strong> enviados!
        <form id="frmModalCbioFecha" class="tblModal">      
            <label for="mdlFechaActual">Original:</label>
            <input type="text" id="mdlFechaActual" disabled><br>
          
            <label for="mdlFechaNueva">Nueva:</label>
            <input type="text" id="mdlFechaNueva" disabled>     
        </form>
        <span>¿Desea continuar?</span>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" title="AGREGAR el movimiento" id="btnModalCbioFecha" tabindex="31">EDITAR</button>
        <button type="button" class="btn btn-success" title="Cerrar ventana SIN realizar el movimiento" id="btnModalCbioFechaCerrar" data-dismiss="modal" tabindex="30">CANCELAR</button>
      </div>
    </div>   
  </div>
</div><!-- FIN Modal de cambio de FECHA -->

<!-- Modal para cambiar la contraseña -->
<div class="modal fade" id="modalPwd" tabindex="-1" role="dialog" aria-labelledby="Modal" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document"> 
    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header tituloModal">
        <h4 class="modal-title">Cambiar Contraseña al usuario: <?php echo $_SESSION["username"]?></h4>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      </div>
      <div class="modal-body">
        <table id="tblModalPwd" class="tblModal">
<!--          <tr>
            <td>Nuevo nombre:</td>
            <td>
              <input type="text" id="nombreUser" name="nombreUser" class="agrandar">
            </td>
          </tr>-->
          <tr>
            <td>Introducir NUEVA contraseña:</td>
            <td>
              <input type="password" id="pw1" placeholder="Contraseña NUEVA" title="Ingresar la NUEVA contraseña" class="agrandar" autofocus="true">
            </td>
          </tr>
          <tr>
            <td>Repetir NUEVA contraseña:</td>
            <td>
              <input type="password" id="pw2" placeholder="Contraseña NUEVA" title="Repetir la NUEVA contraseña" class="agrandar">
            </td>
          </tr>
        </table>  
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-warning" title="Cambiar la contraseña" id="btnModal">Actualizar</button>
        <button type="button" class="btn btn-primary" title="Cerrar ventana SIN modificar la contraseña" data-dismiss="modal">Cerrar</button>
      </div>
    </div>   
  </div>
</div><!-- FIN Modal para cambiar la contraseña -->

<!-- Modal para cambiar los parámetros de visualización -->
<div class="modal fade" id="modalParametros" tabindex="-1" role="dialog" aria-labelledby="Modal" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document"> 
    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header tituloModal">
        <h4 class="modal-title">Cambiar Par&aacute;metros del usuario: <?php echo $_SESSION["username"]?></h4>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      </div>
      <div class="modal-body">
        <table id="tblModalParametros" class="tblModal">
<!--          <tr>
            <td>Nuevo nombre:</td>
            <td>
              <input type="text" id="nombreUser" name="nombreUser" class="agrandar">
            </td>
          </tr>-->
          <tr>
            <td>Tamaño de p&aacute;gina:</td>
            <td>
              <input type="text" id="pageSize" placeholder="NUEVO tamaño de página" title="Ingresar el NUEVO tamaño de p&aacute;gina" class="agrandar" autofocus="true">
            </td>
          </tr>
          <tr>
            <td>Tamaño Selects:</td>
            <td>
              <input type="text" id="tamSelects" placeholder="NUEVO tamaño de SELECTS" title="Ingresar el NUEVO tamaño de los selects" class="agrandar" autofocus="true">
            </td>
          </tr>
          <tr>
            <td>Historial General:</td>
            <td>
              <input type="text" id="tamHistorialGeneral" placeholder="NUEVO tamaño del historial general" title="Ingresar el NUEVO tamaño para el historial general" class="agrandar">
            </td>
          </tr>
          <tr>
            <td>Historial Producto:</td>
            <td>
              <input type="text" id="tamHistorialProducto" placeholder="NUEVO tamaño del historial del producto" title="Ingresar el NUEVO tamaño para el historial del producto" class="agrandar">
            </td>
          </tr>
        </table>  
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-warning" title="Cambiar par&acute;metros" id="btnParam">Actualizar</button>
        <button type="button" class="btn btn-primary" title="Cerrar ventana SIN modificar los par&aacute;metros" data-dismiss="modal">Cerrar</button>
      </div>
    </div>   
  </div>
</div><!-- FIN Modal para cambiar los parámetros -->