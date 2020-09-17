<?php require_once('modals.php'); ?>
<!--<footer class="fixed-bottom">-->
<footer>
<!--
  <a href='#' class="arrow arrow-bottom"><img border='0'  src="images/arrowDown1.png" height="35" width="35" title="BAJAR" /></a>
  <a href='#' class="arrow arrow-top"><img border='0'  src="images/arrowUp1.png" height="35" width="35"  title="SUBIR" /></a>
  <p>
    <input id="usuarioSesion" name="usuarioSesion" type="text" value="" style="color: black; display: none">
    <input id="userID" name="userID" type="text" value="" style="color: black; display: none">
    <input id="timestampSesion" name="timestampSesion" type="text" value="" style="color: black; display: none">
    <input id="nombreGrafica" name="nombreGrafica" type="text" value="<?php echo $_SESSION["nombreGrafica"]?>" style="color: black; display: none">
  </p>
-->
  <div class='container'>
    <div class='row'>
			<div class="col-4">
<!--				<section id='hours' class='col-sm-4'>-->
				<section id='userInfo'>
					<hr class='d-block d-sm-none'>
					<?php
						if (!empty($_SESSION['user_id']))
							{

					?>
					Usuario:
					<font class='naranja'>
					<?php
							// Confirm the successful log-in
							echo "<a href='#modalPwd' title='Cambiar contraseña de acceso' class='naranja' id='user'>".strtoupper($_SESSION['username'])."</a> ";
							if ( isset($_SESSION['success']) ) {
								echo('<span style="color:white;margin:0">'.$_SESSION['success']."</span>");
								unset($_SESSION['success']);
							}
							echo  "<br>"
								. "<a href='#modalParametros' title='Cambiar los parámetros' class='naranja' id='param'>--- Cambiar Par&aacute;metros ---</a>";
					?>
					</font>
					<br>
					<font><a title="Salir del programa" href="logout.php">Salir</a></font>
						<?php
							}
						else {
						?>
							<br>
							Usuario:
							<font class='naranja'>NO logueado</font>
					<?php
						}
					?>
				</section>
			</div>
			<div class="col-4">
<!--				<section id='address' class='col-sm-4 d-none d-sm-block'>-->
				<section id='address' >
					Buenos Aires 486, Montevideo, Uruguay
					<br>29153304 / 29160318 / 29154195
					<br>Lunes a Viernes: 09:00 - 18:00
				</section>
			</div>
			<div class="col-4">
<!--				<section id='testimonials' class='col-sm-4'>-->
				<section id='version'>
					<hr class='d-block d-sm-none'>
					v.4.3<br>
					&copy; Copyright Juan M. Ortega 2017
					<hr class='d-block d-sm-none'>
				</section>
			</div>
    </div>
  </div>
</footer>