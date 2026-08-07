import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

const VIDEO_SRC = "/commercial-video.mp4";
const POSTER_SRC = "/assets/images/home/commercial-poster.webp";
const MARQUEE_KEYS = ["uv", "cod", "delivery", "exchange", "made"];

/**
 * Cinematic brand film band.
 *
 * Performance notes:
 * - `preload="none"` plus an IntersectionObserver means the 2.8 MB file is only
 *   requested once the section is close to the viewport, so it never competes
 *   with the hero LCP image.
 * - The poster and the fixed aspect ratio reserve the space up front, so the
 *   section never causes layout shift.
 * - Playback pauses whenever the section leaves the viewport (battery + data).
 */
export default function CommercialFilm() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // Load + autoplay only while the section is on screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          if (!reduceMotion) {
            videoRef.current?.play().catch(() => {});
          }
        } else {
          videoRef.current?.pause();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const toggleSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    // Unmuting is a user gesture, so it is a safe moment to resume playback.
    if (!nextMuted && video.paused) video.play().catch(() => {});
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0d0c0b] text-white my-4"
      aria-labelledby="film-title"
    >
      {/* Warm Moroccan-light glow bleeding in from the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, rgba(144,105,65,.38), transparent 55%), radial-gradient(100% 80% at 95% 100%, rgba(200,150,90,.22), transparent 60%)",
        }}
      />

      <div className="nazra-container relative py-12 sm:py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.6fr)] lg:items-center lg:gap-10">
          {/* ── Editorial column ─────────────────────────────── */}
          <div className="max-w-md">
            <p className="nazra-eyebrow !text-[#c79a63]">{t("home.film.eyebrow")}</p>
            <h2 id="film-title" className="nazra-heading text-white">
              {t("home.film.title")}
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/70">{t("home.film.copy")}</p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/store/products"
                className="nazra-button bg-white text-black hover:bg-[#e9dfd2]"
              >
                {t("home.film.cta")}
              </Link>
              <Link
                to="/about"
                className="nazra-button border border-white/30 text-white hover:border-white hover:bg-white/10"
              >
                {t("home.film.secondary")}
              </Link>
            </div>

            <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-white/40">
              {t("home.film.signature")}
            </p>
          </div>

          {/* ── Film frame ───────────────────────────────────── */}
          <figure className="relative m-0">
            {/* Thin brass frame line, offset like a gallery mount */}
            <div
              aria-hidden="true"
              className="absolute -inset-2 rounded-sm border border-[#906941]/40 sm:-inset-3"
            />

            <div className="relative overflow-hidden rounded-sm bg-black shadow-2xl shadow-black/60">
              <video
                ref={videoRef}
                className="aspect-video h-full w-full object-cover"
                width="1280"
                height="720"
                poster={POSTER_SRC}
                preload="none"
                muted
                loop
                playsInline
                disablePictureInPicture
                aria-label={t("home.film.videoLabel")}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              >
                {shouldLoad && <source src={VIDEO_SRC} type="video/mp4" />}
              </video>

              {/* Bottom scrim so the controls stay legible on bright frames */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={t(playing ? "home.film.pause" : "home.film.play")}
                    className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-black transition hover:bg-white"
                  >
                    {playing ? (
                      <Pause className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Play className="h-4 w-4 translate-x-[1px]" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleSound}
                    aria-label={t(muted ? "home.film.unmute" : "home.film.mute")}
                    aria-pressed={!muted}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur transition hover:border-white hover:bg-black/70"
                  >
                    {muted ? (
                      <VolumeX className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Volume2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                <figcaption className="hidden text-[10px] uppercase tracking-[0.18em] text-white/60 sm:block">
                  {t("home.film.caption")}
                </figcaption>
              </div>
            </div>
          </figure>
        </div>
      </div>

      {/* ── Value ticker ───────────────────────────────────── */}
      <div className="relative border-t border-white/10 py-3.5">
        <div className="nazra-marquee">
          <ul className="nazra-marquee__track" aria-hidden="true">
            {[0, 1].map((pass) =>
              MARQUEE_KEYS.map((key) => (
                <li
                  key={`${pass}-${key}`}
                  className="flex shrink-0 items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55"
                >
                  <span>{t(`home.film.ticker.${key}`)}</span>
                  <span className="text-[#906941]">✦</span>
                </li>
              )),
            )}
          </ul>
          {/* Screen-reader equivalent of the decorative marquee */}
          <ul className="sr-only">
            {MARQUEE_KEYS.map((key) => (
              <li key={key}>{t(`home.film.ticker.${key}`)}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
