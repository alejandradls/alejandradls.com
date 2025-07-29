<?php
$recaptchaSecret = '6LdAuPoqAAAAAFEOBaBxMa5HNfnPMeVe3iIJdqWj'; // Coloca aquí tu clave secreta real
$recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';
$lang = $_POST['lang'] ?? 'es'; // Detecta idioma desde el formulario (es o en)

// Validación básica: ¿se envió el token?
if (empty($recaptchaResponse)) {
    $msg = $lang === 'en'
        ? '❌ reCAPTCHA token not sent. Please try again.'
        : '❌ reCAPTCHA no enviado. Intenta de nuevo.';

    echo json_encode([
        'success' => false,
        'message' => $msg
    ]);
    exit;
}

// Verifica el token con Google
$verifyUrl = "https://www.google.com/recaptcha/api/siteverify?secret={$recaptchaSecret}&response={$recaptchaResponse}";
$verifyResponse = file_get_contents($verifyUrl);
$responseData = json_decode($verifyResponse);
$lang = $_POST["lang"];

// ¿La respuesta fue exitosa?
if (!$responseData || !$responseData->success) {
    $msg = $lang === 'en'
        ? '❌ Error: reCAPTCHA verification failed.'
        : '❌ Error: reCAPTCHA no fue verificado correctamente.';

    echo json_encode([
        'success' => false,
        'message' => $msg
    ]);
    exit;
}

// reCAPTCHA validado correctamente. Aquí puedes continuar con el resto del proceso.
?>

<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $lang = $_POST["lang"];
  $name = htmlspecialchars($_POST["name"]);
  $email = htmlspecialchars($_POST["email"]);
  $phone = htmlspecialchars($_POST["phone"]);
  $message = htmlspecialchars($_POST["message"]);
  $plan = htmlspecialchars($_POST["plan"]);

  $to = "alejandrairma@gmail.com"; // cambia esto por tu correo real
  $subject = $lang === "es" ? "Nuevo mensaje de sitio web" : "New message from your website";
  $body = "Nombre: $name\nCorreo: $email\nTeléfono: $phone\nPlan: $plan\n\nMensaje:\n$message";
  $headers = "From: Alejandra DLS <me@alejandradls.com>\r\n";
  $headers .= "Reply-To: $email\r\n";

  if (mail($to, $subject, $body, $headers)) {
    echo json_encode([
      "success" => true,
      "mensaje" => $lang === "es" ? "✅ ¡Gracias! Tu mensaje ha sido enviado." : "✅ Thank you! Your message has been sent."
    ]);
  } else {
    echo json_encode([
      "success" => false,
      "mensaje" => $lang === "es" ? "❌ Hubo un error. Intenta de nuevo más tarde." : "❌ There was an error. Please try again later."
    ]);
  }
} else {
  echo json_encode([
    "success" => false,
    "mensaje" => "❌ Acceso no permitido."
  ]);
}

?>