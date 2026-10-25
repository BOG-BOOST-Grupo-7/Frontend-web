import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        {/* Información */}
        <div className="footer-info">
          <span className="info-title">Información</span>

          <span className="info-item">
            <i className="fas fa-envelope"></i>
            Info@pulgassanalalejo.com
          </span>

          <span className="info-item">
            <i className="fas fa-phone"></i>
            (571) 281 56 15 - 283 10 73
          </span>
        </div>

        {/* Redes Sociales */}
        <div className="footer-social">
          <span className="social-title">Síguenos</span>

          <div className="social-links">
            <a
              href="https://www.youtube.com/@pulgasanalejo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-youtube"></i>
              <span>YouTube</span>
            </a>

            <a
              href="https://www.facebook.com/people/Mercado-de-las-Pulgas-San-Alejo/100092656710601/?mibextid=ZbWKwL"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-facebook"></i>
              <span>Facebook</span>
            </a>

            <a
              href="https://www.instagram.com/mercadodelaspulgassanalejo?igshid=YTQwZjQ0NmI0OA%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
              <span>Instagram</span>
            </a>

            <a
              href="https://www.tiktok.com/@mercadodepulgassanalejo?_t=8et0nnfkqcv&_r=1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-tiktok"></i>
              <span>TikTok</span>
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        Derechos de autor © 2025 BOG-BOOST. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;