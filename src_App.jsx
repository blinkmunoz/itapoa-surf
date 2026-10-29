import { useEffect, useState } from "react";

const LAT = -26.11;
const LON = -48.63;

const weatherCodes = {
  0: "Limpo",
  1: "Parcialmente nublado",
  2: "Nublado",
  3: "Encoberto",
  45: "Nevoeiro",
  48: "Nevoeiro com geada",
  51: "Garoa leve",
  53: "Garoa",
  55: "Garoa forte",
  56: "Garoa gelada",
  57: "Garoa forte gelada",
  61: "Chuva leve",
  63: "Chuva",
  65: "Chuva forte",
  66: "Chuva gelada",
  67: "Chuva forte gelada",
  71: "Neve leve",
  73: "Neve",
  75: "Neve forte",
  77: "Granizo",
  80: "Pancadas leves",
  81: "Pancadas",
  82: "Pancadas fortes",
  85: "Neve leve",
  86: "Neve forte",
  95: "Trovoada",
  96: "Trovoada com granizo",
  99: "Trovoada severa",
};

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,relative_humidity_2m,weather_code,sea_surface_temperature&hourly=wave_height,wave_period,wind_speed_10m,temperature_2m&daily=sunrise,sunset&timezone=auto`
        );

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Erro ao buscar dados meteorológicos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return <div className="loading">Carregando condições do mar...</div>;
  }

  const current = data?.current;
  const hourly = data?.hourly;

  const airTemp = current?.temperature_2m ?? 0;
  const feelsLike = current?.apparent_temperature ?? 0;
  const windSpeed = current?.wind_speed_10m ?? 0;
  const windDir = current?.wind_direction_10m ?? 0;
  const humidity = current?.relative_humidity_2m ?? 0;
  const waterTemp = current?.sea_surface_temperature ?? 0;
  const waveHeight = hourly?.wave_height?.[0] ?? 0;
  const wavePeriod = hourly?.wave_period?.[0] ?? 0;
  const weatherCode = current?.weather_code ?? 0;

  const waveStatus =
    waveHeight > 1.5
      ? "Mar agitado"
      : waveHeight > 0.8
        ? "Mar bom"
        : "Mar tranquilo";

  const windStatus =
    windSpeed > 25
      ? "Vento forte"
      : windSpeed > 12
        ? "Vento moderado"
        : "Vento leve";

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Surf em</p>
          <h1>Itapoá / SC</h1>
        </div>

        <div className="chip">
          <span className="dot" />
          Tempo real
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-text">
            <p className="label">Condição da praia</p>
            <h2>{weatherCodes[weatherCode] || "Condições variáveis"}</h2>
            <p className="summary">
              {waveStatus} • {windStatus} • sensações de {feelsLike.toFixed(1)}°C
            </p>
          </div>

          <div className="hero-card">
            <p>Ondas</p>
            <strong>{waveHeight.toFixed(1)} m</strong>
            <span>{wavePeriod.toFixed(0)} s de período</span>
          </div>
        </section>

        <section className="stats-grid">
          <div className="card">
            <span>Temperatura do ar</span>
            <strong>{airTemp.toFixed(1)}°C</strong>
          </div>

          <div className="card">
            <span>Temperatura da água</span>
            <strong>{waterTemp.toFixed(1)}°C</strong>
          </div>

          <div className="card">
            <span>Vento</span>
            <strong>{windSpeed.toFixed(0)} km/h</strong>
            <small>Direção: {windDir}°</small>
          </div>

          <div className="card">
            <span>Umidade</span>
            <strong>{humidity}%</strong>
          </div>
        </section>

        <section className="camera-panel">
          <div className="panel-header">
            <h3>Câmera ao vivo</h3>
            <span>Webcam da praia</span>
          </div>

          <div className="camera-box">
            <iframe
              src="https://www.youtube.com/embed/2R9h2U8E5kM"
              title="Câmera ao vivo da praia"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="camera-note">
            <p>
              Se você tiver uma webcam específica da praia ou um link de stream
              público, substitua a URL do iframe acima.
            </p>
          </div>
        </section>

        <section className="info-panel">
          <h3>Resumo da sessão</h3>
          <p>
            Hoje o mar está em {waveStatus.toLowerCase()}, com vento {windStatus.toLowerCase()}.
            A água está em {waterTemp.toFixed(1)}°C e a temperatura do ar em {airTemp.toFixed(1)}°C.
          </p>
          <p>
            Recomenda-se verificar o vento e a direção das ondas antes de entrar.
            Em dias com vento mais forte, a condição pode mudar rapidamente.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;