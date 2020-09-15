<?php
require_once "pdo.php";

session_start();

if (!isset($_SESSION['user_id'])) {
  die("ACCESS DENIED.");
}

// If the user requested logout go back to index.php
if (isset($_POST['cancel'])) {
  header('Location: index.php');
  return;
}

// Guardian: Make sure that profile_id is present
if (!isset($_REQUEST['profile_id'])) {
  $_SESSION['error'] = "Missing profile_id.";
  header('Location: index.php');
  return;
}

$stmt = $pdo->prepare("SELECT * FROM profile where profile_id = :xyz and user_id = :uid");
$stmt->execute(array(":xyz" => $_REQUEST['profile_id'], ":uid" => $_SESSION['user_id']));
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if ( $row === false ) {
  $_SESSION['error'] = 'Could not load profile.';
  header( 'Location: index.php' ) ;
  return;
}

if (isset($_POST['delete']) && isset($_POST['profile_id'])) {
  $sql = "DELETE FROM profile WHERE profile_id = :zip";
  $stmt = $pdo->prepare($sql);
  $stmt->execute(array(':zip' => $_POST['profile_id']));
  $_SESSION['success'] = 'Profile deleted';
  header( 'Location: index.php' ) ;
  return;
}

?>

<!DOCTYPE html>
<html>

<head>
  <?php require_once "jquery_bootstrap.php"; ?>
  <title>Juan Martin Ortega's Profile Delete</title>
  <meta charset="utf-8">
</head>

<body>
  <div class="container">

    <h1>Deleting Profile</h1>

    <p>Confirm Deleting Profile?</p>

    <form method="post" action="delete.php">
      <label for="fn">First Name:</label>
      <span id="fn" style="color:red"><?= htmlentities($row['first_name']);?></span><br>
      <label for="ln">Last Name:</label>
      <span id="ln" style="color:red"><?= htmlentities($row['last_name']);?></span><br>
      <input type="hidden" name="profile_id" value="<?= $row['profile_id'] ?>">
      <input type="submit" value="Delete" name="delete">
      <input type="submit" value="Cancel" name="cancel">
    </form>
    
</div>
</body>
</html>
