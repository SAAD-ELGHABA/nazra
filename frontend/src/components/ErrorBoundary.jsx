import React from "react";

/**
 * Catches render errors so a single bad component cannot take the whole
 * storefront down to a blank white page.
 *
 * Must be a class: there is still no hook equivalent of
 * `getDerivedStateFromError`.
 *
 * Deliberately plain — no translation hook, no router hook, no API call. This
 * renders precisely when something upstream is already broken, so it must not
 * depend on anything that could itself be the thing that failed.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // The hook point for Sentry or similar, once one is configured.
    console.error("Unhandled render error:", error, errorInfo?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-4 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-semibold text-[#151515]">
            Une erreur est survenue
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Nous n&apos;avons pas pu afficher cette page. Rechargez pour réessayer, ou
            revenez à l&apos;accueil.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="nazra-button bg-black text-white hover:bg-[#8d643d]"
            >
              Recharger la page
            </button>
            {/* A full navigation, not a router link: the router may be the
                thing that failed. */}
            <a href="/" className="nazra-button border border-black/25 bg-white text-black hover:border-black">
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
