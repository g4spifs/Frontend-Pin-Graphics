<?php

session_start();

// Preparar una respuesta por defecto
$respuesta = [
    'loggedIn' => false,
    'isAdmin' => false,
    'nombre' => null
];

// 1. Revisar si hay un ADMIN logueado 
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $respuesta['loggedIn'] = true;
    $respuesta['isAdmin'] = true;
    $respuesta['nombre'] = $_SESSION['admin_username'] ?? 'Admin';
}
// 2. Si no es admin, revisar si hay un CLIENTE logueado
elseif (isset($_SESSION['cliente_id'])) {
    $respuesta['loggedIn'] = true;
    $respuesta['isAdmin'] = false;
    $respuesta['nombre'] = $_SESSION['cliente_nombre'] ?? 'Usuario';
}

// 3. Devolver la respuesta como JSON
header('Content-Type: application/json');
echo json_encode($respuesta);

?>