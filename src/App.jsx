import { useEffect, useState } from "react";
import "./styles.css";

const LAT = -26.11;
const LON = -48.63;
const API_BASE = "https://api.open-meteo.com/v1";
const MARINE_API = "https://marine-api.open-meteo.com/v1/marine";
const CAMERA_STREAM_URL = "";

const weatherDescriptions = {
  0: "Céu limpo",
  1: "Poucas nuvens",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Névoa",
  48: "Névoa",
  51: "Garoa leve",
  53: "Garoa",
  55: "Garoa intensa",
  56: "Garoa congelante",
  57: "Garoa congelante intensa",
  61: "Chuva leve",
  63: "Chuva",
  65: "Chuva intensa",
  66: "Chuva congelante",
  67: "Chuva congelante intensa",
  71: "Neve leve",
  73: "Neve",
  75: "Neve intensa",
  77: "Granizo",
  80: "Pancadas leves",
  81: "Pancadas",
  82: "Pancadas intensas",
  85: "Neve leve",
  86: "Neve intensa",
  95: "Trovoadas",
  96: "Trovoadas com granizo",
  99: "Trovoadas intensas",
};

const directions = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];

async function getJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`A consulta retornou o erro ${response.status}.`);
  }
  return response.json();
}

async function fetchConditions(signal) {
  const weatherUrl = new URL(`${API_BASE}/forecast`);
  weatherUrl.search = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    current:
      "temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,relative_humidity_2m,weather_code",
    hourly: "temperature_2m,wind_speed_10m,wind_direction_10m,weather_code",
    wind_speed_unit: "kmh",
    timezone: "America/Sao_Paulo",
    forecast_days: "2",
  });

  const marineUrl = new URL(MARINE_API);
  marineUrl.search = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    hourly: "wave_height,wave_period,wave_direction,sea_surface_temperature",
    timezone: "America/Sao_Paulo",
    forecast_days: "2",
  });

  const [weatherResult, marineResult] = await Promise.allSettled([
    getJson(weatherUrl, signal),
    getJson(marineUrl, signal),
  ]);

  if (weatherResult.status === "rejected") {
    throw weatherResult.reason;
  }

  const weather = weatherResult.value;
  if (!weather.current || !weather.hourly) {
    throw new Error("Os dados do clima vieram incompletos. Tente novamente.");
  }

  const marine =
    marineResult.status === "fulfilled" && marineResult.value.hourly
      ? marineResult.value
      : null;
  const marineError = marine
    ? ""
    : "Os dados das ondas estão temporariamente indisponíveis.";

  return { weather, marine, marineError };
}

function formatNumber(value, digits = 0) {
  return Number.isFinite(value)
    ? value.toLocaleString("pt-BR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : "—";
}

function compassDirection(degrees) {
  if (!Number.isFinite(degrees)) return "—";
  return directions[
    Math.round(degrees / 45) % directions.length
  ];
}

function hourLabel(time) {
  return new Date(time).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function dayLabel(time, index) {
  if (index === 0) return "Agora";
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  const forecastDate = new Date(time).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  if (forecastDate === currentDate) return hourLabel(time);
  const weekday = new Date(time).toLocaleDateString("pt-BR", {
    weekday: "short",
    timeZone: "America/Sao_Paulo",
  });
  return `${weekday} · ${hourLabel(time)}`;
}

function WaveArtwork() {
  return (
    <svg
      className="wave-artwork"
      viewBox="0 0 760 470"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="548" cy="147" r="72" fill="#87CEEB" fillOpacity=".9" />
      <circle cx="548" cy="147" r="104" fill="#87CEEB" fillOpacity=".08" />
      <path
        d="M0 307c84-35 132-48 206-41 108 10 151 75 252 63 81-10 118-76 189-88 45-7 81 0 113 12v217H0V307Z"
        fill="#2688A8"
        fillOpacity=".52"
      />
      <path
        d="M0 363c100-40 184-49 276-18 83 29 147 47 218 15 79-36 138-72 266-46v192H0V363Z"
        fill="#3FA9D0"
        fillOpacity=".66"
      />
      <path
        d="M0 414c93-28 173-34 255-5 104 36 173 40 256-1 84-41 163-47 249-14v112H0V414Z"
        fill="#88CEEB"
        fillOpacity=".72"
      />
      <path
        d="M142 344c43-15 76-13 111-1 24 8 38 16 66 16"
        stroke="#D3F2FF"
        strokeOpacity=".64"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M472 391c39-17 73-16 108-3 19 7 31 14 51 14"
        stroke="#D3F2FF"
        strokeOpacity=".64"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M352 276c13-23 27-35 44-37 18-2 27 16 44 14 10-1 18-8 26-18"
        stroke="#B6E9FF"
        strokeOpacity=".7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M394 279c6-11 13-16 21-16 8 0 12 7 20 7 5 0 9-4 12-9"
        stroke="#B6E9FF"
        strokeOpacity=".55"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WeatherIcon({ code }) {
  const isRain = code >= 51 && code <= 82;
  return (
    <svg
      className="weather-icon"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      {isRain ? (
        <>
          <path
            d="M12 28h23a8 8 0 0 0 0-16 11 11 0 0 0-20-2 8 8 0 0 0-3 18Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="m18 34-2 5m12-5-2 5m12-5-2 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="24" cy="24" r="8" fill="currentColor" />
          <path
            d="M24 5v4m0 30v4M5 24h4m30 0h4M10.6 10.6l2.8 2.8m21.2 21.2 2.8 2.8m0-26.8-2.8 2.8M13.4 34.6l-2.8 2.8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

function App() {
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadInitialConditions() {
      try {
        const nextConditions = await fetchConditions(controller.signal);
        if (!controller.signal.aborted) setConditions(nextConditions);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Não foi possível carregar as condições:", fetchError);
          setError(
            fetchError.message ||
              "Não foi possível consultar as condições agora.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadInitialConditions();
    return () => controller.abort();
  }, []);

  function refreshConditions() {
    setRefreshing(true);
    setError("");
    fetchConditions()
      .then((nextConditions) => setConditions(nextConditions))
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          console.error("Não foi possível atualizar as condições:", fetchError);
          setError(
            fetchError.message ||
              "Não foi possível atualizar as condições agora.",
          );
        }
      })
      .finally(() => setRefreshing(false));
  }

  const weather = conditions?.weather;
  const marine = conditions?.marine;
  const current = weather?.current;
  const marineTimes = marine?.hourly?.time ?? [];
  const currentMarineIndex = marineTimes.findIndex(
    (time) => time === current?.time,
  );
  const marineIndex =
    currentMarineIndex >= 0
      ? currentMarineIndex
      : marineTimes.findIndex((time) => time >= (current?.time ?? ""));
  const waveHeight = marine?.hourly?.wave_height?.[marineIndex];
  const wavePeriod = marine?.hourly?.wave_period?.[marineIndex];
  const waveDirection = marine?.hourly?.wave_direction?.[marineIndex];
  const waterTemperature =
    marine?.hourly?.sea_surface_temperature?.[marineIndex];
  const waveMood =
    waveHeight == null
      ? "Aguardando leitura do mar"
      : waveHeight < 0.6
        ? "Mar mais tranquilo"
        : waveHeight < 1.2
          ? "Ondas moderadas"
          : "Ondas maiores hoje";

  const hourlyForecast = weather?.hourly?.time
    ? weather.hourly.time
        .map((time, index) => ({ time, index }))
        .filter(({ time }) => time >= current.time)
        .slice(0, 6)
    : [];
  const updatedAt = current?.time
    ? new Date(current.time).toLocaleString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
        timeZone: "America/Sao_Paulo",
      })
    : "";

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Surf Itapoá, início">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="27" cy="12" r="6" fill="currentColor" />
              <path
                d="M4 23c5-6 10-6 15 0s10 6 17 0M4 31c5-6 10-6 15 0s10 6 17 0"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>
            <strong>ITAPOÁ</strong>
            <small>SURF & MAR</small>
          </span>
        </a>
        <nav className="main-nav" aria-label="Navegação principal">
          <a href="#condicoes">Condições</a>
          <a href="#previsao">Previsão</a>
          <a href="#camera">Câmera</a>
          <a href="#sobre">A praia</a>
        </nav>
        <a
          className="header-location"
          href="https://maps.google.com/?q=Itapo%C3%A1+SC"
          target="_blank"
          rel="noreferrer"
        >
          <span aria-hidden="true">⌖</span> Itapoá, Santa Catarina
        </a>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <p className="overline"><span /> LITORAL NORTE DE SANTA CATARINA</p>
            <h1>
              Seu próximo
              <br />
              <span>bom dia</span> começa no mar.
            </h1>
            <p className="hero-description">
              O ritmo das ondas, o vento e o tempo em Itapoá. Tudo o que você
              precisa para planejar sua próxima sessão.
            </p>
            <a className="primary-link" href="#condicoes">
              Ver condições de hoje <span aria-hidden="true">↓</span>
            </a>
            <div className="hero-caption">
              <span className="caption-line" />
              <span>26°07&apos; S &nbsp; 48°37&apos; O</span>
              <span className="caption-separator">·</span>
              <span>Itapoá, SC</span>
            </div>
          </div>

          <div className="hero-scene">
            <div className="scene-sun-glow" />
            <WaveArtwork />
            <div className="scene-note">
              <span>01 — 26</span>
              <span>ONDE O MAR ENCONTRA A MATA</span>
            </div>
            <div className="scene-stamp" aria-hidden="true">
              <span>MAR</span>
              <span>•</span>
              <span>VIDA</span>
            </div>
          </div>
          <div className="hero-bottom">
            <span>OCEANO ATLÂNTICO</span>
            <span className="hero-bottom-line" />
            <span>BRASIL — 26° S</span>
          </div>
        </section>

        <section className="conditions section-wrap" id="condicoes">
          <div className="section-heading">
            <div>
              <p className="section-kicker">NA PRAIA AGORA</p>
              <h2>Como está o mar?</h2>
            </div>
            <button
              className="refresh-button"
              type="button"
              onClick={refreshConditions}
              disabled={loading || refreshing}
            >
              <span aria-hidden="true" className={refreshing ? "spin" : ""}>
                ↻
              </span>
              {refreshing ? "Atualizando" : "Atualizar"}
            </button>
          </div>

          {error && (
            <div className="notice notice-error" role="status">
              <span>{error}</span>
              <button type="button" onClick={refreshConditions}>
                Tentar novamente
              </button>
            </div>
          )}

          {conditions?.marineError && (
            <div className="notice" role="status">
              {conditions.marineError} O clima continua sendo exibido.
            </div>
          )}

          <div className="conditions-layout">
            <article className="surf-card">
              <div className="surf-card-top">
                <span className="live-indicator">
                  <span /> {loading ? "CONSULTANDO" : "CONDIÇÕES DE HOJE"}
                </span>
                <span className="surf-card-time">
                  {updatedAt ? `ATUALIZADO ÀS ${updatedAt}` : "ITAPOÁ / SC"}
                </span>
              </div>

              {loading ? (
                <div className="loading-state" aria-live="polite">
                  <span className="loading-wave" />
                  <span>Buscando as condições do mar...</span>
                </div>
              ) : (
                <>
                  <div className="surf-main">
                    <div className="wave-reading">
                      <span className="wave-number">
                        {formatNumber(waveHeight, 1)}
                      </span>
                      <span className="wave-unit">m</span>
                      <span className="wave-label">ALTURA DAS ONDAS</span>
                    </div>
                    <div className="surf-divider" />
                    <div className="surf-details">
                      <p className="surf-mood">{waveMood}</p>
                      <p>
                        {Number.isFinite(wavePeriod)
                          ? `${formatNumber(wavePeriod)} s de período`
                          : "Período das ondas indisponível"}
                      </p>
                      <p>
                        {Number.isFinite(waveDirection)
                          ? `Ondas de ${compassDirection(waveDirection)}`
                          : "Direção das ondas indisponível"}
                      </p>
                    </div>
                  </div>
                  <div className="surf-card-footer">
                    <span>Condições estimadas para a região</span>
                    <span className="surf-card-coordinate">
                      LAT {LAT.toFixed(2)}° &nbsp; LONG {Math.abs(LON).toFixed(2)}° O
                    </span>
                  </div>
                </>
              )}
            </article>

            <div className="weather-grid">
              <article className="weather-card">
                <span className="metric-label">TEMPO</span>
                <WeatherIcon code={current?.weather_code} />
                <strong>
                  {formatNumber(current?.temperature_2m)}
                  <span>°C</span>
                </strong>
                <span className="metric-description">
                  {weatherDescriptions[current?.weather_code] ?? "Condição atual"}
                </span>
              </article>

              <article className="weather-card">
                <span className="metric-label">VENTO</span>
                <span className="metric-symbol wind-symbol" aria-hidden="true">
                  ↗
                </span>
                <strong>
                  {formatNumber(current?.wind_speed_10m)}
                  <span> km/h</span>
                </strong>
                <span className="metric-description">
                  {compassDirection(current?.wind_direction_10m)} &nbsp;·&nbsp;
                  {formatNumber(current?.wind_direction_10m)}°
                </span>
              </article>

              <article className="weather-card">
                <span className="metric-label">ÁGUA DO MAR</span>
                <span className="metric-symbol water-symbol" aria-hidden="true">
                  ≋
                </span>
                <strong>
                  {formatNumber(waterTemperature, 1)}
                  <span>°C</span>
                </strong>
                <span className="metric-description">Temperatura da água</span>
              </article>

              <article className="weather-card">
                <span className="metric-label">SENSAÇÃO</span>
                <span className="metric-symbol feels-symbol" aria-hidden="true">
                  ◌
                </span>
                <strong>
                  {formatNumber(current?.apparent_temperature)}
                  <span>°C</span>
                </strong>
                <span className="metric-description">
                  Umidade {formatNumber(current?.relative_humidity_2m)}%
                </span>
              </article>
            </div>
          </div>
          <p className="data-disclaimer">
            Dados meteorológicos e marítimos estimados para a região. As
            condições podem variar de um ponto da praia para outro.
          </p>
        </section>

        <section className="forecast-section" id="previsao">
          <div className="section-wrap forecast-inner">
            <div className="section-heading forecast-heading">
              <div>
                <p className="section-kicker">DE HORA EM HORA</p>
                <h2>O mar ao longo do dia</h2>
              </div>
              <p className="forecast-note">
                Uma olhada nas próximas horas para ajudar a planejar sua ida à
                praia.
              </p>
            </div>

            <div className="forecast-strip" aria-live="polite">
              {loading
                ? Array.from({ length: 6 }, (_, index) => (
                    <div className="forecast-card forecast-loading" key={index}>
                      <span className="skeleton-line" />
                      <span className="skeleton-wave" />
                      <span className="skeleton-line short" />
                    </div>
                  ))
                : hourlyForecast.map(({ time, index }, forecastIndex) => {
                    const timeIndex =
                      marineTimes.findIndex((marineTime) => marineTime === time);
                    const height = marine?.hourly?.wave_height?.[timeIndex];
                    return (
                      <article className="forecast-card" key={time}>
                        <span className="forecast-time">
                          {dayLabel(time, forecastIndex)}
                        </span>
                        <WeatherIcon
                          code={weather.hourly?.weather_code?.[index] ?? 0}
                        />
                        <strong>
                          {formatNumber(height, 1)}
                          <span> m</span>
                        </strong>
                        <span className="forecast-period">
                          {Number.isFinite(
                            marine?.hourly?.wave_period?.[timeIndex],
                          )
                            ? `${formatNumber(marine.hourly.wave_period[timeIndex])} s`
                            : "ondas"}
                        </span>
                        <span className="forecast-wind">
                          Vento{" "}
                          {formatNumber(weather.hourly?.wind_speed_10m?.[index])}{" "}
                          km/h
                        </span>
                      </article>
                    );
                  })}
              {!loading && hourlyForecast.length === 0 && (
                <p className="forecast-empty">
                  A previsão por hora está temporariamente indisponível.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="camera-section section-wrap" id="camera">
          <div className="section-heading">
            <div>
              <p className="section-kicker">DIRETO DA PRAIA</p>
              <h2>Câmera ao vivo</h2>
            </div>
            <span className="camera-status">
              <span /> {CAMERA_STREAM_URL ? "AO VIVO" : "EM BREVE"}
            </span>
          </div>

          <div className="camera-frame">
            {CAMERA_STREAM_URL ? (
              <iframe
                src={CAMERA_STREAM_URL}
                title="Câmera ao vivo da praia de Itapoá"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="camera-placeholder">
                <div className="camera-placeholder-content">
                  <span className="camera-icon" aria-hidden="true">
                    <svg viewBox="0 0 48 48" fill="none">
                      <rect
                        x="5"
                        y="12"
                        width="27"
                        height="24"
                        rx="4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="m32 20 11-6v20l-11-6V20Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="18.5"
                        cy="24"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  <p className="camera-placeholder-title">
                    A praia de Itapoá, ao vivo.
                  </p>
                  <p className="camera-placeholder-copy">
                    Este espaço está reservado para a instalação da câmera.
                    Assim que a transmissão estiver pronta, ela aparecerá aqui.
                  </p>
                </div>
                <span className="camera-frame-caption">ITAPOÁ / SC &nbsp;·&nbsp; 26°07&apos; S</span>
              </div>
            )}
          </div>
        </section>

        <section className="about-section section-wrap" id="sobre">
          <div className="about-mark" aria-hidden="true">
            26°<br />
            <span>S</span>
          </div>
          <div className="about-copy">
            <p className="section-kicker">NOSSO CANTO DO LITORAL</p>
            <h2>Um lugar para chegar. Um mar para respeitar.</h2>
            <p>
              Entre a Mata Atlântica e o oceano, Itapoá tem um ritmo próprio.
              Consulte as condições, respeite seus limites e cuide da praia que
              recebe a gente.
            </p>
            <a
              className="map-link"
              href="https://maps.google.com/?q=Itapo%C3%A1+SC"
              target="_blank"
              rel="noreferrer"
            >
              Explore Itapoá <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="tide-note">
            <span className="tide-icon" aria-hidden="true">≈</span>
            <p>MAR, MATA<br />E TEMPO BOM.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#inicio">ITAPOÁ <span>— SURF & MAR</span></a>
        <p>Feito com carinho pelo litoral de Itapoá, SC.</p>
        <p>
          Previsão:{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
