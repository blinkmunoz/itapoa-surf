import { useEffect, useState } from "react";
import "./styles.css";

const LAT = -26.11;
const LON = -48.63;

const weatherCodes = {
  0: "Limpo", 1: "Predominantemente limpo", 2: "Parcialmente nublado", 3: "Encoberto",
  45: "Nevoeiro", 48: "Nevoeiro com geada", 51: "Garoa leve", 53: "Garoa", 55: "Garoa forte",
  56: "Garoa gelada", 57: "Garoa forte gelada", 61: "Chuva leve", 63: "Chuva", 65: "Chuva forte",
  66: "Chuva gelada", 67: "Chuva forte gelada", 71: "Neve leve", 73: "Neve", 75: "Neve forte",
  77: "Granizo", 80: "Pancadas leves", 81: "Pancadas", 82: "Pancadas fortes",
  85: "Neve leve", 86: "Neve forte", 95: "Trovoada", 96: "Trovoada com granizo", 99: "Trovoada severa",
};

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function fetchConditions() {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,relative_humidity_2m,weather_code&timezone=America%2FSao_Paulo`;
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${LAT}&longitude=${LON}&hourly=wave_height,wave_period,sea_surface_temperature&timezone=America%2FSao_Paulo&forecast_days=2`;
        const [weatherResponse, marineResponse] = await Promise.all([
          fetch(weatherUrl, { signal: controller.signal }),
          fetch(marineUrl, { signal: controller.signal }),
        ]);
        if (!weatherResponse.ok) throw new Error(`Clima: erro HTTP ${weatherResponse.status}`);
        if (!marineResponse.ok) throw new Error(`Dados do mar: erro HTTP ${marineResponse.status}`);
        const [weather, marine] = await Promise.all([weatherResponse.json(), marineResponse.json()]);
        if (!weather.current || !marine.hourly) throw new Error("A API não retornou todos os dados esperados.");
        const currentTime = weather.current.time;
        let index = marine.hourly.time.findIndex((time) => time === currentTime);
        if (index < 0) index = marine.hourly.time.findIndex((time) => time >= currentTime);
        if (index < 0) index = 0;
        setData({ current: weather.current, marine: marine.hourly, marineIndex: index });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Erro ao buscar condições:", err);
          setError(err.message || "Não foi possível carregar as condições.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchConditions();
    return () => controller.abort();
  }, []);

  if (loading) return <div className="loading">Carregando condições do mar...</div>;
  if (error) return <div className="loading"><div><p>Não foi possível carregar os dados.</p><p>{error}</p><button onClick={() => window.location.reload()}>Tentar novamente</button></div></div>;

  const current = data.current;
  const marine = data.marine;
  const i = data.marineIndex;
  const value = (v, digits = 1) => Number.isFinite(v) ? v.toFixed(digits) : "—";
  const airTemp = current.temperature_2m;
  const feelsLike = current.apparent_temperature;
  const windSpeed = current.wind_speed_10m;
  const windDir = current.wind_direction_10m;
  const humidity = current.relative_humidity_2m;
  const waterTemp = marine.sea_surface_temperature?.[i];
  const waveHeight = marine.wave_height?.[i];
  const wavePeriod = marine.wave_period?.[i];
  const weatherCode = current.weather_code;
  const waveStatus = waveHeight == null ? "Ondas sem leitura" : waveHeight > 1.5 ? "Mar agitado" : waveHeight > 0.8 ? "Ondas moderadas" : "Mar tranquilo";
  const windStatus = windSpeed > 25 ? "Vento forte" : windSpeed > 12 ? "Vento moderado" : "Vento leve";

  return (
    <div className="page">
      <header className="topbar">
        <div><p className="eyebrow">Surf em</p><h1>Itapoá / SC</h1></div>
        <div className="chip"><span className="dot" /> Dados atualizados pela API</div>
      </header>
      <main className="container">
        <section className="hero">
          <div className="hero-text"><p className="label">Condição da praia</p><h2>{weatherCodes[weatherCode] || "Condições variáveis"}</h2><p className="summary">{waveStatus} • {windStatus} • sensação de {value(feelsLike)}°C</p></div>
          <div className="hero-card"><p>Altura das ondas</p><strong>{value(waveHeight)} m</strong><span>{value(wavePeriod, 0)} s de período</span></div>
        </section>
        <section className="stats-grid">
          <div className="card"><span>Temperatura do ar</span><strong>{value(airTemp)}°C</strong></div>
          <div className="card"><span>Temperatura da água</span><strong>{value(waterTemp)}°C</strong></div>
          <div className="card"><span>Vento</span><strong>{value(windSpeed, 0)} km/h</strong><small>Direção: {value(windDir, 0)}°</small></div>
          <div className="card"><span>Umidade</span><strong>{value(humidity, 0)}%</strong></div>
        </section>
        <section className="camera-panel">
          <div className="panel-header"><h3>Câmera ao vivo</h3><span>Webcam da praia</span></div>
          <div className="camera-box"><iframe src="https://www.youtube.com/embed/2R9h2U8E5kM" title="Câmera ao vivo da praia" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
          <div className="camera-note"><p>Se a transmissão não estiver disponível, substitua o endereço pelo link de incorporação de uma webcam pública ativa.</p></div>
        </section>
        <section className="info-panel"><h3>Resumo da sessão</h3><p>O mar está classificado como {waveStatus.toLowerCase()}, com {windStatus.toLowerCase()}. A água está em {value(waterTemp)}°C e o ar em {value(airTemp)}°C.</p><p>Consulte também as condições locais e a segurança da praia antes de entrar no mar. As previsões podem variar conforme o ponto da costa.</p></section>
      </main>
    </div>
  );
}

export default App;
