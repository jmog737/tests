<?php
/**
******************************************************
*  @file enviarMails.php
*  @brief Archivo con las funciones para el envío de mails.
*  @author Juan Martín Ortega
*  @version 1.0
*  @date Noviembre 2017
*
*******************************************************/

function enviarMail($para, $copia, $ocultos, $asunto, $cuerpo, $correo, $adjunto, $path)
  {
  require_once('..\..\mail\class.phpmailer.php');

  //************* DATOS DEL USUARIO Y DEL SERVIDOR **************************************************
  $host = "mail.emsa.com.uy";
  $usuario = "ensobrado@emsa.com.uy";
  $deMail = "ensobrado@emsa.com.uy";
  $deNombre = "Stock Manager";
  $pwd = "em123sa";
  $responderMail = "ensobrado@emsa.com.uy";
  $responderNombre = "Stock Manager";
  //**************************************************************************************************

  $mail = new PHPMailer(true);
  $mail->IsSMTP();

  try
      {
      //Datos del HOST:
      $mail->Host       = $host; // SMTP server
      $mail->SMTPAuth   = true;                  // enable SMTP authentication
      $mail->Host       = $host; // sets the SMTP server
      $mail->Port       = 25;                    // set the SMTP port for the GMAIL server

      //Datos del usuario del correo:
      $mail->Username   = $usuario; // SMTP account username
      $mail->Password   = $pwd;        // SMTP account password

      //Direcciones del remitente y a quien responder:
      $mail->SetFrom($deMail, $deNombre);
      $mail->AddReplyTo($responderMail, $responderNombre);

      foreach ($para as $ind => $dir)
          {
          //Direcciones a las cuales se manda el mail (Para):
          $mail->AddAddress($dir, $ind);
          }

      if (count($copia)>0)
          {    
          foreach ($copia as $ind => $dir)
              {
              //Direcciones a las cuales se manda el mail (Cc):
              $mail->AddCC($dir, $ind);
              }
          }    

      if (count($ocultos)>0)
          {   
          foreach ($ocultos as $ind => $dir)
              {
              //Direcciones a las cuales se manda el mail (Bcc):
              $mail->AddBCC($dir, $ind);
              }
          }
      // Activo condificacción utf-8
      //$mail->CharSet = 'UTF-8';
      $mail->CharSet = 'ISO-8859-1';

      //$asunto = "=?ISO-8859-1?B?".$asunto."=?=";
      //Datos del mail a enviar:
      $mail->Subject = $asunto;echo $mail->Subject."<br>";

      $mail->AltBody = 'Para ver este mensaje por favor use un cliente de correo con compatibilidad con HTML!'; // optional - MsgHTML will create an alternate automatically
      $mail->MsgHTML($cuerpo);

      if (!empty($adjunto))
          {
          $mail->AddAttachment($path, $adjunto);
          }

      $mail->Send();

      $mensajeMail = "Mail con el $correo enviado.";
      }
  catch (phpmailerException $e)
      {
      $mensajeMail = "Error al enviar el mail con el $correo. Por favor verifique.<br>".$e->errorMessage();
      }
  catch (Exception $e)
      {
      $mensajeMail = $mensajeMail." ".$e->getMessage();
      }
  return $mensajeMail;
}

?>