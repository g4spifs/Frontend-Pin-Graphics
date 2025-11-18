<?php

session_start();

// Guardar si era admin antes de destruir la sesión
$era_admin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

// Destruir todas las variables de sesión
$_SESSION = array();

// Destruir la sesión completamente
session_destroy();

// Redirigir según el tipo de usuario
if ($era_admin) {
    // Si era admin, llevarlo al login
    header('Location: login.html?logout=1');
} else {
    // Si era cliente, llevarlo al inicio
    header('Location: index.html');
}
exit;

?>