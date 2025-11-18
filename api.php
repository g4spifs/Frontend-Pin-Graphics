<?php

// 1. Configuración de la Base de Datos
$db_host = 'localhost';     // Servidor 
$db_name = 'pin_graphics';  // El nombre de la DB 
$db_user = 'root';          // Usuario por defecto en XAMPP
$db_pass = '';              // Contraseña por defecto en XAMPP 

// 2. Conexión usando PDO 
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    // Configurar PDO para que lance excepciones en caso de error
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Si la conexión falla, detenemos todo y mostramos un error en formato JSON
    http_response_code(500); // Error interno del servidor
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $e->getMessage()]);
    exit; // Detener la ejecución del script
}

// 3. Consulta y procesamiento
$catalog = []; //guardamos el catálogo final
try {
    $stmt = $pdo->query("SELECT * FROM productos");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $specs_array = explode("\n", $row['specs']);
        
        // Asignamos el array de specs de vuelta a la fila
        $row['specs'] = $specs_array;
        
        // Construimos el catálogo con el 'id' del producto como clave,
        // exactamente igual a como lo tenías en tu 'CATALOG' de JS.
        $catalog_id = $row['id'];
        $catalog[$catalog_id] = $row;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al consultar los productos: ' . $e->getMessage()]);
    exit;
}

// 4. Enviar la respuesta
// Le decimos al navegador que estamos enviando contenido JSON
header('Content-Type: application/json');
// Convertimos nuestro array de PHP a una cadena de texto JSON y la enviamos
echo json_encode($catalog);

?>