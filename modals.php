<!-- Modal de cambio de FECHA -->
<div class="modal fade" id="modalCbioFecha" tabindex="-1" role="dialog" aria-labelledby="Modal" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document"> 
    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header tituloModal">
        <h4 class="modal-title">¡ATENCI&Oacute;N: CAMBIO DE FECHA!</h4>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close" tabindex="32"><span aria-hidden="true">&times;</span></button>
      </div>
      <div class="modal-body">
        ¡Esto <strong><i>puede</i></strong> generar diferencias con los reportes <strong>YA</strong> enviados!
        <table id="tblModalCbioFecha" class="tblModal">
          <tr>
            <th>Fecha Original:</th>
            <td><input type="text" id="mdlFechaActual" disabled="" size="6"></td>
          </tr>
          <tr>
            <th>Fecha Nueva:</th>
            <td><input type="text" id="mdlFechaNueva" disabled="" size="6" align="left"></td>
          </tr>
          <tr>
            <td> </td>
          </tr>
        </table>
        ¿Desea continuar?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" title="AGREGAR el movimiento" id="btnModalCbioFecha" tabindex="31">AGREGAR</button>
        <button type="button" class="btn btn-success" title="Cerrar ventana SIN realizar el movimiento" id="btnModalCbioFechaCerrar" data-dismiss="modal" tabindex="30">CANCELAR</button>
      </div>
    </div>   
  </div>
</div><!-- FIN Modal de cambio de FECHA -->