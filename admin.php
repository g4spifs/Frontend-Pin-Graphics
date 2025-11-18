<?php

// 1. Iniciar la sesión 
session_start();

// 2. VERIFICAR SI EL ADMIN ESTÁ LOGUEADO
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.html'); 
    exit;
}

// 3. Conexión ÚNICA a la DB 
$db_host = 'localhost';
$db_name = 'pin_graphics';
$db_user = 'root';
$db_pass = '';
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}

// 4. Lógica de ACCIONES
$mensaje = ''; // Para mostrar mensajes de éxito o error

// --- ACCIÓN A: Procesar ELIMINACIÓN (por GET) ---
// Verificamos si la URL tiene ?action=delete&id=...
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    try {
        $id_a_eliminar = $_GET['id'];
        $sql = "DELETE FROM productos WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id_a_eliminar]);
        
        // Usamos la sesión para que el mensaje sobreviva a la redirección
        $_SESSION['admin_mensaje'] = "<p class='notice' style='background:#dcfce7; color:#166534;'>Producto (ID: $id_a_eliminar) eliminado con éxito.</p>";

    } catch (PDOException $e) {
        $_SESSION['admin_mensaje'] = "<p class='notice' style='background:#fee2e2; color:#991b1b;'>Error al eliminar: " . $e->getMessage() . "</p>";
    }
    
    // Redirigir de vuelta a admin.php (limpio) para evitar re-eliminar si se recarga
    header('Location: admin.php');
    exit;
}

// --- ACCIÓN B: Procesar ADICIÓN ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recoger datos del formulario
    $id = $_POST['id'];
    $name = $_POST['name'];
    $brand = $_POST['brand'];
    $sku = $_POST['sku'];
    $price = (int)$_POST['price'];
    $img = $_POST['img'];
    $specs = $_POST['specs'];

    // Insertar en la base de datos
    try {
        $sql = "INSERT INTO productos (id, name, brand, sku, price, img, specs) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id, $name, $brand, $sku, $price, $img, $specs]);
        
        $mensaje = "<p class='notice' style='background:#dcfce7; color:#166534;'>¡Producto '$name' agregado con éxito!</p>";

    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { 
            $mensaje = "<p class='notice' style='background:#fee2e2; color:#991b1b;'>Error: El ID '$id' ya existe.</p>";
        } else {
            $mensaje = "<p class='notice' style='background:#fee2e2; color:#991b1b;'>Error: " . $e->getMessage() . "</p>";
        }
    }
}

// --- Mostrar mensaje de sesión y limpiarlo ---
if (isset($_SESSION['admin_mensaje'])) {
    $mensaje = $_SESSION['admin_mensaje'];
    unset($_SESSION['admin_mensaje']);
}

// 5. Lógica de LECTURA 
$productos_existentes = [];
try {
    // Pedimos todos los productos
    $stmt = $pdo->query("SELECT id, name, brand FROM productos ORDER BY name ASC");
    $productos_existentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $mensaje .= "<p class='notice' style='background:#fee2e2; color:#991b1b;'>Error al listar productos: " . $e->getMessage() . "</p>";
}

?>
<!doctype html>
<html lang="es-AR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PIN Graphics – Panel de Admin</title>
    <link rel="stylesheet" href="styles.css" />
    
    <style>
      .btn.danger {
        background-color: #dc2626; /* Rojo */
        border-color: #dc2626;
        color: white;
      }
      .btn.danger:hover {
        background-color: #b91c1c; /* Rojo oscuro */
        border-color: #b91c1c;
      }
    </style>
  </head>
  <body>
    <header>
      <div class="container bar">
        <div class="left">
          <img class="brand-logo" src="img/logo.png" alt="Logo PIN Graphics">
          <span class="brand-name">PIN&nbsp;Graphics</span>
        </div>
        <nav class="right">
          <ul>
            <li><a href="index.html">Ver Sitio</a></li>
            <li><a href="logout.php">Cerrar Sesión (<?php echo htmlspecialchars($_SESSION['admin_username']); ?>)</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main id="contenido" class="container">
      
      <h1 class="section-title">Cargar Nueva Tarjeta Gráfica</h1>
      <p class="notice">Completa el formulario para agregar un producto al catálogo.</p>

      <?php echo $mensaje; ?>

      <form method="POST" action="admin.php">
        <div class="form-row">
          <div>
            <label for="id">ID (ej: rtx4080super)</label>
            <input type="text" id="id" name="id" placeholder="rtx4080super" required>
          </div>
          <div>
            <label for="name">Nombre (ej: NVIDIA GeForce RTX 4080 Super)</label>
            <input type="text" id="name" name="name" placeholder="NVIDIA GeForce RTX 4080 Super" required>
          </div>
        </div>
        <div class="form-row">
          <div>
            <label for="brand">Marca</label>
            <input type="text" id="brand" name="brand" placeholder="NVIDIA" required>
          </div>
          <div>
            <label for="sku">SKU</label>
            <input type="text" id="sku" name="sku" placeholder="RTX4080S-16G" required>
          </div>
        </div>
        <div class="form-row">
          <div>
            <label for="price">Precio (sólo números, ej: 950000)</label>
            <input type="number" id="price" name="price" placeholder="950000" required>
          </div>
          <div>
            <label for="img">Ruta de Imagen (ej: img/rtx4080s.jpg)</label>
            <input type="text" id="img" name="img" placeholder="img/rtx4080s.jpg">
          </div>
        </div>
        <div>
          <label for="specs">Especificaciones (Una por línea)</label>
          <textarea id="specs" name="specs" rows="5" placeholder="Memoria: 16 GB GDDR6X&#10;Salidas: HDMI 2.1 / DisplayPort&#10;Fuente recomendada: 750 W"></textarea>
        </div>
        <div style="margin-top: 1rem;">
          <button class="btn primary" type="submit">Cargar Producto</button>
        </div>
      </form>

      <hr style="margin: 2rem 0;">

      <h2 class="section-title">Gestionar Productos Existentes</h2>
      
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Marca</th>
              <th>ID (SKU)</th>
              <th class="center">Acción</th>
            </tr>
          </thead>
          <tbody data-product-list>
            <?php if (empty($productos_existentes)): ?>
              <tr>
                <td colspan="4" class="center">No hay productos cargados.</td>
              </tr>
            <?php else: ?>
              <?php foreach ($productos_existentes as $producto): ?>
                <tr>
                  <td><?php echo htmlspecialchars($producto['name']); ?></td>
                  <td><?php echo htmlspecialchars($producto['brand']); ?></td>
                  <td><?php echo htmlspecialchars($producto['id']); ?></td>
                  <td class="center">
                    <a href="admin.php?action=delete&id=<?php echo htmlspecialchars($producto['id']); ?>" 
                       class="btn danger" 
                       data-delete-id="<?php echo htmlspecialchars($producto['id']); ?>"
                       data-delete-name="<?php echo htmlspecialchars($producto['name']); ?>">
                      Eliminar
                    </a>
                  </td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>

    </main>

    <script>
      const productList = document.querySelector('[data-product-list]');
      
      if (productList) {
        productList.addEventListener('click', function(e) {
          // Detectar clic solo en el botón de eliminar
          const deleteButton = e.target.closest('[data-delete-id]');
          if (!deleteButton) return;

          // Prevenir que el link se active inmediatamente
          e.preventDefault(); 
          
          const id = deleteButton.dataset.deleteId;
          const name = deleteButton.dataset.deleteName || 'este producto';
          
          // Mostrar ventana de confirmación
          const confirmar = confirm(`¿Estás seguro de que querés eliminar el producto?\n\n"${name}" (ID: ${id})\n\nEsta acción no se puede deshacer.`);

          // Si el usuario confirma, proceder con la eliminación
          if (confirmar) {
            // Redirigir a la URL de borrado (la que estaba en el 'href' original)
            window.location.href = deleteButton.href;
          }
          // Si no confirma, no pasa nada.
        });
      }
    </script>

  </body>
</html>