<?php
require_once "pdo.php";
require_once "util.php";

session_start();

// Guardian: Make sure that profile_id is present
if (!isset($_REQUEST['profile_id'])) {
  $_SESSION['error'] = "Missing profile_id";
  header('Location: index.php');
  return;
}

$stmt = $pdo->prepare("SELECT * FROM profile where profile_id = :xyz");
$stmt->execute(array(":xyz" => $_GET['profile_id']));
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if ( $row === false ) {
  $_SESSION['error'] = 'Could not load profile.';
  header( 'Location: index.php' ) ;
  return;
} else {
    $fn = htmlentities($row['first_name']);
    $ln = htmlentities($row['last_name']);
    $em = htmlentities($row['email']);
    $hl = htmlentities($row['headline']);
    $sm = htmlentities($row['summary']);
  }

$positions = loadPositions($pdo, $_REQUEST['profile_id']);  

?>

<!DOCTYPE html>
<html>

<head>
  <?php require_once "jquery_bootstrap.php"; ?>
  <title>Juan Martin Ortega's Profile View</title>
  <meta charset="utf-8">
</head>

<body>
  <div class="container">

    <h1>Profile Information</h1>

    <p><label for="first_name">First Name: </label><span id="first_name"><?= ' '.$fn ?></span></p>
    <p><label for="last_name">Last Name: </label><span id="last_name"><?= ' '.$ln ?></span></p>
    <p><label for="email">Email: </label><span id="email"><?= ' '.$em ?></span></p>
    <p><label for="headline">Headline: </label><br><span id="headline"><?= $hl ?></span></p>
    <p><label for="summary">Summary: </label><br><span id="summary"><?= $sm ?></span></p>
    <p>Positions:<br>
      <ul>
    <?php 
    foreach ($positions as $j => $row) {
      echo '<li>'.htmlentities($row["year"]).': '.htmlentities($row["description"]).'</li>';
    }
    ?>
      </ul>
    </p>
    <p><a href="index.php">Done</a></p>

  </div>
</body>
</html>