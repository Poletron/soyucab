const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Configuración de Base de Datos
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'db_soyucab',
    database: process.env.DB_NAME || 'db_soyucab',
    password: process.env.DB_PASS || 'password123',
    port: 5432,
});

// 2. Plantilla HTML (Estilo Figma UCAB)
// En un proyecto real, esto podría estar en un archivo .html separado
const getCertificateTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
    body { font-family: 'Montserrat', sans-serif; padding: 0; margin: 0; background: #f4f4f4; }
    .container { width: 800px; height: 600px; margin: 20px auto; background: white; padding: 40px; position: relative; border: 1px solid #ddd; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px solid #009DAE; padding-bottom: 20px; }
    .logo { color: #009DAE; font-size: 24px; font-weight: bold; letter-spacing: 2px; }
    .title { color: #333; font-size: 32px; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px; }
    .subtitle { color: #666; font-size: 16px; margin-top: 10px; }
    .content { text-align: center; margin-top: 60px; }
    .highlight { font-size: 20px; color: #333; margin: 10px 0; }
    .name { font-size: 36px; color: #009DAE; font-weight: bold; margin: 20px 0; }
    .score-box { background: #009DAE; color: white; display: inline-block; padding: 15px 40px; border-radius: 50px; font-size: 28px; font-weight: bold; margin-top: 30px; box-shadow: 0 4px 10px rgba(0, 157, 174, 0.3); }
    .footer { position: absolute; bottom: 40px; left: 40px; right: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
    .date { font-weight: bold; color: #333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SOY UCAB</div>
    </div>
    <div class="content">
      <div class="title">Certificado de Viralidad</div>
      <div class="subtitle">Otorgado al contenido de alto impacto en la comunidad</div>
      
      <p style="margin-top: 50px; font-size: 18px; color: #555;">Se certifica que la publicación creada por:</p>
      <div class="name">${data.autor}</div>
      
      <div class="highlight">"${data.titulo}"</div>
      
      <p style="margin-top: 30px;">Ha alcanzado un Score de Impacto de:</p>
      <div class="score-box">${data.score} Puntos</div>
    </div>
    
    <div class="footer">
      Documento generado automáticamente por el sistema SoyUCAB.<br>
      Fecha de emisión: <span class="date">${new Date().toLocaleDateString()}</span>
    </div>
  </div>
</body>
</html>
`;

// 3. Endpoint: Generar PDF
app.get('/api/report/cert-viralidad/:id', async (req, res) => {
    const contentId = req.params.id;

    try {
        // A. Buscar datos en la BD (Usamos tu Vista SQL o Query directo)
        const result = await pool.query(`
      SELECT 
        c.id_contenido,
        p.primer_nombre || ' ' || p.primer_apellido as autor,
        LEFT(c.texto_contenido, 50) || '...' as titulo,
        FN_CALCULAR_NIVEL_IMPACTO(c.id_contenido) as score
      FROM CONTENIDO c
      JOIN PERSONA p ON c.id_autor = p.id_miembro
      WHERE c.id_contenido = $1
    `, [contentId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Contenido no encontrado');
        }

        const data = result.rows[0];

        // B. Renderizar HTML con los datos reales
        const htmlContent = getCertificateTemplate(data);

        // C. Llamar a JsReport (Truco Stateless)
        const jsreportUrl = process.env.JSREPORT_URL || 'http://localhost:5488';

        console.log(`Generando reporte para ID ${contentId}... enviando a ${jsreportUrl}`);

        const response = await axios.post(`${jsreportUrl}/api/report`, {
            template: {
                content: htmlContent,
                engine: 'none', // No necesitamos handlebars si ya inyectamos las variables con JS
                recipe: 'chrome-pdf',
                chrome: {
                    landscape: true // Certificado horizontal
                }
            }
        }, {
            responseType: 'stream' // Importante: recibimos el archivo como flujo de datos
        });

        // D. Devolver el PDF al navegador
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificado_Viralidad_${contentId}.pdf`);
        response.data.pipe(res);

    } catch (err) {
        console.error('Error generando reporte:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint de prueba simple
app.get('/', (req, res) => {
    res.send('API SoyUCAB funcionando 🚀. Intenta ir a /api/report/cert-viralidad/1');
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en puerto ${PORT}`);
});